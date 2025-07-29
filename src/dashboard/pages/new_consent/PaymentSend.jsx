import axios from 'axios';
import { useState } from "react";
import { Button, Card, Form, Spinner, Toast, ToastContainer } from "react-bootstrap";


const PaymentSend = ({ onPrevious, formData, signatureFields }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user?.userEmail;
    const userName = user?.userName;
    const signatoryCount = formData.signatories?.length || 0;
    const documentCharge = 5; // Fixed charge
    const signatoryCharge = 1 * signatoryCount;
    const totalCredits = documentCharge + signatoryCharge;
    const [confirmSend, setConfirmSend] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);


    const handleConfirmSend = async () => {
        setIsLoading(true); 
        const formDataToSend = new FormData();
        const payload = {
            senderEmail: userEmail,
            senderName: userName,
            documentName: formData.documentName,
            description: formData.description,
            fileName: formData.file?.name,
            signingMode: formData.signingMode,
            additionalInitials: formData.blockAllPages,
            deadline: formData.deadline,
            reminderEveryDay: formData.reminderDays?.everyDay || false,
            reminderDaysBeforeEnabled: formData.reminderDays?.daysBeforeEnabled || false,
            reminderDaysBefore: formData.reminderDays?.daysBefore || null,
            reminderLastDay: formData.reminderDays?.lastDay || false,
            sendFinalCopy: formData.sendFinalCopy || false,
            documentCharge: 5,
            signatoryCharge: formData.signatories.length,
            totalCredits: 5 + formData.signatories.length,
            draft: false,
            signers: formData.signatories.map(s => ({ name: s.name, email: s.email }))
        };
        formDataToSend.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
        formDataToSend.append("file", formData.editedPdfBlob || formData.file);

        try {
            const response = await axios.post("http://localhost:8084/api/documents/save-document", formDataToSend, {
                responseType: 'blob',
            });

            setShowToast(true);
            // // Prepare to download the PDF (either editedPdfBlob or response data)
            // let downloadBlob;
            // let fileName;

            // if (formData.editedPdfBlob) {
            //     // If you have the edited blob locally, use it
            //     downloadBlob = formData.editedPdfBlob;
            //     fileName = (formData.documentName || "document").replace(/\s+/g, "_") + "_edited.pdf";
            // } else if (response.data) {
            //     // If backend returns the file as blob
            //     downloadBlob = response.data;
            //     fileName = (formData.documentName || "document").replace(/\s+/g, "_") + ".pdf";
            // } else {
            //     alert("No file available to download.");
            //     return;
            // }

            // // Create temporary link to download
            // const url = URL.createObjectURL(downloadBlob);
            // const a = document.createElement("a");
            // a.href = url;
            // a.download = fileName;
            // document.body.appendChild(a);
            // a.click();
            // document.body.removeChild(a);
            // URL.revokeObjectURL(url);

        } catch (err) {
            console.error(err);

        }
        finally {
            setIsLoading(false); // stop loading
        }
    };

    return (
        <Card className="p-4">
            <h4><strong>Payments & Confirmations</strong></h4>
            <p>Confirm the charges before sending the document for signing.</p>
            <ToastContainer position="bottom-end" className="p-3">
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg="success">
                    <Toast.Header>
                        <strong className="me-auto">Success</strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">File sent successfully!</Toast.Body>
                </Toast>
            </ToastContainer>

            <div className="mb-4">
                <p><strong>Document Charges:</strong> 5 Credits</p>
                <p><strong>Signatory Charges:</strong> {signatoryCount} × 1 Credit = {signatoryCharge} Credits</p>
                <p><strong>Total Credits:</strong> {totalCredits} Credits</p>
            </div>

            <Form.Check
                type="checkbox"
                label="Confirm and send to the signatories"
                checked={confirmSend}
                onChange={(e) => setConfirmSend(e.target.checked)}
            />

            <div className="text-end">
                <Button variant="secondary" className="me-2" onClick={onPrevious}>
                    Previous
                </Button>
                <Button variant="success" onClick={handleConfirmSend} disabled={!confirmSend || isLoading}>
                    {isLoading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Sending...
                        </>
                    ) : (
                        "Confirm and Send"
                    )}
                </Button>

            </div>
        </Card>
    );
};

export default PaymentSend;
