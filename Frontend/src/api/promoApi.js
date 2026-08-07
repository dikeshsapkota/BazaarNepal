import API from "./axios";

export const validatePromo = (code, cartTotal) =>
  API.post("/promos/validate", {
    code,
    cartTotal,
  });

export const getSellerPromos = () =>
  API.get("/promos/seller");

export const createPromo = (promo) =>
  API.post("/promos", promo);

export const updatePromo = (id, promo) =>
  API.put(`/promos/${id}`, promo);

export const deletePromo = (id) =>
  API.delete(`/promos/${id}`);