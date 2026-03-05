import api from "@/lib/axios";

const BASE = "/api/v1/pick-pack";

export const getAllPickPacks = (params) => api.get(BASE, { params });

export const getPickPackById = (pickPackId) => api.get(`${BASE}/${pickPackId}`);

export const createPickPack = (data) => api.post(BASE, data);

export const updatePickPack = (pickPackId, data) =>
  api.put(`${BASE}/${pickPackId}`, data);

export const updatePickPackStatus = (pickPackId, status) =>
  api.patch(`${BASE}/${pickPackId}/status`, { status });

export const deletePickPack = (pickPackId) => api.delete(`${BASE}/${pickPackId}`);
