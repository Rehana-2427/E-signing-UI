import { useEffect, useState } from "react";
import { Button, Spinner, Table } from "react-bootstrap";
import { BsWechat } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import signerApi from "../../../api/signerapi";

const Signers = ({ documentId, documentName }) => {
  const [signers, setSigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [senderEmailFromSender, setSenderEmailFromSender] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    if (documentId) {
      signerApi
        .getDetailsOfSignersById(documentId)
        .then((response) => {
          console.log("Signers data:", response.data);
          setSigners(response.data);
          
          // Extract senderEmail from the first signer
          if (response.data && response.data.length > 0 && response.data[0].senderEmail) {
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
    return <div>No reviewers found for this document.</div>;
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

  console.log("Sender Email From Sender:", senderEmailFromSender); // Log the senderEmailFromSender state

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
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Signed Status</th>
            <th>Signed At</th>
          </tr>
        </thead>
        <tbody>
          {signers.map((signer, index) => (
            <tr key={index}>
              <td>{signer.name}</td>
              <td>{signer.email}</td>
              <td>{signer.signStatus ? signer.signStatus : "Not signed"}</td>
              <td>{signer.signedAt ? signer.approvedAt : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Signers;
