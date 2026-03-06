import api from "@/lib/axios";

const BASE = "/api/v1/pick-pack";

export const getAllPickPacks = (params) => api.get(BASE, { params });

export const getPickPackById = (pickPackId) => api.get(`${BASE}/${pickPackId}`);

export const createPickPack = (data) => api.post(BASE, data);

export const updatePickPack = (pickPackId, data) =>
  api.put(`${BASE}/${pickPackId}`, data);

export const startPicking = (pickPackId) =>
  api.post(`${BASE}/${pickPackId}/start-picking`);

export const completePicking = (pickPackId) =>
  api.post(`${BASE}/${pickPackId}/complete-picking`);

export const startPacking = (pickPackId) =>
  api.post(`${BASE}/${pickPackId}/start-packing`);

export const completePacking = (pickPackId) =>
  api.post(`${BASE}/${pickPackId}/complete-packing`);

export const updatePickQuantity = (pickPackId, itemId, quantityPicked) =>
  api.put(`${BASE}/${pickPackId}`, {
    items: [{ itemId, quantityPicked }],
  });

export const addPackingDetails = (pickPackId, packingDetails) =>
  api.put(`${BASE}/${pickPackId}`, { packingDetails });

export const deletePickPack = (pickPackId) => api.delete(`${BASE}/${pickPackId}`);
