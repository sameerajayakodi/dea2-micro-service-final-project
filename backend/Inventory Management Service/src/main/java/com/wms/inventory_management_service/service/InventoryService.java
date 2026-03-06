package com.wms.inventory_management_service.service;

import com.wms.inventory_management_service.dto.request.InventoryAdjustmentRequest;
import com.wms.inventory_management_service.dto.request.InventoryRequest;
import com.wms.inventory_management_service.dto.request.StockUpdateRequest;
import com.wms.inventory_management_service.dto.response.InventoryAdjustmentResponse;
import com.wms.inventory_management_service.dto.response.InventoryResponse;
import com.wms.inventory_management_service.dto.response.LowStockAlertResponse;

import java.util.List;
import java.util.UUID;

public interface InventoryService {

    List<InventoryResponse> getAllInventories();

    InventoryResponse getInventoryById(Long inventoryId);

    List<InventoryResponse> getInventoriesByProductId(UUID productId);

    List<InventoryResponse> getInventoriesByLocationId(Long locationId);

    InventoryResponse createInventory(InventoryRequest request);

    InventoryResponse updateInventory(Long inventoryId, InventoryRequest request);

    void deleteInventory(Long inventoryId);

    InventoryResponse updateStockOnReceiving(StockUpdateRequest request);

    InventoryResponse updateStockOnPicking(StockUpdateRequest request);

    InventoryResponse reserveStock(StockUpdateRequest request);

    InventoryResponse releaseReservedStock(StockUpdateRequest request);

    InventoryResponse markAsDamaged(StockUpdateRequest request);

    LowStockAlertResponse getLowStockAlerts();

    List<InventoryResponse> getLowStockItems();

    InventoryAdjustmentResponse createInventoryAdjustment(InventoryAdjustmentRequest request);

    List<InventoryAdjustmentResponse> getAdjustmentHistory(Long inventoryId);

    List<InventoryAdjustmentResponse> getAllAdjustments();

    List<InventoryResponse> getExpiringSoon(int days);
}
