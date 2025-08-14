import { PDFDocument, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { useEffect, useRef, useState } from "react";
import { Button, } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import documentApi from "../../../api/documentapi";
import signerApi from "../../../api/signerapi";
import SignatureStyle from "../SignatureStyle";
import CustomSignatureField from "./CustomSignatureField";
import GenerateSignatureField from "./GenerateSignatureField";
import UploadSignatureField from "./UploadSignatureField";

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const RecipentViewDoc = () => {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user"));
    const userEmail = user?.userEmail;
    const { documentId, recipientEmail, documentName, signedFile } = location.state || {};
    const [signatureFields, setSignatureFields] = useState([]); // Stores all placed fields (image or text)
    const [generatedSignatures, setGeneratedSignatures] = useState([]); // From GenerateSignatureField (images)
    const [signatureMode, setSignatureMode] = useState("draw");
    const [customFields, setCustomFields] = useState([]); // From CustomSignatureField (text)
    const [fileBlob, setFileBlob] = useState(null);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef();
    const [selectedField, setSelectedField] = useState(null);
    const [fontSettings, setFontSettings] = useState({
        fontType: "Arial",
        fontSize: "14",
        fontColor: "#000000",
    });
    const [pdfRendered, setPdfRendered] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveDraft, setSaveDraft] = useState(false);
    const [viewportInfo, setViewportInfo] = useState(null);
    const navigate = useNavigate();


    // useEffect(() => {
    //     setLoading(true);
    //     setPdfRendered(false);
    //     const fetchDocument = async () => {
    //         try {
    //             const response = await documentApi.getDocumentFile(documentId, userEmail);
    //             const blob = new Blob([response.data], { type: "application/pdf" });
    //             const blobUrl = URL.createObjectURL(blob);
    //             setFileBlob(blobUrl);
    //         } catch (error) {
    //             console.error("Error loading document:", error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     if (documentId) {
    //         fetchDocument();
    //     }
    // }, [documentId]);

    // 1. Render PDF pages ONCE when fileBlob changes

    useEffect(() => {
        setLoading(true);
        setPdfRendered(false);
        const fetchDocument = async () => {
            try {
                let blob;
                if (signedFile) {
                    // If signedFile is available, create a Blob from it
                    const byteCharacters = atob(signedFile);
                    const byteArrays = [];
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteArrays.push(byteCharacters.charCodeAt(i));
                    }
                    blob = new Blob([new Uint8Array(byteArrays)], { type: "application/pdf" });
                } else {
                    // Fetch the document if signedFile is not available
                    const response = await documentApi.getDocumentFile(documentId, userEmail);
                    blob = new Blob([response.data], { type: "application/pdf" });
                }
                const blobUrl = URL.createObjectURL(blob);
                setFileBlob(blobUrl);
            } catch (error) {
                console.error("Error loading document:", error);
            } finally {
                setLoading(false);
            }
        };

        if (documentId || signedFile) {
            fetchDocument();
        }
    }, [documentId, signedFile]);

    useEffect(() => {
        if (!fileBlob || pdfRendered) return;

        const renderPdf = async () => {
            const loadingTask = pdfjsLib.getDocument(fileBlob);
            const pdf = await loadingTask.promise;

            const container = containerRef.current;
            container.innerHTML = "";

            const firstPage = await pdf.getPage(1);
            const viewport = firstPage.getViewport({ scale: 1.2 });
            setViewportInfo({
                renderedWidth: viewport.width,
                renderedHeight: viewport.height,
                scale: 1.2
            });

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.2 });

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: context, viewport }).promise;

                const img = document.createElement("img");
                img.src = canvas.toDataURL();
                img.style.width = "80%";

                const wrapper = document.createElement("div");
                wrapper.style.position = "relative";
                wrapper.style.marginBottom = "0px";
                wrapper.style.width = `${viewport.width}px`;
                wrapper.style.height = `${viewport.height}px`;

                const overlay = document.createElement("div");
                overlay.style.position = "absolute";
                overlay.style.top = 0;
                overlay.style.left = 0;
                overlay.style.width = `${viewport.width}px`;
                overlay.style.height = `${viewport.height}px`;
                overlay.style.cursor = "crosshair";

                overlay.dataset.pageIndex = i - 1;

                wrapper.appendChild(img);
                wrapper.appendChild(overlay);
                container.appendChild(wrapper);
            }

            setPdfRendered(true); // Mark PDF as rendered
        };

        renderPdf();
    }, [fileBlob, pdfRendered]);

    // 2. Render or update fields overlay on signatureFields changes only
    useEffect(() => {
        if (!fileBlob || !pdfRendered) return;
        const container = containerRef.current;
        if (!container) return;

        // For each page overlay div, clear its children (remove old fields)
        const overlays = container.querySelectorAll("div[style*='position: absolute']");
        overlays.forEach((overlay) => {
            // Only clear if this overlay has the pageIndex dataset (meaning it's a valid overlay)
            if (!overlay.dataset.pageIndex) return;

            // Remove all children
            overlay.innerHTML = "";
            const pageIndex = Number(overlay.dataset.pageIndex);

            // Get fields for this page
            const pageFields = signatureFields.filter((f) => f.pageIndex === pageIndex);

            pageFields.forEach((fieldData) => {
                if (fieldData.imageData) {
                    // Render image field (draggable) with icons
                    const containerDiv = document.createElement("div");
                    containerDiv.style.position = "absolute";
                    containerDiv.style.left = `${fieldData.x}px`;
                    containerDiv.style.top = `${fieldData.y}px`;
                    containerDiv.style.display = "flex";
                    containerDiv.style.flexDirection = "column";
                    containerDiv.style.alignItems = "center";
                    containerDiv.style.gap = "4px";

                    const imgEl = document.createElement("img");
                    imgEl.src = fieldData.imageData;
                    imgEl.style.width = "150px";
                    imgEl.style.height = "auto";
                    imgEl.style.pointerEvents = "none";

                    // Icons container for image
                    const iconContainer = document.createElement("div");
                    iconContainer.style.display = "flex";
                    iconContainer.style.gap = "6px";
                    iconContainer.style.pointerEvents = "auto";

                    // Delete icon for image
                    const deleteIcon = document.createElement("span");
                    deleteIcon.textContent = "❌";
                    deleteIcon.style.cursor = "pointer";
                    deleteIcon.style.fontSize = "14px";
                    deleteIcon.style.padding = "2px";
                    deleteIcon.style.backgroundColor = "#ffebee";
                    deleteIcon.style.borderRadius = "3px";
                    deleteIcon.style.pointerEvents = "auto";
                    deleteIcon.title = "Delete Image";
                    deleteIcon.className = "field-icon";
                    deleteIcon.addEventListener("click", (e) => {
                        e.stopPropagation();
                        console.log("Delete icon clicked for image field:", fieldData.id);
                        setSignatureFields((prev) => prev.filter(f => f.id !== fieldData.id));
                    });

                    // Save icon for image
                    const saveIcon = document.createElement("span");
                    saveIcon.innerHTML = "✅";
                    saveIcon.style.cursor = "pointer";
                    saveIcon.style.fontSize = "14px";
                    saveIcon.style.padding = "2px";
                    saveIcon.style.backgroundColor = "#e8f5e8";
                    saveIcon.style.borderRadius = "3px";
                    saveIcon.style.pointerEvents = "auto";
                    saveIcon.title = "Save Image";
                    saveIcon.className = "field-icon";
                    saveIcon.addEventListener("click", (e) => {
                        e.stopPropagation();
                        console.log("Save icon clicked for image field:", fieldData.id);
                        setSignatureFields((prev) =>
                            prev.map(f =>
                                f.id === fieldData.id
                                    ? { ...f, saved: true }
                                    : f
                            )
                        );
                    });

                    // Add hover effects for delete icon
                    deleteIcon.addEventListener("mouseenter", () => {
                        deleteIcon.style.backgroundColor = "#ffcdd2";
                    });
                    deleteIcon.addEventListener("mouseleave", () => {
                        deleteIcon.style.backgroundColor = "#ffebee";
                    });

                    // Add hover effects for save icon
                    saveIcon.addEventListener("mouseenter", () => {
                        saveIcon.style.backgroundColor = "#c8e6c9";
                    });
                    saveIcon.addEventListener("mouseleave", () => {
                        saveIcon.style.backgroundColor = "#e8f5e8";
                    });

                    iconContainer.appendChild(saveIcon);
                    iconContainer.appendChild(deleteIcon);

                    containerDiv.appendChild(imgEl);
                    containerDiv.appendChild(iconContainer);

                    // Toggle icon visibility based on saved state
                    if (fieldData.saved) {
                        // Image is saved - hide all icons
                        saveIcon.style.display = "none";
                        deleteIcon.style.display = "none";
                    } else {
                        // Image is not saved - show all icons
                        saveIcon.style.display = "inline-block";
                        deleteIcon.style.display = "inline-block";
                    }

                    addDragToElement(containerDiv, overlay, pageIndex, fieldData.id);
                    overlay.appendChild(containerDiv);
                }
                else if (fieldData.textData) {
                    const fontType = fontSettings?.fontType || "Arial";
                    const fontSize = fontSettings?.fontSize || 14;
                    const fontColor = fontSettings?.fontColor || "#000000";

                    const containerDiv = document.createElement("div");
                    containerDiv.style.position = "absolute";
                    containerDiv.style.left = `${fieldData.x}px`;
                    containerDiv.style.top = `${fieldData.y}px`;
                    containerDiv.style.padding = "4px 8px";
                    containerDiv.style.backgroundColor = "#eee";
                    containerDiv.style.border = "1px solid #333";
                    containerDiv.style.borderRadius = "4px";
                    containerDiv.style.minWidth = "100px";
                    containerDiv.style.zIndex = "10";
                    containerDiv.style.fontFamily = fieldData.fontType || fontType;
                    containerDiv.style.fontSize = `${fieldData.fontSize || fontSize}px`;
                    containerDiv.style.color = fieldData.fontColor || fontColor;
                    containerDiv.style.display = "flex";
                    containerDiv.style.alignItems = "center";
                    containerDiv.style.gap = "6px";

                    // Text display div
                    const textEl = document.createElement("div");
                    textEl.style.flexGrow = "1";
                    textEl.style.userSelect = "none";
                    textEl.style.pointerEvents = "none";
                    textEl.textContent = fieldData.textData;
                    // Apply current font settings to the text element
                    textEl.style.fontFamily = fieldData.fontType || fontType;
                    textEl.style.fontSize = `${fieldData.fontSize || fontSize}px`;
                    textEl.style.color = fieldData.fontColor || fontColor;

                    // Icons container
                    const iconContainer = document.createElement("div");
                    iconContainer.style.display = "flex";
                    iconContainer.style.gap = "6px";
                    iconContainer.style.pointerEvents = "auto"; // Ensure icons are clickable

                    // Delete icon
                    const deleteIcon = document.createElement("span");
                    deleteIcon.textContent = "❌";
                    deleteIcon.style.cursor = "pointer";
                    deleteIcon.style.fontSize = "14px";
                    deleteIcon.style.padding = "2px";
                    deleteIcon.style.backgroundColor = "#ffebee";
                    deleteIcon.style.borderRadius = "3px";
                    deleteIcon.style.pointerEvents = "auto";
                    deleteIcon.title = "Delete Field";
                    deleteIcon.className = "field-icon";
                    deleteIcon.addEventListener("click", (e) => {
                        e.stopPropagation(); // Prevent drag from interfering
                        console.log("Delete icon clicked for field:", fieldData.id);
                        setSignatureFields((prev) => prev.filter(f => f.id !== fieldData.id));
                        if (selectedField === fieldData.id) setSelectedField(null);
                    });

                    // Add hover effects
                    deleteIcon.addEventListener("mouseenter", () => {
                        deleteIcon.style.backgroundColor = "#ffcdd2";
                    });
                    deleteIcon.addEventListener("mouseleave", () => {
                        deleteIcon.style.backgroundColor = "#ffebee";
                    });


                    // Edit icon
                    const editIcon = document.createElement("span");
                    editIcon.innerHTML = "✏️";
                    editIcon.style.cursor = "pointer";
                    editIcon.style.fontSize = "14px";
                    editIcon.style.padding = "2px";
                    editIcon.style.backgroundColor = "#e3f2fd";
                    editIcon.style.borderRadius = "3px";
                    editIcon.style.pointerEvents = "auto";
                    editIcon.title = "Edit Field";
                    editIcon.className = "field-icon";
                    editIcon.addEventListener("click", (e) => {
                        e.stopPropagation(); // Prevent drag from interfering
                        console.log("Edit icon clicked for field:", fieldData.id);
                        setSelectedField(fieldData.id);
                        // Update font settings to match the current field
                        setFontSettings({
                            fontType: fieldData.fontType || "Arial",
                            fontSize: fieldData.fontSize || "14",
                            fontColor: fieldData.fontColor || "#000000",
                        });
                        // Mark field as not saved so icons remain visible
                        setSignatureFields((prev) =>
                            prev.map(f =>
                                f.id === fieldData.id
                                    ? { ...f, saved: false }
                                    : f
                            )
                        );
                    });

                    // Add hover effects
                    editIcon.addEventListener("mouseenter", () => {
                        editIcon.style.backgroundColor = "#bbdefb";
                    });
                    editIcon.addEventListener("mouseleave", () => {
                        editIcon.style.backgroundColor = "#e3f2fd";
                    });

                    // Save icon
                    const saveIcon = document.createElement("span");
                    saveIcon.innerHTML = "✅";
                    saveIcon.style.cursor = "pointer";
                    saveIcon.style.fontSize = "14px";
                    saveIcon.style.padding = "2px";
                    saveIcon.style.backgroundColor = "#e8f5e8";
                    saveIcon.style.borderRadius = "3px";
                    saveIcon.style.pointerEvents = "auto";
                    saveIcon.title = "Save Field";
                    saveIcon.className = "field-icon";

                    saveIcon.addEventListener("click", (e) => {
                        e.stopPropagation(); // Prevent drag from interfering
                        console.log("Save icon clicked for field:", fieldData.id);

                        setSignatureFields((prev) =>
                            prev.map(f =>
                                f.id === fieldData.id
                                    ? {
                                        ...f,
                                        fontType: fontSettings.fontType,
                                        fontSize: fontSettings.fontSize,
                                        fontColor: fontSettings.fontColor,
                                        saved: true, // Hide all icons when saved
                                    }
                                    : f
                            )
                        );

                        setSelectedField(null); // Exit edit mode
                    });

                    // Add hover effects
                    saveIcon.addEventListener("mouseenter", () => {
                        saveIcon.style.backgroundColor = "#c8e6c9";
                    });
                    saveIcon.addEventListener("mouseleave", () => {
                        saveIcon.style.backgroundColor = "#e8f5e8";
                    });


                    iconContainer.appendChild(editIcon);
                    iconContainer.appendChild(saveIcon);
                    iconContainer.appendChild(deleteIcon);

                    containerDiv.appendChild(textEl);
                    containerDiv.appendChild(iconContainer);

                    // Toggle edit mode UI - show all icons by default, hide all when saved
                    if (fieldData.saved) {
                        // Field is saved - hide all icons
                        editIcon.style.display = "none";
                        saveIcon.style.display = "none";
                        deleteIcon.style.display = "none";
                    } else {
                        // Field is not saved - show all icons
                        editIcon.style.display = "inline-block";
                        saveIcon.style.display = "inline-block";
                        deleteIcon.style.display = "inline-block";
                    }

                    // No textarea needed - text is updated through font settings

                    addDragToElement(containerDiv, overlay, pageIndex, fieldData.id);

                    overlay.appendChild(containerDiv);
                }
            });
        });
    }, [signatureFields, fileBlob, pdfRendered]);

    // 3. Update font settings for selected field without recreating all fields
    useEffect(() => {
        if (!fileBlob || !pdfRendered || !selectedField) return;

        const container = containerRef.current;
        if (!container) return;

        // Find the selected field element and update its styling
        const fieldElement = container.querySelector(`[data-id="${selectedField}"]`);
        if (fieldElement) {
            const textElement = fieldElement.querySelector('div');
            if (textElement) {
                textElement.style.fontFamily = fontSettings.fontType;
                textElement.style.fontSize = `${fontSettings.fontSize}px`;
                textElement.style.color = fontSettings.fontColor;
            }
        }
    }, [fontSettings, selectedField, fileBlob, pdfRendered]);


    const handleDrop = (event) => {
        event.preventDefault();

        const data = event.dataTransfer.getData("text/plain");
        if (!data) return;

        const container = containerRef.current;
        if (!container) return;

        const overlays = container.querySelectorAll("div[style*='position: absolute']");

        for (let index = 0; index < overlays.length; index++) {
            const overlay = overlays[index];
            const rect = overlay.getBoundingClientRect();

            if (
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom
            ) {
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                const newId = Date.now();

                // Determine if data is an image (dataURL) or text
                const isImage = data.startsWith("data:image/");

                // Create wrapper div for new draggable element
                const wrapper = document.createElement("div");
                wrapper.style.position = "absolute";
                wrapper.style.left = `${x}px`;
                wrapper.style.top = `${y}px`;
                wrapper.style.cursor = "move";
                wrapper.style.zIndex = "10";

                // For image show image preview, for text show text content
                if (isImage) {
                    const imgEl = document.createElement("img");
                    imgEl.src = data;
                    imgEl.style.width = "150px";
                    imgEl.style.height = "auto";
                    wrapper.appendChild(imgEl);
                } else {
                    wrapper.textContent = data;
                    wrapper.style.padding = "4px 8px";
                    wrapper.style.backgroundColor = "#eee";
                    wrapper.style.border = "1px solid #333";
                    wrapper.style.borderRadius = "4px";
                    wrapper.style.fontFamily = fontSettings.fontType;
                    wrapper.style.fontSize = `${fontSettings.fontSize}px`;
                    wrapper.style.color = fontSettings.fontColor;
                }

                addDragToElement(wrapper, overlay, index, newId);

                overlay.appendChild(wrapper);

                // Add to React state
                setSignatureFields((prev) => [
                    ...prev,
                    {
                        id: newId,
                        label: isImage ? "Signature Image" : "Text Field",
                        x,
                        y,
                        pageIndex: index,
                        saved: false, // Start with icons visible
                        imageData: isImage ? data : null,
                        textData: !isImage ? data : null,
                    },
                ]);

                break;
            }
        }
    };

    // Drag logic
    function addDragToElement(element, overlay, pageIndex, fieldId) {
        let offsetX, offsetY;
        let isDragging = false;

        element.dataset.id = fieldId;

        element.addEventListener("mousedown", (e) => {
            // Don't start dragging if clicking on icons
            if (e.target.closest('.field-icon')) {
                console.log("Drag prevented - clicked on icon");
                return;
            }

            console.log("Starting drag for element:", fieldId);
            isDragging = true;
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            e.preventDefault();

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });

        function onMouseMove(e) {
            if (!isDragging) return;

            const overlayRect = overlay.getBoundingClientRect();

            let newX = e.clientX - offsetX - overlayRect.left;
            let newY = e.clientY - offsetY - overlayRect.top;

            // Keep inside overlay boundaries
            newX = Math.max(0, Math.min(newX, overlayRect.width - element.offsetWidth));
            newY = Math.max(0, Math.min(newY, overlayRect.height - element.offsetHeight));

            element.style.left = `${newX}px`;
            element.style.top = `${newY}px`;
        }

        function onMouseUp() {
            if (!isDragging) return;
            isDragging = false;

            setSignatureFields((prev) =>
                prev.map((field) => {
                    if (field.id === parseInt(element.dataset.id)) {
                        return {
                            ...field,
                            x: parseFloat(element.style.left),
                            y: parseFloat(element.style.top),
                            pageIndex,
                        };
                    }
                    return field;
                })
            );

            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }
    }

    const generateEditedPdf = async (fields = signatureFields) => {
        if (!fileBlob || !viewportInfo) {
            console.error("Missing fileBlob or viewportInfo");
            return null;
        }

        try {
            console.log("Starting PDF generation with fields:", fields);
            console.log("Viewport info:", viewportInfo);

            const existingPdfBytes = await fetch(fileBlob).then((res) => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const pages = pdfDoc.getPages();

            console.log("PDF loaded, pages count:", pages.length);

            // Embed a standard font
            const font = await pdfDoc.embedFont('Helvetica');

            let processedFields = 0;
            for (const field of fields) {
                if (!field.saved) {
                    console.log("Skipping unsaved field:", field.id);
                    continue; // Skip unsaved fields
                }

                console.log("Processing field:", field);

                const page = pages[field.pageIndex];
                if (!page) {
                    console.error("Page not found for index:", field.pageIndex);
                    continue;
                }

                const { width: pdfWidth, height: pdfHeight } = page.getSize();
                console.log("Page size:", { pdfWidth, pdfHeight });

                // The PDF is rendered at 80% width, so we need to account for this scaling
                const renderedWidth = viewportInfo.renderedWidth * 0.8; // 80% of original width
                const renderedHeight = viewportInfo.renderedHeight * 0.8; // 80% of original height

                // Calculate scaling factors from rendered size to PDF size
                const scaleX = pdfWidth / renderedWidth;
                const scaleY = pdfHeight / renderedHeight;

                console.log("Scaling factors:", { scaleX, scaleY, renderedWidth, renderedHeight });

                // Convert UI coordinates to PDF coordinates
                const pdfX = field.x * scaleX;
                const pdfY = pdfHeight - (field.y * scaleY); // PDF uses bottom-left origin

                console.log("PDF coordinates:", { pdfX, pdfY, originalX: field.x, originalY: field.y });

                if (field.imageData) {
                    try {
                        const base64Data = field.imageData.split(',')[1];
                        if (!base64Data) {
                            console.error("Invalid image data format");
                            continue;
                        }

                        const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                        const signatureImage = await pdfDoc.embedPng(imageBytes);

                        // Scale image appropriately for PDF
                        const imageWidth = 150 * scaleX; // Convert 150px to PDF units
                        const imageHeight = (150 * signatureImage.height / signatureImage.width) * scaleY;

                        console.log("Drawing image:", { imageWidth, imageHeight, pdfX, pdfY });

                        page.drawImage(signatureImage, {
                            x: pdfX,
                            y: pdfY - imageHeight, // Adjust for image height
                            width: imageWidth,
                            height: imageHeight,
                        });
                        processedFields++;
                    } catch (imageError) {
                        console.error("Error embedding image:", imageError);
                    }
                } else if (field.textData) {
                    try {
                        // Directly use the color value from the field
                        const fontColor = field.fontColor || "#000000";
                        const r = parseInt(fontColor.slice(1, 3), 16) / 255;
                        const g = parseInt(fontColor.slice(3, 5), 16) / 255;
                        const b = parseInt(fontColor.slice(5, 7), 16) / 255;

                        // Scale font size appropriately
                        const fontSize = parseInt(field.fontSize || "14") * scaleY;

                        console.log("Drawing text:", {
                            text: field.textData,
                            fontSize,
                            pdfX,
                            pdfY,
                            color: [r, g, b]
                        });

                        page.drawText(field.textData, {
                            x: pdfX,
                            y: pdfY,
                            size: fontSize,
                            font: font,
                            color: rgb(r, g, b), // Use rgb() function for proper color format
                        });
                        processedFields++;
                    } catch (textError) {
                        console.error("Error drawing text:", textError);
                    }
                }
            }

            console.log("Processed fields:", processedFields);
            const pdfBytes = await pdfDoc.save();
            console.log("PDF generation completed successfully");
            // Convert Uint8Array to Blob
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            return blob;
        } catch (error) {
            console.error("PDF generation error:", error);
            console.error("Error details:", {
                message: error.message,
                stack: error.stack,
                fields: fields,
                viewportInfo: viewportInfo
            });
            throw error;
        }
    };


    const blobToBase64 = (blob) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // reader.result is like 'data:application/pdf;base64,JVBERi0xLjcK...'
                const base64data = reader.result.split(",")[1]; // strip prefix
                resolve(base64data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

    const handleSave = async () => {
        if (!fileBlob) return;

        setSaving(true);

        try {
            const editedPdfBlob = await generateEditedPdf(signatureFields);
            if (!editedPdfBlob) {
                toast.error("No fields to save or error generating PDF");
                return;
            }

            if (!(editedPdfBlob instanceof Blob)) {
                console.error("Invalid blob returned:", editedPdfBlob);
                toast.error("Error generating PDF. Please try again.");
                return;
            }

            const base64Pdf = await blobToBase64(editedPdfBlob);

            await signerApi.updateSignerStatus({
                email: recipientEmail || userEmail,
                documentId: documentId,
                signStatus: "completed",
                signed_file: base64Pdf,
            });

            toast.success("Document sent successfully!");
            setTimeout(() => {
                navigate("/dashboard/my-docs");
            }, 1500);


        } catch (error) {
            console.error("Error saving document:", error);
            toast.error("Error saving document. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!documentId || !recipientEmail || !fileBlob) return;

        setSaveDraft(true);

        try {
            const editedPdfBlob = await generateEditedPdf(signatureFields);

            if (!editedPdfBlob) {
                toast.error("No fields to save or error generating PDF");
                return;
            }

            if (!(editedPdfBlob instanceof Blob)) {
                console.error("Invalid blob returned:", editedPdfBlob);
                toast.error("Error generating PDF. Please try again.");
                return;
            }

            const base64Pdf = await blobToBase64(editedPdfBlob);

            await signerApi.updateSignerStatus({
                email: recipientEmail,
                documentId: documentId,
                signStatus: "draft",
                signed_file: base64Pdf,
            });

            toast.success("Draft saved successfully!");
            console.log("Draft saved");

        } catch (error) {
            console.error("Failed to save draft:", error);
            toast.error("Error saving draft.");
        } finally {
            setSaveDraft(false);
        }
    };


    return (
        <div style={{ padding: "20px" }}>
            <p>
                <span style={{ display: 'inline-flex', gap: '8px' }}>
                    <h1><strong>My-docs {documentName} </strong></h1>&nbsp; &nbsp;

                    <Button onClick={handleSaveDraft} variant="secondary">
                        {saveDraft ? "Saving draft..." : "Save Draft"}
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Sending..." : "Send"}
                    </Button>
                </span>
            </p>
            <ToastContainer position="top-right" autoClose={3000} />

            <div style={{ display: "flex", }}>
                <div
                    style={{
                        flex: 2,
                        border: "1px solid #ddd",
                        padding: "10px",
                        backgroundColor: "#fff",
                        maxHeight: "80vh",
                        overflowY: "auto",
                    }}
                >
                    <div
                        ref={containerRef}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        style={{
                            background: "white",
                            minHeight: "100vh",
                            position: "relative",
                        }}
                    />
                </div>

                <div
                    style={{
                        flex: 1,
                        border: "1px solid #ccc",
                        padding: "15px",
                        backgroundColor: "#f9f9f9",
                        maxHeight: "80vh",
                        overflowY: "auto",
                    }}
                >
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ marginRight: "10px" }}>
                            <input
                                type="radio"
                                name="signatureMode"
                                value="draw"
                                checked={signatureMode === "draw"}
                                onChange={() => setSignatureMode("draw")}
                            />
                            &nbsp;Draw
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="signatureMode"
                                value="type"
                                checked={signatureMode === "type"}
                                onChange={() => setSignatureMode("type")}
                            />
                            &nbsp;Type
                        </label>
                        &nbsp;  &nbsp;
                        <label>
                            <input
                                type="radio"
                                name="signatureMode"
                                value="upload"
                                checked={signatureMode === "upload"}
                                onChange={() => setSignatureMode("upload")}
                            />
                            &nbsp;Upload
                        </label>
                    </div>

                    {signatureMode === "draw" ? (
                        <GenerateSignatureField
                            generatedSignatures={generatedSignatures}
                            setGeneratedSignatures={setGeneratedSignatures}
                        />
                    ) : signatureMode === "type" ? (
                        <>
                            <CustomSignatureField
                                customFields={customFields}
                                setCustomFields={setCustomFields}
                            />
                            <SignatureStyle
                                fontSettings={fontSettings}
                                setFontSettings={setFontSettings}
                                selectedField={selectedField}
                            />
                        </>
                    ) : (
                        <>
                            <UploadSignatureField />
                            <SignatureStyle
                                fontSettings={fontSettings}
                                setFontSettings={setFontSettings}
                                selectedField={selectedField}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipentViewDoc;
