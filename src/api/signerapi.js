import axios from 'axios';
import { BASE_URL } from './apiConfig';

const SIGNER_SERVICE_BASE = `${BASE_URL}/documentservice/api/signer`;

const apiClient = axios.create({
    baseURL: SIGNER_SERVICE_BASE,
    // Note: for multipart/form-data, do NOT set Content-Type manually; let axios set it
    withCredentials: true,
});

const signerApi = {

    updateSignerStatus: (data) =>
        apiClient.put("/update-status", data),

    getDocumentsByEmail: (email) =>
        apiClient.get("/documents-by-email", { params: { email } }),

    getSignersContact: (senderEmail) =>
        apiClient.get("/signersContact", { params: { senderEmail } }),

    getSignersByDocumentId: (documentId) =>
        apiClient.get(`/documents/${documentId}/signers`),

};

export default signerApi;
