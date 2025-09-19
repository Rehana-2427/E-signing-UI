import axios from 'axios';

const SIGNER_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/documentservice/api/signer`;

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

    getCompletedDocumentsByEmail: (email) =>
        apiClient.get("/completedDocs", { params: { email } }),

    getSignersContact: (senderEmail) =>
        apiClient.get("/signersContact", { params: { senderEmail } }),

    getSignersByDocumentId: (documentId) =>
        apiClient.get(`/documents/${documentId}/signers`),

    getSearchPendingDocumentsByEmail : (email, query = "") => {
        return apiClient.get('/searchPendingDocs',{
            params:{email, query}
        })
    },

     getSearchCompletedDocumentsByEmail : (email, query = "") => {
        return apiClient.get('/searchcompletedDocs',{
            params:{email, query}
        })
    },

};

export default signerApi;
