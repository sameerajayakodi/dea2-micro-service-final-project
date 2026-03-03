import api from "@/lib/axios";

const BASE = "/api/inventory";

export const getAllInventories = () => api.get(BASE);

export const getInventoryById = (inventoryId) => api.get(`${BASE}/${inventoryId}`);

export const getInventoriesByProductId = (productId) =>
  api.get(`${BASE}/product/${productId}`);

export const getInventoriesByLocationId = (locationId) =>
  api.get(`${BASE}/location/${locationId}`);

export const createInventory = (data) => api.post(BASE, data);

export const updateInventory = (inventoryId, data) =>
  api.put(`${BASE}/${inventoryId}`, data);

export const deleteInventory = (inventoryId) => api.delete(`${BASE}/${inventoryId}`);

export const updateStockOnReceiving = (data) => api.post(`${BASE}/receiving`, data);

export const updateStockOnPicking = (data) => api.post(`${BASE}/picking`, data);

export const reserveStock = (data) => api.post(`${BASE}/reserve`, data);

export const releaseReservedStock = (data) => api.post(`${BASE}/release`, data);

export const markAsDamaged = (data) => api.post(`${BASE}/damaged`, data);

export const getLowStockAlerts = () => api.get(`${BASE}/alerts/low-stock`);

export const getLowStockItems = () => api.get(`${BASE}/low-stock`);

export const createInventoryAdjustment = (data) =>
  api.post(`${BASE}/adjustments`, data);

export const getAllAdjustments = () => api.get(`${BASE}/adjustments`);

export const getAdjustmentHistory = (inventoryId) =>
  api.get(`${BASE}/adjustments/${inventoryId}`);

export const getExpiringSoon = (days = 30) =>
  api.get(`${BASE}/expiring`, { params: { days } });
