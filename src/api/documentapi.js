import axios from 'axios';
import { BASE_URL } from './apiConfig';

const DOCUMENT_SERVICE_BASE = `${BASE_URL}/documentservice/api/documents`;

const apiClient = axios.create({
    baseURL: DOCUMENT_SERVICE_BASE,
    // Note: for multipart/form-data, do NOT set Content-Type manually; let axios set it
    withCredentials: true,
});

const documentApi = {
    saveDocument: (formData) => {
        return apiClient.post('/save-document', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    updateDocument: (documentId, formData) => {
        return apiClient.put(`/update-document/${documentId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    getMyConsents: (senderEmail) => {
        return apiClient.get('/my-consents', {
            params: { senderEmail },
        });
    },
    getDocumentFile: (documentId) => {
        return apiClient.get(`/view-document/${documentId}`, {
            responseType: 'blob',
        });
    },


};

export default documentApi;
