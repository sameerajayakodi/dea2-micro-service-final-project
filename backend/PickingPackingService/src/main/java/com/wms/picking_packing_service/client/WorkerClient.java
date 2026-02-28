package com.wms.picking_packing_service.client;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class WorkerClient {

    private final RestTemplate restTemplate;

    @Value("${worker.service.url}")
    private String workerServiceUrl;

    public WorkerClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Fetch worker details from Worker Service
     * @param workerId the worker ID
     * @return worker details as a Map
     */
    public Map<String, Object> getWorkerById(Long workerId) {
        try {
            String url = workerServiceUrl + "/api/v1/workers/" + workerId;
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch worker details for workerId: " + workerId, e);
        }
    }

    /**
     * Check if worker is available
     * @param workerId the worker ID
     * @return true if available, false otherwise
     */
    public boolean isWorkerAvailable(Long workerId) {
        try {
            Map<String, Object> worker = getWorkerById(workerId);
            if (worker != null && worker.containsKey("status")) {
                return "AVAILABLE".equals(worker.get("status"));
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}
