import axios from "axios";

const REVIEWER_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/documentservice/api/reviewer`;

const apiClient = axios.create({
  baseURL: REVIEWER_SERVICE_BASE,
  withCredentials: true,
});

const reviewerApi = {
  getUnRevieweDocsByEmail: (reviewerEmail) =>
    apiClient.get("/unreviewedDocs", { params: { reviewerEmail } }),

  getRevieweDocsByEmail: (reviewerEmail) =>
    apiClient.get("/reviewedDocs", { params: { reviewerEmail } }),

  approveDocumentReview: (payload) =>
    apiClient.put("/approveDocument", null, {
      params: payload,
    }),

  getDetailsOfReviewerById: (documentId) =>
    apiClient.get("/getDetailsOfReviewerById", { params: { documentId } }),
};

export default reviewerApi;
