import axios from "axios";

const COMPANY_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/companyService/api/companies`;

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
const companyApi = {
  createCompany: (companyData) => {
    return apiClient.post("/addCompany", companyData);
  },
  getCompaniesByEmail: (email,page,pageSize,sortedColumn,sortOrder) =>
    apiClient.get(`/getCompanyByAdminEmail`, {
      params: { email,page,pageSize,sortedColumn,sortOrder },
    }),
    getListOfCompanyByAdminEmail: (email) =>
    apiClient.get(`/getListOfCompanyByAdminEmail`, {
      params: { email },
    }),
};
export default companyApi;
