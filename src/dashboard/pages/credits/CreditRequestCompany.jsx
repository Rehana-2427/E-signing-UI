import { useEffect, useState } from "react";
import { Button, Card, Form, Toast, ToastContainer } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import companyApi from "../../../api/company";
import companyUserApi from "../../../api/companyUsers";

const CreditRequestCompany = () => {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showForm, setShowForm] = useState(false); // 🔄 New state for toggle
  const [userCompanies, setUserCompanies] = useState([]);
  const [assignedCompanies, setAssignedCompanies] = useState([]);
  const [mobileNumber, setMobileNumber] = useState();

  useEffect(() => {
    const fetchUserCompanies = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;

        // Assuming this endpoint exists and returns a list of companies created by the user
        const response = await companyApi.getListOfCompanyByAdminEmail(user.userEmail);
        setUserCompanies(Array.isArray(response.data) ? response.data : []);

        const assignedResponse = await companyUserApi.getAssignedCompanies(
          user.userEmail
        );
        setAssignedCompanies(
          Array.isArray(assignedResponse.data) ? assignedResponse.data : []
        );
      } catch (error) {
        console.error("Error fetching user companies:", error);
      }
    };

    fetchUserCompanies();
  }, []);

  const handleSubmitRequest = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const companyData = {
        companyName: companyName,
        description: description,
        adminUserName: user?.userName,
        adminEmail: user?.userEmail,
      };

      const response = await companyApi.createCompany(companyData);

      // Log the response to debug what is returned from the server
      console.log("Company Added Response:", response);

      if (response && response.data) {
        console.log("Company Added submitted:", response.data);
        setShowToast(true);
        setCompanyName("");
        setDescription("");
        setShowForm(false); // hide form after submit
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error("Error submitting company credit request:", error);
    }
  };

  return (
    <>
      {/* Info Card */}
      <Card className="p-3 mt-3">
        <h5>🏢 How Company Credits Work</h5>
        <ol>
          <li>
            First, click on <strong>"Add Company"</strong> and enter your
            desired company name and a short description.
          </li>
          <li>
            Once submitted, the request will be sent to the{" "}
            <strong>SignBook Admin</strong> for approval.
          </li>
          <li>
            After approval, your company will be active, and you will become the{" "}
            <strong>Company Admin</strong>.
          </li>
          <li>
            As the Company Admin, you can now <strong>add users</strong> to your
            company.
          </li>
          <li>
            All users added to the company will share the same{" "}
            <strong>company credit pool</strong>.
          </li>
          <li>
            When creating documents <strong>on behalf of your company</strong>,
            <strong>20 credits</strong> will be deducted per document (same as
            personal).
          </li>
          <li>
            If the company's available credits reach 0,{" "}
            <strong>all users</strong> in that company will be{" "}
            <strong>blocked from sending</strong> new documents.
          </li>
          <li>
            As the Company Admin, you can request additional credits using the{" "}
            <strong>credit request form</strong> below.
          </li>
        </ol>
      </Card>

      <br />
      <div className="d-flex justify-content-between align-items-center mt-3">
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "➕ Add Company"}
        </Button>
        {(userCompanies.length > 0 || assignedCompanies.length > 0) && (
          <Button
            variant="secondary"
            onClick={() => navigate("/dashboard/creditRequest/my-companies")}
          >
            🏢 My Companies
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-3 mt-3">
          <h5>Add company details</h5>
          <Form>
            <Form.Group controlId="companyName">
              <Form.Label>Company Name<span style={{ color: "red" }}>*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="mobileNumber">
              <Form.Label>
                Mobile Number <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter your mobile number"
                required
              />
            </Form.Group>
            <Form.Group controlId="description" className="mt-3">
              <Form.Label>Company Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter short description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>

            <Button
              className="mt-3"
              variant="success"
              onClick={handleSubmitRequest}
              disabled={!companyName || !description || !mobileNumber}
            >
              Submit
            </Button>
          </Form>
        </Card>
      )}

      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto">Company Added</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Company Added successfully.
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default CreditRequestCompany;
