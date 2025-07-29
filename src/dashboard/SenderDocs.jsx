// import { useEffect, useState } from "react";
// import { Button, Card } from "react-bootstrap";
// import documentApi from "../api/documentapi";
// import Navbar from "../components/layout/Navbar";

// const SenderDocs = () => {
//     const user = JSON.parse(localStorage.getItem('user'));
//     const userEmail = user?.userEmail;
//     const [documents, setDocuments] = useState([]);

//     useEffect(() => {
//         if (userEmail) {
//             documentApi.getSenderDocuments(userEmail)
//                 .then((res) => {
//                     setDocuments(res.data);
//                 })
//                 .catch((err) => {
//                     console.error("Failed to fetch documents:", err);
//                 });
//         }
//     }, [userEmail]);
//     console.log(userEmail)
//     const handleSendReminder = (documentId) => {
//         console.log("Sending reminder for document ID:", documentId);
//         // You can integrate API call here later
//     };
//     return (
//         <div>
//             <Navbar />
//             <br />
//             <Card>
//                 <table className="table table-striped mt-3">
//                     <thead className="thead-dark">
//                         <tr>
//                             <th>Document Name</th>
//                             <th>Sent On</th>
//                             <th>Last Signed On</th>
//                             <th>Completion</th>
//                             <th>Actions</th>
//                             <th>Signed_users</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {documents.length === 0 ? (
//                             <tr>
//                                 <td colSpan="5" className="text-center">No documents found</td>
//                             </tr>
//                         ) : (
//                             documents.map((doc) => (
//                                 <tr key={doc.documentId}>
//                                     <td>{doc.title}</td>
//                                     <td>{doc.sentOn || 'N/A'}</td>
//                                     <td>{doc.latestSignedDate || 'N/A'}</td>
//                                     <td>{`${doc.signedCount} / ${doc.totalSigners}`}</td>
//                                     <td>
//                                         <Button
//                                             size="sm"
//                                             variant="warning"
//                                             onClick={() => handleSendReminder(doc.documentId)}
//                                         >
//                                             Send Reminder
//                                         </Button>
//                                     </td>
//                                     <td>
//                                         <Button
//                                             size="sm"
//                                             variant="info"
//                                             onClick={() =>
//                                                 window.open(
//                                                     `/dashboard/signedDocument/${doc.documentId}?title=${encodeURIComponent(doc.title)}`,
//                                                     '_blank'
//                                                 )
//                                             }
//                                         >
//                                             View
//                                         </Button>


//                                     </td>
//                                 </tr>
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </Card>


//         </div>
//     )
// }

// export default SenderDocs
