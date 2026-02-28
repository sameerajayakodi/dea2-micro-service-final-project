package com.wms.workforce_equipment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for representing an equipment type response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentTypeResponse {

    private Long id;
    private String name;
    private String description;
    private String manufacturer;
    private String model;
}
