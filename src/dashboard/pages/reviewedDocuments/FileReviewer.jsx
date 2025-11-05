import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { useEffect, useState } from "react";
import { Button, Toast, ToastContainer } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import documentApi from "../../../api/documentapi";
import reviewerApi from "../../../api/reviewerApi";

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const FileReviewer = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Use navigate for redirection
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);
  const [showToast, setShowToast] = useState(false); // State to manage Toast visibility
  const [toastMessage, setToastMessage] = useState(""); // State for toast message
  const [toastVariant, setToastVariant] = useState("success"); // State for toast variant (success/error)

  const params = new URLSearchParams(location.search);
  const documentId = params.get("documentId");
  const documentName = params.get("documentName");
  const companyName = params.get("companyName") || "N/A";
  const senderEmail = params.get("senderEmail") || "N/A";
  const { editedFile } = location.state || {};
  const [pdfRendered, setPdfRendered] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const reviewerEmail = user?.userEmail;

  console.log(documentId , companyName, documentName, senderEmail)
  useEffect(() => {
    setLoading(true);

    const fetchDocument = async () => {
      try {
        let blob;
        if (editedFile) {
          // If there's an edited file, decode base64 string and create a Blob
          const byteCharacters = atob(editedFile);
          const byteArrays = [];
          for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
          }
          blob = new Blob([new Uint8Array(byteArrays)], {
            type: "application/pdf",
          });
        } else {
          // Otherwise, fetch the document file from server
          const response = await documentApi.getDocumentFileReviewer(
            documentId,
            reviewerEmail
          );
          blob = new Blob([response.data], { type: "application/pdf" });
        }

        setFileBlob(blob); // Set the Blob for PDF
      } catch (error) {
        setError("Error loading document.");
        console.error("Error loading document:", error);
      } finally {
        setLoading(false);
      }
    };

    if (documentId || editedFile) {
      fetchDocument();
    }
  }, [documentId, editedFile, reviewerEmail]);

  // Render PDF once Blob is set
  useEffect(() => {
    if (!fileBlob || pdfRendered) return;

    const renderPdf = async () => {
      try {
        // Convert Blob to ArrayBuffer
        const arrayBuffer = await fileBlob.arrayBuffer();

        // Load PDF using PDF.js
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });

        const pdf = await loadingTask.promise;
        const container = document.getElementById("pdf-container");
        container.innerHTML = ""; // Clear existing content

        // Render each page of the PDF
        const numPages = pdf.numPages;
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.2 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;

          // Append the canvas to the container
          container.appendChild(canvas);
        }

        setPdfRendered(true); // Mark PDF as rendered
      } catch (err) {
        console.error("Error rendering PDF:", err);
        setError("Error rendering PDF.");
      }
    };

    renderPdf();
  }, [fileBlob, pdfRendered]);

  // Handle approve button click
  const handleApproved = async () => {
    try {
      setLoading(true);
      const payload = { documentId, reviewerEmail }; // Prepare the payload
      await reviewerApi.approveDocumentReview(payload); // Pass the payload

      // Show success toast
      setToastMessage("Document approved successfully.");
      setToastVariant("success");
      setShowToast(true);

      // Redirect to the reviewed consents tab
      setTimeout(() => {
        navigate("/dashboard/review-documents?tab=reviewedConsents");
      }, 2000); // Navigate after the toast message is shown for 2 seconds
    } catch (err) {
      console.error("Error approving document:", err);
      setToastMessage("Failed to approve document.");
      setToastVariant("danger");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading document...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>
        <strong>File Reviewer</strong>
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p style={{ margin: 0 }}>
          Review Document - <strong>{documentName}</strong>
          {companyName !== "N/A" && (
            <>
              {" "}
              | Company Name: <strong>{companyName}</strong>
            </>
          )}{" "}
          | Sender Email: <strong>{senderEmail}</strong>
        </p>
        <Button onClick={handleApproved}>Approve</Button>
      </div>

      <div
        id="pdf-container"
        style={{
          marginTop: "20px",
          maxHeight: "600px", // Set a maximum height for the PDF container
          overflowY: "auto", // Allow vertical scrolling
          textAlign: "center",
        }}
      ></div>
      

      {/* Toast Container */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default FileReviewer;
