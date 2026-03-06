package com.wms.workforce_equipment_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignWorkersToOrderRequest {

    @NotBlank(message = "Order ID cannot be blank")
    private String orderId;

    @NotNull(message = "Supervisor ID cannot be null")
    private Long supervisorId;

    @NotEmpty(message = "Worker IDs list cannot be empty")
    private List<Long> workerIds;
}
