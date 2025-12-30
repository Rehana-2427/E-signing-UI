import axios from "axios";

const REVIEWER_SERVICE_BASE = `${process.env.REACT_APP_API_URL}/documentservice/api/reviewer`;

const apiClient = axios.create({
  baseURL: REVIEWER_SERVICE_BASE,
  withCredentials: true,
});

const reviewerApi = {
  getUnRevieweDocsByEmail: (reviewerEmail,page,pageSize,sortedColumn,sortOrder) =>
    apiClient.get("/unreviewedDocs", { params: { reviewerEmail,page,pageSize,sortedColumn,sortOrder } }),

  getRevieweDocsByEmail: (reviewerEmail,page,pageSize,sortedColumn,sortOrder) =>
    apiClient.get("/reviewedDocs", { params: { reviewerEmail,page,pageSize,sortedColumn,sortOrder } }),

  approveDocumentReview: (payload) =>
    apiClient.put("/approveDocument", null, {
      params: payload,
    }),

  getDetailsOfReviewerById: (documentId) =>
    apiClient.get("/getDetailsOfReviewerById", { params: { documentId } }),
  AddReviewer: (documentId, request) => {
    return apiClient.put(`/${documentId}/add-reviewer`, request);
  },
};

export default reviewerApi;
