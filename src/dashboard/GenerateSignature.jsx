// GenerateSignature.js
import { Button } from 'react-bootstrap';

const GenerateSignature = ({ onSignatureGenerated }) => {
  
  const generateSignature = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const fontSize = 48;

    canvas.width = 500;
    canvas.height = 100;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px 'Pacifico'`; // You can change the font if needed
    ctx.fillStyle = "black";
    ctx.textBaseline = "middle";
    ctx.fillText("signature", 10, canvas.height / 2); // Generates the text "signature"

    const dataUrl = canvas.toDataURL();
    onSignatureGenerated(dataUrl);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <Button onClick={generateSignature}>
        Generate Signature
      </Button>
    </div>
  );
};

export default GenerateSignature;
