import axios from "axios";
import api from "@/lib/axios";

// ✅ Direct call to inbound service running on EC2:8090
const inboundDirect = axios.create({
  baseURL: "http://13.229.61.136:8090",
  headers: { "Content-Type": "application/json" },
});

/**
 * INBOUND SERVICE (DIRECT)
 */
export const getInboundShipments = () =>
  inboundDirect.get("/api/v1/inbound/shipments");

export const getAllReceipts = () =>
  inboundDirect.get("/api/v1/inbound/receipts");

export const getAllReceiptItems = () =>
  inboundDirect.get("/api/v1/inbound/receipt-items");

export const getShipmentById = (id) =>
  inboundDirect.get(`/api/v1/inbound/${id}`);

export const receiveGoods = (data) =>
  inboundDirect.post("/api/v1/inbound/receive", data);

export const updateShipmentStatus = (id, status) =>
  inboundDirect.patch(`/api/v1/inbound/${id}/status`, null, { params: { status } });

export const deleteShipment = (id) =>
  inboundDirect.delete(`/api/v1/inbound/${id}`);

/**
 * SUPPLIER + PRODUCT (keep through your normal gateway api)
 */
export const getAvailableSuppliers = async () => {
  const res = await api.get("/api/v1/suppliers");
  return res.data?.suppliers || [];
};

export const getAvailableProducts = async () => {
  const res = await api.get("/api/products");
  return res.data || [];
};