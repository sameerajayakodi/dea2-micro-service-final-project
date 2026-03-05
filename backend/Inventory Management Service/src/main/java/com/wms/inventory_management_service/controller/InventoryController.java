package com.wms.inventory_management_service.controller;

import com.wms.inventory_management_service.dto.request.InventoryAdjustmentRequest;
import com.wms.inventory_management_service.dto.request.InventoryRequest;
import com.wms.inventory_management_service.dto.request.StockUpdateRequest;
import com.wms.inventory_management_service.dto.response.InventoryAdjustmentResponse;
import com.wms.inventory_management_service.dto.response.InventoryResponse;
import com.wms.inventory_management_service.dto.response.LowStockAlertResponse;
import com.wms.inventory_management_service.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAllInventories() {
        return ResponseEntity.ok(inventoryService.getAllInventories());
    }

    @GetMapping("/{inventoryId}")
    public ResponseEntity<InventoryResponse> getInventoryById(@PathVariable Long inventoryId) {
        return ResponseEntity.ok(inventoryService.getInventoryById(inventoryId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<InventoryResponse>> getInventoriesByProductId(@PathVariable UUID productId) {
        return ResponseEntity.ok(inventoryService.getInventoriesByProductId(productId));
    }

    @GetMapping("/location/{locationId}")
    public ResponseEntity<List<InventoryResponse>> getInventoriesByLocationId(@PathVariable Long locationId) {
        return ResponseEntity.ok(inventoryService.getInventoriesByLocationId(locationId));
    }

    @PostMapping
    public ResponseEntity<InventoryResponse> createInventory(@Valid @RequestBody InventoryRequest request) {
        InventoryResponse created = inventoryService.createInventory(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{inventoryId}")
    public ResponseEntity<InventoryResponse> updateInventory(@PathVariable Long inventoryId,
                                                            @Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.updateInventory(inventoryId, request));
    }

    @DeleteMapping("/{inventoryId}")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long inventoryId) {
        inventoryService.deleteInventory(inventoryId);
        return ResponseEntity.noContent().build();
    }

    // Stock Update Operations
    @PostMapping("/receiving")
    public ResponseEntity<InventoryResponse> updateStockOnReceiving(@Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(inventoryService.updateStockOnReceiving(request));
    }

    @PostMapping("/picking")
    public ResponseEntity<InventoryResponse> updateStockOnPicking(@Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(inventoryService.updateStockOnPicking(request));
    }

    @PostMapping("/reserve")
    public ResponseEntity<InventoryResponse> reserveStock(@Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(inventoryService.reserveStock(request));
    }

    @PostMapping("/release")
    public ResponseEntity<InventoryResponse> releaseReservedStock(@Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(inventoryService.releaseReservedStock(request));
    }

    @PostMapping("/damaged")
    public ResponseEntity<InventoryResponse> markAsDamaged(@Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(inventoryService.markAsDamaged(request));
    }

    // Low Stock Alerts
    @GetMapping("/alerts/low-stock")
    public ResponseEntity<LowStockAlertResponse> getLowStockAlerts() {
        return ResponseEntity.ok(inventoryService.getLowStockAlerts());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryResponse>> getLowStockItems() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    // Inventory Adjustments
    @PostMapping("/adjustments")
    public ResponseEntity<InventoryAdjustmentResponse> createInventoryAdjustment(
            @Valid @RequestBody InventoryAdjustmentRequest request) {
        InventoryAdjustmentResponse created = inventoryService.createInventoryAdjustment(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/adjustments")
    public ResponseEntity<List<InventoryAdjustmentResponse>> getAllAdjustments() {
        return ResponseEntity.ok(inventoryService.getAllAdjustments());
    }

    @GetMapping("/adjustments/{inventoryId}")
    public ResponseEntity<List<InventoryAdjustmentResponse>> getAdjustmentHistory(@PathVariable Long inventoryId) {
        return ResponseEntity.ok(inventoryService.getAdjustmentHistory(inventoryId));
    }

    // Expiring Items
    @GetMapping("/expiring")
    public ResponseEntity<List<InventoryResponse>> getExpiringSoon(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(inventoryService.getExpiringSoon(days));
    }
}
