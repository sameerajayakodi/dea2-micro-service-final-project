package com.wms.workforce_equipment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkerStorageLocationResponse {
    private Long id;
    private Long workerId;
    private Long storageLocationId;
    private LocalDateTime assignedDate;
}
