package com.wms.workforce_equipment_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO matching the Order Service's UpdateWorkerRequest for Feign calls.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWorkerRequest {
    private String workerId;
}
