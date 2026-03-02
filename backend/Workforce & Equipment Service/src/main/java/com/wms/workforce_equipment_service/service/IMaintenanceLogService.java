package com.wms.workforce_equipment_service.service;

import com.wms.workforce_equipment_service.dto.request.MaintenanceLogRequest;
import com.wms.workforce_equipment_service.dto.response.MaintenanceLogResponse;

import java.util.List;

/**
 * Service interface for managing maintenance logs.
 */
public interface IMaintenanceLogService {

    /**
     * Retrieves all maintenance logs.
     * @return List of maintenance log responses.
     */
    List<MaintenanceLogResponse> getAllMaintenanceLogs();

    /**
     * Retrieves a maintenance log by its ID.
     * @param id The ID of the maintenance log.
     * @return The maintenance log response.
     */
    MaintenanceLogResponse getMaintenanceLogById(Long id);

    /**
     * Retrieves maintenance logs for a specific equipment.
     * @param equipmentId The ID of the equipment.
     * @return List of maintenance log responses.
     */
    List<MaintenanceLogResponse> getMaintenanceLogsByEquipmentId(Long equipmentId);

    /**
     * Creates a new maintenance log.
     * @param request The maintenance log creation request.
     * @return The created maintenance log response.
     */
    MaintenanceLogResponse createMaintenanceLog(MaintenanceLogRequest request);

    /**
     * Updates an existing maintenance log.
     * @param id The ID of the maintenance log to update.
     * @param request The maintenance log update request.
     * @return The updated maintenance log response.
     */
    MaintenanceLogResponse updateMaintenanceLog(Long id, MaintenanceLogRequest request);

    /**
     * Deletes a maintenance log by its ID.
     * @param id The ID of the maintenance log to delete.
     */
    void deleteMaintenanceLog(Long id);
}
