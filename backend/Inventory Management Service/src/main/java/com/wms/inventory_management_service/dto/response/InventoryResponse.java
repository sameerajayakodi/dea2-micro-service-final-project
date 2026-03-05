package com.wms.inventory_management_service.dto.response;

import com.wms.inventory_management_service.model.Inventory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {

    private Long inventoryId;
    private String batchNo;
    private Integer quantityAvailable;
    private Integer quantityReserved;
    private Integer quantityDamaged;
    private Integer totalAvailable;
    private LocalDate expiryDate;
    private Inventory.StockStatus stockStatus;
    private Integer lowStockThreshold;
    private Boolean isLowStock;
    private UUID productId;
    private String productName;
    private Long locationId;
    private String zone;
    private String rackNo;
    private String binNo;
    private LocalDateTime lastUpdated;
}
