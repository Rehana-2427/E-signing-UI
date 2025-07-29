import { useRef, useState } from "react";

const UploadFilePreview = ({ onFileDrop }) => {
  const [fileInfo, setFileInfo] = useState(null);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type;
    const reader = new FileReader();

    // Image
    if (fileType.startsWith("image/")) {
      reader.onload = (event) => {
        setFileInfo({
          type: "image",
          name: file.name,
          content: event.target.result,
        });
      };
      reader.readAsDataURL(file);
    }

    // Text or JSON
    else if (
      fileType.startsWith("text/") ||
      file.name.endsWith(".json") ||
      file.name.endsWith(".csv")
    ) {
      reader.onload = (event) => {
        setFileInfo({
          type: "text",
          name: file.name,
          content: event.target.result,
        });
      };
      reader.readAsText(file);
    }

    // PDF
    else if (fileType === "application/pdf") {
      const url = URL.createObjectURL(file);
      setFileInfo({
        type: "pdf",
        name: file.name,
        content: url,
      });
    }

    // Unknown type
    else {
      setFileInfo({
        type: "other",
        name: file.name,
        content: null,
      });
    }
  };

  const handleDragStart = (e) => {
    if (fileInfo) {
      e.dataTransfer.setData("text/plain", fileInfo.content);
      e.dataTransfer.setData("fileType", fileInfo.type);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ marginBottom: "10px" }}
      />

      {fileInfo && (
        <div
          style={{ width: "100%", maxWidth: "600px", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
          draggable
          onDragStart={handleDragStart}
        >
          {fileInfo.type === "image" && (
            <img src={fileInfo.content} alt="Uploaded preview" style={{ width: "100%", height: "auto" }} />
          )}

          {fileInfo.type === "text" && (
            <pre style={{ whiteSpace: "pre-wrap", maxHeight: "300px", overflowY: "auto" }}>
              {fileInfo.content}
            </pre>
          )}

          {fileInfo.type === "pdf" && (
            <iframe
              src={fileInfo.content}
              title="PDF Preview"
              width="100%"
              height="400px"
              style={{ border: "none" }}
            />
          )}

          {fileInfo.type === "other" && (
            <p style={{ color: "#666" }}>Preview not supported for this file type.</p>
          )}
        </div>
      )}

      {!fileInfo && (
        <div style={{ fontSize: "12px", color: "#888" }}>
          Upload any file to preview it here.
        </div>
      )}
    </div>
  );
};

export default UploadFilePreview;
