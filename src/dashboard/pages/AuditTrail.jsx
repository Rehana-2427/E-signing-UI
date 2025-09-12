import { useEffect, useState } from "react";
import { Alert, Container, Spinner, Table } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import documentApi from "../../api/documentapi";

const AuditTrail = () => {
    const [signers, setSigners] = useState([]);
    const [documentName, setDocumentName] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const documentId = queryParams.get("documentId");

    useEffect(() => {
        const fetchAuditTrail = async () => {
            try {
                const response = await documentApi.getSignerAudit(documentId);
                const { signers, documentName } = response.data;

                setDocumentName(documentName);
                setSigners(signers);

                const allSigned = signers.every(s => s.signStatus?.toLowerCase() === "completed");
                setIsCompleted(allSigned);
            } catch (error) {
                console.error("Error fetching audit trail:", error);
            } finally {
                setLoading(false);
            }
        };

        if (documentId) fetchAuditTrail();
    }, [documentId]);

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /> Loading audit trail...</div>;

    return (
        <Container className="mt-4">
            <h2><strong>Audit Trail</strong></h2>

            {!isCompleted ? (
                <Alert variant="warning">
                    Not all people have signed yet. You will see the full audit trail after all signers complete their part.
                </Alert>
            ) : (
                <>
                    <Alert variant="success">
                        All signers have completed signing. Below is the full audit trail.
                    </Alert>
                    <p><strong>Document Name:</strong> {documentName}</p>

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

export default AuditTrail;
