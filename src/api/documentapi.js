import axios from "axios";

const DOCUMENT_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/documentservice/api/documents`;

const apiClient = axios.create({
  baseURL: DOCUMENT_SERVICE_BASE,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const documentApi = {
  saveDocument: (formData) => {
    return apiClient.post("/save-document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob",
    });
  },
  updateDocument: (documentId, formData) => {
    return apiClient.put(`/update-document/${documentId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getMyConsents: (senderEmail) => {
    return apiClient.get("/my-consents", {
      params: { senderEmail },
    });
  },

  getDrafts: (senderEmail) => {
    return apiClient.get("/drafts", {
      params: { senderEmail },
    });
  },
  // signerApi.js
  getDocumentFile: (documentId, email) => {
    return apiClient.get(`/view-document/${documentId}/${email}`, {
      responseType: "blob",
    });
  },

  sendReminder: (payload) => apiClient.post("/send-reminder", payload),

  getTotalCredits: (senderEmail) => {
    return apiClient.get("/total-credits", {
      params: { senderEmail },
    });
  },

  getSignerAudit: (documentId) => {
    return apiClient.get("/signers", {
      params: { documentId },
    });
  },

  getSearchSentConsensts: (senderEmail, query = "") => {
    return apiClient.get("/searchSentConsensts", {
      params: { senderEmail, query },
    });
  },
  getSearchDraftsConsensts: (senderEmail, query = "") => {
    return apiClient.get("/searchDraftConsensts", {
      params: { senderEmail, query },
    });
  },
  getDocumentFileReviewer: (documentId, email) => {
    return apiClient.get(`/view-document-reviewer/${documentId}/${email}`, {
      responseType: "blob",
    });
  },

  getParticipants: (documentId) => {
    return apiClient.get(`/participants/${documentId}`, {
      responseType: "json",
    });
  },
  sendToSigners(documentId) {
    return apiClient.put(`/send-to-signers?documentId=${documentId}`);
  },

  getUnseenRequests: (senderEmail) =>
    apiClient.get(`/unseen-requests?senderEmail=${senderEmail}`),
  markAsSeen: (documentId) => apiClient.put(`/markAsSeen/${documentId}`),
};

export default documentApi;
