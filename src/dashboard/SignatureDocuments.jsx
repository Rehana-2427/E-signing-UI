import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { FaBars } from "react-icons/fa";
import Navbar from "../components/layout/Navbar";
// import GenerateSignatureField from "./pages/recipent_document/GenerateSignatureField";
import SignatureStyle from "./pages/SignatureStyle";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const SignatureDocuments = () => {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [title, setTitle] = useState("PDF Viewer");
    const containerRef = useRef(null);
    const [customFields, setCustomFields] = useState([]);
    const [signatureMode, setSignatureMode] = useState("draw");
    const [generatedSignatures, setGeneratedSignatures] = useState([]);
    const overlayRefs = useRef([]);
    const [showThumbnails, setShowThumbnails] = useState(false);
    const [pageThumbs, setPageThumbs] = useState([]);
    const [activePageIndex, setActivePageIndex] = useState(null);
    const [selectedField, setSelectedField] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user?.userEmail;;
    const [fontSettings, setFontSettings] = useState({
        fontType: "Arial",
        fontSize: "14",
        fontColor: "#000000",
    });
    const documentId = localStorage.getItem("documentId");
    const senderEmail = localStorage.getItem("senderEmail");

    console.log(documentId, senderEmail)
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === "PDF_PREVIEW") {
                const { pdfData, title } = event.data;
                const blob = new Blob([pdfData], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
                setTitle(title || "PDF Viewer");
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    useEffect(() => {
        if (pdfUrl && containerRef.current) {
            renderPdfToHtml(pdfUrl, containerRef.current);
        }
    }, [pdfUrl]);

    async function renderPdfToHtml(url, container) {
        container.innerHTML = "";
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        const thumbs = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.2 }); // small size

            const thumbCanvas = document.createElement("canvas");
            const thCtx = thumbCanvas.getContext("2d");
            thumbCanvas.width = viewport.width;
            thumbCanvas.height = viewport.height;
            await page.render({ canvasContext: thCtx, viewport }).promise;
            thumbs.push(thumbCanvas.toDataURL());

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport }).promise;

            const pageWrapper = document.createElement("div");
            pageWrapper.style.position = "relative";
            pageWrapper.style.marginBottom = "20px";
            pageWrapper.style.boxShadow = "0 0 6px rgba(0,0,0,0.1)";
            pageWrapper.appendChild(canvas);

            // Add an overlay container for signatures
            const overlay = document.createElement("div");
            overlay.className = "pdf-overlay";
            overlay.style.position = "absolute";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100%";
            overlay.style.height = "100%";
            pageWrapper.appendChild(overlay);

            overlayRefs.current.push(overlay);
            container.appendChild(pageWrapper);

        }
        setPageThumbs(thumbs);

    }
    // const handleDrop = (event) => {
    //     event.preventDefault();
    //     const data = event.dataTransfer.getData("text/plain");
    //     if (!data) return;

    //     const isImage = data.startsWith("data:image/");

    //     for (let i = 0; i < overlayRefs.current.length; i++) {
    //         const overlay = overlayRefs.current[i];
    //         const rect = overlay.getBoundingClientRect();

    //         if (
    //             event.clientX >= rect.left &&
    //             event.clientX <= rect.right &&
    //             event.clientY >= rect.top &&
    //             event.clientY <= rect.bottom
    //         ) {
    //             const x = event.clientX - rect.left;
    //             const y = event.clientY - rect.top;

    //             const wrapper = document.createElement("div");
    //             wrapper.style.position = "absolute";
    //             wrapper.style.left = `${x}px`;
    //             wrapper.style.top = `${y}px`;
    //             wrapper.style.cursor = "move";
    //             wrapper.style.userSelect = "none";

    //             const content = isImage
    //                 ? `<img src="${data}" style="width: 150px; height: auto; pointer-events: none;" />`
    //                 : `<div contenteditable="true" style="font-size: 18px; padding: 4px 8px; background-color: #f1f1f1; border: 1px solid #ccc;">${data}</div>`;

    //             wrapper.innerHTML = content;

    //             // ✅ Add drag functionality
    //             wrapper.onmousedown = (e) => {
    //                 e.preventDefault();
    //                 let startX = e.clientX;
    //                 let startY = e.clientY;

    //                 const onMouseMove = (moveEvent) => {
    //                     const dx = moveEvent.clientX - startX;
    //                     const dy = moveEvent.clientY - startY;

    //                     const currentLeft = parseFloat(wrapper.style.left);
    //                     const currentTop = parseFloat(wrapper.style.top);

    //                     wrapper.style.left = `${currentLeft + dx}px`;
    //                     wrapper.style.top = `${currentTop + dy}px`;

    //                     startX = moveEvent.clientX;
    //                     startY = moveEvent.clientY;
    //                 };

    //                 const onMouseUp = () => {
    //                     document.removeEventListener("mousemove", onMouseMove);
    //                     document.removeEventListener("mouseup", onMouseUp);
    //                 };

    //                 document.addEventListener("mousemove", onMouseMove);
    //                 document.addEventListener("mouseup", onMouseUp);
    //             };

    //             overlay.appendChild(wrapper);
    //             break;
    //         }
    //     }
    // };


    const handleDrop = (event) => {
        event.preventDefault();
        const data = event.dataTransfer.getData("text/plain");
        if (!data) return;

        const isImage = data.startsWith("data:image/");

        for (let i = 0; i < overlayRefs.current.length; i++) {
            const overlay = overlayRefs.current[i];
            const rect = overlay.getBoundingClientRect();

            if (
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom
            ) {
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                const wrapper = document.createElement("div");
                wrapper.style.position = "absolute";
                wrapper.style.left = `${x}px`;
                wrapper.style.top = `${y}px`;
                wrapper.style.cursor = "move";
                wrapper.style.userSelect = "none";
                wrapper.style.backgroundColor = "transparent";
                wrapper.style.padding = "4px";

                // Drag functionality for the wrapper
                wrapper.onmousedown = (e) => {
                    e.preventDefault();
                    let startX = e.clientX;
                    let startY = e.clientY;

                    const onMouseMove = (moveEvent) => {
                        const dx = moveEvent.clientX - startX;
                        const dy = moveEvent.clientY - startY;

                        const currentLeft = parseFloat(wrapper.style.left);
                        const currentTop = parseFloat(wrapper.style.top);

                        wrapper.style.left = `${currentLeft + dx}px`;
                        wrapper.style.top = `${currentTop + dy}px`;

                        startX = moveEvent.clientX;
                        startY = moveEvent.clientY;
                    };

                    const onMouseUp = () => {
                        document.removeEventListener("mousemove", onMouseMove);
                        document.removeEventListener("mouseup", onMouseUp);
                    };

                    document.addEventListener("mousemove", onMouseMove);
                    document.addEventListener("mouseup", onMouseUp);
                };

                if (isImage) {
                    // If image, just add the image without icons
                    const img = document.createElement("img");
                    img.src = data;
                    img.style.width = "150px";
                    img.style.height = "auto";
                    img.style.pointerEvents = "none";
                    wrapper.appendChild(img);
                } else {
                    // Text field with icons
                    wrapper.innerHTML = "";

                    // Editable text div
                    const editableDiv = document.createElement("div");
                    editableDiv.contentEditable = "true";
                    editableDiv.style.fontSize = fontSettings.fontSize + "px";
                    editableDiv.style.color = fontSettings.fontColor;
                    editableDiv.style.fontFamily = fontSettings.fontType;
                    editableDiv.style.padding = "4px 8px";
                    editableDiv.style.backgroundColor = "#f1f1f1";
                    editableDiv.style.border = "1px solid #ccc";
                    editableDiv.style.minWidth = "50px";
                    editableDiv.style.minHeight = "20px";
                    editableDiv.textContent = data;

                    // Icons container
                    const iconsDiv = document.createElement("div");
                    iconsDiv.style.display = "flex";
                    iconsDiv.style.gap = "8px";
                    iconsDiv.style.marginTop = "4px";

                    // Create icon helper function
                    const createIcon = (innerHTML, title, onClick) => {
                        const icon = document.createElement("span");
                        icon.innerHTML = innerHTML;
                        icon.title = title;
                        icon.style.cursor = "pointer";
                        icon.style.fontSize = "18px";
                        icon.style.userSelect = "none";
                        icon.style.color = "#555";
                        icon.style.display = "inline-block";
                        icon.style.lineHeight = "1";
                        icon.onclick = onClick;
                        return icon;
                    };

                    // Save icon (✅)
                    const saveIcon = createIcon("✅", "Save", () => {
                        // Apply changes if needed (you can sync fontSettings with editableDiv)
                        // Here simply hide icons and deselect editing
                        setSelectedField(null);
                        iconsDiv.style.display = "none";
                    });

                    // Delete icon (❌)
                    const deleteIcon = createIcon("❌", "Delete", () => {
                        wrapper.remove();
                        setSelectedField(null);
                    });

                    // Edit icon (✏️)
                    const editIcon = createIcon("✏️", "Edit", () => {
                        setSelectedField(wrapper);
                        iconsDiv.style.display = "flex";
                    });

                    iconsDiv.appendChild(saveIcon);
                    iconsDiv.appendChild(editIcon);
                    iconsDiv.appendChild(deleteIcon);

                    wrapper.appendChild(editableDiv);
                    wrapper.appendChild(iconsDiv);
                }

                overlay.appendChild(wrapper);
                break;
            }
        }
    };

    // Effect to apply font settings live to selected field
    useEffect(() => {
        if (selectedField) {
            const editableDiv = selectedField.querySelector("div[contenteditable]");
            if (editableDiv) {
                editableDiv.style.fontFamily = fontSettings.fontType;
                editableDiv.style.fontSize = fontSettings.fontSize + "px";
                editableDiv.style.color = fontSettings.fontColor;
            }
        }
    }, [fontSettings, selectedField]);

    const handleDownload = async () => {
        const pages = containerRef.current?.children;
        if (!pages?.length) return;

        const pdf = new jsPDF();

        for (let i = 0; i < pages.length; i++) {
            const pageElement = pages[i]; // This includes canvas and overlay
            const canvas = await html2canvas(pageElement, {
                scale: 2,
                useCORS: true
            });
            const imgData = canvas.toDataURL("image/jpeg", 1);
            const { width: w, height: h } = pdf.getImageProperties(imgData);
            const pdfW = pdf.internal.pageSize.getWidth();
            const pdfH = (h * pdfW) / w;

            if (i !== 0) pdf.addPage();
            pdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);
        }

        pdf.save("signed-document.pdf");
    };


    const handleSend = async () => {
        const pages = containerRef.current?.children;
        if (!pages?.length) return;

        const pdf = new jsPDF();

        for (let i = 0; i < pages.length; i++) {
            const pageElement = pages[i];
            const canvas = await html2canvas(pageElement, {
                scale: 2,
                useCORS: true
            });
            const imgData = canvas.toDataURL("image/jpeg", 1);
            const { width: w, height: h } = pdf.getImageProperties(imgData);
            const pdfW = pdf.internal.pageSize.getWidth();
            const pdfH = (h * pdfW) / w;

            if (i !== 0) pdf.addPage();
            pdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);
        }

        // 1. Download the PDF locally
        pdf.save("signed-document.pdf");

        // 2. Send the PDF to the backend
        const blob = pdf.output("blob");

        // Convert blob to File to ensure proper upload
        const file = new File([blob], "signed-document.pdf", { type: "application/pdf" });

        const formData = new FormData();
        const documentId = localStorage.getItem("documentId");

        formData.set("documentId", documentId);
        formData.set("email", userEmail);
        formData.set("signedPdf", file);

        try {
            const res = await axios.put("http://localhost:8084/api/signer/submit-signed", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            console.log(res.data);
            alert("Signed document sent successfully!");
            localStorage.removeItem("documentId");
            localStorage.removeItem("senderEmail");

            // Optionally refresh or navigate away
        } catch (error) {
            console.error("Error submitting signed document:", error);
            alert("Failed to send the signed document.");
        }
    };

    return (
        <div>
            <Navbar />
            <div style={{ height: "100vh", display: "flex", overflow: 'hidden' }}>
                {/* Left Sidebar */}

                <div
                    style={{
                        width: "300px",
                        borderRight: "1px solid #ccc",
                        padding: "10px",
                        overflowY: "auto",
                        height: "100vh",
                    }}
                >
                    <h5>Signature Mode</h5>
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            value="draw"
                            checked={signatureMode === "draw"}
                            onChange={() => setSignatureMode("draw")}
                            id="drawMode"
                        />
                        <label className="form-check-label" htmlFor="drawMode">
                            Draw
                        </label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            value="type"
                            checked={signatureMode === "type"}
                            onChange={() => setSignatureMode("type")}
                            id="typeMode"
                        />
                        <label className="form-check-label" htmlFor="typeMode">
                            Type
                        </label>
                    </div>

                    {/* Conditionally render based on signatureMode */}
                    {/* {signatureMode === "draw" ? (
                        <GenerateSignatureField
                            generatedSignatures={generatedSignatures}
                            setGeneratedSignatures={setGeneratedSignatures}
                        />


                    ) : (
                        <CustomSignatureField
                            customFields={customFields}
                            setCustomFields={setCustomFields}
                        />
                    )} */}
                </div>

                {/* Right Content */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        overflowY: "auto", // Enables vertical scrolling
                        height: "100vh",   // Full height for scrolling
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h4 className="mb-0">{title}</h4>
                        <Button variant="success" onClick={handleSend}>
                            send
                        </Button>
                        <div
                            style={{
                                cursor: "pointer",
                                padding: "8px",
                                borderRadius: "4px",
                                backgroundColor: "#e0e0e0",
                            }}
                            onClick={() => setShowThumbnails(prev => !prev)} // toggles showThumbnails state
                        >
                            <FaBars size={18} />
                        </div>

                    </div>


                    <div
                        ref={containerRef}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        style={{
                            background: "#f8f8f8",
                            padding: "10px",
                            borderRadius: "8px",
                            minHeight: "90vh",
                            position: 'relative'
                        }}
                    >

                    </div>
                </div>

                <div
                    style={{
                        width: "200px",
                        borderLeft: "1px solid #ccc",
                        height: "100vh",
                        padding: "10px",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {showThumbnails ? (
                        <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
                            {pageThumbs.map((src, idx) => (
                                <div
                                    key={idx}
                                    style={{ marginBottom: "10px", cursor: "pointer" }}
                                    onClick={() => {
                                        const pageWrapper = containerRef.current.children[idx];
                                        pageWrapper.scrollIntoView({ behavior: "smooth" });
                                        setShowThumbnails(false);
                                    }}
                                >
                                    <img
                                        src={src}
                                        alt={`Page ${idx + 1}`}
                                        style={{ width: "100%", border: idx === activePageIndex ? "2px solid skyblue" : "1px solid #ddd" }}
                                    />
                                    <small style={{ display: "block", textAlign: "right" }}>Page {idx + 1}</small>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Show SignatureStyle full height, hide thumbnails
                        <div style={{ flex: 1, overflowY: "auto", padding: "20px", width: "200px", }}>
                            <SignatureStyle
                                fontSettings={fontSettings}
                                setFontSettings={setFontSettings}
                                selectedField={selectedField}
                            />

                        </div>
                    )}
                </div>
            </div>

        </div >
    );
};

export default SignatureDocuments;
