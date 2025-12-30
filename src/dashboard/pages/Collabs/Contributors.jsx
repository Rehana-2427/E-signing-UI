import { useEffect, useState } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { BsWechat } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import collaborationApi from "../../../api/collaborationApi";

const Contributors = ({ collabId, collaborationName }) => {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // For modal
  const [newContributor, setNewContributor] = useState({
    name: "",
    email: "",
    role: "Reviewer",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (collabId) {
      collaborationApi
        .getContributorsDetails(collabId)
        .then((response) => {
          const contributorsData = response.data.map((item) => ({
            id: item[0],
            name: item[1],
            email: item[2],
            role: item[3],
            createdBy: item[4],
          }));
          setContributors(contributorsData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching contributors:", err);
          setError("Failed to load contributors.");
          setLoading(false);
        });
    }
  }, [collabId]);

  const handleChatHubClick = () => {
    navigate("/dashboard/chat-app", {
      state: {
        collabId,
        collaborationName,
        contributors,
        chatType: "collaboration",
      },
    });
  };

  const handleAddContributorClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewContributor({ name: "", email: "", role: "Reviewer" });
  };
  const handleSaveContributor = async () => {
    try {
      const payload = [
        {
          name: newContributor.name,
          email: newContributor.email,
          role: newContributor.role,
        },
      ];

      const response = await collaborationApi.addContributors(
        collabId,
        payload
      );

      const savedContributor = response.data[0];

      setContributors((prev) => [
        ...prev,
        {
          id: savedContributor.id,
          name: savedContributor.name,
          email: savedContributor.email,
          role: savedContributor.role,
        },
      ]);

      Swal.fire({
        title: "Success!",
        text: `Contributor added successfully for collaboration ${collaborationName}!`,
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
    setNewContributor((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <div>Loading contributors...</div>;
  if (error) return <div>{error}</div>;

  const handleDeleteContributor = async (email) => {
    try {
      await collaborationApi.deleteContributor(collabId, email);

      setContributors((prev) => prev.filter((c) => c.email !== email));

      Swal.fire({
        title: "Deleted!",
        text: "Contributor has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error deleting contributor:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to delete contributor",
        icon: "error",
      });
    }
  };

  return (
    <div>
      <br />
      <div className="d-flex justify-content-between align-items-center">
        <h4>
          <strong>Details of Contributors</strong>
        </h4>
        <Button variant="secondary" onClick={handleChatHubClick}>
          <BsWechat /> Chat Hub
        </Button>
      </div>

      <p>
        If you want to add any contributor you can add here for collaboration{" "}
        {collaborationName}{" "}
        <Button variant="info" onClick={handleAddContributorClick}>
          Add Contributor
        </Button>
      </p>

      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {contributors.map((contributor, index) => (
            <tr key={contributor.id}>
              <td>{index + 1}</td>
              <td>{contributor.name}</td>
              <td>{contributor.email}</td>
              <td>{contributor.role}</td>
              <td>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteContributor(contributor.email)}
                >
                  <MdDelete />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Contributor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="contributorName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                name="name"
                value={newContributor.name}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="contributorEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                value={newContributor.email}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="contributorRole" className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={newContributor.role}
                onChange={handleInputChange}
              >
                <option value="Reviewer">Reviewer</option>
                <option value="Actor">Actor</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveContributor}>
            Save Contributor
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Contributors;
