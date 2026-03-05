import api from "@/lib/axios";

// Make sure the API Gateway routes this correctly. Adjust if your path is just /api/products
const BASE = "/api/products";

// ── CRUD ──────────────────────────────────────────────
export const getAllProducts = () => api.get(BASE);
export const getProductById = (id) => api.get(`${BASE}/${id}`);
export const createProduct = (data) => api.post(BASE, data);
export const updateProduct = (id, data) => api.put(`${BASE}/${id}`, data);
export const deleteProduct = (id) => api.delete(`${BASE}/${id}`);

// ── Status Actions ─────────────────────────────────────
export const activateProduct = (id) => api.patch(`${BASE}/${id}/activate`);
export const deactivateProduct = (id) => api.patch(`${BASE}/${id}/deactivate`);
