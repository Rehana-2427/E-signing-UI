import { useEffect, useState } from "react";
import { Alert, Container, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import documentApi from "../../../api/documentapi";

const Audit = ({ documentId, documentName }) => {
  const navigate = useNavigate();
  const [signers, setSigners] = useState([]);
  //   const [documentName, setDocumentName] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  //   const location = useLocation();
  //   const queryParams = new URLSearchParams(location.search);
  //   const documentId = queryParams.get("documentId");

  useEffect(() => {
    const fetchAuditTrail = async () => {
      try {
        const response = await documentApi.getSignerAudit(documentId);
        const { signers } = response.data;

        setSigners(signers);

        const allSigned = signers.every(
          (s) => s.signStatus?.toLowerCase() === "completed"
        );
        setIsCompleted(allSigned);
      } catch (error) {
        console.error("Error fetching audit trail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (documentId) fetchAuditTrail();
  }, [documentId]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" /> Loading audit trail...
      </div>
    );
  const handleBack = () => {
    navigate(-1);
  };
  return (
    <Container className="mt-4">
      <div class="header-container">
        <h3>Audit Trail</h3>
        {/* <Button onClick={handleBack} variant="info" className="tooltip-btn">
          <IoArrowBackCircleSharp />
          <span className="tooltip-text">Go to Back</span>
        </Button> */}
      </div>

      {!isCompleted ? (
        <Alert variant="warning">
          Not all people have signed yet. You will see the full audit trail
          after all signers complete their part.
        </Alert>
      ) : (
        <>
          <Alert variant="success">
            All signers have completed signing. Below is the full audit trail.
          </Alert>
          <p>
            <strong>Document Name:</strong> {documentName}
          </p>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Signer Name</th>
                <th>Signer Email</th>
                <th>Status</th>
                <th>Signed At</th>
              </tr>
            </thead>
            <tbody>
              {signers.map((signer, index) => (
                <tr key={signer.email}>
                  <td>{signer.name}</td>
                  <td>{signer.email}</td>
                  <td>{signer.signStatus}</td>
                  <td>{signer.signedAt || "Not signed"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
};

export default Audit;
