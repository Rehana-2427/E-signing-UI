import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const FilePreview = ({ file, formData, setSelectedField, signingMode, signatories, onPdfEdited, signatureFields, setSignatureFields, onSave }) => {
    const [isEditable, setIsEditable] = useState(true);
    const [fileUrl, setFileUrl] = useState(null);
    const containerRef = useRef(null);

    // Create file preview URL
    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setFileUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    // Render PDF into editable div
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        // Clear previous content
        container.innerHTML = "";

        // Save scroll position
        const prevScrollTop = container.scrollTop;

        const renderPdfToHtml = async (pdfUrl, container) => {
            // container.innerHTML = "";
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            const pdf = await loadingTask.promise;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1 });

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: context, viewport }).promise;

                const imgData = canvas.toDataURL();
                const img = document.createElement("img");
                img.src = imgData;
                img.style.width = "100%";
                img.style.display = "block";

                const pageContainer = document.createElement("div");
                pageContainer.classList.add("pdf-page-container");
                pageContainer.style.position = "relative";
                pageContainer.style.width = `${viewport.width}px`;
                pageContainer.style.height = `${viewport.height}px`;
                pageContainer.style.marginBottom = "20px";

                const textLayerDiv = document.createElement("div");
                textLayerDiv.style.position = "absolute";
                textLayerDiv.style.top = "0";
                textLayerDiv.style.left = "0";
                textLayerDiv.style.width = `${viewport.width}px`;
                textLayerDiv.style.height = `${viewport.height}px`;
                textLayerDiv.style.pointerEvents = isEditable ? "auto" : "none";

                // Render saved signature fields for this page
                signatureFields
                    .filter((f) => f.pageIndex === i - 1)
                    .forEach((fieldData, fieldIdx) => {
                        const wrapper = document.createElement("div");
                        wrapper.style.position = "absolute";
                        wrapper.style.left = `${fieldData.x}px`;
                        wrapper.style.top = `${fieldData.y}px`;
                        wrapper.style.cursor = "move";
                        wrapper.style.display = "inline-flex";
                        wrapper.style.alignItems = "center";
                        wrapper.style.gap = "2px";

                        const nameDiv = document.createElement("div");
                        nameDiv.innerText = fieldData.signatoryName; // Display signatory name
                        nameDiv.style.fontWeight = "bold";
                        nameDiv.style.marginRight = "5px";

                        const field = document.createElement("div");
                        field.innerText = fieldData.label;
                        field.contentEditable = true;
                        field.style.padding = "4px 8px";
                        field.style.border = "1px solid #666";
                        field.style.backgroundColor = "#f9f9f9";
                        field.style.borderRadius = "4px";
                        field.style.fontSize = "14px";
                        field.style.fontFamily = "Arial";
                        field.style.color = "#000";

                        // --- Drag logic for moving after drop or save ---
                        let isDragging = false;
                        let offsetX = 0;
                        let offsetY = 0;
                        let startX = 0;
                        let startY = 0;

                        const onMouseMove = (e) => {
                            if (!isDragging) return;
                            const parentRect = textLayerDiv.getBoundingClientRect();
                            const newX = e.clientX - parentRect.left - offsetX;
                            const newY = e.clientY - parentRect.top - offsetY;
                            wrapper.style.left = `${newX}px`;
                            wrapper.style.top = `${newY}px`;
                            startX = newX;
                            startY = newY;
                        };

                        const onMouseUp = () => {
                            setSignatureFields((prev) =>
                                prev.map(f => f.id === fieldData.id ? { ...f, x: startX, y: startY } : f)
                            );
                            isDragging = false;
                            document.removeEventListener("mousemove", onMouseMove);
                            document.removeEventListener("mouseup", onMouseUp);
                        };

                        if (!fieldData.saved) {
                            const deleteIcon = document.createElement("span");
                            deleteIcon.innerHTML = "❌";
                            deleteIcon.style.cursor = "pointer";
                            deleteIcon.style.fontSize = "12px";
                            deleteIcon.title = "Delete Field";
                            deleteIcon.className = "field-icon";
                            deleteIcon.addEventListener("click", () => {
                                setSignatureFields((prev) => prev.filter(f => f.id !== fieldData.id));
                            });

                            const editIcon = document.createElement("span");
                            editIcon.innerHTML = "✏️";
                            editIcon.style.cursor = "pointer";
                            editIcon.style.fontSize = "12px";
                            editIcon.title = "Edit Field";
                            editIcon.className = "field-icon";
                            editIcon.addEventListener("click", () => setSelectedField(field));

                            const saveIcon = document.createElement("span");
                            saveIcon.innerHTML = "✅";
                            saveIcon.style.cursor = "pointer";
                            saveIcon.style.fontSize = "12px";
                            saveIcon.style.userSelect = "none";
                            saveIcon.title = "Save Position";
                            saveIcon.className = "field-icon";
                            saveIcon.addEventListener("click", () => {
                                setSignatureFields((prev) =>
                                    prev.map(f =>
                                        f.id === fieldData.id
                                            ? { ...f, saved: true }
                                            : f
                                    )
                                );
                            });

                            wrapper.appendChild(nameDiv);
                            wrapper.appendChild(field);
                            wrapper.appendChild(deleteIcon);
                            wrapper.appendChild(editIcon);
                            wrapper.appendChild(saveIcon);
                        } else {
                            wrapper.appendChild(nameDiv);
                            wrapper.appendChild(field);
                        }
                        textLayerDiv.appendChild(wrapper);

                        // Move drag logic here so it always applies, but skip if clicking icon
                        wrapper.addEventListener("mousedown", (e) => {
                            if (!isEditable) return;
                            // Prevent drag if clicking on an icon
                            if (e.target.classList.contains("field-icon")) return;
                            isDragging = true;
                            const wrapperRect = wrapper.getBoundingClientRect();
                            offsetX = e.clientX - wrapperRect.left;
                            offsetY = e.clientY - wrapperRect.top;
                            startX = fieldData.x;
                            startY = fieldData.y;
                            document.addEventListener("mousemove", onMouseMove);
                            document.addEventListener("mouseup", onMouseUp);
                            e.stopPropagation();
                        });
                        // --- End drag logic ---
                    });

                textLayerDiv.addEventListener("drop", (e) => {
                    e.preventDefault();
                    if (!isEditable) return;

                    const label = e.dataTransfer.getData("text/plain");
                    const rect = textLayerDiv.getBoundingClientRect();
                    const dropX = e.clientX - rect.left;
                    const dropY = e.clientY - rect.top;
                    if (signingMode === "same_doc_end" || signingMode === "same_doc_pages" || signingMode === "multi_doc") {
                        const lastPageContainer = containerRef.current.lastElementChild;
                        const lastTextLayer = lastPageContainer?.querySelector("div");

                        if (lastTextLayer) {
                            signatories.forEach((signatory, idx) => {
                                const wrapper = document.createElement("div");
                                wrapper.style.position = "absolute";
                                wrapper.style.left = `40px`;
                                wrapper.style.top = `${100 + idx * 60}px`;
                                wrapper.style.display = "flex";
                                wrapper.style.alignItems = "center";
                                wrapper.style.gap = "1px";
                                wrapper.style.cursor = "move";

                                const nameDiv = document.createElement("div");
                                nameDiv.innerText = signatory.name;
                                nameDiv.style.fontWeight = "bold";

                                const field = document.createElement("div");
                                field.innerText = label;
                                field.contentEditable = true;
                                field.style.padding = "4px 8px";
                                field.style.border = "1px solid #666";
                                field.style.backgroundColor = "#f9f9f9";
                                field.style.borderRadius = "4px";
                                field.style.fontSize = "14px";
                                field.style.fontFamily = "Arial";
                                field.style.color = "#000";

                                const deleteIcon = document.createElement("span");
                                deleteIcon.innerHTML = "❌";
                                deleteIcon.style.cursor = "pointer";
                                deleteIcon.style.fontSize = "12px";
                                deleteIcon.title = "Delete Field";
                                deleteIcon.addEventListener("click", () => wrapper.remove());

                                const editIcon = document.createElement("span");
                                editIcon.innerHTML = "✏️";
                                editIcon.style.cursor = "pointer";
                                editIcon.style.fontSize = "12px";
                                editIcon.title = "Edit Field";
                                editIcon.addEventListener("click", () => setSelectedField(field));

                                const saveIcon = document.createElement("span");
                                saveIcon.innerHTML = "✅";
                                saveIcon.style.cursor = "pointer";
                                saveIcon.style.fontSize = "12px";
                                saveIcon.style.userSelect = "none";
                                saveIcon.title = "Save Position";
                                saveIcon.addEventListener("click", () => {
                                    // Keep field editable after save
                                    wrapper.style.cursor = "default";
                                    [saveIcon, deleteIcon, editIcon].forEach(icon => {
                                        if (icon && icon.parentNode) icon.parentNode.removeChild(icon);
                                    });
                                });

                                let isDragging = false;
                                let offsetX = 0;
                                let offsetY = 0;

                                const onMouseMove = (e) => {
                                    if (!isDragging) return;
                                    const parentRect = textLayerDiv.getBoundingClientRect();
                                    const newX = e.clientX - parentRect.left - offsetX;
                                    const newY = e.clientY - parentRect.top - offsetY;
                                    wrapper.style.left = `${newX}px`;
                                    wrapper.style.top = `${newY}px`;
                                };

                                const onMouseUp = () => {
                                    isDragging = false;
                                    document.removeEventListener("mousemove", onMouseMove);
                                    document.removeEventListener("mouseup", onMouseUp);
                                };

                                field.addEventListener("mousedown", (e) => {
                                    isDragging = true;
                                    const wrapperRect = wrapper.getBoundingClientRect();
                                    offsetX = e.clientX - wrapperRect.left;
                                    offsetY = e.clientY - wrapperRect.top;
                                    document.addEventListener("mousemove", onMouseMove);
                                    document.addEventListener("mouseup", onMouseUp);
                                    e.stopPropagation();
                                });

                                const onMouseDownHandler = (e) => {
                                    isDragging = true;
                                    const wrapperRect = wrapper.getBoundingClientRect();
                                    offsetX = e.clientX - wrapperRect.left;
                                    offsetY = e.clientY - wrapperRect.top;
                                    document.addEventListener("mousemove", onMouseMove);
                                    document.addEventListener("mouseup", onMouseUp);
                                    e.stopPropagation();
                                };


                                wrapper.appendChild(nameDiv);
                                wrapper.appendChild(field);
                                wrapper.appendChild(deleteIcon);
                                wrapper.appendChild(editIcon);
                                wrapper.appendChild(saveIcon);
                                lastTextLayer.appendChild(wrapper);

                                const fieldData = {
                                    id: Date.now() + Math.random(),
                                    label,
                                    signatoryName: signatory.name,
                                    x: dropX,
                                    y: dropY + idx * 30,
                                    pageIndex: containerRef.current.children.length - 1,
                                    saved: true
                                };
                                setSignatureFields((prev) => [...prev, fieldData]);
                            });
                        }

                        return;
                    }

                    // const rect = textLayerDiv.getBoundingClientRect();
                    // let x = e.clientX - rect.left;
                    // let y = e.clientY - rect.top;

                    const wrapper = document.createElement("div");
                    wrapper.style.position = "absolute";
                    wrapper.style.left = `${dropX}px`;
                    wrapper.style.top = `${dropY}px`;
                    wrapper.style.cursor = "move";
                    wrapper.style.display = "inline-flex";
                    wrapper.style.alignItems = "center";
                    wrapper.style.gap = "2px";

                    const field = document.createElement("div");
                    field.innerText = label;
                    field.contentEditable = true;
                    field.style.padding = "4px 8px";
                    field.style.border = "1px solid #666";
                    field.style.backgroundColor = "#f9f9f9";
                    field.style.fontFamily = "Arial";
                    field.style.fontSize = "14px";
                    field.style.color = "#333";
                    field.style.borderRadius = "4px";

                    const deleteIcon = document.createElement("span");
                    deleteIcon.innerHTML = "❌";
                    deleteIcon.style.cursor = "pointer";
                    deleteIcon.style.fontSize = "12px";
                    deleteIcon.title = "Delete Field";
                    deleteIcon.addEventListener("click", () => {
                        wrapper.remove();
                        setSignatureFields((prev) => prev.filter(f => f.label !== label));
                    });

                    const editIcon = document.createElement("span");
                    editIcon.innerHTML = "✏️";
                    editIcon.style.cursor = "pointer";
                    editIcon.style.fontSize = "12px";
                    editIcon.title = "Edit Field";
                    editIcon.addEventListener("click", () => setSelectedField(field));

                    const saveIcon = document.createElement("span");
                    saveIcon.innerHTML = "✅";
                    saveIcon.style.cursor = "pointer";
                    saveIcon.style.fontSize = "12px";
                    saveIcon.style.userSelect = "none";
                    saveIcon.title = "Save Position";

                    wrapper.appendChild(field);
                    wrapper.appendChild(deleteIcon);
                    wrapper.appendChild(editIcon);
                    wrapper.appendChild(saveIcon);
                    textLayerDiv.appendChild(wrapper);

                    const fieldData = {
                        id: Date.now() + Math.random(),
                        label,
                        signatoryName: "",
                        x: dropX,
                        y: dropY,
                        pageIndex: i - 1,
                        saved: false
                    };
                    setSignatureFields((prev) => [...prev, fieldData]);
                });

                textLayerDiv.addEventListener("dragover", (e) => e.preventDefault());

                pageContainer.appendChild(img);
                pageContainer.appendChild(textLayerDiv);
                container.appendChild(pageContainer);


            }
            // Restore scroll position after DOM update
            setTimeout(() => {
                container.scrollTop = prevScrollTop;
            }, 0);
        };

        if (file?.type === "application/pdf" && fileUrl && container) {
            renderPdfToHtml(fileUrl, container);
        }
    }, [file, fileUrl, isEditable, setSelectedField, signingMode, signatories, setSignatureFields]);

    const generateEditedPdf = async (fields = signatureFields) => {
        if (!file) return null;
        // Read original PDF bytes
        const arrayBuffer = await file.arrayBuffer();
        // Load PDF with pdf-lib
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        // Embed a font
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Store viewport information for coordinate conversion
        const viewports = [];

        // First pass: Store viewport information for each page
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const { width, height } = page.getSize();
            viewports.push({ width, height });
        }

        fields.forEach(field => {
            const page = pages[field.pageIndex];
            if (!page) return;
            const { width, height } = viewports[field.pageIndex];
            const scaleX = width / viewports[field.pageIndex].width;
            const scaleY = height / viewports[field.pageIndex].height;

            const pdfX = field.x * scaleX;
            const pdfY = height - (field.y * scaleY);



            if (field.signatoryName) {
                const nameWidth = font.widthOfTextAtSize(field.signatoryName, 12);
                page.drawText(field.signatoryName, {
                    x: pdfX,
                    y: pdfY,
                    size: 12,
                    font,
                    color: rgb(0, 0, 0),
                });
                page.drawText(field.label || "Signature", {
                    x: pdfX + nameWidth + 8, // 8px spacing between name and label
                    y: pdfY,
                    size: 12,
                    font,
                    color: rgb(0, 0, 0),
                });
            } else {
                page.drawText(field.label || "Signature", {
                    x: pdfX,
                    y: pdfY,
                    size: 12,
                    font,
                    color: rgb(0, 0, 0),
                });
            }
        });

        // Serialize and return PDF Blob
        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes], { type: "application/pdf" });
    };

    const handleSave = async () => {
        // Log all x and y coordinates when Save button is clicked
        console.log('Save button clicked. All signature fields:');
        signatureFields.forEach(f => {
            console.log(`field id: ${f.id}, x: ${f.x}, y: ${f.y}`);
        });
        if (onSave) onSave(signatureFields);

        const editedPdfBlob = await generateEditedPdf(signatureFields, signingMode);
        if (!editedPdfBlob) return;

        // Send to parent if needed
        if (onPdfEdited) onPdfEdited(editedPdfBlob);

        // // ✅ Automatically trigger download
        // const url = URL.createObjectURL(editedPdfBlob);
        // const a = document.createElement("a");
        // a.href = url;
        // a.download = formData?.documentName ? `${formData.documentName}_edited.pdf` : "edited_document.pdf";
        // document.body.appendChild(a);
        // a.click();
        // document.body.removeChild(a);
        // URL.revokeObjectURL(url);
    };

    return (
        <>
            <div style={{ display: "flex", justifyContent: "flex-end" }} className="mt-3">
                <Button variant="success" onClick={handleSave}>Save</Button>
            </div>

            <div>
                <div
                    ref={containerRef}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    style={{
                        outline: "none",
                        pointerEvents: isEditable ? "auto" : "none",
                        cursor: isEditable ? "text" : "default",
                        minHeight: "50%",
                        padding: "20px",
                        backgroundColor: "#fff",
                    }}
                />

            </div>
        </>
    );
};

export default FilePreview; 