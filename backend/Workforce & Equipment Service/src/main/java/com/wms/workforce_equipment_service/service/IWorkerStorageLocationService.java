package com.wms.workforce_equipment_service.service;

import com.wms.workforce_equipment_service.dto.request.WorkerStorageLocationRequest;
import com.wms.workforce_equipment_service.dto.response.WorkerStorageLocationResponse;

import java.util.List;

/**
 * Interface defining the operations for managing worker storage location assignments.
 */
public interface IWorkerStorageLocationService {

    /**
     * Assigns a worker to a storage location.
     * @param request The assignment request containing workerId and storageLocationId.
     * @return The resulting assignment response.
     */
    WorkerStorageLocationResponse assignWorkerToStorageLocation(WorkerStorageLocationRequest request);

    /**
     * Retrieves all storage locations assigned to a specific worker.
     * @param workerId The ID of the worker.
     * @return List of assignment responses.
     */
    List<WorkerStorageLocationResponse> getStorageLocationsByWorkerId(Long workerId);
    
    /**
     * Removes an assignment by its ID.
     * @param id The ID of the assignment to remove.
     */
    void removeAssignment(Long id);
}
