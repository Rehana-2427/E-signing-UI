import { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // ✅ Import Swal
import adminUserCreditApi from "../../../api/adminUserCreditApi";

const CreditRequestUser = () => {
  const navigate = useNavigate();
  const [requestedCredits, setRequestedCredits] = useState("");

  const handleSubmitRequest = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const message = {
        userName: user?.userName,
        userEmail: user?.userEmail,
        requestedCredits: parseInt(requestedCredits, 10),
      };

      const response = await adminUserCreditApi.requestUserCredits(message);

      Swal.fire({
        title: "Request Submitted!",
        text: "Your request for credits has been sent to the admin. Please wait, the admin will assign credits for you.",
        icon: "success",
        confirmButtonText: "OK",
      });

      setRequestedCredits("");
      console.log("Credit request submitted:", response.data);
    } catch (error) {
      console.error("Error submitting credit request:", error);

      Swal.fire({
        title: "Error!",
        text: "Failed to submit your credit request. Please try again.",
        icon: "error",
        confirmButtonText: "Close",
      });
    }
  };

  return (
    <>
      <div className="d-flex justify-content-end align-items-end mb-3">
        <Button
          onClick={() =>
            navigate("/dashboard/creditRequest/user/user-transaction-history")
          }
        >
          Credit Transaction Report
        </Button>
      </div>

      <Card className="p-3 mt-3">
        <h5>📘 How Credits Work</h5>
        <ul>
          <li>
            Every document you send costs <strong>20 credits</strong>.
          </li>
          <li>Ensure you have enough balance to send documents.</li>
          <li>
            You can’t send documents if your balance is below the minimum
            required credits (less than 20).
          </li>
          <li>If you need more, you can request credits from admin.</li>
        </ul>
      </Card>

      <Card className="p-3 mt-3">
        <h5>📨 Request Credits</h5>
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
    </>
  );
};

export default CreditRequestUser;
