import { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import { BsWechat } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import signerApi from "../../../api/signerapi";

const Signers = ({ documentId, documentName }) => {
  const [signers, setSigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [senderEmailFromSender, setSenderEmailFromSender] = useState();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [newSigner, setNewSigner] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (documentId) {
      signerApi
        .getDetailsOfSignersById(documentId)
        .then((response) => {
          console.log("Signers data:", response.data);
          setSigners(response.data);

          // Extract senderEmail from the first signer
          if (
            response.data &&
            response.data.length > 0 &&
            response.data[0].senderEmail
          ) {
            setSenderEmailFromSender(response.data[0].senderEmail);
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

  const handleaddSignerClick = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setNewSigner({ name: "", email: "" });
  };
  const handleSaveAddSigner = async () => {
    try {
      const payload = {
        name: newSigner.name,
        email: newSigner.email,
      };

      const response = await signerApi.AddSigner(documentId, payload);

      const savedSigner = response.data;

      setSigners((prev) => [
        ...prev,
        {
          id: savedSigner.id,
          name: savedSigner.name ||  newSigner.name,
          email: savedSigner.email || newSigner.email,
          signStatus: savedSigner.signStatus || "Not signed",
          signedAt: savedSigner.signedAt || "N/A",
          
        },
      ]);

      Swal.fire({
        title: "Success!",
        text: `Signer added successfully for Document ${documentName}!`,
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
    setNewSigner((prev) => ({ ...prev, [name]: value }));
  };
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

  if (!signers.length) {
    return <div className="mt-3">No Signers found for this document.</div>;
  }

  const handleChatHubClick = () => {
    navigate("/dashboard/chat-app-signers", {
      state: {
        documentId,
        documentName,
        // signers,
        chatType: "document",
        // senderEmailFromSender,
      },
    });
  };

  // const handleaddSignerClick = () => {};
  return (
    <div>
      <br />
      <div className="d-flex justify-content-between align-items-center">
        <h4>
          <strong>Details of Signers</strong>
        </h4>
        <Button variant="secondary" onClick={handleChatHubClick}>
          <BsWechat /> Chat Hub
        </Button>
      </div>
      <p>
        If you want to send any signer you can add here for this document and
        send {documentName}{" "}
        <Button variant="info" onClick={handleaddSignerClick}>
          Add Signer
        </Button>
      </p>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Signed Status</th>
            <th>Signed At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {signers.map((signer, index) => (
            <tr key={index}>
              <td>{signer.name}</td>
              <td>{signer.email}</td>
              <td>{signer.signStatus ? signer.signStatus : "Not signed"}</td>
              <td>{signer.signedAt ? signer.approvedAt : "N/A"}</td>
              <td>
                <Button variant="danger">
                  <MdDelete />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Signer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="SignerName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                name="name"
                value={newSigner.name}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="SignerEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                value={newSigner.email}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveAddSigner}>
            Send Invite
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Signers;
