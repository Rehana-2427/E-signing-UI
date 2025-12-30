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
  getListOfSentInvitations: (invitedByEmail,page,pageSize,sortedColumn,sortOrder) => {
    return apiClient.get("/getListofSentInvitations", {
      params: { invitedByEmail,page,pageSize,sortedColumn,sortOrder },
    });
  },
  getListofRecievedInvitations: (userEmail,page,pageSize,sortedColumn,sortOrder) => {
    return apiClient.get("/getListofRecievedInvitations", {
      params: { userEmail,page,pageSize,sortedColumn,sortOrder },
    });
  },
  getAssignedCompanies: (userEmail,page,pageSize,sortedColumn,sortOrder) =>
    apiClient.get(`/getAssignedCompanies`, {
      params: { userEmail,page,pageSize,sortedColumn,sortOrder },
    }),

  getUsersByCompanyName: (companyName) =>
    apiClient.get("/getUserByCompanyName", {
      params: { companyName },
    }),
};
export default companyUserApi;
