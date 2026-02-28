package com.wms.workforce_equipment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for representing a maintenance log response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceLogResponse {

    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String description;
    private LocalDateTime maintenanceDate;
    private String performedBy;
    private String status;
    private String notes;
}
