import { useRef, useState } from "react";
import Draggable from "react-draggable";
import { Document, Page, pdfjs } from 'react-pdf';

// Set the worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

function DraggableSignature({ file, signature, onDropPositionChange }) {
    const [numPages, setNumPages] = useState(null);
    const containerRef = useRef();

    const handleDragStop = (e, data) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = data.x - rect.left; // Adjust x coordinate
            const y = data.y - rect.top; // Adjust y coordinate
            onDropPositionChange({ x, y });
        }
    };

    return (
        <div ref={containerRef} style={{ position: "relative", border: "1px solid #ccc" }}>
            <Document
                file={file}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                onLoadError={error => console.error("PDF loading error:", error)}
            >
                <Page pageNumber={1} width={600} />
            </Document>
            {signature && (
                <Draggable onStop={handleDragStop}>
                    <img
                        src={signature}
                        alt="Signature"
                        style={{
                            width: 100,
                            height: 50,
                            position: "absolute",
                            cursor: "move",
                            zIndex: 10,
                        }}
                    />
                </Draggable>
            )}
        </div>
    );
}

export default DraggableSignature;
