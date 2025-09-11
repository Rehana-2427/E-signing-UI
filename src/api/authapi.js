import axios from 'axios';

const AUTH_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/authservice/api/auth`;
// Create an Axios instance
const apiClient = axios.create({
  baseURL: AUTH_SERVICE_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // optional
});

const authapi = {
  saveUser: async (userData) => {
    return apiClient.post('/register', userData);
  },

  userLogin: async (loginRequest) => {
    return apiClient.post('/login', loginRequest)
  },
  googleLogin: async (idToken) => {
    return apiClient.post('/google', { idToken });
  }
};

export default authapi;