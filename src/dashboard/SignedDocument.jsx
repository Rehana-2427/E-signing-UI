import React, { useEffect, useState } from 'react';
import documentApi from '../api/documentapi';
import { saveAs } from 'file-saver';
import Navbar from './layout/Navbar';
import Breadcrumb from '../components/sessions/Breadcrumb';

const SignedDocument = () => {
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState('');

    const storedUser = localStorage.getItem('user');
    let userEmail = '';
    try {
        userEmail = JSON.parse(storedUser)?.userEmail || '';
    } catch {
        userEmail = '';
    }

    useEffect(() => {
        if (userEmail) fetchSignDocuments();
    }, [userEmail]);

    const fetchSignDocuments = async () => {
        try {
            const response = await documentApi.getSignDocument(userEmail);
            setDocuments(response.data || []);
        } catch {
            setError('Could not fetch documents. Please try again.');
        }
    };

    const handleDownload = async (id) => {
        try {
            const response = await documentApi.downloadSignedPdf(id);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            saveAs(blob, `signed_document_${id}.pdf`);
        } catch (err) {
            console.error('Error downloading file:', err);
            alert('Download failed.');
        }
    };

    return (
        <div>
            <Navbar />
            <section>
                <Breadcrumb routeSegments={[{ path: '/forms' }]} />
                <div className="container mt-4">
                    <h2>Signed Documents</h2>

                    {error && <div className="alert alert-danger">{error}</div>}

                    {documents.length > 0 ? (
                        <table className="table table-bordered table-hover mt-3">
                            <thead className="thead-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Sender (Signer)</th>
                                    <th>Receiver</th>
                                    <th>Download</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr key={doc.id}>
                                        <td>{doc.id}</td>
                                        <td>{doc.signerEmail}</td>
                                        <td>{doc.receiventEmail}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => handleDownload(doc.id)}
                                            >
                                                Download PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="alert alert-info mt-3">
                            No signed documents found.
                        </div>
                    )}
                </div>
            </section>
        </div>

    );
};

export default SignedDocument;
