// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import * as pdfjsLib from "pdfjs-dist";
// import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
// import { useEffect, useRef, useState } from "react";
// import { Button } from "react-bootstrap";
// import { FaBars } from "react-icons/fa";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import documentApi from "../api/documentapi";
// import Navbar from "../components/layout/Navbar";
// import CustomSignatureField from "./CustomSignatureField";
// import SignatureFields from "./SignatureFields";
// import SignatureStyle from "./pages/SignatureStyle";
// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// const FileEditor = () => {
//     const user = JSON.parse(localStorage.getItem('user'));
//     const userEmail = user?.userEmail;
//     const [pdfUrl, setPdfUrl] = useState(null);
//     const [isEditable, setIsEditable] = useState(true);
//     const containerRef = useRef(null);
//     const [pageThumbs, setPageThumbs] = useState([]);
//     const pageRefs = useRef([]);
//     const [customFields, setCustomFields] = useState([]);
//     const signatureFieldLabels = ["Signature", "Full Name", "Company Name", "Email ID"];
//     const editorScrollRef = useRef(null);
//     const [activePageIndex, setActivePageIndex] = useState(0);
//     const [showThumbnails, setShowThumbnails] = useState(false);
//     const [selectedField, setSelectedField] = useState(null);
//     const [fontSettings, setFontSettings] = useState({
//         fontType: "Arial",
//         fontSize: "14",
//         fontColor: "#000000",
//     });
//     const [formData, setFormData] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);


//     useEffect(() => {
//         const handleMessage = (event) => {
//             if (event.origin !== window.location.origin) return;

//             const data = event.data;

//             // ✅ Validate expected structure
//             if (data?.pdfUrl && data?.title) {
//                 console.log("✅ Received DOC_PAYLOAD:", data);
//                 setFormData(data); // sets the full form data
//                 setPdfUrl(data.pdfUrl); // ✅ this line is crucial
//             } else {
//                 console.warn("⚠️ Ignored message:", data);
//             }
//         };

//         window.addEventListener("message", handleMessage);
//         return () => window.removeEventListener("message", handleMessage);
//     }, []);

//     useEffect(() => {
//         if (formData?.signRequiredBy) {
//             const date = new Date(formData.signRequiredBy);
//             if (!isNaN(date)) {
//                 const formattedDate = date.toISOString().split("T")[0];
//                 console.log("Formatted signRequiredBy:", formattedDate);
//             }
//         }
//     }, [formData]);


//     useEffect(() => {
//         if (pdfUrl && containerRef.current) {
//             renderPdfToHtml(pdfUrl, containerRef.current, isEditable, pageRefs, setPageThumbs);
//         }
//     }, [pdfUrl]);

//     useEffect(() => {
//         const onScroll = () => {
//             if (!editorScrollRef.current || !pageRefs.current.length) return;
//             const scrollTop = editorScrollRef.current.scrollTop;
//             const containerHeight = editorScrollRef.current.clientHeight;

//             let foundIndex = 0;
//             for (let i = 0; i < pageRefs.current.length; i++) {
//                 const page = pageRefs.current[i];
//                 if (!page) continue;
//                 const offsetTop = page.offsetTop;
//                 const height = page.offsetHeight;

//                 if (scrollTop + containerHeight / 2 >= offsetTop) {
//                     foundIndex = i;
//                 } else {
//                     break;
//                 }
//             }
//             setActivePageIndex(foundIndex);
//         };

//         const scrollEl = editorScrollRef.current;
//         if (scrollEl) {
//             scrollEl.addEventListener("scroll", onScroll);
//         }
//         return () => {
//             if (scrollEl) scrollEl.removeEventListener("scroll", onScroll);
//         };
//     }, [pageThumbs]);


//     console.log(pdfUrl)
//     async function renderPdfToHtml(pdfUrl, container, isEditable, pageRefs, setPageThumbs) {
//         container.innerHTML = "";
//         const loadingTask = pdfjsLib.getDocument(pdfUrl);
//         const pdf = await loadingTask.promise;

//         const thumbs = [];
//         pageRefs.current = [];

//         for (let i = 1; i <= pdf.numPages; i++) {
//             const page = await pdf.getPage(i);
//             const viewport = page.getViewport({ scale: 1.5 });

//             const canvas = document.createElement("canvas");
//             const context = canvas.getContext("2d");
//             canvas.width = viewport.width;
//             canvas.height = viewport.height;

//             await page.render({ canvasContext: context, viewport }).promise;

//             const imgData = canvas.toDataURL();
//             thumbs.push(imgData);

//             const img = document.createElement("img");
//             img.src = imgData;
//             img.style.width = "100%";
//             img.style.display = "block";

//             const pageContainer = document.createElement("div");
//             pageContainer.classList.add("pdf-page-container");
//             pageContainer.style.position = "relative";
//             pageContainer.style.width = `${viewport.width}px`;
//             pageContainer.style.height = `${viewport.height}px`;
//             pageContainer.style.marginBottom = "20px";


//             pageRefs.current.push(pageContainer);

//             const pageNumberDiv = document.createElement("div");
//             pageNumberDiv.textContent = `Page ${i}`;
//             pageNumberDiv.style.position = "absolute";
//             pageNumberDiv.style.bottom = "5px";

//             pageNumberDiv.style.right = "5px";
//             pageNumberDiv.style.left = "auto";  // make sure left is unset
//             pageNumberDiv.style.transform = "none";

//             pageNumberDiv.style.fontSize = "14px";
//             pageNumberDiv.style.color = "gray";
//             pageNumberDiv.style.userSelect = "none"; // prevent selection

//             pageContainer.appendChild(pageNumberDiv);

//             const textLayerDiv = document.createElement("div");
//             textLayerDiv.style.position = "absolute";
//             textLayerDiv.style.top = "0";
//             textLayerDiv.style.left = "0";
//             textLayerDiv.style.width = `${viewport.width}px`;
//             textLayerDiv.style.height = `${viewport.height}px`;
//             textLayerDiv.style.pointerEvents = isEditable ? "auto" : "none";

//             // Enable dropping into this layer
//             textLayerDiv.addEventListener("drop", (e) => {
//                 e.preventDefault();
//                 if (!isEditable) return;
//                 let label = e.dataTransfer.getData("text/plain");

//                 const customFieldId = e.dataTransfer.getData("customFieldId");
//                 if (customFieldId) {
//                     const customField = customFields.find(f => f.id.toString() === customFieldId);
//                     if (customField) {
//                         label = customField.text;
//                     } else {
//                         return; // unknown field
//                     }
//                 }
//                 const rect = textLayerDiv.getBoundingClientRect();
//                 let x = e.clientX - rect.left;
//                 let y = e.clientY - rect.top;

//                 const wrapper = document.createElement("div");
//                 wrapper.style.position = "absolute";
//                 wrapper.style.left = `${x}px`;
//                 wrapper.style.top = `${y}px`;
//                 wrapper.style.cursor = "move";
//                 wrapper.style.display = "inline-flex";
//                 wrapper.style.alignItems = "center";
//                 wrapper.style.gap = "4px";
//                 wrapper.draggable = false;

//                 const isSignatureField = signatureFieldLabels.includes(label);

//                 const field = document.createElement("div");
//                 field.innerText = label;
//                 field.contentEditable = !isSignatureField;
//                 field.innerText = label;
//                 field.contentEditable = true;
//                 field.style.padding = "4px 8px";
//                 field.style.border = "1px solid #666";
//                 field.style.backgroundColor = "#f9f9f9";
//                 field.style.fontFamily = "Arial";
//                 field.style.fontSize = "14px";
//                 field.style.color = "#333";
//                 field.style.borderRadius = "4px";
//                 field.style.outline = "none";

//                 const saveIcon = document.createElement("span");
//                 saveIcon.innerHTML = "✅";
//                 saveIcon.style.cursor = "pointer";
//                 saveIcon.style.fontSize = "12px";
//                 saveIcon.style.userSelect = "none";
//                 saveIcon.title = "Save Position";

//                 const deleteIcon = document.createElement("span");
//                 deleteIcon.innerHTML = "❌";
//                 deleteIcon.style.cursor = "pointer";
//                 deleteIcon.style.fontSize = "12px";
//                 deleteIcon.style.userSelect = "none";
//                 deleteIcon.title = "Delete Field";

//                 deleteIcon.addEventListener("click", () => {
//                     wrapper.remove();
//                 });

//                 let isDragging = false;
//                 let offsetX = 0;
//                 let offsetY = 0;

//                 const onMouseMove = (e) => {
//                     if (!isDragging) return;
//                     const parentRect = textLayerDiv.getBoundingClientRect();
//                     const newX = e.clientX - parentRect.left - offsetX;
//                     const newY = e.clientY - parentRect.top - offsetY;
//                     wrapper.style.left = `${newX}px`;
//                     wrapper.style.top = `${newY}px`;
//                 };

//                 const onMouseUp = () => {
//                     isDragging = false;
//                     document.removeEventListener("mousemove", onMouseMove);
//                     document.removeEventListener("mouseup", onMouseUp);
//                 };

//                 field.addEventListener("mousedown", (e) => {
//                     isDragging = true;
//                     const wrapperRect = wrapper.getBoundingClientRect();
//                     offsetX = e.clientX - wrapperRect.left;
//                     offsetY = e.clientY - wrapperRect.top;
//                     document.addEventListener("mousemove", onMouseMove);
//                     document.addEventListener("mouseup", onMouseUp);
//                     e.stopPropagation();
//                 });

//                 const editIcon = document.createElement("span");
//                 editIcon.innerHTML = "✏️";
//                 editIcon.style.cursor = "pointer";
//                 editIcon.style.fontSize = "12px";
//                 editIcon.style.userSelect = "none";
//                 editIcon.title = "Edit Field";

//                 editIcon.addEventListener("click", () => {
//                     setSelectedField(field); // update currently selected field for editing
//                     setShowThumbnails(false); // show SignatureStyle panel
//                 });


//                 const onMouseDownHandler = (e) => {
//                     isDragging = true;
//                     const wrapperRect = wrapper.getBoundingClientRect();
//                     offsetX = e.clientX - wrapperRect.left;
//                     offsetY = e.clientY - wrapperRect.top;
//                     document.addEventListener("mousemove", onMouseMove);
//                     document.addEventListener("mouseup", onMouseUp);
//                     e.stopPropagation();
//                 };

//                 if (!isSignatureField) {
//                     field.addEventListener("mousedown", onMouseDownHandler);
//                 }

//                 saveIcon.addEventListener("click", () => {
//                     field.contentEditable = false;
//                     wrapper.style.cursor = "default";
//                     [saveIcon, deleteIcon, editIcon].forEach(icon => {
//                         if (icon && icon.parentNode) icon.parentNode.removeChild(icon);
//                     });
//                     field.removeEventListener("mousedown", onMouseDownHandler);
//                 });

//                 wrapper.appendChild(field);
//                 wrapper.appendChild(saveIcon);
//                 wrapper.appendChild(deleteIcon);
//                 wrapper.appendChild(editIcon);

//                 textLayerDiv.appendChild(wrapper);
//             });

//             pageContainer.appendChild(img);
//             pageContainer.appendChild(textLayerDiv);
//             container.appendChild(pageContainer);
//         }

//         setPageThumbs(thumbs);
//     }


//     // const handleSave = async () => {
//     //     const pages = containerRef.current?.children;
//     //     if (!pages?.length || !formData) return;
//     //     setIsLoading(true); // Start loading
//     //     const pdf = new jsPDF();
//     //     for (let i = 0; i < pages.length; i++) {
//     //         const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true });
//     //         const imgData = canvas.toDataURL("image/jpeg", 1);
//     //         const { width: w, height: h } = pdf.getImageProperties(imgData);
//     //         const pdfW = pdf.internal.pageSize.getWidth();
//     //         const pdfH = (h * pdfW) / w;
//     //         if (i) pdf.addPage();
//     //         pdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);
//     //     }

//     //     const pdfBlob = pdf.output("blob");
//     //     const pdfFile = new File([pdfBlob], "edited.pdf", { type: "application/pdf" });

//     //     const data = new FormData();
//     //     data.append("title", formData.title);
//     //     data.append("signRequiredBy", new Date(formData.signRequiredBy).toISOString().split("T")[0]);
//     //     data.append("termsType", formData.termsOption);
//     //     data.append("termsLink", formData.termsOfSigning || "");
//     //     data.append("pdf", pdfFile);
//     //     data.append("signers", JSON.stringify(formData.signers));
//     //     data.append("senderEmail", userEmail);

//     //     try {
//     //         const resp = await documentApi.saveDocument(data);

//     //         toast.success("✅ Document sent successfully!");
//     //     } catch (err) {
//     //         toast.error("❌ Failed to send document");
//     //     } finally {
//     //         setIsLoading(false); // ✅ Always stop loading
//     //     }
//     // };


//     const scrollToPage = (index) => {
//         setActivePageIndex(index); // set active page for border
//         const page = pageRefs.current[index];
//         if (page && editorScrollRef.current) {
//             editorScrollRef.current.scrollTo({
//                 top: page.offsetTop - 20,
//                 behavior: "smooth",
//             });
//         }
//     };


//     return (
//         <div>
//             <Navbar />
//             <div style={{ height: "100vh", display: "flex" }}>
//                 {/* LEFT COLUMN: Signature Fields */}
//                 <div style={{ width: "200px", borderRight: "1px solid #ccc", padding: "10px" }}>
//                     <SignatureFields />
//                 </div>

//                 {/* MIDDLE COLUMN: PDF Editor */}
//                 <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
//                     {/* Top bar inside middle column */}
//                     <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom" style={{ background: "#f8f9fa" }}>
//                         <h4 className="mb-0">PDF Editor</h4>
//                         <div className="d-flex align-items-center gap-2">
//                             <Button variant="success" onClick={handleSave} disabled={isLoading}>
//                                 {isLoading ? (
//                                     <>
//                                         <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
//                                         Sending...
//                                     </>
//                                 ) : (
//                                     "Send"
//                                 )}
//                             </Button>

//                             <div
//                                 style={{
//                                     cursor: "pointer",
//                                     padding: "8px",
//                                     borderRadius: "4px",
//                                     backgroundColor: "#e0e0e0",
//                                 }}
//                                 onClick={() => setShowThumbnails(prev => !prev)} // toggles showThumbnails state
//                             >
//                                 <FaBars size={18} />
//                             </div>

//                         </div>
//                     </div>

//                     {/* PDF Content Area */}
//                     <div
//                         ref={editorScrollRef}
//                         style={{
//                             flex: 1,
//                             overflowY: "auto",
//                             padding: "20px",
//                             backgroundColor: "#fff",
//                         }}
//                     >
//                         <div
//                             ref={containerRef}
//                             contentEditable={isEditable}
//                             suppressContentEditableWarning
//                             style={{
//                                 outline: "none",
//                                 pointerEvents: isEditable ? "auto" : "none",
//                                 cursor: isEditable ? "text" : "default",
//                                 minHeight: "100%",
//                             }}
//                         />
//                     </div>
//                 </div>

//                 <div
//                     style={{
//                         width: "200px",
//                         borderLeft: "1px solid #ccc",
//                         height: "100vh",
//                         padding: "10px",
//                         boxSizing: "border-box",
//                         display: "flex",
//                         flexDirection: "column",
//                     }}
//                 >
//                     {showThumbnails ? (
//                         // Show thumbnails full height, hide SignatureStyle
//                         <div
//                             style={{
//                                 height: "100%",
//                                 overflowY: "auto",
//                                 backgroundColor: "#fff",
//                                 border: "1px solid #ccc",
//                                 padding: "10px",
//                             }}
//                         >
//                             {pageThumbs.map((thumb, index) => (
//                                 <div
//                                     key={index}
//                                     style={{ marginBottom: "10px", cursor: "pointer" }}
//                                     onClick={() => {
//                                         scrollToPage(index);
//                                         setShowThumbnails(false); // auto-close thumbnails, show SignatureStyle
//                                     }}
//                                 >
//                                     <img
//                                         src={thumb}
//                                         alt={`Page ${index + 1}`}
//                                         style={{
//                                             width: "100%",
//                                             border: index === activePageIndex ? "2px solid skyblue" : "1px solid #ddd",
//                                             boxShadow: index === activePageIndex ? "0 0 5px blue" : "none",
//                                         }}
//                                     />
//                                     <div
//                                         style={{
//                                             textAlign: "right",
//                                             fontSize: "12px",
//                                             color: "#666",
//                                             marginTop: "4px",
//                                             userSelect: "none",
//                                         }}
//                                     >
//                                         {`Page ${index + 1}`}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     ) : (
//                         // Show SignatureStyle full height, hide thumbnails
//                         <div style={{ flex: 1, overflowY: "auto", padding: "20px", width: "200px", }}>
//                             <SignatureStyle
//                                 fontSettings={fontSettings}
//                                 setFontSettings={setFontSettings}
//                                 selectedField={selectedField}
//                             />
//                             <CustomSignatureField
//                                 customFields={customFields}
//                                 setCustomFields={setCustomFields}
//                             />
//                         </div>
//                     )}
//                 </div>
//                 <ToastContainer position="top-right" autoClose={3000} />

//             </div>
//         </div>
//     );
// };

// export default FileEditor;
