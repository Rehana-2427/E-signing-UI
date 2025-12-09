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

  getCollabInfoByEmail: (email) => {
    return apiClient.get("/by-email/" + email);
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
  getCollabNotApproved: () => {
    return apiClient.get(`/getCollabNotApproved`);
  },

  getApprovedCollabs: () => {
    return apiClient.get(`/getApprovedCollabs`);
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
  getCollabsByCompanyUserEmail: (email) => {
    return apiClient.get("/by-email-company/" + email);
  },
  getCollabsByPersonUserEmail: (email) => {
    return apiClient.get("/by-email-person/" + email);
  },

  getContributorsContact: (createdByEmail) => {
    return apiClient.get(`/contributorsContact`, {
      params: { createdByEmail },
    });
  },

  addContributors: (collabId, payload) => {
    return apiClient.put(
      `/${collabId}/add-contributors`,
      payload
    );
  },
};
export default collaborationApi;
