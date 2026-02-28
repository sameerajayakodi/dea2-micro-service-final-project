package com.wms.picking_packing_service.client;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class OrderClient {

    private final RestTemplate restTemplate;

    @Value("${order.service.url}")
    private String orderServiceUrl;

    public OrderClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Fetch order details from Order Service
     * @param orderId the order ID
     * @return order details as a Map
     */
    public Map<String, Object> getOrderById(Long orderId) {
        try {
            String url = orderServiceUrl + "/api/v1/orders/" + orderId;
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch order details for orderId: " + orderId, e);
        }
    }

    /**
     * Update order status in Order Service
     * @param orderId the order ID
     * @param status the new status
     */
    public void updateOrderStatus(Long orderId, String status) {
        try {
            String url = orderServiceUrl + "/api/v1/orders/" + orderId + "/status?status=" + status;
            restTemplate.patchForObject(url, null, Void.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update order status for orderId: " + orderId, e);
        }
    }
}
