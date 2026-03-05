import api from "@/lib/axios";

// ── Suppliers ─────────────────────────────────────────
const SUPPLIERS = "/api/v1/suppliers";

export const getAllSuppliers      = (status)     => api.get(SUPPLIERS, { params: status ? { status } : {} });
export const getSupplierById      = (id)         => api.get(`${SUPPLIERS}/${id}`);
export const createSupplier       = (data)       => api.post(SUPPLIERS, data);
export const updateSupplier       = (id, data)   => api.put(`${SUPPLIERS}/${id}`, data);
export const updateSupplierStatus = (id, data)   => api.patch(`${SUPPLIERS}/${id}/status`, data);

// ── Purchase Orders ───────────────────────────────────
const PO = "/api/v1/purchase-orders";

export const getAllPurchaseOrders     = (params)  => api.get(PO, { params: params || {} });
export const getPurchaseOrderById    = (id)       => api.get(`${PO}/${id}`);
export const createPurchaseOrder     = (data)     => api.post(PO, data);

// ── PO Lifecycle Actions ──────────────────────────────
export const submitPurchaseOrder     = (id)       => api.post(`${PO}/${id}/submit`);
export const approvePurchaseOrder    = (id)       => api.post(`${PO}/${id}/approve`);
export const sendPurchaseOrder       = (id)       => api.post(`${PO}/${id}/send`);
export const cancelPurchaseOrder     = (id)       => api.post(`${PO}/${id}/cancel`);
export const updatePOStatus          = (id, data) => api.patch(`${PO}/${id}/status`, data);

// ── PO Integration ────────────────────────────────────
export const validatePOForReceiving  = (poNumber) => api.get(`${PO}/validate/${poNumber}`);
export const receiveGoodsAgainstPO   = (poNumber, data) => api.post(`${PO}/receive-update/${poNumber}`, data);
