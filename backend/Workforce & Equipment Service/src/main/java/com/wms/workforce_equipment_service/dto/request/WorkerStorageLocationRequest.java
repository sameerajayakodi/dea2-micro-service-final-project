package com.wms.workforce_equipment_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkerStorageLocationRequest {

    @NotNull(message = "Worker ID cannot be null")
    private Long workerId;

    @NotNull(message = "Storage Location ID cannot be null")
    private Long storageLocationId;
}
