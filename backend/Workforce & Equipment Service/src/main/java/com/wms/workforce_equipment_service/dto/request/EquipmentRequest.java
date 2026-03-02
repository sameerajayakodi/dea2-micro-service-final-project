package com.wms.workforce_equipment_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating or updating an equipment item.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Status is required")
    private String status;

    private String description;

    @NotNull(message = "Equipment Type ID is required")
    private Long equipmentTypeId;
}
