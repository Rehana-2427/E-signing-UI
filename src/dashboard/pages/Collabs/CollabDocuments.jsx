import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  OverlayTrigger,
  Row,
  Table,
  Tooltip,
} from "react-bootstrap";
import Swal from "sweetalert2";
import collabDocumentsApi from "../../../api/collabDocumentsApi";
import collaborationApi from "../../../api/collaborationApi";

const CollabDocuments = ({ collabId, collaborationName }) => {
  const [docData, setDocData] = useState({
    description: "",
    file: null,
    collabName: collaborationName || "",
    sendTo: "",
    role: "",
    email: "",
  });
  const [documents, setDocuments] = useState([]); // Store documents
  const [shareLink, setShareLink] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showForm, setShowForm] = useState(false); // toggle between table and form
  const user = JSON.parse(localStorage.getItem("user"));
  const senderEmail = user?.userEmail;
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [formError, setFormError] = useState("");

  // Fetch documents based on the sender's email
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await collabDocumentsApi.getCollabDocsByCollabId(
          collabId
        );
        if (response.status === 200) {
          setDocuments(response.data);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        alert("Failed to load documents.");
      }
    };

    if (collabId) {
      fetchDocuments();
    }
  }, [collabId]);

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
          }));

          setContributors(contributorsData);
          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to load contributors.");
          setLoading(false);
        });
    }
  }, [collabId]);

  // Handle form data changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setDocData((prevDocData) => ({
      ...prevDocData,
      [name]: value,
      ...(name === "collabId" && {
        collabName:
          collaborations.find((collab) => collab.collabId == value)
            ?.collabName || "",
      }),
    }));
  };

  const handleFileChange = (e) => {
    setDocData({ ...docData, file: e.target.files[0] });
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!collabId) {
      setFormError("Please select a collaboration first.");
      return;
    }

    setFormError("");

    if (!docData.file) {
      alert("Please select a file to upload!");
      return;
    }

    const email = docData.email ? [docData.email] : [];

    const payload = {
      documentName: docData.file.name,
      description: docData.description,
      uploadedBy: senderEmail,
      collabId: collabId,
      collabName: collaborationName,
      sendTo: docData.role,
      email: email,
    };

    console.log("Payload before uploading:", payload);

    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
    formData.append("file", docData.file);

    try {
      const response = await collabDocumentsApi.uploadDocument(formData);
      if (response.status === 201) {
        await Swal.fire({
          icon: "success",
          title: "File Saved!",
          text: "Your file has been saved successfully.",
          confirmButtonText: "OK",
        });

        const newDoc = response.data;
        setDocuments((prevDocs) => [...prevDocs, newDoc]);

        setDocData({
          description: "",
          file: null,
          collabName: collaborationName,
          sendTo: "",
          role: "",
          email: "",
          uploadedBy: senderEmail,
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      await Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: "Something went wrong while saving the file.",
        confirmButtonText: "OK",
      });
    }
  };

  // Get filtered emails based on selected role
  const getFilteredEmails = (role) => {
    return contributors
      .filter((user) => user.role === role)
      .map((user) => user.email);
  };

  return (
    <Card className="p-4 mt-3 shadow-sm">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="mb-0">📄 Documents</h5>

        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "← Back " : "Upload Document"}
        </Button>
      </div>

      <p>
        <strong>
          For each collaboration you select, if you send a document, 0.2 credits
          will be deducted.
        </strong>
      </p>

      {documents.length === 0 ? (
        <p className="text-muted mb-4">
          No documents uploaded yet. Please upload documents.
        </p>
      ) : (
        <>
          {/* TABLE VIEW */}
          {!showForm && (
            <>
              <p className="text-black mb-4">
                List of documents uploaded below.
              </p>

              {documents.length > 0 ? (
                <Table bordered hover responsive className="mb-3">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>File Name</th>
                      <th>Send To</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.id}</td>
                        <td>{doc.documentName}</td>
                        <td>{doc.email} - {doc.sendTo} </td>
                        {/* Truncate description and use OverlayTrigger for full description */}
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>{doc.description}</Tooltip>}
                          >
                            <span style={{ cursor: "pointer" }}>
                              {doc.description.length > 12
                                ? `${doc.description.slice(0, 12)}...`
                                : doc.description}
                            </span>
                          </OverlayTrigger>
                        </td>
                        <td>{doc.uploadAt}</td>
                        <td>
                          <Button variant="outline-danger" size="sm">
                            🗑️
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No documents uploaded yet.</p>
              )}
            </>
          )}
        </>
      )}

      {/* FORM VIEW */}
      {showForm && (
        <>
          <Form>
            {/* Document Upload Form */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="documentName">
                  <Form.Label>Document Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={docData.documentName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="file">
                  <Form.Label>Upload Document</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    disabled={!collabId}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="sendTo">
                  <Form.Label>Send To</Form.Label>
                  <Form.Select
                    name="sendTo"
                    value={docData.sendTo}
                    onChange={(e) => {
                      const selectedRole = e.target.value;
                      handleChange(e); // Update the assignedTo value
                      setDocData({
                        ...docData,
                        sendTo: selectedRole, // Ensure assignedTo is updated correctly
                        role: selectedRole || "", // Set the role based on the "Assign To" selection
                        email: "", // Clear email when role changes
                      });
                    }}
                    disabled={!collabId}
                  >
                    <option value="">Select a user...</option>
                    <option value="Actor">Actor</option>
                    <option value="Reviewer">Reviewer</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Select
                    name="email"
                    value={docData.email}
                    onChange={handleChange}
                    disabled={!collabId}
                  >
                    <option value="">Select Email</option>
                    {getFilteredEmails(docData.role).map((email) => (
                      <option key={email} value={email}>
                        {email}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Content / Message / Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={docData.description}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Enter document details..."
                    disabled={!collabId}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>

          <div className="d-flex justify-content-between mt-3">
            <div className="d-flex gap-2">
              <Button type="submit" variant="info" onClick={handleUpload}>
                💾 Save
              </Button>

            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default CollabDocuments;
