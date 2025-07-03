import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PDFDocument, rgb } from 'pdf-lib';

import { Button, Form } from 'react-bootstrap';

import { Document, Page } from 'react-pdf';
// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;




const hexToRgb = (hex) => {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255,
  };
};

const FilePreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { uploadedFile, fileUrl, title, signRequiredBy } = location.state || {};

  const [projectTitle, setProjectTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (title) setProjectTitle(title);
    if (signRequiredBy) setDueDate(signRequiredBy);
  }, [title, signRequiredBy]);



  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewSize, setPreviewSize] = useState({ width: 600, height: 800 });
  const previewRef = useRef();

  const [signatureFields, setSignatureFields] = useState([]);
  const [isAddSignatureMode, setIsAddSignatureMode] = useState(false);

  // Signature customization state
  const [fontSize, setFontSize] = useState(12);
  const [color, setColor] = useState('#FF0000');

  // Redirect if missing file info
  useEffect(() => {
    if (!uploadedFile || !fileUrl) {
      navigate('/');
    }
  }, [uploadedFile, fileUrl, navigate]);

  // Load PDF to get number of pages (only for PDFs)
  useEffect(() => {
    const loadPdfPages = async () => {
      if (uploadedFile?.type === 'application/pdf') {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setNumPages(pdfDoc.getPageCount());
        setCurrentPage(1);
      }
    };
    loadPdfPages();
  }, [uploadedFile]);

  // Update preview size on container resize
  useEffect(() => {
    if (previewRef.current) {
      setPreviewSize({
        width: previewRef.current.offsetWidth,
        height: previewRef.current.offsetHeight,
      });
    }
  }, [uploadedFile]);

  const handleAddSignature = () => {
    setIsAddSignatureMode(true);
  };

  const handleDoubleClick = (e) => {
    if (!isAddSignatureMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSignatureFields((prev) => [
      ...prev,
      { x, y, page: currentPage, fontSize, color },
    ]);
    setIsAddSignatureMode(false);
  };

  const insertSignatureField = async (arrayBuffer, fields, fileType) => {
    let pdfDoc;

    if (fileType === 'application/pdf') {
      pdfDoc = await PDFDocument.load(arrayBuffer);
    } else if (fileType?.startsWith('image/')) {
      pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      let image;

      if (fileType === 'image/png') {
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
      alert('Unsupported file type for signing.');
      return null;
    }

    if (fileType === 'application/pdf') {
      fields.forEach((pos) => {
        const pageIndex = (pos.page || 1) - 1;
        const page = pdfDoc.getPage(pageIndex);
        const { width: pdfWidth, height: pdfHeight } = page.getSize();

        const scaledX = (pos.x / previewSize.width) * pdfWidth;
        const scaledY = (pos.y / previewSize.height) * pdfHeight;

        const rgbColor = hexToRgb(pos.color);

        page.drawText('signature', {
          x: scaledX,
          y: pdfHeight - scaledY,
          size: pos.fontSize || 12,
          color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
        });
      });
    } else {
      const page = pdfDoc.getPage(0);
      const { height } = page.getSize();
      fields.forEach((pos) => {
        const rgbColor = hexToRgb(pos.color);
        page.drawText('signature', {
          x: pos.x,
          y: height - pos.y,
          size: pos.fontSize || 12,
          color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
        });
      });
    }

    return await pdfDoc.save();
  };

  // const handleSave = async () => {
  //   try {
  //     if (!uploadedFile || signatureFields.length === 0) return;

  //     const arrayBuffer = await uploadedFile.arrayBuffer();
  //     const modifiedPdfBytes = await insertSignatureField(
  //       arrayBuffer,
  //       signatureFields,
  //       uploadedFile.type
  //     );
  //     if (!modifiedPdfBytes) return;

  //     const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'signed-document.pdf';
  //     a.click();
  //     URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error('Error processing file:', error);
  //   }
  // };
  const handleSave = async () => {
    try {
      if (!uploadedFile || signatureFields.length === 0) return;

      const arrayBuffer = await uploadedFile.arrayBuffer();
      const modifiedPdfBytes = await insertSignatureField(
        arrayBuffer,
        signatureFields,
        uploadedFile.type
      );

      if (!modifiedPdfBytes) return;

      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const fileUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = `${title}.pdf`;
      a.click();
      URL.revokeObjectURL(fileUrl);
      navigate("/dashboard/new-project", {
        state: {
          title: projectTitle,
          signRequiredBy: dueDate,
          fileUrl,
          signedPdfBlob: blob,
        },
      });
    } catch (error) {
      console.error("Error saving edited file:", error);
    }
  };

  const renderPreview = () => {
    if (!uploadedFile || !fileUrl) {
      return <p>No file selected.</p>;
    }

    if (uploadedFile.type === 'application/pdf') {
      // Using react-pdf for current page preview
      return (
        <div
          ref={previewRef}
          style={{ width: '100%', height: '600px', overflow: 'auto' }}
          onDoubleClick={handleDoubleClick}
        >
          <Document file={uploadedFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            <Page pageNumber={currentPage} width={previewSize.width} />
          </Document>
        </div>
      );
    } else if (uploadedFile.type?.startsWith('image/')) {
      return (
        <div
          ref={previewRef}
          onDoubleClick={handleDoubleClick}
          style={{ width: '100%', height: '600px', overflow: 'auto', position: 'relative' }}
        >
          <img
            src={fileUrl}
            alt="Image Preview"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      );
    } else {
      return (
        <p className="text-danger m-3">
          File preview not supported for this file type. <br />
          Type: {uploadedFile.type || '<empty or undefined>'}
        </p>
      );
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>File Preview</h2>
        <div>
          <Button variant="primary" onClick={handleAddSignature} className="me-2">
            Add Signature
          </Button>
          <Button variant="success" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>

      {/* Page navigation for PDFs */}
      {uploadedFile?.type === 'application/pdf' && (
        <div className="d-flex align-items-center mb-3 gap-2">
          <Button
            variant="secondary"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Prev Page
          </Button>
          <span>
            Page {currentPage} / {numPages}
          </span>
          <Button
            variant="secondary"
            disabled={currentPage >= numPages}
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
          >
            Next Page
          </Button>
        </div>
      )}

      {/* Signature customization controls */}
      <Form className="mb-3 d-flex align-items-center gap-3 flex-wrap">
        <Form.Group controlId="fontSize" className="d-flex align-items-center gap-2">
          <Form.Label style={{ marginBottom: 0 }}>Font Size:</Form.Label>
          <Form.Control
            type="number"
            min={8}
            max={72}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            style={{ width: '80px' }}
          />
        </Form.Group>

        <Form.Group controlId="color" className="d-flex align-items-center gap-2">
          <Form.Label style={{ marginBottom: 0 }}>Color:</Form.Label>
          <Form.Control
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: '50px', padding: 0, border: 'none' }}
          />
        </Form.Group>
      </Form>

      <p>(Double-click where you want to place the signature)</p>

      <div
        style={{
          position: 'relative',
          height: '600px',
          overflow: 'auto',
          border: '1px solid #ccc',
          cursor: isAddSignatureMode ? 'crosshair' : 'default',
        }}
      >
        {renderPreview()}

        {/* Overlay to capture double clicks for signatures */}
        <div
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

        {/* Signature markers */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {signatureFields
            .filter((sig) => sig.page === currentPage)
            .map((pos, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  pointerEvents: 'none',
                }}
              >
                <span style={{ fontSize: pos.fontSize, color: pos.color }}>
                  signature
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewPage;
