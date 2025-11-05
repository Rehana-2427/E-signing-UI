import axios from "axios";

const CHAT_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/chat-service/api/messages`;
// Create an Axios instance
const apiClient = axios.create({
  baseURL: CHAT_SERVICE_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const chatApi = {
  sendMessage: (message) => {
    return apiClient.post("/save-message", message); // Send the message to the backend
  },
  getMessages: async ({ documentId, userEmail }) => {
    const response = await axios.get(`/fetch-messages`, {
      params: { documentId, userEmail },
    });
    return response;
  },
};
export default chatApi;
