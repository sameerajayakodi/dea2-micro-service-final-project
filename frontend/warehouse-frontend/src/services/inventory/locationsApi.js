import api from "@/lib/axios";

const BASE = "/api/inventory/storage-locations";

export const getAllStorageLocations = () => api.get(BASE);

export const getStorageLocationById = (locationId) =>
  api.get(`${BASE}/${locationId}`);

export const createStorageLocation = (data) => api.post(BASE, data);

export const updateStorageLocation = (locationId, data) =>
  api.put(`${BASE}/${locationId}`, data);

export const deleteStorageLocation = (locationId) =>
  api.delete(`${BASE}/${locationId}`);
