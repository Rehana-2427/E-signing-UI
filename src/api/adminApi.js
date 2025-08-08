// adminApi.js
import axios from 'axios';
import { BASE_URL } from './apiConfig';

const ADMIN_API_SERVICE = `${BASE_URL}/adminservice/api/admin`;

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

};

export default adminApi;
