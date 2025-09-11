import { useState } from "react";
import { Button, Card, Form, Toast, ToastContainer } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import adminUserCreditApi from "../../api/adminUserCreditApi";

const CreditPassBook = () => {

  const navigate = useNavigate();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestedCredits, setRequestedCredits] = useState("");
  const [showToast, setShowToast] = useState(false);


  const handleSubmitRequest = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const message = {
        userName: user?.userName,
        userEmail: user?.userEmail,
        requestedCredits: parseInt(requestedCredits, 10),
      };
      const response = await adminUserCreditApi.requestUserCredits(message);
      console.log('Credit request submitted:', response.data);
    } catch (error) {
      console.error('Error submitting credit request:', error);
    }
  }
  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1><strong>Credit PassBook</strong></h1>
        <Button onClick={() => navigate('/dashboard/creditPassBook/transaction-history')}>
          Credit Transaction Report
        </Button>
      </div>

      <Card className="p-3 mt-3">
        <h5>📘 How Credits Work</h5>
        <ul>
          <li>Every document you send costs <strong>20 credits</strong>.</li>
          <li>Ensure you have enough balance to send documents.</li>
          <li>You can’t send documents if your balance is below the minimum required credits (less than 20).</li>
          <li>If you need more, you can request credits from admin.</li>
        </ul>
      </Card>

      <div className="mt-4">
        <Button
          variant="primary"
          onClick={() => setShowRequestForm(!showRequestForm)}
        >
          {showRequestForm ? "Cancel Request" : "Request Credits from Admin"}
        </Button>
      </div>

      {showRequestForm && (
        <Card className="p-3 mt-3">
          <Form>
            <Form.Group controlId="creditRequest">
              <Form.Label>How many credits do you want?</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter number of credits"
                value={requestedCredits}
                onChange={(e) => setRequestedCredits(e.target.value)}
                min={1}
              />
            </Form.Group>

            <Button
              className="mt-3"
              variant="success"
              onClick={handleSubmitRequest}
              disabled={!requestedCredits || parseInt(requestedCredits) <= 0}
            >
              Submit Request
            </Button>
          </Form>
        </Card>
      )}

      {/* ✅ Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg="success">
          <Toast.Header>
            <strong className="me-auto">Credit Request</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Your request for credits has been submitted to the admin.
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default CreditPassBook;
