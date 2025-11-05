// adminApi.js
import axios from 'axios';

const ADMIN_API_SERVICE = `${process.env.REACT_APP_API_URL}/adminservice/api/userCreditsList`;

const apiClient = axios.create({
    baseURL: ADMIN_API_SERVICE,
    withCredentials: true,
});
const adminUserCreditApi = {

    getUserCreditList: () =>
        apiClient.get("/allUsersCredits"),

    getUserCreditsByEmail: (email) =>
        apiClient.get(`/userCredits`, { params: { email } }),

    requestUserCredits: (message) =>
        apiClient.post("/request-credits", message),

    addCredits: (userEmail, creditsToAssign) =>
        apiClient.put("/assign-credits", { userEmail, creditsToAssign }),

    updateUserCredits: (userEmail, updateData) =>
        apiClient.put(`/updateUserCredits?userEmail=${encodeURIComponent(userEmail)}`, updateData),

    saveCreditTransaction: (transactionData) =>
        apiClient.post("/creditTransactions", transactionData),


    getCreditTransactionsByUser: (userEmail) =>
        apiClient.get("/getCredtTransactionsByUser", {
            params: { userEmail }
        }),

    getUnseenRequests: () => apiClient.get("/unseen-requests"),

    markAsSeen: (id) => apiClient.put(`/mark-seen/${id}`),

    

};

export default adminUserCreditApi;
