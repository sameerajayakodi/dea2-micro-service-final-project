package com.wms.workforce_equipment_service.service;

import com.wms.workforce_equipment_service.dto.request.EquipmentTypeRequest;
import com.wms.workforce_equipment_service.dto.response.EquipmentTypeResponse;

import java.util.List;

/**
 * Service interface for managing equipment types.
 */
public interface IEquipmentTypeService {

    /**
     * Retrieves all equipment types.
     * @return List of equipment type responses.
     */
    List<EquipmentTypeResponse> getAllEquipmentTypes();

    /**
     * Retrieves an equipment type by its ID.
     * @param id The ID of the equipment type.
     * @return The equipment type response.
     */
    EquipmentTypeResponse getEquipmentTypeById(Long id);

    /**
     * Creates a new equipment type.
     * @param request The equipment type creation request.
     * @return The created equipment type response.
     */
    EquipmentTypeResponse createEquipmentType(EquipmentTypeRequest request);

    /**
     * Updates an existing equipment type.
     * @param id The ID of the equipment type to update.
     * @param request The equipment type update request.
     * @return The updated equipment type response.
     */
    EquipmentTypeResponse updateEquipmentType(Long id, EquipmentTypeRequest request);

    /**
     * Deletes an equipment type by its ID.
     * @param id The ID of the equipment type to delete.
     */
    void deleteEquipmentType(Long id);
}
