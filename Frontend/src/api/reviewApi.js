import axios from "axios";
import API from "./axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Public — get reviews for a product
export const getProductReviews = (productId) => {
  return API.get(`/reviews/${productId}`);
};

// Customer only — add review
export const addProductReview = (productId, reviewData) => {
  return API.post(`/reviews/${productId}`, reviewData);
};

export const checkReviewEligibility = (productId, token) => {
  return axios.get(
    `${API_URL}/reviews/${productId}/eligibility`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
// Customer only — update review
export const updateProductReview = (productId, reviewData, token) => {
  return axios.put(
    `${API_URL}/reviews/${productId}`,
    reviewData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
//delete review
export const deleteProductReview = (productId, token) => {
  return axios.delete(
    `${API_URL}/reviews/${productId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};