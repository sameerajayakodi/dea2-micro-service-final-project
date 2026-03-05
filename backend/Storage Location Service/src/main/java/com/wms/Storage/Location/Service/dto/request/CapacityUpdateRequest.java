package com.wms.Storage.Location.Service.dto.request;

import java.math.BigDecimal;

/**
 * Request DTO for the PATCH /api/locations/{id}/capacity endpoint.
 * Use negative values to reduce capacity (e.g., when removing inventory).
 */
public record CapacityUpdateRequest(
        BigDecimal addedWeight,
        BigDecimal addedVolume) {
}
