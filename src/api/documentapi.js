import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_DOCUMENT_API_URL || 'http://localhost:8084/api/documents',
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});


const documentApi = {
    saveDocument: async (formData) => {
        return apiClient.post('/save-document', formData);  // Axios will detect it's FormData
    },
    getDocument: async (userEmail) => {
        return apiClient.get('/getDocument', {
            params: { userEmail: userEmail }
        });
    },
    downloadPdf: (documentId) => {
        return apiClient.get('/documentspdf', {
            params: { documentId: documentId },
            responseType: 'blob',
        });
    },
    saveSignatureDocument: async (formData) => {
        return apiClient.post('/save-sign-document', formData);
    },

    getSignDocument: async (userEmail) => {
        return apiClient.get('/getSignDocument', {
            params: { userEmail: userEmail }
        });
    },

    downloadSignedPdf: (id) => {
        return apiClient.get(`/downloadSignedPdf`, {
            params: { id },
            responseType: 'blob',
        });
    },
};

export default documentApi;