import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

const CompanyCreditRequestModal = ({
  show,
  onClose,
  companyName,
  onSend,
  showCreditPriceUnit = false, // 👈 new prop (default false)
}) => {
  const [requestedCredits, setCreditsRequested] = useState("");
  const [message, setMessage] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [requestCPUnit, setRequestCPUnit] = useState("");

  useEffect(() => {
    if (!showCreditPriceUnit) {
      setRequestCPUnit(null); 
    } else {
      setRequestCPUnit(5); 
    }
  }, [show, showCreditPriceUnit]);

  const handleSubmit = () => {
    if (!mobileNumber) return;

    const requestData = {
      companyName,
      requestedCredits: parseInt(requestedCredits, 10),
      message,
      mobileNumber,
      requestCPUnit: parseInt(requestCPUnit),
    };

    onSend(requestData);
    setCreditsRequested("");
    setMessage("");
    setMobileNumber("");
    setRequestCPUnit("");
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Request Credits for {companyName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
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
          <Form.Group controlId="creditsRequested">
            <Form.Label>
              Credits Requested 
            </Form.Label>
            <Form.Control
              type="number"
              value={requestedCredits}
              onChange={(e) => setCreditsRequested(e.target.value)}
              placeholder="Enter number of credits"
              min={1}
              required
            />
          </Form.Group>

          {showCreditPriceUnit && (
            <Form.Group controlId="creditsPriceUnit" className="mt-3">
              <Form.Label>
                Credits Price Unit 
              </Form.Label>
              <Form.Control
                type="number"
                value={requestCPUnit}
                onChange={(e) => setRequestCPUnit(e.target.value)}
                placeholder="Enter number of credits per unit"
                min={1}
                required
              />
            </Form.Group>
          )}

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
            disabled={!mobileNumber}
          >
            Submit Request
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CompanyCreditRequestModal;
