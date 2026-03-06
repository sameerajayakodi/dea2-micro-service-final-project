package com.wms.workforce_equipment_service.controller;

import com.wms.workforce_equipment_service.dto.request.WorkerStorageLocationRequest;
import com.wms.workforce_equipment_service.dto.response.WorkerStorageLocationResponse;
import com.wms.workforce_equipment_service.service.IWorkerStorageLocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for handling worker to storage location assignment requests.
 */
@RestController
@RequestMapping("/api/v1/workforce-equipment/worker-storage-locations")
@RequiredArgsConstructor
public class WorkerStorageLocationController {

    private final IWorkerStorageLocationService workerStorageLocationService;

    /**
     * Assigns a worker to a storage location in the inventory.
     * @param request The assignment request.
     * @return The created assignment response.
     */
    @PostMapping
    public ResponseEntity<WorkerStorageLocationResponse> assignWorkerToStorageLocation(
            @Valid @RequestBody WorkerStorageLocationRequest request) {
        
        WorkerStorageLocationResponse created = workerStorageLocationService.assignWorkerToStorageLocation(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Retrieves all storage locations assigned to a specific worker.
     * @param workerId The ID of the worker.
     * @return List of storage location assignments for the worker.
     */
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<WorkerStorageLocationResponse>> getStorageLocationsByWorkerId(
            @PathVariable Long workerId) {
        
        return ResponseEntity.ok(workerStorageLocationService.getStorageLocationsByWorkerId(workerId));
    }
    
    /**
     * Removes an assignment by its ID.
     * @param id The ID of the assignment.
     * @return No content.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeAssignment(@PathVariable Long id) {
        workerStorageLocationService.removeAssignment(id);
        return ResponseEntity.noContent().build();
    }
}
