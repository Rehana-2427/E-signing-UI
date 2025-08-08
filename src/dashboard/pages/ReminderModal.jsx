import { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner, Toast, ToastContainer } from "react-bootstrap";
import documentApi from "../../api/documentapi";
import signerApi from "../../api/signerapi";

const ReminderModal = ({ show, onClose, documentId, documentName, onSend }) => {
    const [signers, setSigners] = useState([]);
    const [selectedSigners, setSelectedSigners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', bg: '' });

    const user = JSON.parse(localStorage.getItem("user"));
    const senderEmail = user?.userEmail;

    useEffect(() => {
        if (show && documentId) {
            signerApi.getSignersByDocumentId(documentId)
                .then(res => {
                    setSigners(res.data);
                    const pending = res.data
                        .filter(s => s.signStatus?.toLowerCase() !== 'completed')
                        .map(s => s.email);
                    setSelectedSigners(pending);
                })
                .catch(err => {
                    console.error("Failed to fetch signers:", err);
                });
        }
    }, [show, documentId]);

    const handleCheckboxChange = (email) => {
        setSelectedSigners(prev =>
            prev.includes(email)
                ? prev.filter(e => e !== email)
                : [...prev, email]
        );
    };

    const handleSendReminder = () => {
        setLoading(true);
        const payload = {
            id: documentId, // Make sure to send document ID
            senderEmail,
            title: documentName,
            recipients: selectedSigners.map(email => {
                const signer = signers.find(s => s.email === email);
                return {
                    name: signer?.name || '',
                    email: email,
                };
            }),
        };
        documentApi.sendReminder(payload)
            .then(() => {
                setToast({ show: true, message: "Reminder email sent successfully.", bg: "success" });
                setLoading(false);
                onClose();
                if (onSend) onSend(); // callback if provided
            })
            .catch((err) => {
                console.error("Error sending reminder:", err);
                setToast({ show: true, message: "Failed to send reminder.", bg: "danger" });
                setLoading(false);
            });
    };

    return (
        <>
            <Modal show={show} onHide={onClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Send Reminder</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Are you sure you want to send a reminder for document: <strong>{documentName} </strong>?
                    </p>

                    <Form>
                        <p className="mt-3 mb-2"><strong>Signers:</strong></p>
                        {signers.length === 0 ? (
                            <p>No signers found.</p>
                        ) : (
                            signers.map((signer, index) => {
                                const isCompleted = signer.signStatus?.toLowerCase() === "completed";
                                return (
                                    <Form.Check
                                        key={index}
                                        type="checkbox"
                                        label={`${signer.name} (${signer.email}) - ${signer.signStatus}`}
                                        checked={isCompleted || selectedSigners.includes(signer.email)}
                                        disabled={isCompleted}
                                        onChange={() => !isCompleted && handleCheckboxChange(signer.email)}
                                    />
                                );
                            })
                        )}
                    </Form>

                    {signers.some(s => s.signStatus?.toLowerCase() !== "completed") && (
                        <p className="text-muted mt-3">
                            You can only send reminders to signers who haven't completed signing yet.
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSendReminder}
                        disabled={selectedSigners.length === 0 || loading}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" role="status" aria-hidden="true" /> Sending...
                            </>
                        ) : (
                            "Send Email"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer position="top-end" className="p-3">
                <Toast
                    onClose={() => setToast(prev => ({ ...prev, show: false }))}
                    show={toast.show}
                    bg={toast.bg}
                    delay={3000}
                    autohide
                >
                    <Toast.Body className="text-white">{toast.message}</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
};

export default ReminderModal;
