import '@fortawesome/fontawesome-free/css/all.min.css'; // Font Awesome icons
import { useEffect, useRef } from "react";
import { Button } from 'react-bootstrap';
import SignatureCanvas from "react-signature-canvas";
import './signatureField.css';

const GenerateSignatureField = ({ generatedSignatures, setGeneratedSignatures }) => {
    const sigPadRef = useRef();

    useEffect(() => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);

        const canvas = sigPadRef.current.getCanvas();
        const context = canvas.getContext("2d");

        // Save current signature if needed (optional)
        const imageData = sigPadRef.current.toData();

        canvas.width = 500 * ratio;
        canvas.height = 200 * ratio;
        canvas.style.width = "500px";
        canvas.style.height = "200px";
        context.scale(ratio, ratio);

        // Redraw signature if saved earlier
        sigPadRef.current.fromData(imageData);
    }, []);
    const clearSignature = () => {
        sigPadRef.current?.clear();
    };

    const handleGenerate = () => {
        if (sigPadRef.current.isEmpty()) {
            alert("Please draw a signature first.");
            return;
        }

        // Get signature as base64 PNG image data URL
        const signatureDataUrl = sigPadRef.current.toDataURL("image/png");

        // Add to your customFields array (or however you want to store)
        setGeneratedSignatures(prev => [
            ...prev,
            { id: Date.now(), image: signatureDataUrl },
        ]);

    };

    return (
        <div>
            <h3 className="signature-title">
                Draw Your Signature
            </h3>

            <SignatureCanvas
                ref={sigPadRef}
                penColor="black"
                canvasProps={{
                    className: "signature-canvas",
                    width: 500,
                    height: 200,
                }}
            />

            <div className="clear-button">
                <Button className="btn btn-secondary" onClick={clearSignature}>
                    Clear
                </Button>
                <Button onClick={handleGenerate}>
                    Generate
                </Button>
            </div>

            {/* Display generated signatures below buttons */}
            <div className="generated-signatures" style={{ marginTop: '20px' }}>
                {generatedSignatures.map(({ id, image }) => (
                    <img
                        key={id}
                        src={image}
                        alt="Generated Signature"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", image)}
                        style={{ border: '1px solid #ccc', marginTop: 10, maxWidth: '100%', height: '50px' }}
                    />
                ))}
            </div>


        </div>

    );
};

export default GenerateSignatureField;
