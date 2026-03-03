package com.wms.workforce_equipment_service.service;

import com.wms.workforce_equipment_service.dto.request.AssignWorkersToOrderRequest;
import com.wms.workforce_equipment_service.dto.response.WorkerOrderAssignmentResponse;

import java.util.List;

/**
 * Interface defining the operations for managing worker order assignments.
 */
public interface IWorkerOrderAssignmentService {

    /**
     * Assigns a supervisor and workers to an order.
     * The supervisor is assigned to the order via Feign call to Order Service.
     * Workers are stored in the worker_order_assignment table.
     *
     * @param request The assignment request containing orderId, supervisorId, and workerIds.
     * @return List of worker order assignment responses.
     */
    List<WorkerOrderAssignmentResponse> assignWorkersToOrder(AssignWorkersToOrderRequest request);

    /**
     * Retrieves all worker assignments for a specific order.
     * @param orderId The order ID (UUID string).
     * @return List of assignment responses.
     */
    List<WorkerOrderAssignmentResponse> getAssignmentsByOrderId(String orderId);

    /**
     * Retrieves all order assignments for a specific worker.
     * @param workerId The ID of the worker.
     * @return List of assignment responses.
     */
    List<WorkerOrderAssignmentResponse> getAssignmentsByWorkerId(Long workerId);
}
