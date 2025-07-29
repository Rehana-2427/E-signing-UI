import axios from 'axios';
import { BASE_URL } from './apiConfig';

const OTP_SERVICE_BASE = `${BASE_URL}/authservice/otp`;
// Create an Axios instance
const apiClient = axios.create({
 baseURL: OTP_SERVICE_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // optional
});

const otpapi = {
  validateUserEmail: (userEmail) =>
    apiClient.get('/validateUserEmail', {
      params: { userEmail }
    }),
}
export default otpapi;