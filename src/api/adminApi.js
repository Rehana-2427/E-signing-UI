// adminApi.js
import axios from 'axios';

const ADMIN_API_SERVICE = `${process.env.REACT_APP_API_URL}/adminservice/api/admin`;

const apiClient = axios.create({
    baseURL: ADMIN_API_SERVICE,
    withCredentials: true,
});

const adminApi = {
    saveCreditSettings: (docCost, signCost) =>
        apiClient.post("/saveCredits", { docCost, signCost }),

    getCreditSettings: () =>
        apiClient.get("/currentCredits"),

    getCreditHistory: () =>
        apiClient.get("/creditHistory"),

    getUserCreditList:() =>
        apiClient.get("/allUsersCredits"),

};

export default adminApi;
