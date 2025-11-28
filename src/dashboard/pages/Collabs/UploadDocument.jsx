import { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import Swal from "sweetalert2";
import collabDocumentsApi from "../../../api/collabDocumentsApi";
import collaborationApi from "../../../api/collaborationApi";

const UploadDocument = ({ collabId, collaborationName }) => {
  const [collaborations, setCollaborations] = useState([]);
  const [documents, setDocuments] = useState([]); // Store documents
  const user = JSON.parse(localStorage.getItem("user"));
  const senderEmail = user?.userEmail;
  const [contributors, setContributors] = useState([]);
  const [docData, setDocData] = useState({
    description: "",
    file: null,
    collabName: "",
    sendTo: "",
    role: "",
    email: "",
  });

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
        })
        .catch((err) => {
          console.error("Error fetching contributors:", err);
        });
    }
  }, [collabId]);
  const handleChange = (e) => {
    const { name, value } = e.target;

    setDocData((prevDocData) => {
      const updatedData = {
        ...prevDocData,
        [name]: value,
        ...(name == "collabId" && {
          collaborationName:
            collaborations.find((collab) => collabId == value)
              ?.collaborationName || "",
        }),
      };

      console.log("Updated docData:", updatedData); // Log the updated data to check if collabName is set
      return updatedData;
    });
  };

  const handleFileChange = (e) => {
    setDocData({ ...docData, file: e.target.files[0] });
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!docData.file) {
      alert("Please select a file to upload!");
      return;
    }
    const selectedCollab = collaborations.find(
      (collab) => collab.collabId == collabId
    );
    const collabName = selectedCollab ? selectedCollab.collabName : "";

    const email = docData.email ? [docData.email] : [];

    const payload = {
      documentName: docData.file.name,
      description: docData.description,
      uploadedBy: senderEmail,
      collabId: collabId,
      collabName: collabName,
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
          collabName: "",
          sendTo: "",
          role: "",
          email: "",
          uploadedBy: senderEmail,
        });
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
  const getFilteredEmails = (role) => {
    return contributors
      .filter((user) => user.role === role)
      .map((user) => user.email);
  };
  return (
    <>
      <br />
      <h5>Upload Document for Collaboration: {collaborationName}</h5>
      <Form>
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
              <Form.Control type="file" onChange={handleFileChange} />
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

          <Button variant="success">📦 Download (ZIP)</Button>
        </div>
      </div>
    </>
  );
};

export default UploadDocument;
