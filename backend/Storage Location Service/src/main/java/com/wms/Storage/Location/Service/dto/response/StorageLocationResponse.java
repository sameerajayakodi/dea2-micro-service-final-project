package com.wms.Storage.Location.Service.dto.response;

import com.wms.Storage.Location.Service.entity.LocationAvailabilityStatus;
import java.math.BigDecimal;

public record StorageLocationResponse(
        Long locationId,
        String zone,
        String rackNo,
        String binNo,
        BigDecimal maxWeight,
        BigDecimal maxVolume,
        BigDecimal currentWeight,
        BigDecimal currentVolume,
        LocationAvailabilityStatus availabilityStatus
) {}
