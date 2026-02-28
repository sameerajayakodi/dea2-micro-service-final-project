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
@RequestMapping("/api/v1/pick-pack/integration/order")
@Tag(name = "Order Service Integration", description = "🟢 Endpoints called BY Order Service")
public class OrderIntegrationController {
    
    private final PickingPackingService service;

    public OrderIntegrationController(PickingPackingService service) {
        this.service = service;
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get picking tasks by order", 
               description = "🔵 CALLED BY: Order Service → Returns all picking tasks for specific order")
    public ResponseEntity<List<PickingPackingDTO>> getByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(service.getByOrderId(orderId));
    }
}
