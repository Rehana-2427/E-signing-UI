// 📁 CompanyCreditRequestModal.js
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

const CompanyCreditRequestModal = ({ show, onClose, companyName, onSend }) => {
  const [requestedCredits, setCreditsRequested] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!requestedCredits) return;
    const requestData = {
      companyName,
      requestedCredits: parseInt(requestedCredits, 10),
      message,
    };
    onSend(requestData); // pass back to parent
    setCreditsRequested("");
    setMessage("");
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Request Credits for {companyName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="creditsRequested">
            <Form.Label>Credits Requested</Form.Label>
            <Form.Control
              type="number"
              value={requestedCredits}
              onChange={(e) => setCreditsRequested(e.target.value)}
              placeholder="Enter number of credits"
              min={1}
              required
            />
          </Form.Group>

          <Form.Group controlId="requestMessage" className="mt-3">
            <Form.Label>Optional Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add any notes or justification..."
            />
          </Form.Group>

          <Button
            className="mt-3"
            variant="primary"
            onClick={handleSubmit}
            disabled={!requestedCredits}
          >
            Submit Request
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CompanyCreditRequestModal;
