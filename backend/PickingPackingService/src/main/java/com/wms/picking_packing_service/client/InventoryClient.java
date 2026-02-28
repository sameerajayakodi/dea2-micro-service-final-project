package com.wms.picking_packing_service.client;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class InventoryClient {

    private final RestTemplate restTemplate;

    @Value("${inventory.service.url}")
    private String inventoryServiceUrl;

    public InventoryClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Update inventory after picking items
     * @param itemId the product/item ID
     * @param quantity the quantity picked
     */
    public void updateInventoryAfterPicking(Long itemId, Integer quantity) {
        try {
            String url = inventoryServiceUrl + "/api/v1/inventory/" + itemId + "/reduce";
            Map<String, Object> request = new HashMap<>();
            request.put("quantity", quantity);
            restTemplate.postForObject(url, request, Void.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update inventory for itemId: " + itemId, e);
        }
    }

    /**
     * Get inventory details from Inventory Service
     * @param itemId the product/item ID
     * @return inventory details as a Map
     */
    public Map<String, Object> getInventoryByItemId(Long itemId) {
        try {
            String url = inventoryServiceUrl + "/api/v1/inventory/" + itemId;
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch inventory for itemId: " + itemId, e);
        }
    }
}
