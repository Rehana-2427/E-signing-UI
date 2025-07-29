import { useEffect, useState } from "react";

const SignatureStyle = ({ fontSettings, setFontSettings, selectedField }) => {
    const { fontType, fontSize, fontColor } = fontSettings;
    const [isEditable, setIsEditable] = useState(false);


    useEffect(() => {
        if (selectedField) {
            setIsEditable(true);
            if (selectedField.style) {
                selectedField.style.fontFamily = fontType;
                selectedField.style.fontSize = `${fontSize}px`;
                selectedField.style.color = fontColor;
            }
        } else {
            setIsEditable(false);
        }
    }, [fontType, fontSize, fontColor, selectedField]);



    const fonts = [
        "Arial", "Verdana", "Times New Roman", "Courier New", "Georgia",
        "Tahoma", "Trebuchet MS", "Lucida Console", "Comic Sans MS", "Helvetica"
    ];

    return (
        <div>
            <h4>Signature Style</h4>

            {/* Font Type */}
            <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px" }}>Font Type</label>
                <select
                    value={fontType}
                    onChange={(e) => setFontSettings(prev => ({ ...prev, fontType: e.target.value }))}
                    style={{ width: "90%", padding: "6px" }}
                    disabled={!isEditable} // Disable if not editable
                >
                    {fonts.map((font) => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                        </option>
                    ))}
                </select>
            </div>

            {/* Font Size */}
            <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px" }}>Font Size</label>
                <input
                    type="number"
                    min="8"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                    style={{ width: "90%", padding: "6px" }}
                    disabled={!isEditable} // Disable if not editable
                />
            </div>

            {/* Font Color */}
            <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px" }}>Font Color</label>
                <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFontSettings(prev => ({ ...prev, fontColor: e.target.value }))}
                    style={{ width: "90%", height: "40px", padding: "0", border: "none" }}
                    disabled={!isEditable} // Disable if not editable
                />
            </div>
        </div>
    );
};

export default SignatureStyle;
