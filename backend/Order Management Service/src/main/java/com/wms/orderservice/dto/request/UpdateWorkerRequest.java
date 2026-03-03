package com.wms.orderservice.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateWorkerRequest(
        @NotBlank(message = "Worker ID is required")
        String workerId
) {}
