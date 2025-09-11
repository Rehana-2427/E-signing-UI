import { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import adminUserCreditApi from '../api/adminUserCreditApi';

const AddCreditsModal = ({ show, onHide, user, onSave }) => {
  const [creditToAdd, setCreditToAdd] = useState(0);

  const handleSave = async () => {
    try {
      await adminUserCreditApi.addCredits(user.userEmail, creditToAdd);
      const response = await adminUserCreditApi.getUserCreditList();
      onSave(response.data, user.userEmail);
      onHide();
      toast.success(`Successfully assigned ${creditToAdd} credits to ${user.userEmail}`);
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
          <p><strong>User:</strong> {user.userName}</p>
          <p><strong>Email:</strong> {user.userEmail}</p>
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
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* Toast container */}
      <ToastContainer position="top-end" autoClose={3000} />
    </>
  );
};

export default AddCreditsModal;
