import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import collaborationApi from "../../../api/collaborationApi"; // Corrected the import

const CollabCredits = ({ collabId, collaborationName }) => {
  const [collabData, setCollabData] = useState(null);
  const [extraTime, setExtraTime] = useState(0); // Additional time chosen by the user
  const [extracharge, setExtraCharge] = useState(0); // Initial total cost set to 0
  const [collabStatus, setCollabStatus] = useState("Active"); // Active or Readable status
  const user = JSON.parse(localStorage.getItem("user"));
  const senderEmail = user?.userEmail;
  const [showModal, setShowModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(0); // Duration selected by user
  const [newDeadline, setNewDeadline] = useState(""); // New Deadline based on selected duration

  // Fetch collaboration details
  useEffect(() => {
    collaborationApi
      .getCollaBriefById(collabId)
      .then((response) => {
        setCollabData(response.data);

        // Set default newDeadline as today's date when the component first loads
        const today = new Date();
        setNewDeadline(today.toDateString()); // Set today's date as the default newDeadline
      })
      .catch((error) => {
        console.error("Failed to fetch collaboration data", error);
      });
  }, [collabId]);

  // Calculate the total cost (base credits + additional time credits)
  useEffect(() => {
    if (collabData && extraTime >= 0) {
      const baseCredits = collabData.baseCollabCredits || 5;
      const dailyCreditRate = 0.5;

      const additionalCost = dailyCreditRate * extraTime;

      // Total cost includes base cost + additional cost based on extraTime
      // const totalCost = baseCredits * dailyCreditRate + additionalCost;
      setExtraCharge(additionalCost); // Update the total cost
    }
  }, [collabData, extraTime]);

  // Handle the transition between active and readable states
  useEffect(() => {
    if (collabData) {
      const today = new Date();
      const deadline = new Date(collabData.deadline);
      const daysPastDeadline = Math.floor(
        (today - deadline) / (1000 * 3600 * 24)
      ); // Days past the deadline

      if (collabData.cost <= 0) {
        setCollabStatus("Active - Readable");
      } else if (daysPastDeadline > 0) {
        setCollabStatus("Active - Readable");
      } else {
        setCollabStatus("Active - writable");
      }
    }
  }, [collabData]);

  if (!collabData) {
    return <div>Loading collaboration data...</div>;
  }

  const handleRequestCredits = () => {
    setShowModal(true);
  };

  // Update Total Cost and Deadline based on the user's selected duration
  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value);
    setSelectedDuration(newDuration);

    // Calculate the new deadline by adding the selectedDuration (in days) to today's date
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + newDuration);
    setNewDeadline(currentDate.toDateString()); // Set the new deadline

    // Update extraTime and recalculate the total cost
    setExtraTime(newDuration);

    // Recalculate the total cost based on the extra time (new duration)
    const dailyCreditRate = 0.5;
    const newCost = dailyCreditRate * newDuration;
    setExtraCharge(newCost);
  };

  const handleSubmitRequest = () => {
    // Construct the updateDTO with the required fields
    const updateDTO = {
      extraTime: extraTime,
      extraCharge: extracharge,
      newDeadline: new Date(newDeadline).toISOString().split("T")[0], // Format the date correctly
    };

    // Log the DTO for debugging
    console.log(updateDTO);

    // Call the API to update the collaboration with the collabId and the updateDTO payload
    collaborationApi
      .updateRequestCredits(collabId, updateDTO)
      .then((response) => {
        // Handle the response here, e.g., update the UI with the new collaboration data
        console.log("Updated collaboration:", response.data);
      })
      .catch((error) => {
        console.error("Error updating collaboration:", error);
      });

    setShowModal(false); // Close the modal after submitting the request
  };

  const bufferPeriod = 3;
  const ddDays = 7;
  const deletionDate = new Date(collabData.deadline);
  deletionDate.setDate(deletionDate.getDate() + ddDays + bufferPeriod);

  return (
    <>
      <br />
      <Row>
        <Col md={4}>
          <Card>
            <h3>
              <strong>Base Credits</strong>
            </h3>
            <p>Duration: {collabData.baseCollabCredits * 2} days</p>
            <p>Base collab charge: {collabData.baseCollabCredits} credits</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <h3>
              <strong>Additional Credits</strong>
            </h3>
            <p>Extra Time: {collabData.extraTime} days</p>
            <p>Extra charge: {collabData.extraCharge} credits</p>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <h3>
              <strong>Total Credits</strong>
            </h3>
            <p>Total Duration: {collabData.collaborationDuration} days</p>
            <p>Total Cost: {collabData.cost} credits</p>
          </Card>
        </Col>
      </Row>

      <div className="mt-4 d-flex justify-content-between align-items-center">
        <h2>
          <strong>Meta Data:</strong>
        </h2>
        <Button onClick={handleRequestCredits}>Request for credits</Button>
      </div>

      <Card>
        <h3>
          <strong>Collaboration Status</strong>
        </h3>
        <p>
          {collabStatus === "Active - writable" && (
            <>
              This collaboration is <strong>Active and Writable</strong>. You
              can send attachments and update the checklist until the deadline
              of <strong>{collabData.deadline}</strong>.
            </>
          )}
          {collabStatus === "Active - Readable" && (
            <>
              This collaboration is now in <strong>Read-Only</strong> mode. You
              can no longer modify it, but you can view the details.
              <br />
              The attachments and files will be deleted after the deadline +
              buffer period (DD days + Y buffer).
            </>
          )}
        </p>
      </Card>

      <Card>
        <h3>
          <strong>Timeline</strong>
        </h3>
        <p>
          Collaboration is active until the deadline:{" "}
          <strong>{collabData.deadline}</strong>
          <br />
          After the deadline, it becomes Read-Only.
          <br />
          Attachments and files will be deleted by:{" "}
          <strong>{deletionDate.toDateString()}</strong>
          (The collaboration will be active for{" "}
          {collabData.baseCollabCredits * 10} days, plus an additional buffer
          period of {collabData.collaborationDuration} days.)
          <br />
          <strong>Credits Deduction:</strong> 0.5 credits will be deducted per
          day until the collaboration transitions to read-only.
        </p>
      </Card>

      {/* Display other meta info */}
      <Card>
        <h3>
          <strong>Basic Collaboration Info</strong>
        </h3>
        <p>
          Collaboration ID: <strong>{collabId}</strong>
          <br />
          Email: <strong>{senderEmail}</strong>
        </p>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{collaborationName} </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            How much extra time do you want please select deadline, if you are
            okay with credits, please send a request.
          </p>
          <Form>
            <Form.Group className="mb-3" controlId="newDeadline">
              <Form.Label>New Deadline</Form.Label>
              <Form.Control
                type="text"
                name="newDeadline"
                readOnly
                value={newDeadline || collabData.deadline}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="collaborationDuration">
              <Form.Label>Collaboration Duration (days)</Form.Label>
              <Form.Control
                type="number"
                name="collaborationDuration"
                placeholder="Enter number of days"
                value={selectedDuration}
                onChange={handleDurationChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="cost">
              <Form.Label>Total Cost</Form.Label>
              <Form.Control
                type="number"
                name="cost"
                value={extracharge}
                readOnly
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmitRequest}>
            Request Credits
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CollabCredits;
