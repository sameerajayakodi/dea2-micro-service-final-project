package com.wms.inventory_management_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    @EqualsAndHashCode.Include
    private Long inventoryId;

    @Column(name = "batch_no", nullable = false)
    private String batchNo;

    @Column(name = "quantity_available", nullable = false)
    private Integer quantityAvailable;

    @Column(name = "quantity_reserved", nullable = false)
    private Integer quantityReserved;

    @Column(name = "quantity_damaged", nullable = false)
    private Integer quantityDamaged;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "stock_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private StockStatus stockStatus;

    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold;

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;

    @Column(name = "product_id", nullable = false, columnDefinition = "uuid")
    private UUID productId;

    @Column(name = "location_id", nullable = false)
    private Long locationId;

    @PrePersist
    protected void onCreate() {
        lastUpdated = LocalDateTime.now();
        if (quantityReserved == null) {
            quantityReserved = 0;
        }
        if (quantityDamaged == null) {
            quantityDamaged = 0;
        }
        if (stockStatus == null) {
            stockStatus = StockStatus.AVAILABLE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
        updateStockStatus();
    }

    private void updateStockStatus() {
        int totalAvailable = quantityAvailable - quantityReserved;
        if (quantityDamaged > 0) {
            this.stockStatus = StockStatus.DAMAGED;
        } else if (quantityReserved > 0 && totalAvailable > 0) {
            this.stockStatus = StockStatus.RESERVED;
        } else if (totalAvailable > 0) {
            this.stockStatus = StockStatus.AVAILABLE;
        } else {
            this.stockStatus = StockStatus.OUT_OF_STOCK;
        }
    }

    public enum StockStatus {
        AVAILABLE,
        RESERVED,
        DAMAGED,
        OUT_OF_STOCK
    }
}
