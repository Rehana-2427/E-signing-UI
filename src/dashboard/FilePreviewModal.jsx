import { PDFDocument, rgb } from 'pdf-lib';
import { useState, useRef, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';

const FilePreviewModal = ({ show, onHide, uploadedFile, fileUrl }) => {
    const [signatureFields, setSignatureFields] = useState([]);
    const [isAddSignatureMode, setIsAddSignatureMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [previewSize, setPreviewSize] = useState({ width: 1, height: 1 });
    const previewRef = useRef();

    useEffect(() => {
        if (previewRef.current) {
            setPreviewSize({
                width: previewRef.current.offsetWidth,
                height: previewRef.current.offsetHeight,
            });
        }
    }, [show, uploadedFile]);

    const handleAddSignature = () => {
        setIsAddSignatureMode(true);
    };

    const handleDoubleClick = (e) => {
        if (!isAddSignatureMode) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setSignatureFields((prev) => [...prev, { x, y, page: currentPage }]);
        setIsAddSignatureMode(false);
    };

    const insertSignatureField = async (arrayBuffer, fields, fileType) => {
        let pdfDoc;

        if (fileType === "application/pdf") {
            pdfDoc = await PDFDocument.load(arrayBuffer);
        } else if (fileType.startsWith("image/")) {
            pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([600, 800]);
            let image;

            if (fileType === "image/png") {
                image = await pdfDoc.embedPng(arrayBuffer);
            } else {
                image = await pdfDoc.embedJpg(arrayBuffer);
            }

            const { width, height } = image.scale(1);
            page.drawImage(image, {
                x: 50,
                y: 200,
                width,
                height,
            });
        } else {
            alert("Unsupported file type for signing.");
            return null;
        }

        if (fileType === "application/pdf") {
            fields.forEach((pos) => {
                const pageIndex = (pos.page || 1) - 1;
                const page = pdfDoc.getPage(pageIndex);
                const { width: pdfWidth, height: pdfHeight } = page.getSize();

                // Scale coordinates
                const scaledX = (pos.x / previewSize.width) * pdfWidth;
                const scaledY = (pos.y / previewSize.height) * pdfHeight;

                page.drawText("signature", {
                    x: scaledX,
                    y: pdfHeight - scaledY,
                    size: 12,
                    color: rgb(1, 0, 0),
                });
            });
        } else {
            // For images, only one page
            const page = pdfDoc.getPage(0);
            const { height } = page.getSize();
            fields.forEach((pos) => {
                page.drawText("signature", {
                    x: pos.x,
                    y: height - pos.y,
                    size: 12,
                    color: rgb(1, 0, 0),
                });
            });
        }

        return await pdfDoc.save();
    };

    const handleSave = async () => {
        try {
            if (!uploadedFile || signatureFields.length === 0) return;

            const arrayBuffer = await uploadedFile.arrayBuffer();
            let numPages = 1;
            if (uploadedFile.type === "application/pdf") {
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                numPages = pdfDoc.getPageCount();
            } else if (uploadedFile.type.startsWith("image/")) {
                numPages = 1; // Images are treated as single page
            }
            console.log(`Number of pages: ${numPages}`);
            // Log signature positions (x, y, page number)
            signatureFields.forEach((pos, idx) => {
                console.log(`Signature ${idx + 1}: x=${pos.x}, y=${pos.y}, page=${pos.page}`);
            });

            // Download updated file with signatures
            const modifiedPdfBytes = await insertSignatureField(arrayBuffer, signatureFields, uploadedFile.type);
            if (!modifiedPdfBytes) return;
            const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'signed-document.pdf';
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error processing file:", error);
        }
    };

    const renderPreview = () => {
        if (!uploadedFile) return null;

        if (uploadedFile.type === "application/pdf") {
            return (
                <iframe
                    src={fileUrl}
                    style={{ width: '100%', height: '100%' }}
                    title="PDF Preview"
                />
            );
        } else if (uploadedFile.type.startsWith("image/")) {
            return (
                <img
                    src={fileUrl}
                    alt="Image Preview"
                    style={{ width: '100%', height: 'auto' }}
                />
            );
        } else {
            return <p className="text-danger m-3">File preview not supported for this file type.</p>;
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton className="d-flex align-items-center justify-content-between gap-3">
                <Modal.Title>File Preview</Modal.Title>
                <Button variant="primary" onClick={handleAddSignature}>
                    Add Signature
                </Button>
                <p className="mb-0">(Double-click where you want the signature)</p>
            </Modal.Header>

            <Modal.Body
                style={{
                    position: 'relative',
                    height: '500px',
                    overflow: 'auto',
                    padding: 0,
                    cursor: isAddSignatureMode ? 'crosshair' : 'default',
                }}
            >
                {/* PDF or image preview */}
                {renderPreview()}

                {/* Transparent clickable layer for double click */}
                <div
                    ref={previewRef}
                    onDoubleClick={handleDoubleClick}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 5,
                        pointerEvents: isAddSignatureMode ? 'auto' : 'none',
                    }}
                />

                {/* Signature marker overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 10,
                        pointerEvents: 'none', // ✅ allows scrolling through to iframe
                    }}
                >
                    {signatureFields.map((pos, idx) => (
                        <div
                            key={idx}
                            style={{
                                position: 'absolute',
                                left: pos.x,
                                top: pos.y,
                                pointerEvents: 'none',
                            }}
                        >
                            <span style={{ fontSize: '20px', color: 'red' }}>
                                signature
                            </span>
                        </div>
                    ))}
                </div>
            </Modal.Body>


            <Modal.Footer>
                <Button variant="success" onClick={handleSave}>
                    Save
                </Button>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default FilePreviewModal;
