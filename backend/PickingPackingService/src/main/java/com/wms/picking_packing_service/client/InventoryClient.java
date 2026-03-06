package com.wms.picking_packing_service.client;

import java.util.HashMap;
import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "${services.inventory.name:PRODUCT-CATALOG-SERVICE}")
public interface InventoryClient {

    @PostMapping("/api/v1/inventory/{itemId}/reduce")
    void reduceInventory(@PathVariable("itemId") Long itemId, @RequestBody Map<String, Object> request);

    @GetMapping("/api/v1/inventory/{itemId}")
    Map<String, Object> getInventoryByItemId(@PathVariable("itemId") Long itemId);

    default void updateInventoryAfterPicking(Long itemId, Integer quantity) {
        Map<String, Object> request = new HashMap<>();
        request.put("quantity", quantity);
        reduceInventory(itemId, request);
    }
}
