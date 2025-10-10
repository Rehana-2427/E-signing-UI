import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import adminCompanyCreditApi from "../api/adminCompanyCredit";

const AddCompanyCreditsModal = ({ show, onHide, company, onSave }) => {
  const [creditToAdd, setCreditToAdd] = useState(0);
  const handleSave = async () => {
    try {
      await adminCompanyCreditApi.addCredits(
        company.companyName,
        creditToAdd
      );
      const response = await adminCompanyCreditApi.getCompanyCreditList();
      onSave(response.data,company.companyName);
      onHide();
      toast.success(
        `Successfully assigned ${creditToAdd} credits to ${company.companyName}`
      );
      setCreditToAdd(0);
    } catch (error) {
      console.error("Error adding credits", error);
      toast.error("Failed to assign credits");
    }
  };
  return (
    <>
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Credits</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Company Name:</strong> {company.companyName}
          </p>
          <p>
            <strong>Admin Email:</strong> {company.adminEmail}
          </p>
          <Form.Group>
            <Form.Label>Enter credits to add:</Form.Label>
            <Form.Control
              type="number"
              value={creditToAdd}
              onChange={(e) => setCreditToAdd(parseInt(e.target.value))}
              min={1}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer position="top-end" autoClose={3000} />
    </>
  );
};

export default AddCompanyCreditsModal;
