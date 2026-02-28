package com.wms.Storage.Location.Service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record StorageLocationRequest(
        @NotBlank(message = "Zone is required")
        String zone,
        
        @NotBlank(message = "Rack number is required")
        String rackNo,
        
        @NotBlank(message = "Bin number is required")
        String binNo,
        
        @Positive(message = "Max weight must be positive")
        BigDecimal maxWeight,
        
        @Positive(message = "Max volume must be positive")
        BigDecimal maxVolume
) {}
