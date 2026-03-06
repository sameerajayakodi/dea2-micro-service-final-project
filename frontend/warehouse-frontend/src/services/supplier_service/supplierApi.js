import api from "@/lib/axios";

// ── Suppliers ─────────────────────────────────────────
const SUPPLIERS = "/api/v1/suppliers";

export const getAllSuppliers = (status) => api.get(SUPPLIERS, { params: status ? { status } : {} });
export const getSupplierById = (id) => api.get(`${SUPPLIERS}/${id}`);
export const createSupplier = (data) => api.post(SUPPLIERS, data);
export const updateSupplier = (id, data) => api.put(`${SUPPLIERS}/${id}`, data);
export const updateSupplierStatus = (id, data) => api.patch(`${SUPPLIERS}/${id}/status`, data);

