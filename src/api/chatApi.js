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

  getchatByDocumentSigner: async ({ documentId, userEmail, chatMode,role }) => {
    const response = apiClient.get(`/fetch-chatByDocumentSigner`, {
      params: { documentId, userEmail, chatMode,role },
    });
    return response;
  },

  getIndiviudalChatSigner: async ({ documentId, chatMode, userEmail, reciver,role }) => {
    const response = apiClient.get(`/fetchIndiviudalChatSigner`, {
      params: { documentId, chatMode, userEmail, reciver,role },
    });
    return response;
  },

  getchatByDocumentReviewer: async ({ documentId, userEmail, chatMode,role }) => {
    const response = apiClient.get(`/fetch-chatByDocumentReviewer`, {
      params: { documentId, userEmail, chatMode,role },
    });
    return response;
  },

  getIndiviudalChatReviewer: async ({ documentId, chatMode, userEmail, reciver,role }) => {
    const response = apiClient.get(`/fetchIndiviudalChatReviewer`, {
      params: { documentId, chatMode, userEmail, reciver,role },
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
