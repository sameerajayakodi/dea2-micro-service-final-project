package com.wms.workforce_equipment_service.service;

import com.wms.workforce_equipment_service.dto.request.EquipmentAssignmentRequest;
import com.wms.workforce_equipment_service.dto.response.EquipmentAssignmentResponse;

import java.util.List;

/**
 * Service interface for managing equipment assignments.
 */
public interface IEquipmentAssignmentService {

    /**
     * Retrieves all equipment assignments.
     * @return List of equipment assignment responses.
     */
    List<EquipmentAssignmentResponse> getAllAssignments();

    /**
     * Retrieves an equipment assignment by its ID.
     * @param id The ID of the assignment.
     * @return The equipment assignment response.
     */
    EquipmentAssignmentResponse getAssignmentById(Long id);

    /**
     * Retrieves equipment assignments for a specific equipment.
     * @param equipmentId The ID of the equipment.
     * @return List of equipment assignment responses.
     */
    List<EquipmentAssignmentResponse> getAssignmentsByEquipmentId(Long equipmentId);

    /**
     * Retrieves equipment assignments for a specific worker.
     * @param workerId The ID of the worker.
     * @return List of equipment assignment responses.
     */
    List<EquipmentAssignmentResponse> getAssignmentsByWorkerId(Long workerId);

    /**
     * Creates a new equipment assignment.
     * @param request The assignment creation request.
     * @return The created equipment assignment response.
     */
    EquipmentAssignmentResponse createAssignment(EquipmentAssignmentRequest request);

    /**
     * Updates an existing equipment assignment.
     * @param id The ID of the assignment to update.
     * @param request The assignment update request.
     * @return The updated equipment assignment response.
     */
    EquipmentAssignmentResponse updateAssignment(Long id, EquipmentAssignmentRequest request);

    /**
     * Deletes an equipment assignment by its ID.
     * @param id The ID of the assignment to delete.
     */
    void deleteAssignment(Long id);
}
