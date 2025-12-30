import axios from "axios";

const DOCUMENT_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/documentservice/api/converDocx`;

const apiClient = axios.create({
  baseURL: DOCUMENT_SERVICE_BASE,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const convertDocxToPdf = {
  convert: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post("/docx-to-pdf", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "blob", // important to get binary PDF
    });
  },
};

export default convertDocxToPdf;
