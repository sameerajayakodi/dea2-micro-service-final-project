import api from "@/lib/axios";

const BASE = "/api/locations";

export const getWorkerAllStorageLocations = () => api.get(BASE);

// export const getWorkerStorageLocationById = (id) => api.get(`${BASE}/${id}`);
