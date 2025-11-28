import { useState } from "react";
import { Badge, Button, Col, Form, Row } from "react-bootstrap";

const CollabContributors = ({ contributors, setContributors }) => {
  const [contributor, setContributor] = useState({
    name: "",
    email: "",
    role: "Actor",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContributor({ ...contributor, [name]: value });
  };

  const handleAddContributor = (e) => {
    e.preventDefault();
    if (!contributor.name || !contributor.email) {
      alert("Please fill in all fields.");
      return;
    }
    setContributors([...contributors, contributor]);
    setContributor({ name: "", email: "", role: "Actor" });
  };

  const handleRemove = (index) => {
    const updated = contributors.filter((_, i) => i !== index);
    setContributors(updated);
  };

  return (
    <>
      <h5 className="mb-3">👥 Contributors</h5>
      <p className="text-muted mb-4">
        Add contributors involved in this collaboration. Each contributor can be
        an <strong>Actor</strong> (executes tasks) or a{" "}
        <strong>Reviewer</strong> (verifies work).
      </p>

      <Form>
        <Row>
          <Col md={4}>
            <Form.Group controlId="name" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={contributor.name}
                onChange={handleChange}
                placeholder="Enter contributor name"
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={contributor.email}
                onChange={handleChange}
                placeholder="Enter contributor email"
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="role" className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={contributor.role}
                onChange={handleChange}
              >
                <option>Actor</option>
                <option>Reviewer</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2} className="d-flex align-items-end">
            <Button variant="primary" onClick={handleAddContributor}>
              ➕ Add
            </Button>
          </Col>
        </Row>
      </Form>

      <div className="mt-3">
        {contributors.length === 0 && (
          <p className="text-muted">No contributors yet.</p>
        )}
        {contributors.map((c, index) => (
          <div
            key={index}
            className="d-flex justify-content-between align-items-center border p-2 mb-2 rounded"
          >
            <div>
              <strong>{c.name}</strong> - {c.email} -{" "}
              <Badge bg={c.role === "Reviewer" ? "info" : "success"}>
                {c.role}
              </Badge>
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleRemove(index)}
            >
              🗑️
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};

export default CollabContributors;
