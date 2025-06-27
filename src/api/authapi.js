import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
});

const api = {
  validateUserEmail: (userEmail) =>
    apiClient.get('/validateUserEmail', {
      params: { userEmail }
    }),

  saveUser: async (userData) => {
    return apiClient.post('/register', userData);
  },

  userLogin: async(loginRequest) =>{
   return  apiClient.post('/login',loginRequest)
  },
};

export default api;