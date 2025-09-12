import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { AiFillEye, AiOutlineDownload } from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import documentApi from "../../../api/documentapi";
import ReminderModal from "../ReminderModal";

const MyConsents = () => {
    const navigate = useNavigate();
    const [consents, setConsents] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));
    const senderEmail = user?.userEmail;
    const [showModal, setShowModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    useEffect(() => {
        setLoading(true);
        documentApi.getMyConsents(senderEmail)
            .then((response) => {
                setConsents(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Failed to fetch consents:", error);
                setLoading(false);
            });
    }, [senderEmail]);

    const handleEmailClick = (doc) => {
        setSelectedDoc(doc);
        setShowModal(true);
    };


    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDoc(null)
    };

    const handleSendReminder = (docId) => {
        console.log("Sending email reminder for document:", docId);
        setShowModal(false);
    };

    if (loading) return <p>Loading consents...</p>;

    return (
        <>

            <Table hover>
                <thead>
                    <tr>
                        <th>Document Name</th>
                        <th>Sent On</th>
                        {/* <th>Signed On</th> */}
                        <th># of People</th>
                        <th>Actions</th>
                        <th>Audit Trail</th>
                    </tr>
                </thead>
                <tbody>
                    {consents.length === 0 ? (
                        <tr>
                            <td colSpan="6">No consents found.</td>
                        </tr>
                    ) : (
                        consents.map((consent) => (
                            <tr key={consent.documentId}>
                                <td>{consent.documentName}</td>
                                <td>{consent.sentOn}</td>

                                {/* <td>{consent.signedOn || "Not signed yet"}</td> */}
                                <td>{consent.signedCount} / {consent.totalSigners}</td>
                                <td>
                                    <Button variant="primary" size="sm" className="me-2" title="View">
                                        <AiFillEye />
                                    </Button>
                                    <Button variant="success" size="sm" className="me-2" title="Download">
                                        <AiOutlineDownload />
                                    </Button>
                                    <Button
                                        variant="info"
                                        size="sm"
                                        title="Email"
                                        onClick={() => handleEmailClick(consent)} // pass full consent object
                                    >
                                        <MdEmail />
                                    </Button>
                                </td>
                                <td>
                                    <Button onClick={() => navigate(`/dashboard/my-consents/audit-trail?documentId=${consent.documentId}`)}>
                                        Audit Trail
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <ReminderModal
                show={showModal}
                onClose={handleCloseModal}
                documentId={selectedDoc?.documentId}
                documentName={selectedDoc?.documentName}
                onSend={handleSendReminder}
            />

        </>
    );
};

export default MyConsents;
