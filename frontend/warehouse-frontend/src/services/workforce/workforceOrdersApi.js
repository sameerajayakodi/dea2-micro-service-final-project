import api from "@/lib/axios";

// ── Orders (fetched via Order Service through API Gateway) ──
const ORDER_BASE = "/api/v1/orders";

export const getWorkforceOrders = () => api.get(ORDER_BASE);

export const getWorkforceOrderById = (id) => api.get(`${ORDER_BASE}/${id}`);

// ── Worker-Order Assignments (Workforce Service) ──
const ASSIGN_BASE = "/api/v1/workforce-equipment/worker-order-assignments";

export const assignWorkersToOrder = (data) =>
  api.post(`${ASSIGN_BASE}/assign`, data);

export const getAssignmentsByOrderId = (orderId) =>
  api.get(`${ASSIGN_BASE}/order/${orderId}`);

export const getAssignmentsByWorkerId = (workerId) =>
  api.get(`${ASSIGN_BASE}/worker/${workerId}`);
