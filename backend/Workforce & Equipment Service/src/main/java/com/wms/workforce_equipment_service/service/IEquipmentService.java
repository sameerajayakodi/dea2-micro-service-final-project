package com.wms.workforce_equipment_service.service;

import com.wms.workforce_equipment_service.dto.request.EquipmentRequest;
import com.wms.workforce_equipment_service.dto.response.EquipmentResponse;

import java.util.List;

/**
 * Service interface for managing equipment.
 */
public interface IEquipmentService {

    /**
     * Retrieves all equipment.
     * @return List of equipment responses.
     */
    List<EquipmentResponse> getAllEquipments();

    /**
     * Retrieves an equipment item by its ID.
     * @param id The ID of the equipment.
     * @return The equipment response.
     */
    EquipmentResponse getEquipmentById(Long id);

    /**
     * Creates a new equipment item.
     * @param request The equipment creation request.
     * @return The created equipment response.
     */
    EquipmentResponse createEquipment(EquipmentRequest request);

    /**
     * Updates an existing equipment item.
     * @param id The ID of the equipment to update.
     * @param request The equipment update request.
     * @return The updated equipment response.
     */
    EquipmentResponse updateEquipment(Long id, EquipmentRequest request);

    /**
     * Deletes an equipment item by its ID.
     * @param id The ID of the equipment to delete.
     */
    void deleteEquipment(Long id);
}
