import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { FaPlus, FaTrash } from "react-icons/fa";
import documentApi from "../../../api/documentapi";
import SignatureStyle from "../SignatureStyle";
import FilePreview from "./FIlePreview";
import SignatureToolbox from "./SignatureToolbox";

const SignatoriesSettings = ({ onNext, onPrevious, onDraft, formData, setFormData }) => {
    const [signatories, setSignatories] = useState(formData.signatories || []);
    const [signingMode, setSigningMode] = useState(formData.signingMode || "");
    const [blockAllPages, setBlockAllPages] = useState(formData.blockAllPages || "");
    const [deadline, setDeadline] = useState(formData.deadline || "");
    const [reminderDays, setReminderDays] = useState(formData.reminderDays || "");
    const [sendFinalCopy, setSendFinalCopy] = useState(formData.sendFinalCopy || false);
    const [fileUrl, setFileUrl] = useState(null);
    const [selectedField, setSelectedField] = useState(null);
    const [signatureFields, setSignatureFields] = useState(formData.signatureFields || []);

    const [fontSettings, setFontSettings] = useState({
        fontType: "Arial",
        fontSize: "14",
        fontColor: "#000000",
    });
    useEffect(() => {
        console.log("Received formData in SignatoriesSettings:", formData);
    }, [formData]);

    useEffect(() => {
        if (formData.file) {
            const url = URL.createObjectURL(formData.file);
            setFileUrl(url);

            // Cleanup the object URL when component unmounts
            return () => URL.revokeObjectURL(url);
        }
    }, [formData.file]);

    const addSignatory = () => {
        setSignatories([...signatories, { name: "", email: "" }]);
    };

    const removeSignatory = (index) => {
        const updated = [...signatories];
        updated.splice(index, 1);
        setSignatories(updated);
    };

    const updateSignatory = (index, field, value) => {
        const updated = [...signatories];
        updated[index][field] = value;
        setSignatories(updated);
    };
    const handleSave = (signatureFields) => {
        setFormData(prev => ({
            ...prev,
            signatureFields // Save the signature fields in formData
        }));
    };
    const handleSubmit = () => {
        handleSave(signatureFields);
        setFormData(prev => ({
            ...prev,
            signatories,
            signingMode,
            blockAllPages,
            deadline,
            reminderDays,
            sendFinalCopy,
        }));
        onNext();
    };

    const handlePdfEdited = (blob) => {
        setFormData(prev => ({
            ...prev,
            editedPdfBlob: blob // Store the edited PDF blob in formData
        }));
    };

    const handleSaveDraft = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const userEmail = user?.userEmail;

        // Prepare the draft payload using current state
        const payload = {
            senderEmail: userEmail,
            documentName: formData.documentName || "",
            description: formData.description || "",
            fileName: formData.file?.name || "",
            signingMode: signingMode || null,
            additionalInitials: !!blockAllPages,
            deadline: deadline || null,
            reminderEveryDay: reminderDays.everyDay || false,
            reminderDaysBeforeEnabled: reminderDays.daysBeforeEnabled || false,
            reminderDaysBefore: reminderDays.daysBefore || null,
            reminderLastDay: reminderDays.lastDay || false,
            sendFinalCopy: sendFinalCopy || false,
            documentCharge: 0,
            signatoryCharge: 0,
            totalCredits: 5, // Default as requested
            draft: true,
            signers: signatories || []
        };

        const formDataToSend = new FormData();
        formDataToSend.append(
            "data",
            new Blob([JSON.stringify(payload)], { type: "application/json" })
        );
        formDataToSend.append("file", formData.file);

        try {
            const response = await documentApi.saveDocument(formDataToSend);

            if (response.status === 200) {
                alert("Draft saved successfully!");
            } else {
                alert("Failed to save draft.");
            }
        } catch (error) {
            console.error("Error saving draft:", error);
        }
    };


    return (
        <>
            <h3><strong>Signatories & Settings</strong></h3>
            <p>Configure who needs to sign and how</p>

            {/* Signatories Section */}
            <Card className="p-4 mb-4">
                <h5 className=" required-label"><strong>Signatories</strong></h5>
                {signatories.length === 0 && (
                    <p className="text-danger">At least one signatory should be added</p>
                )}
                {signatories.map((signatory, index) => (
                    <Row key={index} className="align-items-end mb-3">
                        <Col md={3}>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={signatory.name}
                                onChange={(e) => updateSignatory(index, "name", e.target.value)}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={signatory.email}
                                onChange={(e) => {
                                    const email = e.target.value;
                                    if (!email.includes("@") && email !== "") {
                                        e.target.setCustomValidity("Email must contain @");
                                    } else {
                                        e.target.setCustomValidity("");
                                    }
                                    updateSignatory(index, "email", email);
                                }}
                                onInvalid={(e) => e.target.setCustomValidity("Please enter a valid email")}
                                required
                            />
                        </Col>



                        <Col md={1}>
                            <Button variant="danger" onClick={() => removeSignatory(index)}>
                                <FaTrash />
                            </Button>
                        </Col>
                    </Row>
                ))}
                <Button onClick={addSignatory} style={{ width: '20%' }}>
                    <FaPlus className="me-1" /> Add Signatory
                </Button>
            </Card>


            {/* Group 1: Signing Block Placement Mode */}
            <Card className="p-4 mb-4">
                <Row>

                    {/* Left Column: Signatory Settings */}

                    <h5 className="required-label"><strong>Signing Block Placement Mode</strong></h5>
                    <div className="mb-2">
                        <strong>Add all signatories on same document</strong>
                        <div className="ms-3 mt-2">
                            <Form.Check
                                type="radio"
                                name="signingMode"
                                label="Add all at the end of the document"
                                value="same_doc_end"
                                checked={signingMode === "same_doc_end"}
                                onChange={(e) => setSigningMode(e.target.value)}
                            />
                            <Form.Check
                                type="radio"
                                name="signingMode"
                                label="Add one page each for each signatory"
                                value="same_doc_pages"
                                checked={signingMode === "same_doc_pages"}
                                onChange={(e) => setSigningMode(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mb-2 mt-3">
                        <strong>Create multiple documents</strong>
                        <div className="ms-3 mt-2">
                            <Form.Check
                                type="radio"
                                name="signingMode"
                                label="Add signatory at the end of document"
                                value="multi_doc"
                                checked={signingMode === "multi_doc"}
                                onChange={(e) => setSigningMode(e.target.value)}
                            />
                        </div>
                    </div>

                    <h5 className="required-label mt-4"><strong>Additional Initials</strong></h5>
                    <Form.Check
                        type="radio"
                        name="additionalInitials"
                        label="Add signing block on all pages"
                        value="all"
                        checked={blockAllPages === "all"}
                        onChange={(e) => setBlockAllPages(e.target.value)}
                    />
                    <Form.Check
                        type="radio"
                        name="additionalInitials"
                        label="Add on the side"
                        value="side"
                        checked={blockAllPages === "side"}
                        onChange={(e) => setBlockAllPages(e.target.value)}
                    />
                    <Form.Check
                        type="radio"
                        name="additionalInitials"
                        label="Add at the bottom"
                        value="bottom"
                        checked={blockAllPages === "bottom"}
                        onChange={(e) => setBlockAllPages(e.target.value)}
                    />
                </Row>
            </Card>

            <Card className="p-4 mb-4">
                <Row>
                    <Col md={4}>
                        <SignatureToolbox />
                        <SignatureStyle
                            fontSettings={fontSettings}
                            setFontSettings={setFontSettings}
                            selectedField={selectedField}
                        />
                    </Col>
                    <Col md={8}>
                        <div style={{ height: "600px", overflowY: "auto", border: "1px solid #ccc", background: "#fff", borderRadius: "4px" }}>
                            <FilePreview
                                file={formData.file}
                                formData={formData}
                                setFormData={setFormData}
                                setSelectedField={setSelectedField}
                                signingMode={signingMode}
                                signatories={signatories}
                                onPdfEdited={handlePdfEdited}
                                signatureFields={signatureFields} // Pass signatureFields
                                setSignatureFields={setSignatureFields} // Pass setSignatureFields
                            />

                        </div>
                    </Col>
                </Row>
            </Card>
            {/* Deadlines & Reminders */}
            <Card className="p-4 mb-4">
                <h5><strong>Deadlines and Reminders</strong></h5>

                <Form.Group className="mb-3">
                    <Form.Label className=" required-label">Get all signatures by:</Form.Label>
                    <Form.Control
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Send reminders:</Form.Label>

                    <Form.Check
                        type="checkbox"
                        label="Every Day"
                        checked={reminderDays.everyDay}
                        onChange={(e) =>
                            setReminderDays(prev => ({ ...prev, everyDay: e.target.checked }))
                        }
                    />

                    <div className="d-flex align-items-center gap-2">
                        <Form.Check
                            type="checkbox"
                            label="Days before"
                            checked={reminderDays.daysBeforeEnabled}
                            onChange={(e) =>
                                setReminderDays(prev => ({ ...prev, daysBeforeEnabled: e.target.checked }))
                            }
                        />

                        {reminderDays.daysBeforeEnabled && (
                            <Form.Control
                                type="number"
                                placeholder="e.g. 2"
                                style={{ width: '100px' }}
                                value={reminderDays.daysBefore || ""}
                                onChange={(e) =>
                                    setReminderDays(prev => ({ ...prev, daysBefore: e.target.value }))
                                }
                            />
                        )}
                    </div>

                    <Form.Check
                        type="checkbox"
                        label="Last Day"
                        checked={reminderDays.lastDay}
                        onChange={(e) =>
                            setReminderDays(prev => ({ ...prev, lastDay: e.target.checked }))
                        }
                    />
                </Form.Group>

                <Form.Check
                    type="checkbox"
                    label="Send fully signed document to all when document is signed by all"
                    checked={sendFinalCopy}
                    onChange={(e) => setSendFinalCopy(e.target.checked)}
                />
            </Card>


            {/* Buttons */}
            <div className="text-end">
                <Button variant="secondary" className="me-2" onClick={handleSaveDraft}>
                    Save as Draft
                </Button>

                <Button variant="secondary" className="me-2" onClick={onPrevious}>
                    Previous
                </Button>
                <Button variant="primary" onClick={handleSubmit}>Next</Button>
            </div>
        </>
    );
};

export default SignatoriesSettings;
