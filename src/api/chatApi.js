import axios from "axios";

const CHAT_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/chat-service/api/messages`;
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

  getMessagesByCollab: async ({ collabId, userEmail, chatMode }) => {
    const response = apiClient.get(`/fetch-chatByCollab`, {
      params: { collabId, userEmail, chatMode },
    });
    return response;
  },

  getIndiviudalChat: async ({ collabId, chatMode, userEmail, reciver }) => {
    const response = apiClient.get(`/fetchIndiviudalChat`, {
      params: { collabId, chatMode, userEmail, reciver },
    });
    return response;
  },

  getUnseenMessages: async ({ userEmail }) => {
    const response = apiClient.get(`/unread`, {
      params: { userEmail },
    });
    return response;
  },
  markAsSeen: (messageId) => apiClient.put(`/markAsSeen/${messageId}`),

  updateMsg: (id, content) =>
    apiClient.put(`/updateMsg/${id}`, null, {
      params: { content },
    }),

  deleteMsg: (id) => apiClient.delete(`/deleteMsg/${id}`),
};
export default chatApi;
