import axios from 'axios';

const OTP_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/authservice/otp`;
// Create an Axios instance
const apiClient = axios.create({
 baseURL: OTP_SERVICE_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

const otpapi = {
  validateUserEmail: (userEmail) =>
    apiClient.get('/validateUserEmail', {
      params: { userEmail }
    }),
}
export default otpapi;