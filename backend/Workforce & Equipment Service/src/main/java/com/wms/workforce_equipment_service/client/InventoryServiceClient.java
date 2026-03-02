package com.wms.workforce_equipment_service.client;

import com.wms.workforce_equipment_service.dto.response.StorageLocationResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign client for communicating with the Inventory Management Service.
 */
@FeignClient(name = "INVENTORY-MANAGEMENT-SERVICE")
public interface InventoryServiceClient {

    @GetMapping("/api/inventory/storage-locations/{locationId}")
    StorageLocationResponse getStorageLocationById(@PathVariable("locationId") Long locationId);
}
