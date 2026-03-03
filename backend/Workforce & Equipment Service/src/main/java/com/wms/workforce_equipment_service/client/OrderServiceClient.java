package com.wms.workforce_equipment_service.client;

import com.wms.workforce_equipment_service.dto.request.UpdateWorkerRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Feign client for communicating with the Order Management Service.
 */
@FeignClient(name = "order-service")
public interface OrderServiceClient {

    @PutMapping("/api/v1/orders/{orderId}/worker")
    Object updateWorkerId(@PathVariable("orderId") String orderId,
                          @RequestBody UpdateWorkerRequest request);
}
