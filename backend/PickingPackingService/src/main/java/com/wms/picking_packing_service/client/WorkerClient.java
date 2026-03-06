package com.wms.picking_packing_service.client;

import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "${services.worker.name:CUSTOMER-MANAGEMENT-SERVICE}")
public interface WorkerClient {

    @GetMapping("/api/v1/workers/{workerId}")
    Map<String, Object> getWorkerById(@PathVariable("workerId") Long workerId);

    default boolean isWorkerAvailable(Long workerId) {
        try {
            Map<String, Object> worker = getWorkerById(workerId);
            return worker != null && "AVAILABLE".equals(worker.get("status"));
        } catch (Exception exception) {
            return false;
        }
    }
}
