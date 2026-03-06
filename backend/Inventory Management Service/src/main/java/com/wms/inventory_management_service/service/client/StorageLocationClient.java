package com.wms.inventory_management_service.service.client;

import java.math.BigDecimal;
import java.util.List;

public interface StorageLocationClient {

    StorageLocationDetails getStorageLocationById(Long locationId);

    List<StorageLocationDetails> getAllStorageLocations();

    StorageLocationDetails createStorageLocation(StorageLocationPayload payload);

    StorageLocationDetails updateStorageLocation(Long locationId, StorageLocationPayload payload);

    void deleteStorageLocation(Long locationId);

    record StorageLocationDetails(
            Long locationId,
            String zone,
            String rackNo,
            String binNo,
            BigDecimal maxWeight,
            BigDecimal maxVolume,
            BigDecimal currentWeight,
            BigDecimal currentVolume,
            String availabilityStatus
    ) {}

    record StorageLocationPayload(
            String zone,
            String rackNo,
            String binNo,
            BigDecimal maxWeight,
            BigDecimal maxVolume
    ) {}
}
