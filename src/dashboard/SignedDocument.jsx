// import { saveAs } from 'file-saver';
// import { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import documentApi from '../api/documentapi';
// import Breadcrumb from '../components/sessions/Breadcrumb';
// import Navbar from './layout/Navbar';

// const SignedDocument = () => {
//     const { id: documentId } = useParams();
//     const [documents, setDocuments] = useState([]);
//     const [error, setError] = useState('');

//     const storedUser = localStorage.getItem('user');
//     let userEmail = '';
//     try {
//         userEmail = JSON.parse(storedUser)?.userEmail || '';
//     } catch {
//         userEmail = '';
//     }

//     useEffect(() => {
//         if (userEmail) fetchSignDocuments();
//     }, [userEmail]);

//     const fetchSignDocuments = async () => {
//         try {
//             const response = await documentApi.getSignDocument(userEmail);
//             setDocuments(response.data || []);
//         } catch {
//             setError('Could not fetch documents. Please try again.');
//         }
//     };

//     const handleDownload = async (id) => {
//         try {
//             const response = await documentApi.downloadSignedPdf(id);
//             const blob = new Blob([response.data], { type: 'application/pdf' });
//             saveAs(blob, `signed_document_${id}.pdf`);
//         } catch (err) {
//             console.error('Error downloading file:', err);
//             alert('Download failed.');
//         }
//     };

//     return (
//         <div>
//             <Navbar />
//             <section>
//                 <Breadcrumb routeSegments={[{ path: '/forms' }]} />
//                 <div className="container mt-4">
//                     <h2>Signed Documents</h2>

//                     {error && <div className="alert alert-danger">{error}</div>}

//                     {documents.length > 0 ? (
//                         <table className="table table-bordered table-hover mt-3">
//                             <thead className="thead-dark">
//                                 <tr>
//                                     <th>ID</th>
//                                     <th>Sender (Signer)</th>
//                                     <th>Receiver</th>
//                                     <th>Download</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {documents.map((doc) => (
//                                     <tr key={doc.id}>
//                                         <td>{doc.documentId}</td>
//                                         <td>{doc.signerEmail}</td>
//                                         <td>{doc.receiventEmail}</td>
//                                         <td>
//                                             <button
//                                                 className="btn btn-sm btn-success"
//                                                 onClick={() => handleDownload(doc.id)}
//                                             >
//                                                 Download PDF
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     ) : (
//                         <div className="alert alert-info mt-3">
//                             No signed documents found.
//                         </div>
//                     )}
//                 </div>
//             </section>
//         </div>

//     );
// };

// export default SignedDocument;


// import { saveAs } from 'file-saver';
// import { useEffect, useState } from 'react';
// import { useLocation, useParams } from 'react-router-dom';
// import documentApi from '../api/documentapi';
// import Navbar from '../components/layout/Navbar';
// import Breadcrumb from '../components/sessions/Breadcrumb';

// const SignedDocument = () => {
//     const { id: documentId } = useParams();
//     const location = useLocation();

//     const queryParams = new URLSearchParams(location.search);
//     const documentTitle = queryParams.get('title') || 'Untitled Document';
//     const [signers, setSigners] = useState([]);
//     const [error, setError] = useState('');

//     console.log(documentId)
//     useEffect(() => {
//         if (documentId) fetchSignedSigners();
//     }, [documentId]);

//     const fetchSignedSigners = async () => {
//         try {
//             const response = await fetch(`http://localhost:8084/api/signer/signed-list?documentId=${documentId}`);
//             console.log(response.data)
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             const data = await response.json();
//             setSigners(data || []);
//         } catch (error) {
//             console.error('Error fetching signed signers:', error);
//             setError('Could not fetch signed signers. Please try again.');
//         }
//     };

//     const handleDownload = async (signerId) => {
//         try {
//             const response = await fetch(`http://localhost:8084/api/pdf/${signerId}`);
//             if (!response.ok) throw new Error('Network response was not ok');
//             const blob = await response.blob();
//             saveAs(blob, `signed_document_${signerId}.pdf`);
//         } catch (err) {
//             console.error('Download error:', err);
//             alert('Download failed.');
//         }
//     };


//     const handleViewPdf = async (signerId) => {
//         try {
//             const response = await documentApi.downloadSignedPdf(signerId);
//             const blob = new Blob([response.data], { type: 'application/pdf' });
//             const url = window.URL.createObjectURL(blob);
//             window.open(url, '_blank');
//         } catch (err) {
//             console.error('View error:', err);
//             alert('Could not open PDF.');
//         }
//     };

//     return (
//         <div>
//             <Navbar />
//             <section>
//                 <Breadcrumb routeSegments={[{ path: '/signed-documents' }]} />
//                 <div className="container mt-4">
//                     <h2>Signed Document Details</h2>

//                     {error && <div className="alert alert-danger">{error}</div>}

//                     {signers.length > 0 ? (
//                         <table className="table table-bordered table-hover mt-3">
//                             <thead className="thead-dark">
//                                 <tr>
//                                     <th>Id</th>
//                                     <th>Document Name</th>
//                                     <th>Signer Email</th>
//                                     <th>Download</th>
//                                     <th>View</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {signers.map((signer) => (
//                                     <tr key={signer.id}>
//                                         <td>{documentId}</td>
//                                         <td>{documentTitle}</td>
//                                         <td>{signer.email}</td>
//                                         <td>
//                                             <button
//                                                 className="btn btn-sm btn-success"
//                                                 onClick={() => handleDownload(signer.id)}
//                                             >
//                                                 Download PDF
//                                             </button>
//                                         </td>
//                                         <td>
//                                             <button
//                                                 className="btn btn-sm btn-primary"
//                                                 onClick={() => handleViewPdf(signer.id)}
//                                             >
//                                                 View PDF
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     ) : (
//                         <div className="alert alert-info mt-3">
//                             No signed records found for this document.
//                         </div>
//                     )}
//                 </div>
//             </section>
//         </div>
//     );
// };

// export default SignedDocument;
