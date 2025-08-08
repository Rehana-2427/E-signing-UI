import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { useEffect, useRef, useState } from "react";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const FilePreview = ({ file, setSelectedField, signingMode, signatories, onPdfEdited, signatureFields, setSignatureFields, onSave, fontSettings }) => {
    const [isEditable, setIsEditable] = useState(true);
    const [fileUrl, setFileUrl] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setFileUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = "";
        const prevScrollTop = container.scrollTop;

        const renderPdfToHtml = async (pdfUrl, container) => {
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
                        nameDiv.innerText = fieldData.signatoryName;
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

                        wrapper.addEventListener("mousedown", (e) => {
                            if (!isEditable) return;
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
                    });

                textLayerDiv.addEventListener("drop", (e) => {
                    e.preventDefault();
                    if (!isEditable) return;

                    const label = e.dataTransfer.getData("text/plain");
                    const rect = textLayerDiv.getBoundingClientRect();
                    const dropX = e.clientX - rect.left;
                    const dropY = e.clientY - rect.top;
                    if (signingMode === "same_doc_end") {
                        const lastPageContainer = containerRef.current.lastElementChild;
                        const lastTextLayer = lastPageContainer?.querySelector("div");

                        if (lastTextLayer) {
                            signatories.forEach((signatory, idx) => {
                                const wrapper = document.createElement("div");
                                wrapper.style.position = "absolute";
                                wrapper.style.left = `40px`;
                                wrapper.style.top = `${100 + idx * 10}px`;
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

                                    const newX = parseFloat(wrapper.style.left);
                                    const newY = parseFloat(wrapper.style.top);

                                    setSignatureFields(prev =>
                                        prev.map(f =>
                                            f.id === fieldData.id
                                                ? { ...f, x: newX, y: newY, saved: true }
                                                : f
                                        )
                                    );
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
                    else if (signingMode === "same_doc_pages") {
                        const existingPageCount = containerRef.current.children.length;

                        signatories.forEach((signatory, idx) => {
                            let pageContainer;

                            // Step 1: Use existing pages first
                            if (idx < existingPageCount) {
                                pageContainer = containerRef.current.children[idx];
                            } else {
                                // Step 2: Add blank pages only if needed
                                const blankPageIndex = containerRef.current.children.length;

                                const blankPage = document.createElement("div");
                                blankPage.className = "pdf-page";
                                blankPage.style.position = "relative";
                                blankPage.style.width = "595px";
                                blankPage.style.height = "842px";
                                blankPage.style.backgroundColor = "#fff";
                                blankPage.style.border = "1px solid #ccc";
                                blankPage.style.margin = "10px auto";

                                const blankTextLayer = document.createElement("div");
                                blankTextLayer.className = "textLayer";
                                blankTextLayer.style.position = "absolute";
                                blankTextLayer.style.top = 0;
                                blankTextLayer.style.left = 0;
                                blankTextLayer.style.right = 0;
                                blankTextLayer.style.bottom = 0;

                                const pageNumber = document.createElement("div");
                                pageNumber.innerText = `Page ${blankPageIndex + 1}`;
                                pageNumber.style.position = "absolute";
                                pageNumber.style.bottom = "10px";
                                pageNumber.style.right = "10px";
                                pageNumber.style.fontSize = "12px";
                                pageNumber.style.color = "#000";

                                blankPage.appendChild(blankTextLayer);
                                blankPage.appendChild(pageNumber);
                                containerRef.current.appendChild(blankPage);

                                pageContainer = blankPage;
                            }

                            // Ensure textLayer exists (even for existing pages)
                            let textLayerDiv = pageContainer.querySelector(".textLayer");
                            if (!textLayerDiv) {
                                textLayerDiv = document.createElement("div");
                                textLayerDiv.className = "textLayer";
                                textLayerDiv.style.position = "absolute";
                                textLayerDiv.style.top = 0;
                                textLayerDiv.style.left = 0;
                                textLayerDiv.style.right = 0;
                                textLayerDiv.style.bottom = 0;
                                pageContainer.appendChild(textLayerDiv);
                            }

                            // Create wrapper for field + name
                            const wrapper = document.createElement("div");
                            wrapper.style.position = "absolute";
                            wrapper.style.left = `60px`;
                            wrapper.style.top = `100px`;
                            wrapper.style.display = "flex";
                            wrapper.style.alignItems = "center";
                            wrapper.style.gap = "8px";
                            wrapper.style.cursor = "move";

                            const nameDiv = document.createElement("div");
                            nameDiv.innerText = signatory.name;
                            nameDiv.style.fontWeight = "bold";

                            const field = document.createElement("div");
                            field.innerText = "Signature";
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
                            saveIcon.title = "Save Position";
                            saveIcon.addEventListener("click", () => {
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

                                // ✅ Update fieldData position in signatureFields state
                                const newX = parseFloat(wrapper.style.left);
                                const newY = parseFloat(wrapper.style.top);

                                setSignatureFields((prevFields) =>
                                    prevFields.map((f) => {
                                        if (f.id === fieldData.id) {
                                            return {
                                                ...f,
                                                x: newX,
                                                y: newY,
                                                saved: true
                                            };
                                        }
                                        return f;
                                    })
                                );
                            };


                            const onMouseDownHandler = (e) => {
                                isDragging = true;
                                const wrapperRect = wrapper.getBoundingClientRect();
                                offsetX = e.clientX - wrapperRect.left;
                                offsetY = e.clientY - wrapperRect.top;
                                document.addEventListener("mousemove", onMouseMove);
                                document.addEventListener("mouseup", onMouseUp);
                                e.stopPropagation();
                            };

                            field.addEventListener("mousedown", onMouseDownHandler);

                            wrapper.appendChild(nameDiv);
                            wrapper.appendChild(field);
                            wrapper.appendChild(deleteIcon);
                            wrapper.appendChild(editIcon);
                            wrapper.appendChild(saveIcon);
                            textLayerDiv.appendChild(wrapper);

                            const fieldData = {
                                id: Date.now() + Math.random(),
                                label: "Signature",
                                signatoryName: signatory.name,
                                x: dropX,
                                y: dropY + idx * 30,
                                pageIndex: idx,
                                saved: true
                            };

                            setSignatureFields((prev) => [...prev, fieldData]);
                        });

                        return;
                    }
                    else if (signingMode === "multi_doc") {
                        const lastPageContainer = containerRef.current.lastElementChild;
                        const lastTextLayer = lastPageContainer?.querySelector("div");

                        if (lastTextLayer) {
                            // Only one signature field, no matter how many signatories
                            const wrapper = document.createElement("div");
                            wrapper.style.position = "absolute";
                            wrapper.style.left = `40px`;
                            wrapper.style.top = `100px`;
                            wrapper.style.display = "flex";
                            wrapper.style.alignItems = "center";
                            wrapper.style.gap = "1px";
                            wrapper.style.cursor = "move";

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
                                const parentRect = lastTextLayer.getBoundingClientRect();
                                const newX = e.clientX - parentRect.left - offsetX;
                                const newY = e.clientY - parentRect.top - offsetY;
                                wrapper.style.left = `${newX}px`;
                                wrapper.style.top = `${newY}px`;
                            };

                            const onMouseUp = () => {
                                isDragging = false;
                                document.removeEventListener("mousemove", onMouseMove);
                                document.removeEventListener("mouseup", onMouseUp);

                                const newX = parseFloat(wrapper.style.left);
                                const newY = parseFloat(wrapper.style.top);

                                setSignatureFields(prev =>
                                    prev.map(f =>
                                        f.id === fieldData.id
                                            ? { ...f, x: newX, y: newY, saved: true }
                                            : f
                                    )
                                );
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

                            wrapper.appendChild(field);
                            wrapper.appendChild(deleteIcon);
                            wrapper.appendChild(editIcon);
                            wrapper.appendChild(saveIcon);
                            lastTextLayer.appendChild(wrapper);

                            const fieldData = {
                                id: Date.now() + Math.random(),
                                label,
                                signatoryName: "", // No name for multi_doc
                                x: 40,
                                y: 100,
                                pageIndex: containerRef.current.children.length - 1,
                                saved: true
                            };

                            setSignatureFields((prev) => [...prev, fieldData]);
                        }
                        return;
                    }

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
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        let pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const viewports = [];

        // If signingMode is same_doc_pages, add blank pages if needed
        if (signingMode === "same_doc_pages" && signatories && signatories.length > pages.length) {
            const { width, height } = pages[0].getSize();
            for (let i = pages.length; i < signatories.length; i++) {
                pdfDoc.addPage([width, height]);
            }
            pages = pdfDoc.getPages(); // update pages after adding
        }

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
        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes], { type: "application/pdf" });
    }



    useEffect(() => {
        const autoSave = async () => {
            if (signatureFields.length === 0) return;
            if (onSave) onSave(signatureFields);
            const editedPdfBlob = await generateEditedPdf(signatureFields, signingMode, signatories);
            if (editedPdfBlob && onPdfEdited) onPdfEdited(editedPdfBlob);
        };
        autoSave();
    }, [signatureFields]);

    return (
        <>
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