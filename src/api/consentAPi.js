import axios from 'axios';

const DOCUMENT_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/documentservice/api/consent-stats`;

const apiClient = axios.create({
    baseURL: DOCUMENT_SERVICE_BASE,
    withCredentials: true,
});

const consentAPi = {
    getConsentStats: (userEmail) =>
        apiClient.get(`/consentstats`, {
            params: { userEmail }
        }),
    getMonthlyStats: (userEmail) =>
        apiClient.get(`/monthlystats`, {
            params: { userEmail }
        }),
};

export default consentAPi;
