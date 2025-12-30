import axios from "axios";

const COLLAB_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/collaboration-service/api/collaboration`;

const apiClient = axios.create({
  baseURL: COLLAB_SERVICE_BASE,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
const collaborationApi = {
  saveCollaborationInfo: (payloadData) => {
    return apiClient.post("/saveCollabInfo", payloadData);
  },

  getCollabInfoByCreatedBy: (createdBy) => {
    return apiClient.get("/by-created-by/" + createdBy);
  },

  getCollabInfoByEmail: (email, page, pageSize, sortedColumn, sortOrder) => {
    return apiClient.get("/by-email/" + email, {
      params: { page, pageSize, sortedColumn, sortOrder },
    });
  },

  getContributorsDetails: (collaboration_id) => {
    return apiClient.get(`/getCollabDetailsById`, {
      params: { collaboration_id },
    });
  },

  getTotalCollabCharge: (createdBy) => {
    return apiClient.get("/total-collab-charge/" + createdBy);
  },

  getCollaBriefById: (collabId) => {
    return apiClient.get(`/getCollaBriefById`, {
      params: { collabId },
    });
  },

  updateRequestCredits: (collabId, payload) => {
    return apiClient.put(
      `/updateCollaboration?collabId=${collabId}`, // Pass collabId as a query parameter
      payload // Pass the update data in the body
    );
  },
  getCollabNotApproved: (page,pageSize,sortedColumn,sortOrder) => {
    return apiClient.get(`/getCollabNotApproved`, {
      params: { page, pageSize, sortedColumn, sortOrder },
    });
  },

  getApprovedCollabs: (page,pageSize,sortedColumn,sortOrder) => {
    return apiClient.get(`/getApprovedCollabs`, {
      params: { page, pageSize, sortedColumn, sortOrder },
    });
  },
  updateApproval: (collabId) => {
    return apiClient.put(`/requestApproveByAdmin?collabId=${collabId}`);
  },
  getCollabsNotSeen: () => {
    return apiClient.get(`/collabsNotSeen`);
  },

  markAsSeen: (id) => apiClient.put(`/mark-seen/${id}`),

  getCreatedByEmail: (collaboration_id) => {
    return apiClient.get(`/getCreatedByEmail`, {
      params: { collaboration_id },
    });
  },

  getCollabReport: (collabId) => {
    return apiClient.get(`/report/${collabId}`);
  },

  getCompanies: () => {
    return apiClient.get(`/company-names`);
  },
  getCollabsByCompanyUserEmail: (
    email,
    page,
    pageSize,
    sortedColumn,
    sortOrder
  ) => {
    return apiClient.get("/by-email-company/" + email, {
      params: { page, pageSize, sortedColumn, sortOrder },
    });
  },
  getCollabsByPersonUserEmail: (
    email,
    page,
    pageSize,
    sortedColumn,
    sortOrder
  ) => {
    return apiClient.get("/by-email-person/" + email, {
      params: { page, pageSize, sortedColumn, sortOrder },
    });
  },

  getContributorsContact: (createdByEmail,page,pageSize,sortedColumn,sortOrder) => {
    return apiClient.get(`/contributorsContact`, {
      params: { createdByEmail, page, pageSize, sortedColumn, sortOrder },
    });
  },

  addContributors: (collabId, payload) => {
    return apiClient.put(`/${collabId}/add-contributors`, payload);
  },

  deleteContributor: (collabId, email) => {
    return apiClient.delete(`/deleteContributor`, {
      params: { collabId, email },
    });
  },
};
export default collaborationApi;
