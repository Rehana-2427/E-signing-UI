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
    const [signCost, setSignCost] = useState(0)

    const [confirmSend, setConfirmSend] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        // fetch credit cost from admin service
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

    const documentCharge = docCost;
    const signatoryCharge = signCost * signatoryCount;
    const totalCredits = signatoryCharge;
    const balanceCredits = docCost - totalCredits

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
            console.error(err);
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
                <p><strong>Document Charges:</strong> {docCost}</p>
                <p><strong>Signatory Charges:</strong> {signatoryCount} × {signCost} Credits</p>
                <p><strong>Total Credits:</strong> {totalCredits} / {docCost} Credits</p>
                <hr style={{ borderTop: '2px solid black' }} />
                <p><strong>Used Credits:</strong> {totalCredits} Credits</p>
                <p><strong>Balance Credits:</strong> {balanceCredits}</p>
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
