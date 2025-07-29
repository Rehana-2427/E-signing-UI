import axios from 'axios';
import { BASE_URL } from './apiConfig';

const AUTH_SERVICE_BASE = `${BASE_URL}/authservice/api/auth`;
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

  userLogin: async(loginRequest) =>{
   return  apiClient.post('/login',loginRequest)
  },
};

export default authapi;