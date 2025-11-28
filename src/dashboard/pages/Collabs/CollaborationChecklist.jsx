import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import collabCheckListApi from "../../../api/collabCheckListApi";
import collaborationApi from "../../../api/collaborationApi";

const CollaborationChecklist = ({ collabId, collaborationName }) => {
  const [showForm, setShowForm] = useState(false);
  const [checklist, setChecklist] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const senderEmail = user?.userEmail;
  const [contributors, setContributors] = useState([]);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    item: "",
    assignedTo: "",
    role: "",
    email: "",
    comment: "",
    status: false,
    deadline: "",
    collabName: collaborationName || "",
    addedBy: senderEmail,
  });

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const response = await collabCheckListApi.getChecklistByCollabId(
          collabId
        );
        if (response.status === 200) {
          setChecklist(response.data);
        }
      } catch (error) {
        console.error("Error fetching checklist:", error);
        alert("Failed to load checklist.");
      }
    };

    if (collabId) {
      fetchChecklist();
    }
  }, [collabId]);

  useEffect(() => {
    if (collabId) {
      collaborationApi
        .getContributorsDetails(collabId)
        .then((response) => {
          const contributorsData = response.data.map((item) => ({
            id: item[0],
            name: item[1],
            email: item[2],
            role: item[3],
          }));
          setContributors(contributorsData);
        })
        .catch((err) => {
          console.error("Error fetching contributors:", err);
        });
    }
  }, [collabId]);

  const isDeadlinePassed = new Date(formData.deadline) < new Date();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAdd = (e) => {
    e.preventDefault();

    if (
      !collabId ||
      !formData.item ||
      !formData.deadline ||
      !formData.assignedTo
    ) {
      setFormError("All fields are required.");
      return;
    }

    const email = formData.email ? [formData.email] : [];

    const newItem = {
      ...formData,
      collabId,
      collabName: collaborationName,
      email,
      addedBy: senderEmail,
    };

    collabCheckListApi
      .addChecklist(newItem)
      .then((response) => {
        if (response.status === 201) {
          setChecklist([ ...checklist, { id: checklist.length + 1, ...newItem } ]);
          setFormData({
            item: "",
            assignedTo: "",
            role: "",
            email: "",
            comment: "",
            status: false,
            deadline: "",
            collabName: collaborationName,
            addedBy: senderEmail,
          });
          setShowForm(false);
          setFormError("");

          Swal.fire({
            icon: "success",
            title: "Checklist Sent",
            text: "Your checklist has been successfully sent!",
            confirmButtonText: "OK",
          });
        }
      })
      .catch((error) => {
        // setError("Failed to save checklist. Please try again.");
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong. Please try again later.",
          confirmButtonText: "OK",
        });
      });
  };

  const handleRemove = (id) => {
    setChecklist(checklist.filter((c) => c.id !== id));
  };

  // Filter contributors based on role
  const getFilteredEmails = (role) => {
    return contributors
      .filter((user) => user.role === role)
      .map((user) => user.email);
  };

  return (
    <Card className="p-4 mt-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">📝 Collaboration Checklist</h5>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "← Back to List" : "+ Add Checklist"}
        </Button>
      </div>
      <p>
        <strong>
          For each collaboration you select, if you send a checklist, 0.2
          credits will be deducted.
        </strong>
      </p>
      {!showForm ? (
        <>
          {checklist.length > 0 ? (
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Checklist Item</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {checklist.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.item}</td>
                    <td>{c.email} - {c.assignedTo}</td>
                    <td>{c.status ? "Done" : "Not Done"}</td>
                    <td>{c.deadline}</td>
                    <td>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleRemove(c.id)}
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted mb-0">No checklist added yet.</p>
          )}
        </>
      ) : (
        <Form onSubmit={handleAdd}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="item">
                <Form.Label>Checklist Item</Form.Label>
                <Form.Select
                  name="item"
                  value={formData.item}
                  onChange={handleChange}
                  disabled={!collabId}
                >
                  <option value="">Select...</option>
                  <option>Aadhaar Card</option>
                  <option>PAN Card</option>
                  <option>Agreement Copy</option>
                  <option>GST Certificate</option>
                  <option value="Other">Other</option>
                </Form.Select>
                {formData.item === "Other" && (
                  <Form.Control
                    type="text"
                    name="item"
                    value={formData.item}
                    onChange={handleChange}
                    placeholder="Enter custom checklist item"
                    required
                  />
                )}
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
                  disabled={!collabId}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="assignedTo">
                <Form.Label>Assign To</Form.Label>
                <Form.Select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => {
                    const selectedRole = e.target.value;
                    handleChange(e); // Update the assignedTo value
                    setFormData({
                      ...formData,
                      assignedTo: selectedRole, // Ensure assignedTo is updated correctly
                      role: selectedRole || "", // Set the role based on the "Assign To" selection
                      email: "", // Clear email when role changes
                    });
                  }}
                  disabled={!collabId}
                >
                  <option value="">Select a user...</option>
                  <option value="Actor">Actor</option>
                  <option value="Reviewer">Reviewer</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Select
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!collabId}
                >
                  <option value="">Select Email</option>
                  {getFilteredEmails(formData.role).map((email) => (
                    <option key={email} value={email}>
                      {email}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3" controlId="comment">
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  disabled={!collabId}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Done"
                  name="status"
                  checked={formData.status}
                  onChange={handleChange}
                  disabled={isDeadlinePassed}
                  required={!isDeadlinePassed}
                />
              </Form.Group>
            </Col>
          </Row>

          <Button variant="primary" onClick={handleAdd}>
            Save Checklist
          </Button>
        </Form>
      )}
    </Card>
  );
};

export default CollaborationChecklist;
