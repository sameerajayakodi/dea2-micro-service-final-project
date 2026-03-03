import api from "@/lib/axios";

const BASE = "/api/v1/workforce-equipment/worker-storage-locations";

export const assignWorkerToStorageLocation = (data) => api.post(BASE, data);

export const getStorageLocationsByWorkerId = (workerId) =>
  api.get(`${BASE}/worker/${workerId}`);

export const removeWorkerStorageLocation = (id) => api.delete(`${BASE}/${id}`);
