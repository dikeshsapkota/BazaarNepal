import API from "./axios";

export const createOrder = (orderData) =>
  API.post("/orders", orderData);

export const getMyOrders = () =>
  API.get("/orders/my");

export const getSellerOrders = () =>
  API.get("/orders/seller");

export const getSellerDashboardStats = () =>
  API.get("/orders/seller/stats");

export const updateOrderStatus = (id, status) =>
  API.put(`/orders/${id}/status`, {
    status,
  });