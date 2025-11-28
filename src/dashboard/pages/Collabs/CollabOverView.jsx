import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import adminApi from "../../../api/adminApi";
import collaborationApi from "../../../api/collaborationApi";
import CollabContributors from "./CollabContributors";
import "./collab.css";

const CollabOverview = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const senderEmail = user?.userEmail;
  const [contributors, setContributors] = useState([]);
  const [collabCharge, setCollabCharge] = useState(0);
  const [collaborationCharge, setCollaborationCharge] = useState(0);
  const [formData, setFormData] = useState({
    collaborationName: "",
    forType: "Company",
    companyOrPerson: "",
    createdOn: new Date().toISOString().split("T")[0],
    deadline: "",
    cost: "",
    costChargedTo: "Client",
    baseCollabCredits: 5,
    collaborationDuration: "10",
    createdBy: senderEmail || "",
    extraDays: 0,
    extraCharge: 0,
    totalCost: 0,
  });

  // Set default deadline (10 days from today)
  useEffect(() => {
    const today = new Date();
    const deadline = new Date(today);
    deadline.setDate(today.getDate() + 10); // Add 10 days to the current date
    setFormData((prevFormData) => ({
      ...prevFormData,
      deadline: deadline.toISOString().split("T")[0],
    }));
  }, []);

  // useEffect(() => {
  //   const baseDuration = 10;
  //   const duration = parseInt(formData.collaborationDuration) || baseDuration;
  //   const extraDays = Math.max(0, duration - baseDuration);
  //   const extraCharge = extraDays * 0.5;

  //   setExtraCharge(extraCharge);
  //   const baseCost = baseDuration * 0.5;

  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     cost: baseCost+extraCharge,
  //     extraTime: extraDays,
  //   }));
  // }, [formData.collaborationDuration]); // Recalculate when duration changes

  useEffect(() => {
    if (formData.createdOn && formData.deadline) {
      // Calculate the duration in days between the created date and the deadline
      const duration = calculateDuration(formData.createdOn, formData.deadline);

      // Base duration and base credits
      const baseDuration = 10;
      const baseCredits = 5;

      const extraDays = Math.max(0, duration - baseDuration);
      const extraCharge = extraDays * 0.5;

      const updatedCost = baseCredits + extraCharge;

      setFormData((prevFormData) => ({
        ...prevFormData,
        collaborationDuration: duration.toString(),
        cost: updatedCost,
        extraTime: extraDays,
        extraCharge: extraCharge,
      }));
    }
  }, [formData.createdOn, formData.deadline]);

  const calculateDuration = (createdOn, deadline) => {
    const createdDate = new Date(createdOn);
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - createdDate; // Difference in milliseconds
    const dayDiff = timeDiff / (1000 * 3600 * 24); // Convert milliseconds to days
    return dayDiff;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Fetch credit settings and collaboration charge from the backend
  useEffect(() => {
    adminApi
      .getCreditSettings()
      .then((res) => {
        setCollabCharge(res.data.collabCharge);
      })
      .catch((err) => {
        console.error("Failed to load credit settings", err);
        Swal.fire(
          "Error",
          "Unable to load credit settings from server.",
          "error"
        );
      });
  }, []);

  useEffect(() => {
    if (senderEmail) {
      collaborationApi
        .getTotalCollabCharge(senderEmail)
        .then((res) => {
          setCollaborationCharge(res.data || 0); // Ensure a valid number
        })
        .catch((err) => {
          console.error("Failed to load collaboration charge", err);
          Swal.fire(
            "Error",
            "Unable to load remaining collaboration charge.",
            "error"
          );
        });
    }
  }, [senderEmail]);

  const totalCollabCharge = (collabCharge || 0) - (collaborationCharge || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalCollabCharge <= 0) {
      // Show SweetAlert message if credits are insufficient
      Swal.fire({
        icon: "warning",
        title: "Insufficient Credits",
        text: "You don't have the minimum collaboration credits. Please upgrade your credits by sending an email to the SignBook admin.",
        confirmButtonText: "Upgrade",
      });
      return; // Prevent form submission
    }

    const forCompany = formData.forType === "Company";
    const forPerson = formData.forType === "Person";
    const baseDuration = 10; // Default base duration
    const selectedDuration = parseInt(formData.collaborationDuration) || 10;
    const extraDays = Math.max(0, selectedDuration - baseDuration);
    const extraCharge = extraDays * 0.5;

    const payload = {
      collaborationName: formData.collaborationName,
      forCompany,
      companyName: forCompany ? formData.companyOrPerson : null,
      forPerson,
      personName: forPerson ? formData.companyOrPerson : null,
      createdOn: formData.createdOn,
      deadline: formData.deadline,
      baseCollabCredits: formData.baseCollabCredits,
      cost: formData.cost,
      collaborationDuration: formData.collaborationDuration,
      costChargedTo: formData.costChargedTo,
      createdBy: formData.createdBy,
      collabDTOs: contributors.map((c) => ({
        name: c.name,
        email: c.email,
        role: c.role,
      })),
      extraTime: extraDays, // Send extra time to backend
      extraCharge: extraCharge, // Send extra charge to backend
      totalCost: (parseFloat(formData.baseCollabCredits) + extraCharge).toFixed(
        2
      ), // Total cost
    };

    console.log("Final Payload:", payload);

    try {
      // Call the backend to save collaboration info
      const response = await collaborationApi.saveCollaborationInfo(payload);

      if (response.status === 200) {
        // Show success alert using SweetAlert2
        let successMessage = "Your collaboration was saved successfully.";

        // If there's an extra charge, add a message about admin approval
        if (extraCharge > 0) {
          successMessage +=
            " Please wait until admin approves your time credits.";
        }

        Swal.fire({
          icon: "success",
          title: "Collaboration Saved!",
          text: successMessage,
          confirmButtonText: "OK",
        }).then(() => {
          // window.location.reload();
          navigate("/dashboard/my-collabs?tab=user-Collabs");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Save Collaboration",
          text: "Something went wrong. Please try again.",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error saving collaboration:", error);
      // Show error alert if there's an exception during the API call
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving the collaboration. Please try again later.",
        confirmButtonText: "OK",
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="scrollable-container" style={{ height: "100%" }}>
      <div className="header-container">
        <h1>Collaboration Overview</h1>
        <Button onClick={handleBack} variant="info" className="tooltip-btn">
          <IoArrowBackCircleSharp />
          <span className="tooltip-text">Go to Back</span>
        </Button>
      </div>

      <Card className="p-4 mt-3 shadow-sm">
        <h5 className="mb-3">🗂️ Collaboration Overview</h5>
        <p>
          <strong>Total Collaboration charge: {collabCharge}</strong>{" "}
          &nbsp;||&nbsp;
          <strong>
            Balance Collaboration charge: {totalCollabCharge}
          </strong>{" "}
          &nbsp;||&nbsp;
          <strong>Used Collaboration charge: {collaborationCharge}</strong>
        </p>
        <p>
          <strong>Note:</strong> For company collaborations, deduct 2.5 credits,
          and for person-to-person collaborations, deduct 1 credit.
        </p>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="collaborationName">
                <Form.Label>Collaboration Name</Form.Label>
                <Form.Control
                  type="text"
                  name="collaborationName"
                  value={formData.collaborationName}
                  onChange={handleChange}
                  placeholder="Enter collaboration name: Title - org / person"
                  required
                />
              </Form.Group>
              <p>
                E.g., Contract – ABC Corp, NDA – John Doe, Invoice – Vendor X
              </p>
            </Col>

            <Col md={3}>
              <Form.Group className="mb-3" controlId="forType">
                <Form.Label>For</Form.Label>
                <Form.Select
                  name="forType"
                  value={formData.forType}
                  onChange={handleChange}
                >
                  <option>Company</option>
                  <option>Person</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group className="mb-3" controlId="companyOrPerson">
                <Form.Label>
                  {formData.forType === "Company"
                    ? "Company Name"
                    : "Person Name"}
                </Form.Label>
                <Form.Control
                  type="text"
                  name="companyOrPerson"
                  value={formData.companyOrPerson}
                  onChange={handleChange}
                  placeholder={
                    formData.forType === "Company"
                      ? "Enter company name"
                      : "Enter person name"
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <CollabContributors
            contributors={contributors}
            setContributors={setContributors}
          />

          <p>
            <strong>
              Note: Base collaboration charge is 5 credits for 10 days. If you
              want to extend the duration, an additional 0.5 credits per day
              will be charged.
            </strong>
          </p>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="createdOn">
                <Form.Label>Created On</Form.Label>
                <Form.Control
                  type="date"
                  name="createdOn"
                  value={formData.createdOn}
                  onChange={handleChange}
                  disabled
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="deadline">
                <Form.Label>Deadline</Form.Label>
                <Form.Control
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="collaborationDuration">
                <Form.Label>Collaboration Duration (days)</Form.Label>
                <Form.Control
                  type="number"
                  name="collaborationDuration"
                  value={formData.collaborationDuration || ""}
                  onChange={handleChange}
                  placeholder="Enter number of days"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3" controlId="cost">
                <Form.Label>Collaboration Cost</Form.Label>
                <Form.Control
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  placeholder={`Max ${formData.cost} credits`}
                  max={formData.cost}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3" controlId="costChargedTo">
                <Form.Label>Cost Charged To</Form.Label>
                <Form.Select
                  name="costChargedTo"
                  value={formData.costChargedTo}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Client">Client</option>
                  <option value="Contributor">Contributor</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="text-end mt-3">
            <Button variant="success" type="submit" className="me-2">
              💾 Save
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                /* Implement delete logic */
              }}
            >
              🗑️ Delete
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CollabOverview;
