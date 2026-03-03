import api from "@/lib/axios";

const BASE = "/api/inventory/products";

export const getAllInventoryProducts = () => api.get(BASE);

export const getInventoryProductById = (productId) => api.get(`${BASE}/${productId}`);

export const createInventoryProduct = (data) => api.post(BASE, data);

export const updateInventoryProduct = (productId, data) =>
  api.put(`${BASE}/${productId}`, data);

export const deleteInventoryProduct = (productId) => api.delete(`${BASE}/${productId}`);
