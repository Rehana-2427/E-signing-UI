import axios from "axios";

const COLLAB_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/collaboration-service/api/collabChecklist`;

const apiClient = axios.create({
  baseURL: COLLAB_SERVICE_BASE,
  withCredentials: true,
});
// Add Authorization token to each request
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
const collabCheckListApi = {
  addChecklist: (formData) => {
    return apiClient.post("/saveChecklist", formData);
  },

  getChecklistsByAddedBy: (addedBy) => {
    return apiClient.get(`/getChecklistAddedBy`, {
      params: { addedBy },
    });
  },
  getChecklistByCollabId: (collabId) => {
    return apiClient.get(`/getChecklistByCollabId`, {
      params: { collabId },
    });
  },
};

export default collabCheckListApi;
