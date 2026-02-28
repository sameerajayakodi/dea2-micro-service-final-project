package com.wms.workforce_equipment_service.dto.request;

import com.wms.workforce_equipment_service.model.enums.Shift;
import com.wms.workforce_equipment_service.model.enums.WorkerRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating or updating a worker.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkerRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Shift is required")
    private Shift shift;

    @NotNull(message = "Role is required")
    private WorkerRole role;
}
