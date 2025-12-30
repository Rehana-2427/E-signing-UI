// adminApi.js
import axios from "axios";

const ADMIN_API_SERVICE = `${process.env.REACT_APP_API_URL}/adminservice/api/CompanyCredits`;

const apiClient = axios.create({
  baseURL: ADMIN_API_SERVICE,
  withCredentials: true,
});
const adminCompanyCreditApi = {
  getCompanyCreditList: (page, pageSize, sortedColumn, sortOrder) =>
    apiClient.get("/allCompanyCredits", {
      params: { page, pageSize, sortedColumn, sortOrder },
    }),

  addCredits: (companyName, creditsToAssign, assignCPU) =>
    apiClient.put("/assign-credits-company", {
      companyName,
      creditsToAssign,
      assignCPU,
    }),

  getCompanyCreditsByCompany: (companyName) =>
    apiClient.get(`/getcompanyCredits`, { params: { companyName } }),

  updateCompanyCredits: (companyName, updateData) =>
    apiClient.put(
      `/updateCompanyCredits?companyName=${encodeURIComponent(companyName)}`,
      updateData
    ),

  saveCreditTransaction: (transactionData) =>
    apiClient.post("/companyTransactions", transactionData),

  getCredtTransactionsByCompany: (companyName) =>
    apiClient.get("/getCredtTransactionsByCompany", {
      params: { companyName },
    }),
};

export default adminCompanyCreditApi;
