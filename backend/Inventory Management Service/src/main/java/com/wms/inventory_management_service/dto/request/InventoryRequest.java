package com.wms.inventory_management_service.dto.request;

import com.wms.inventory_management_service.model.Inventory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryRequest {

    @NotBlank(message = "Batch number is required")
    private String batchNo;

    @NotNull(message = "Quantity available is required")
    @Positive(message = "Quantity available must be positive")
    private Integer quantityAvailable;

    @PositiveOrZero(message = "Quantity reserved must be positive or zero")
    private Integer quantityReserved;

    @PositiveOrZero(message = "Quantity damaged must be positive or zero")
    private Integer quantityDamaged;

    private LocalDate expiryDate;

    private Integer lowStockThreshold;

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Location ID is required")
    private Long locationId;
}
