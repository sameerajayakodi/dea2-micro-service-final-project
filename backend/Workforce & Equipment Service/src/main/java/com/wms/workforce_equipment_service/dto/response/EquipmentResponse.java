package com.wms.workforce_equipment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for representing an equipment response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentResponse {

    private Long id;
    private String name;
    private String status;
    private String description;
    private Long equipmentTypeId;
    private String equipmentTypeName;
}
