import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { FaDownload, FaEnvelope, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import signerApi from "../../api/signerapi";

const MyDocs = () => {
    const [docs, setDocs] = useState([]);
    const user = JSON.parse(localStorage.getItem("user"));
    const userEmail = user?.userEmail;
    const navigate = useNavigate();
    useEffect(() => {
        if (userEmail) {
            signerApi.getDocumentsByEmail(userEmail)
                .then((res) => {
                    setDocs(res.data);
                })
                .catch((err) => {
                    console.error("Failed to fetch documents", err);
                });
        }
    }, [userEmail]);
    const handleView = (documentId, documentName, signedFile) => {
        if (!documentId || !documentName || !userEmail) return;

        navigate("/dashboard/my-docs/view", {
            state: {
                documentId: documentId,
                documentName: documentName,
                userEmail: userEmail,
                signedFile: signedFile,
            },
        });
    };


    const handleEmail = (signer) => {
        // Trigger email logic here
        console.log("Emailing for", signer.email);
    };

    const handleDownload = (documentId, documentName, signedFile) => {
        if (!signedFile) {
            alert("No signed file available yet.");
            return;
        }

        const byteCharacters = atob(signedFile);
        const byteArrays = [];

        for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
        }

        const blob = new Blob([new Uint8Array(byteArrays)], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${documentName || "document"}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <h1><strong>My Docs</strong></h1>

            <Table hover>
                <thead>
                    <tr style={{ background: "#f0f0f0" }}>
                        <th>Document Name</th>
                        <th >Date Created</th>
                        <th >Signed On</th>
                        <th>Sign Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {docs.length === 0 ? (
                        <tr>
                            <td colSpan="5">
                                No documents found.
                            </td>
                        </tr>
                    ) : (
                        docs.map((doc, index) => {
                            const documentName = doc?.documentName || doc?.document?.documentName;
                            const createdDate = doc?.createdDate || doc?.document?.createdDate;
                            const signedAt = doc?.signedAt ?? doc?.signedAt ?? "Not signed yet";
                            const signStatus = doc?.signStatus;

                            return (
                                <tr key={index}>
                                    <td>{documentName || "N/A"}</td>
                                    <td>{createdDate || "N/A"}</td>
                                    <td>{signedAt || "Not signed yet"}</td>
                                    <td>{signStatus || "pending"}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleView(doc.documentId, doc.documentName, doc.signedFile)}
                                                title="View"
                                            >
                                                <FaEye />
                                            </Button>
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEmail(doc)}
                                                title="Email"
                                            >
                                                <FaEnvelope />
                                            </Button>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleDownload(doc.documentId, doc.documentName, doc.signedFile)}
                                                title="Download"
                                            >
                                                <FaDownload />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}

                </tbody>

            </Table>
        </div>
    );
};





export default MyDocs;
