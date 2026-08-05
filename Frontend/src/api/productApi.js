import API from "./axios";

export const getProducts = () =>
  API.get("/products");

export const getSellerProducts = () =>
  API.get("/products/seller");

export const createProduct = (product) =>
  API.post("/products", product);

export const updateProduct = (id, product) =>
  API.put(`/products/${id}`, product);

export const deleteProduct = (id) =>
  API.delete(`/products/${id}`);