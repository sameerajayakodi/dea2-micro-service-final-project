import api from "@/lib/axios";

// ── Inbound Shipments ─────────────────────────────────
const BASE = "/api/v1/inbound";

export const getInboundShipments = () => api.get(`${BASE}/shipments`);
export const getShipmentById = (id) => api.get(`${BASE}/${id}`);
export const receiveGoods = (data) => api.post(`${BASE}/receive`, data);
export const updateShipmentStatus = (id, status) =>
  api.patch(`${BASE}/${id}/status`, null, { params: { status } });
export const deleteShipment = (id) => api.delete(`${BASE}/${id}`);

// ── Receipts (GRNs) ──────────────────────────────────
export const getAllReceipts = () => api.get(`${BASE}/receipts`);
export const getAllReceiptItems = () => api.get(`${BASE}/receipt-items`);

// ── Supplier + Product (through the gateway) ─────────
export const getAvailableSuppliers = async () => {
  const res = await api.get("/api/v1/suppliers");
  return res.data?.suppliers || [];
};

export const getAvailableProducts = async () => {
  const res = await api.get("/api/products");
  return res.data || [];
};