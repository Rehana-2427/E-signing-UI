import { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import { BsWechat } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import reviewerApi from "../../../api/reviewerApi";

const Reviwers = ({ documentId, documentName }) => {
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [senderEmailFromReviewer, setSenderEmailFromReviewwer] = useState();
  const [showModal, setShowModal] = useState(false);
  const [newReviewer, setNewReviewer] = useState({
    email: "",
  });
  useEffect(() => {
    if (documentId) {
      reviewerApi
        .getDetailsOfReviewerById(documentId)
        .then((response) => {
          console.log("Reviewers data:", response.data);
          setReviewers(response.data);
          if (
            response.data &&
            response.data.length > 0 &&
            response.data[0].senderEmail
          ) {
            setSenderEmailFromReviewwer(response.data[0].senderEmail);
          } else {
            console.error("senderEmail not found in signers");
          }

          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to fetch reviewer details.");
          console.error("Error fetching reviewers:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [documentId]);

  console.log(documentId, documentName, reviewers, senderEmailFromReviewer);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-danger">{error}</div>;
  }

  <div className="mt-3">
    {reviewers.length === 0 ? (
      <div>No reviewers found for this document.</div>
    ) : null}
  </div>;

  const handleChatHubClick = () => {
    navigate("/dashboard/chat-app-reviewers", {
      state: {
        documentId,
        documentName,
        chatType: "document",
      },
    });
  };
  const handleAddReviewerClick = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setNewReviewer({ email: "" });
  };
  const handleSaveAddReviewer = async () => {
    try {
      const payload = {
        email: newReviewer.email,
      };

      const response = await reviewerApi.AddReviewer(documentId, payload);

      const savedReviewer = response.data;

      setReviewers((prev) => [
        ...prev,
        {
          id: savedReviewer.id,
          email: savedReviewer.email || newReviewer.email,
          approved: savedReviewer.approved === true,
          approvedAt: savedReviewer.approvedAt || "N/A",
        },
      ]);

      Swal.fire({
        title: "Success!",
        text: `Reviewer added successfully for Document ${documentName}!`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      handleCloseModal();
    } catch (err) {
      console.error("Error adding contributor:", err);

      Swal.fire({
        title: "Error",
        text: "Failed to add contributor",
        icon: "error",
      });
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReviewer((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <div>
      <br />

      <div className="d-flex justify-content-between align-items-center">
        <h4>
          <strong>Details of Reviewers</strong>
        </h4>
        {reviewers.length > 0 && (
          <div className="d-flex justify-content-between align-items-center">
            <Button variant="secondary" onClick={handleChatHubClick}>
              <BsWechat /> Chat Hub
            </Button>
          </div>
        )}
      </div>
      <p>
        If you want to send any reviewer you can add here for this document and
        send {documentName}{" "}
        <Button variant="info" onClick={handleAddReviewerClick}>
          Add Reviewer
        </Button>
      </p>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Email</th>
            <th>Approved</th>
            <th>Approved At</th>
          </tr>
        </thead>
        <tbody>
          {reviewers.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center">
                No reviewers found
              </td>
            </tr>
          ) : (
            reviewers.map((reviewer, index) => (
              <tr key={index}>
                <td>{reviewer.email}</td>
                <td>{reviewer.approved ? "Yes" : "No"}</td>
                <td>{reviewer.approvedAt ? reviewer.approvedAt : "N/A"}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Reviewer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="ReviewerEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                value={newReviewer.email}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveAddReviewer}>
            Send Invite
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Reviwers;
