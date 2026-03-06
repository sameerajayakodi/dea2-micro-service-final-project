package com.wms.inventory_management_service.repository;

import com.wms.inventory_management_service.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByProductId(UUID productId);
    List<Inventory> findByLocationId(Long locationId);
    Optional<Inventory> findByBatchNo(String batchNo);
    List<Inventory> findByStockStatus(Inventory.StockStatus stockStatus);
    List<Inventory> findByExpiryDateBefore(LocalDate date);
    List<Inventory> findByExpiryDateBetween(LocalDate startDate, LocalDate endDate);
}
