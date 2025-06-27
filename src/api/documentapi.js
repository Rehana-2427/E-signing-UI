import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
    baseURL:process.env.REACT_APP_DOCUMENT_API_URL || 'http://localhost:8084/api/documents',
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});


const documentApi = {
    saveDocument: async (formData) => {
        return apiClient.post('/save-document', formData);  // Axios will detect it's FormData
    },
};

export default documentApi;