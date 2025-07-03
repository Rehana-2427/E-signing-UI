import { useState } from "react";
import { Button } from "react-bootstrap";

const CustomSignatureField = ({ customFields, setCustomFields }) => {
    const [inputValue, setInputValue] = useState("");

    const handleGenerate = () => {
        if (inputValue.trim() === "") return;

        setCustomFields([
            ...customFields,
            { id: Date.now(), text: inputValue.trim() },
        ]);
        setInputValue("");
    };

    const handleDragStart = (e, id,text) => {
        // e.dataTransfer.setData("customFieldId", id);
        e.dataTransfer.setData("text/plain",text)
    };

    return (
        <div>
            <h4>Custom Signature Field</h4>
            <input
                type="text"
                placeholder="Custom Signature Field"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{
                    width: "90%",
                    height: "40px",
                    padding: "0",
                    marginBottom: "10px",
                    border: "none",
                }}
            />
            <Button onClick={handleGenerate} disabled={!inputValue.trim()}>
                Generate
            </Button>

            <div style={{ marginTop: "20px" }}>
                {customFields.map((field,index) => (
                    <div
                        key={index}
                        draggable
                        onDragStart={(e) => handleDragStart(e, field.id,field.text)}
                        style={{
                            marginBottom: "8px",
                            padding: "6px 10px",
                            backgroundColor: "#ddd",
                            cursor: "grab",
                            display: "inline-block",
                            userSelect: "none",
                        }}
                    >
                        {field.text}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomSignatureField;
