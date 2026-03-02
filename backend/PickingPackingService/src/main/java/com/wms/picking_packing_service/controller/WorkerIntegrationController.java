package com.wms.picking_packing_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wms.picking_packing_service.dto.PickingPackingDTO;
import com.wms.picking_packing_service.services.PickingPackingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/pick-pack/integration/worker")
@Tag(name = "Worker Service Integration", description = "🟡 Endpoints called BY Worker Service")
public class WorkerIntegrationController {
    
    private final PickingPackingService service;

    public WorkerIntegrationController(PickingPackingService service) {
        this.service = service;
    }

    @GetMapping("/{workerId}")
    @Operation(summary = "Get picking tasks by worker", 
               description = "🔵 CALLED BY: Worker Service → Returns all tasks assigned to specific worker")
    public ResponseEntity<List<PickingPackingDTO>> getByWorkerId(@PathVariable Long workerId) {
        return ResponseEntity.ok(service.getByWorkerId(workerId));
    }
}
