package com.wms.workforce_equipment_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for creating or updating a maintenance log.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceLogRequest {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Maintenance date is required")
    private LocalDateTime maintenanceDate;

    @NotBlank(message = "Performed by is required")
    private String performedBy;

    @NotBlank(message = "Status is required")
    private String status;

    private String notes;
}
