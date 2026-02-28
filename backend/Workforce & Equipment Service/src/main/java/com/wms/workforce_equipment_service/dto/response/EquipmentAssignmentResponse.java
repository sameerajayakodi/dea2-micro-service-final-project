package com.wms.workforce_equipment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for representing an equipment assignment response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentAssignmentResponse {

    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private Long workerId;
    private String workerName;
    private LocalDateTime assignedDate;
    private LocalDateTime returnedDate;
    private String status;
}
