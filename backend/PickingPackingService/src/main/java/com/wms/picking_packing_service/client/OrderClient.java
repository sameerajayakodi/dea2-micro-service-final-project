package com.wms.picking_packing_service.client;

import java.util.Map;
import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "${services.order.name:ORDER-SERVICE}")
public interface OrderClient {

    @GetMapping("/api/v1/orders/{orderId}")
    Map<String, Object> getOrderById(@PathVariable("orderId") UUID orderId);

    @PatchMapping("/api/v1/orders/{orderId}/status")
    void updateOrderStatus(@PathVariable("orderId") UUID orderId, @RequestParam("status") String status);
}
