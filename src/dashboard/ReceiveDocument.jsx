// import 'bootstrap/dist/css/bootstrap.min.css';
// import { saveAs } from 'file-saver';
// import { PDFDocument } from 'pdf-lib';
// import React, { useEffect, useRef, useState } from 'react';
// import { Button } from 'react-bootstrap';
// import { pdfjs } from 'react-pdf';
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import documentApi from '../api/documentapi';
// import Navbar from '../components/layout/Navbar';
// import Breadcrumb from '../components/sessions/Breadcrumb';

// pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

// const ReceiveDocument = () => {
//     const [documents, setDocuments] = useState([]);
//     const [selectedPdf, setSelectedPdf] = useState(null);
//     const [selectedDocTitle, setSelectedDocTitle] = useState('');
//     const [pdfBuffer, setPdfBuffer] = useState(null);
//     const [error, setError] = useState('');
//     const [numPages, setNumPages] = useState(null);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [renderedSize, setRenderedSize] = useState({ width: 0, height: 0 });
//     const [selectedDoc, setSelectedDoc] = useState(null);
//     const [signatures, setSignatures] = useState([]);

//     const [signatureMode, setSignatureMode] = useState('draw');
//     const [typedSignature, setTypedSignature] = useState('');
//     const [showSignatureBox, setShowSignatureBox] = useState(false);
//     const [fontFamily, setFontFamily] = useState('Arial');
//     const [fontColor, setFontColor] = useState('#000000');
//     const [fontSize, setFontSize] = useState(20);

//     const sigPadRef = useRef(null);
//     const pageRefs = useRef([]);

//     const storedUser = localStorage.getItem('user');
//     let userEmail = '';
//     try {
//         userEmail = JSON.parse(storedUser)?.userEmail || '';
//     } catch {
//         userEmail = '';
//     }

//     useEffect(() => {
//         if (userEmail) fetchDocuments();
//     }, [userEmail]);

//     const fetchDocuments = async () => {
//         try {
//             const response = await documentApi.getDocument(userEmail);
//             setDocuments(response.data || []);
//         } catch {
//             setError('Could not fetch documents. Please try again.');
//         }
//     };

//     const handlePreview = async (documentId, title) => {
//         try {
//             const doc = documents.find(d => d.id === documentId);
//             setSelectedDoc(doc);
//             const response = await documentApi.downloadPdf(documentId);
//             setSelectedPdf(URL.createObjectURL(response.data));
//             setPdfBuffer(await response.data.arrayBuffer());
//             setSelectedDocTitle(title);
//             setCurrentPage(1);
//             setSignatures([]);
//         } catch {
//             alert('Failed to load PDF');
//         }
//     };

//     const onDocumentLoadSuccess = ({ numPages }) => {
//         setNumPages(numPages);
//         pageRefs.current = Array(numPages).fill().map(() => React.createRef());
//     };

//     const handlePageClick = async (index, e) => {
//         const container = pageRefs.current[index].current;
//         const bounds = container.getBoundingClientRect();
//         const x = e.clientX - bounds.left;
//         const y = e.clientY - bounds.top;

//         let imageDataUrl;

//         if (signatureMode === 'draw') {
//             if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
//                 alert('Please draw your signature.');
//                 return;
//             }
//             imageDataUrl = sigPadRef.current.toDataURL('image/png');
//         } else {
//             const canvas = document.createElement('canvas');
//             canvas.width = 300;
//             canvas.height = 80;
//             const ctx = canvas.getContext('2d');
//             ctx.clearRect(0, 0, canvas.width, canvas.height);
//             ctx.font = `bold ${fontSize}px ${fontFamily}`;
//             ctx.fillStyle = fontColor;
//             ctx.textAlign = 'center';
//             ctx.textBaseline = 'middle';

//             let text = typedSignature;
//             const measuredWidth = ctx.measureText(text).width;
//             if (measuredWidth > canvas.width - 20) {
//                 while (ctx.measureText(text + '...').width > canvas.width - 20 && text.length > 0) {
//                     text = text.slice(0, -1);
//                 }
//                 text += '...';
//             }

//             ctx.fillText(text, canvas.width / 2, canvas.height / 2);
//             imageDataUrl = canvas.toDataURL('image/png');
//         }

//         const newSignature = {
//             id: Date.now(),
//             image: imageDataUrl,
//             x: x - 75,
//             y: y - 25,
//             page: index + 1
//         };

//         setSignatures(prev => [...prev, newSignature]);
//         setShowSignatureBox(false);
//     };

//     const handleDragStop = (id, data) => {
//         setSignatures(prev => prev.map(sig => sig.id === id ? { ...sig, x: data.x, y: data.y } : sig));
//     };

//     const saveSignature = async () => {
//         if (!pdfBuffer || signatures.length === 0) {
//             alert('No PDF loaded or no signature placed.');
//             return;
//         }

//         const pdfDoc = await PDFDocument.load(pdfBuffer);
//         const pages = pdfDoc.getPages();

//         for (const sig of signatures) {
//             const sigBytes = await fetch(sig.image).then(res => res.arrayBuffer());
//             const pngImage = await pdfDoc.embedPng(sigBytes);
//             const page = pages[sig.page - 1];
//             const { width: pdfWidth, height: pdfHeight } = page.getSize();
//             const { width: renderedWidth, height: renderedHeight } = renderedSize;
//             const scaleX = pdfWidth / renderedWidth;
//             const scaleY = pdfHeight / renderedHeight;
//             const pdfX = sig.x * scaleX;
//             const pdfY = pdfHeight - ((sig.y + 50) * scaleY);

//             page.drawImage(pngImage, {
//                 x: pdfX,
//                 y: pdfY,
//                 width: 150,
//                 height: 50,
//             });
//         }

//         const modifiedPdfBytes = await pdfDoc.save();
//         const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
//         saveAs(blob, `${selectedDocTitle}_signed.pdf`);

//         const formData = new FormData();
//         formData.append("file", blob, `${selectedDocTitle}_signed.pdf`);
//         formData.append("senderEmail", selectedDoc?.senderEmail || '');
//         formData.append("userEmail", userEmail);

//         try {
//             const response = await documentApi.saveSignatureDocument(formData);
//             if (response.ok || response.status === 200) {
//                 alert("PDF uploaded to server successfully!");
//             } else {
//                 alert("Failed to upload PDF to server.");
//             }
//         } catch (error) {
//             console.error("Upload error:", error);
//             alert("Error uploading PDF.");
//         }
//     };


//     const handleOpenInNewTab = async (documentId, title, senderEmail) => {
//         console.log("Opening document:", documentId, senderEmail);

//         try {
//             // Fetch the PDF binary
//             const response = await documentApi.downloadPdf(documentId);
//             const blob = response.data;
//             const pdfArrayBuffer = await blob.arrayBuffer();

//             // Store in localStorage (used later by /dashboard/pdf-viewer tab)
//             localStorage.setItem("documentId", documentId);
//             localStorage.setItem("senderEmail", senderEmail);

//             // Open viewer tab
//             const newTab = window.open('/dashboard/pdf-viewer', '_blank');

//             // Post PDF data to new tab once it's ready
//             const interval = setInterval(() => {
//                 if (newTab && newTab.postMessage) {
//                     newTab.postMessage(
//                         {
//                             pdfData: pdfArrayBuffer,
//                             title,
//                             type: 'PDF_PREVIEW',
//                         },
//                         '*'
//                     );
//                     clearInterval(interval);
//                 }
//             }, 300);
//         } catch (error) {
//             console.error("Error loading PDF:", error);
//             alert('Failed to open PDF in new tab.');
//         }
//     };


//     return (
//         <div>
//             <Navbar />
//             <section>
//                 <Breadcrumb routeSegments={[{ path: '/forms' }]} />
//                 <div className="container mt-4">
//                     <h2>Received Documents</h2>
//                     {error && <div className="alert alert-danger">{error}</div>}
//                     {documents.length > 0 ? (
//                         <>
//                             <table className="table table-striped mt-3">
//                                 <thead className="thead-dark">
//                                     <tr>
//                                         <th>Title</th>
//                                         <th>Sender</th>
//                                         <th>Preview / Sign</th>
//                                         <th>Action</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {documents.map((doc) => (
//                                         <tr key={doc.id}>
//                                             <td>{doc.title}</td>
//                                             <td>{doc.senderEmail}</td>
//                                             <td>
//                                                 <Button onClick={() => handleOpenInNewTab(doc.id, doc.title, doc.senderEmail)}>
//                                                     Open
//                                                 </Button>
//                                             </td>
//                                             <td>{doc.signed ? 'Signed' : 'Pending'}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>

//                             {/* <div className="mt-4 mb-3">
//                                 <h5>Signature Mode</h5>
//                                 <div className="form-check form-check-inline">
//                                     <input
//                                         className="form-check-input"
//                                         type="radio"
//                                         value="draw"
//                                         checked={signatureMode === 'draw'}
//                                         onChange={() => setSignatureMode('draw')}
//                                     />
//                                     <label className="form-check-label">Draw</label>
//                                 </div>
//                                 <div className="form-check form-check-inline">
//                                     <input
//                                         className="form-check-input"
//                                         type="radio"
//                                         value="type"
//                                         checked={signatureMode === 'type'}
//                                         onChange={() => setSignatureMode('type')}
//                                     />
//                                     <label className="form-check-label">Type</label>
//                                 </div>

//                                 {signatureMode === 'draw' ? (
//                                     <SignatureCanvas
//                                         ref={sigPadRef}
//                                         penColor="black"
//                                         canvasProps={{
//                                             width: 350,
//                                             height: 150,
//                                             className: 'signature-canvas border mt-2',
//                                         }}
//                                     />
//                                 ) : (
//                                     <>
//                                         <input
//                                             type="text"
//                                             className="form-control mt-2"
//                                             placeholder="Type your signature"
//                                             value={typedSignature}
//                                             onChange={(e) => setTypedSignature(e.target.value)}
//                                         />
//                                         <div className="mt-2 d-flex align-items-center gap-2">
//                                             <select className="form-select w-auto" value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
//                                                 <option>Arial</option>
//                                                 <option>Times New Roman</option>
//                                                 <option>Courier New</option>
//                                                 <option>Verdana</option>
//                                             </select>
//                                             <input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)} />
//                                             <input
//                                                 type="number"
//                                                 className="form-control w-auto"
//                                                 min={10}
//                                                 max={50}
//                                                 value={fontSize}
//                                                 onChange={e => setFontSize(parseInt(e.target.value) || 20)}
//                                             />
//                                         </div>
//                                     </>
//                                 )}

//                                 <button
//                                     className="btn btn-primary mt-3"
//                                     onClick={() => setShowSignatureBox(true)}
//                                 >
//                                     Click PDF to Place Signature
//                                 </button>
//                                 <button
//                                     className="btn btn-success mt-3 ms-3"
//                                     onClick={saveSignature}
//                                 >
//                                     Save & Upload
//                                 </button>
//                             </div> */}

//                             {/* {selectedPdf && (
//                                 <div>
//                                     <h4>Previewing: {selectedDocTitle}</h4>
//                                     <Document file={selectedPdf} onLoadSuccess={onDocumentLoadSuccess}>
//                                         {Array.from({ length: numPages }, (_, index) => (
//                                             <div
//                                                 key={index}
//                                                 ref={pageRefs.current[index]}
//                                                 className="position-relative border mb-3"
//                                                 style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}
//                                                 onClick={(e) => showSignatureBox && handlePageClick(index, e)}
//                                             >
//                                                 <Page
//                                                     pageNumber={index + 1}
//                                                     width={600}
//                                                     renderAnnotationLayer={false}
//                                                     renderTextLayer={false}
//                                                     onRenderSuccess={({ width, height }) => {
//                                                         if (index + 1 === currentPage) {
//                                                             setRenderedSize({ width, height });
//                                                         }
//                                                     }}
//                                                 />
//                                                 {signatures
//                                                     .filter(sig => sig.page === index + 1)
//                                                     .map(sig => (
//                                                         <Draggable
//                                                             key={sig.id}
//                                                             bounds="parent"
//                                                             position={{ x: sig.x, y: sig.y }}
//                                                             onStop={(e, data) => handleDragStop(sig.id, data)}
//                                                         >
//                                                             <img
//                                                                 src={sig.image}
//                                                                 alt="Signature"
//                                                                 style={{
//                                                                     width: 150,
//                                                                     height: 50,
//                                                                     cursor: 'move',
//                                                                     position: 'absolute',
//                                                                     zIndex: 10,
//                                                                 }}
//                                                             />
//                                                         </Draggable>
//                                                     ))}
//                                             </div>
//                                         ))}
//                                     </Document>
//                                 </div>
//                             )} */}
//                         </>
//                     ) : (
//                         <div className="alert alert-info mt-4">
//                             You don't have any received documents to sign.
//                         </div>
//                     )}
//                 </div>
//             </section>
//         </div>
//     );
// };

// export default ReceiveDocument;