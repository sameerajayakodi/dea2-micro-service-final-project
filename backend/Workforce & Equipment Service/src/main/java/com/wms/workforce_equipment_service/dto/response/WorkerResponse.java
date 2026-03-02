package com.wms.workforce_equipment_service.dto.response;

import com.wms.workforce_equipment_service.model.enums.Shift;
import com.wms.workforce_equipment_service.model.enums.WorkerRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for representing a worker response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkerResponse {

    private Long id;
    private String name;
    private Shift shift;
    private WorkerRole role;
}
