import api from "@/lib/axios";

const BASE = "/api/v1/orders";

// ── CRUD ──────────────────────────────────────────────
export const getAllOrders        = ()          => api.get(BASE);
export const getOrderById        = (id)        => api.get(`${BASE}/${id}`);
export const createOrder         = (data)      => api.post(BASE, data);
export const modifyOrder         = (id, data)  => api.put(`${BASE}/${id}`, data);

// ── Workflow actions ──────────────────────────────────
export const validateOrder       = (id)        => api.post(`${BASE}/${id}/validate`);
export const approveOrder        = (id, data)  => api.post(`${BASE}/${id}/approve`, data);
export const updateOrderStatus   = (id, data)  => api.patch(`${BASE}/${id}/status`, data);

// ── History ───────────────────────────────────────────
export const getOrderHistory     = (id)        => api.get(`${BASE}/${id}/history`);
