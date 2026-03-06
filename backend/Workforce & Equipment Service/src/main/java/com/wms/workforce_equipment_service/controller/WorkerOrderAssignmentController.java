package com.wms.workforce_equipment_service.controller;

import com.wms.workforce_equipment_service.dto.request.AssignWorkersToOrderRequest;
import com.wms.workforce_equipment_service.dto.response.WorkerOrderAssignmentResponse;
import com.wms.workforce_equipment_service.service.IWorkerOrderAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for handling worker to order assignment requests.
 */
@RestController
@RequestMapping("/api/v1/workforce-equipment/worker-order-assignments")
@RequiredArgsConstructor
public class WorkerOrderAssignmentController {

    private final IWorkerOrderAssignmentService workerOrderAssignmentService;

    /**
     * Assigns a supervisor and workers to an order.
     * The supervisor is assigned to the order in the Order Service via Feign.
     * Workers are stored in the worker_order_assignment table.
     *
     * @param request The assignment request containing orderId, supervisorId, and workerIds.
     * @return List of created worker order assignments.
     */
    @PostMapping("/assign")
    public ResponseEntity<List<WorkerOrderAssignmentResponse>> assignWorkersToOrder(
            @Valid @RequestBody AssignWorkersToOrderRequest request) {

        List<WorkerOrderAssignmentResponse> assignments =
                workerOrderAssignmentService.assignWorkersToOrder(request);
        return new ResponseEntity<>(assignments, HttpStatus.CREATED);
    }

    /**
     * Retrieves all worker assignments for a specific order.
     *
     * @param orderId The order ID (UUID string).
     * @return List of worker order assignments for the order.
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<WorkerOrderAssignmentResponse>> getAssignmentsByOrderId(
            @PathVariable String orderId) {

        return ResponseEntity.ok(workerOrderAssignmentService.getAssignmentsByOrderId(orderId));
    }

    /**
     * Retrieves all order assignments for a specific worker.
     *
     * @param workerId The ID of the worker.
     * @return List of order assignments for the worker.
     */
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<WorkerOrderAssignmentResponse>> getAssignmentsByWorkerId(
            @PathVariable Long workerId) {

        return ResponseEntity.ok(workerOrderAssignmentService.getAssignmentsByWorkerId(workerId));
    }
}
