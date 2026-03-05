import api from "@/lib/axios";

const BASE = "/api/locations";

export const getAllStorageLocations = () => api.get(BASE);

export const getStorageLocationById = (id) => api.get(`${BASE}/${id}`);

export const createStorageLocation = (data) => api.post(BASE, data);

export const updateStorageLocation = (id, data) => api.put(`${BASE}/${id}`, data);

export const deleteStorageLocation = (id) => api.delete(`${BASE}/${id}`);

export const updateStorageLocationCapacity = (id, data) =>
  api.patch(`${BASE}/${id}/capacity`, data);

export const getAvailableStorageLocations = () => api.get(`${BASE}/available`);
