import { useState } from "react";
import { Badge, Button, Card, Col, Form, Row, Table } from "react-bootstrap";

const CollabTasks = () => {
  const [task, setTask] = useState({
    description: "",
    assignedTo: "",
    dueDate: "",
    comment: "",
    status: "Pending",
  });

  const [tasks, setTasks] = useState([]);
  const [actionLogs, setActionLogs] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const handleAddTask = (e) => {
    e.preventDefault();

    if (!task.description || !task.assignedTo) {
      alert("Please fill in both task description and assignee.");
      return;
    }

    const newTask = {
      id: tasks.length + 1,
      ...task,
      createdOn: new Date().toLocaleString(),
    };

    setTasks([...tasks, newTask]);
    setActionLogs([
      ...actionLogs,
      {
        id: actionLogs.length + 1,
        action: "Added task",
        user: "Current User",
        time: new Date().toLocaleString(),
        details: `Task: ${task.description} assigned to ${task.assignedTo}`,
      },
    ]);

    setTask({
      description: "",
      assignedTo: "",
      dueDate: "",
      comment: "",
      status: "Pending",
    });
  };

  const handleStatusChange = (index, newStatus) => {
    const updated = [...tasks];
    updated[index].status = newStatus;
    setTasks(updated);

    setActionLogs([
      ...actionLogs,
      {
        id: actionLogs.length + 1,
        action: "Updated status",
        user: "Current User",
        time: new Date().toLocaleString(),
        details: `Task: ${updated[index].description} → ${newStatus}`,
      },
    ]);
  };

  const handleRemove = (index) => {
    const removedTask = tasks[index];
    const updated = tasks.filter((_, i) => i !== index);
    setTasks(updated);

    setActionLogs([
      ...actionLogs,
      {
        id: actionLogs.length + 1,
        action: "Removed task",
        user: "Current User",
        time: new Date().toLocaleString(),
        details: `Deleted task: ${removedTask.description}`,
      },
    ]);
  };

  const handleDownloadLogs = () => {
    alert("Logs and data will be downloaded as ZIP (mock).");
  };

  return (
    <Card className="p-4 mt-3 shadow-sm">
      <h5 className="mb-3">✅ Tasks & Actions</h5>
      <p className="text-muted mb-4">
        Manage all tasks for this collaboration. Assign actions, set deadlines,
        and track progress. Every update is recorded in the action log.
      </p>

      {/* Task Creation Form */}
      <Form onSubmit={handleAddTask}>
        <Row>
          <Col md={5}>
            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Task Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={task.description}
                onChange={handleChange}
                placeholder="Enter task details"
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group className="mb-3" controlId="assignedTo">
              <Form.Label>Assigned To</Form.Label>
              <Form.Control
                type="text"
                name="assignedTo"
                value={task.assignedTo}
                onChange={handleChange}
                placeholder="Enter assignee name"
              />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group className="mb-3" controlId="dueDate">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                name="dueDate"
                value={task.dueDate}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          <Col md={2} className="d-flex align-items-end">
            <Button type="submit" variant="primary">
              ➕ Add Task
            </Button>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Form.Group className="mb-3" controlId="comment">
              <Form.Label>Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="comment"
                value={task.comment}
                onChange={handleChange}
                placeholder="Optional comment or note..."
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {/* Tasks Table */}
      {tasks.length > 0 ? (
        <Table bordered hover responsive className="mt-4">
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Assigned To</th>
              <th>Due Date</th>
              <th>Comment</th>
              <th>Status</th>
              <th>Created On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t, index) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.description}</td>
                <td>{t.assignedTo}</td>
                <td>{t.dueDate || "-"}</td>
                <td>{t.comment || "-"}</td>
                <td>
                  <Badge bg={t.status === "Done" ? "success" : "warning"}>
                    {t.status}
                  </Badge>
                </td>
                <td>{t.createdOn}</td>
                <td>
                  {t.status === "Pending" ? (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleStatusChange(index, "Done")}
                    >
                      ✅ Mark Done
                    </Button>
                  ) : (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleStatusChange(index, "Pending")}
                    >
                      ↩️ Undo
                    </Button>
                  )}{" "}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRemove(index)}
                  >
                    ❌ Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-muted mt-3">No tasks added yet.</p>
      )}

      {/* Action Log */}
      <h6 className="mt-4 mb-2 text-primary">📜 Action Log</h6>
      {actionLogs.length > 0 ? (
        <Table bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Action</th>
              <th>User</th>
              <th>Time</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {actionLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.user}</td>
                <td>{log.time}</td>
                <td>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-muted">No actions logged yet.</p>
      )}

      {/* Download All Logs */}
      <div className="text-end mt-3">
        <Button variant="success" onClick={handleDownloadLogs}>
          📦 Download Log & Data (ZIP)
        </Button>
      </div>
    </Card>
  );
};

export default CollabTasks;
