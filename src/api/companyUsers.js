import axios from "axios";

const COMPANY_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/companyService/api/companyUsers`;

const apiClient = axios.create({
  baseURL: COMPANY_SERVICE_BASE,
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
const companyUserApi = {
  inviteCompanyUser: (companyData) => {
    return apiClient.post("/inviteUser", companyData);
  },

  acceptInvitation: (acceptInvitationData) => {
    return apiClient.put("/acceptInvitation", acceptInvitationData);
  },
  getListOfSentInvitations: (invitedByEmail) => {
    return apiClient.get("/getListofSentInvitations", {
      params: { invitedByEmail },
    });
  },
  getListofRecievedInvitations: (userEmail) => {
    return apiClient.get("/getListofRecievedInvitations", {
      params: { userEmail },
    });
  },
  getAssignedCompanies: (userEmail) =>
    apiClient.get(`/getAssignedCompanies`, {
      params: { userEmail },
    }),
};
export default companyUserApi;
