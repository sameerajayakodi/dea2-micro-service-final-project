package com.wms.workforce_equipment_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for creating or updating an equipment assignment.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentAssignmentRequest {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotNull(message = "Worker ID is required")
    private Long workerId;

    @NotNull(message = "Assigned date is required")
    private LocalDateTime assignedDate;

    private LocalDateTime returnedDate;

    @NotNull(message = "Status is required")
    private String status;
}
