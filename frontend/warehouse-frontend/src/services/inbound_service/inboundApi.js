import api from "@/lib/axios";

// GET: All raw shipment logs
export const getInboundShipments = () => api.get("/api/v1/inbound/shipments");

// GET: All finalized receipts (Enriched with Supplier Names)
export const getAllReceipts = () => api.get("/api/v1/inbound/receipts");

// GET: All specific receipt items (Enriched with Product Names)
export const getAllReceiptItems = () => api.get("/api/v1/inbound/receipt-items");

// GET: Single shipment/receipt details by ID
export const getShipmentById = (id) => api.get(`/api/v1/inbound/${id}`);

// POST: Process and finalize a shipment (Receive Goods)
export const receiveGoods = (data) => api.post("/api/v1/inbound/receive", data);

// PATCH: Update the status of a shipment
export const updateShipmentStatus = (id, status) =>
    api.patch(`/api/v1/inbound/${id}/status`, null, { params: { status } });

// DELETE: Remove a shipment record
export const deleteShipment = (id) => api.delete(`/api/v1/inbound/${id}`);

// NEW: Fetch data for searchable dropdowns
export const getAvailableSuppliers = () => api.get("/api/v1/suppliers");
export const getAvailableProducts = () => api.get("/api/v1/products");