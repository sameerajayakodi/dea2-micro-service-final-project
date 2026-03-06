import api from "@/lib/axios";

const BASE = "/api/dispatches";

export const getAllDispatches = () => api.get(BASE);

export const getDispatchById = (id) => api.get(`${BASE}/${id}`);

export const createDispatch = (data) => api.post(BASE, data);

export const updateDispatch = (id, data) => api.put(`${BASE}/${id}`, data);

export const deleteDispatch = (id) => api.delete(`${BASE}/${id}`);
