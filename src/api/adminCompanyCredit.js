// adminApi.js
import axios from "axios";

const ADMIN_API_SERVICE = `${process.env.REACT_APP_API_URL}/adminservice/api/CompanyCredits`;

const apiClient = axios.create({
  baseURL: ADMIN_API_SERVICE,
  withCredentials: true,
});
const adminCompanyCreditApi = {
  getCompanyCreditList: () => apiClient.get("/allCompanyCredits"),

  addCredits: (companyName, creditsToAssign) =>
    apiClient.put("/assign-credits-company", { companyName, creditsToAssign }),

  getCompanyCreditsByCompany: (companyName) =>
    apiClient.get(`/getcompanyCredits`, { params: { companyName } }),
};

export default adminCompanyCreditApi;
