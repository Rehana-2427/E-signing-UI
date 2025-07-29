import { useState } from "react";
import { Button, Card } from "react-bootstrap";
import { FaMobile, FaSignature, FaUser } from "react-icons/fa";

const SignatureToolbox = () => {
    const [customFields, setCustomFields] = useState([]);
    const [inputValue, setInputValue] = useState("");

    const standardFields = [
        { label: "Signature", icon: <FaSignature /> },
        { label: "Full Name", icon: <FaUser  /> },
        { label: "Phone", icon: <FaMobile /> }
    ];

    const handleStandardDragStart = (e, field) => {
        e.dataTransfer.setData("text/plain", field.label);
        e.dataTransfer.setData("customFieldId", ""); // No custom field ID for standard fields
    };

    const handleCustomDragStart = (e, text) => {
        e.dataTransfer.setData("text/plain", text);
        e.dataTransfer.setData("customFieldId", text); // Set custom field ID
    };

    const handleAddCustomField = () => {
        if (!inputValue.trim()) return;
        setCustomFields([...customFields, { id: Date.now(), text: inputValue.trim() }]);
        setInputValue("");
    };

    const handleRemoveField = (id) => {
        setCustomFields(customFields.filter(field => field.id !== id));
    };

    return (
        <div className="d-flex flex-column gap-4" style={{ width: 260 }}>
            {/* Standard Signature Fields */}
            <Card className="p-3">
                <h5><strong>Standard Signature Fields</strong></h5>
                {standardFields.map((field, index) => (
                    <div
                        key={index}
                        draggable
                        onDragStart={(e) => handleStandardDragStart(e, field)}
                        style={{
                            backgroundColor: "gainsboro",
                            padding: "8px",
                            marginBottom: "15px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            cursor: "grab",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <span>{field.icon}</span>
                        <span>{field.label}</span>
                    </div>
                ))}

                <h5><strong>Custom Signature Fields</strong></h5>

                <input
                    type="text"
                    placeholder="Enter custom field"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "6px",
                        marginBottom: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                    }}
                />
                <Button
                    onClick={handleAddCustomField}
                    disabled={!inputValue.trim()}
                    variant="primary"
                    style={{ width: "100%" }}
                >
                    Add Field
                </Button>

                <div style={{ marginTop: "15px" }}>
                    {customFields.map((field) => (
                        <div
                            key={field.id}
                            draggable
                            onDragStart={(e) => handleCustomDragStart(e, field.text)}
                            style={{
                                backgroundColor: "#ddd",
                                padding: "6px 10px",
                                marginBottom: "8px",
                                borderRadius: "4px",
                                cursor: "grab",
                                fontWeight: "500",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <span>{field.text}</span>
                            <span
                                onClick={() => handleRemoveField(field.id)}
                                style={{
                                    marginLeft: "10px",
                                    color: "red",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    fontSize: '20px'
                                }}
                                title="Remove"
                            >
                                ×
                            </span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default SignatureToolbox;
