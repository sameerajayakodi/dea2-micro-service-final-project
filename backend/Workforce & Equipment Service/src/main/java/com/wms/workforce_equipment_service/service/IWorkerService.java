package com.wms.workforce_equipment_service.service;

import com.wms.workforce_equipment_service.dto.request.WorkerRequest;
import com.wms.workforce_equipment_service.dto.response.WorkerResponse;

import java.util.List;

/**
 * Service interface for managing workers.
 */
public interface IWorkerService {

    /**
     * Retrieves all workers.
     * @return List of worker responses.
     */
    List<WorkerResponse> getAllWorkers();

    /**
     * Retrieves a worker by their ID.
     * @param id The ID of the worker.
     * @return The worker response.
     */
    WorkerResponse getWorkerById(Long id);

    /**
     * Creates a new worker.
     * @param request The worker creation request.
     * @return The created worker response.
     */
    WorkerResponse createWorker(WorkerRequest request);

    /**
     * Updates an existing worker.
     * @param id The ID of the worker to update.
     * @param request The worker update request.
     * @return The updated worker response.
     */
    WorkerResponse updateWorker(Long id, WorkerRequest request);

    /**
     * Deletes a worker by their ID.
     * @param id The ID of the worker to delete.
     */
    void deleteWorker(Long id);
}
