import axios from 'axios';

const DOCUMENT_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/documentservice/api/documents`;

const apiClient = axios.create({
    baseURL: DOCUMENT_SERVICE_BASE,
    withCredentials: true,
});

const documentApi = {
    saveDocument: (formData) => {
        return apiClient.post('/save-document', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            responseType: 'blob', 
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

     getDrafts: (senderEmail) => {
        return apiClient.get('/drafts', {
            params: { senderEmail },
        });
    },
    // signerApi.js
    getDocumentFile: (documentId, email) => {
        return apiClient.get(`/view-document/${documentId}/${email}`, {
            responseType: 'blob',
        });
    },

    sendReminder: (payload) => apiClient.post("/send-reminder", payload),

    getTotalCredits : (senderEmail) => {
        return apiClient.get('/total-credits',{
            params:{senderEmail}
        })
    },

};

export default documentApi;
