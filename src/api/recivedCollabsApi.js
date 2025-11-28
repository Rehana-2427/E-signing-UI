import axios from "axios";

const COLLAB_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/collaboration-service/api/recievedCollabs`;

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
const recivedCollabsApi = {
  getRecievedCollabs: (email) => {
    return apiClient.get(`/getCollabDetails`, {
      params: { email },
    });
  },
};
export default recivedCollabsApi;
