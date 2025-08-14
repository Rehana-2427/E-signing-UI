import { useEffect, useState } from "react";
import { Button, Card, Form, Spinner } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import adminApi from "../../../api/adminApi";
import documentApi from "../../../api/documentapi";

const PaymentSend = ({ onPrevious, formData, setFormData, setSignatureFields, signatureFields }) => {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user?.userEmail;
    const userName = user?.userName;

    const signatoryCount = formData.signatories?.length || 0;
    const [docCost, setDocCost] = useState(0);
    const [signCost, setSignCost] = useState(0);
    const [totalCredits, setTotalCredits] = useState(0);
    const [confirmSend, setConfirmSend] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch cost settings from admin API
    useEffect(() => {
        adminApi.getCreditSettings()
            .then(res => {
                setDocCost(res.data.docCost);
                setSignCost(res.data.signCost);
            })
            .catch(err => {
                console.error("Failed to load credit settings", err);
                Swal.fire("Error", "Unable to load credit settings from server.", "error");
            });
    }, []);

    // Fetch user's total available credits
    useEffect(() => {
        if (!userEmail) return;

        documentApi.getTotalCredits(userEmail)
            .then(res => {
                setTotalCredits(res.data);
            })
            .catch(err => {
                console.error("Failed to load total credits", err);
                Swal.fire("Error", "Unable to load credit balance from server.", "error");
            });
    }, [userEmail]);

    const documentCharge = docCost;
    const signatoryCharge = signCost * signatoryCount;
    const totalCharge =  signatoryCharge + totalCredits;
    const balanceCredits = documentCharge - totalCharge;

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
            documentCharge,
            signatoryCharge,
            totalCredits,
            draft: false,
            signers: formData.signatories.map(s => ({ name: s.name, email: s.email }))
        };

        formDataToSend.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
        formDataToSend.append("file", formData.editedPdfBlob || formData.file);

        try {
            await documentApi.saveDocument(formDataToSend);

            Swal.fire({
                title: 'Success!',
                text: 'Document sent successfully!',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate("/dashboard/my-consents");
            });
        } catch (err) {
            console.error("Error sending document:", err);
            Swal.fire({
                title: 'Error',
                text: 'Something went wrong while sending the document.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="p-4">
            <h4><strong>Payments & Confirmations</strong></h4>
            <p>Confirm the charges before sending the document for signing.</p>

            <div className="mb-4">
                <p><strong>Document Charges:</strong> {docCost} credits</p>
                <p><strong>Signatory Charges:</strong> {signatoryCount} × {signCost} = {signatoryCharge} credits</p>
                <hr />
                <p><strong>used Credits:</strong> {totalCredits}</p>
                <p><strong>Total Charges:</strong> {totalCharge} credits </p>
                <p><strong>Balance After Sending:</strong> {balanceCredits} credits</p>
            </div>

            <Form.Check
                type="checkbox"
                label="Confirm and send to the signatories"
                checked={confirmSend}
                onChange={(e) => setConfirmSend(e.target.checked)}
            />

            <div className="text-end mt-3">
                <Button variant="secondary" className="me-2" onClick={onPrevious}>
                    Previous
                </Button>
                <Button
                    variant="success"
                    onClick={handleConfirmSend}
                    disabled={!confirmSend || isLoading}
                >
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
