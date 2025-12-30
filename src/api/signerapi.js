import axios from "axios";

const SIGNER_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/documentservice/api/signer`;

const apiClient = axios.create({
  baseURL: SIGNER_SERVICE_BASE,
  // Note: for multipart/form-data, do NOT set Content-Type manually; let axios set it
  withCredentials: true,
});

const signerApi = {
  updateSignerStatus: (data) => apiClient.put("/update-status", data),

  getDocumentsByEmail: (email,page,pageSize,sortedColumn,sortOrder) =>
    apiClient.get("/documents-by-email", { params: { email,page,pageSize,sortedColumn,sortOrder } }),

  getCompletedDocumentsByEmail: (email,page,pageSize,sortedColumn,sortOrder) =>
    apiClient.get("/completedDocs", { params: { email,page,pageSize,sortedColumn,sortOrder } }),

  getSignersContact: (senderEmail,page,pageSize,sortedColumn,sortOrder) =>
    apiClient.get("/signersContact", { params: { senderEmail,page,pageSize,sortedColumn,sortOrder } }),

  getSignersByDocumentId: (documentId) =>
    apiClient.get(`/documents/${documentId}/signers`),

  getSearchPendingDocumentsByEmail: (email, query = "", page, pageSize, sortedColumn, sortOrder) => {
    return apiClient.get("/searchPendingDocs", {
      params: { email, query, page, pageSize, sortedColumn, sortOrder },
    });
  },

  getSearchCompletedDocumentsByEmail: (email, query = "", page, pageSize, sortedColumn, sortOrder) => {
    return apiClient.get("/searchcompletedDocs", {
      params: { email, query, page, pageSize, sortedColumn, sortOrder },
    });
  },
  getDetailsOfSignersById: (documentId) =>
    apiClient.get("/getDetailsOfSignersById", { params: { documentId } }),

  AddSigner: (documentId, request) => {
    return apiClient.put(`/${documentId}/add-signer`, request);
  },
};
export default signerApi;
