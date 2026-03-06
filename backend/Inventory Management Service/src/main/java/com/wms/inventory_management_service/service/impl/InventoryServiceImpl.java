package com.wms.inventory_management_service.service.impl;

import com.wms.inventory_management_service.dto.request.InventoryAdjustmentRequest;
import com.wms.inventory_management_service.dto.request.InventoryRequest;
import com.wms.inventory_management_service.dto.request.StockUpdateRequest;
import com.wms.inventory_management_service.dto.response.InventoryAdjustmentResponse;
import com.wms.inventory_management_service.dto.response.InventoryResponse;
import com.wms.inventory_management_service.dto.response.LowStockAlertResponse;
import com.wms.inventory_management_service.exception.BadRequestException;
import com.wms.inventory_management_service.exception.ConflictException;
import com.wms.inventory_management_service.exception.ResourceNotFoundException;
import com.wms.inventory_management_service.model.Inventory;
import com.wms.inventory_management_service.model.InventoryAdjustment;
import com.wms.inventory_management_service.repository.InventoryAdjustmentRepository;
import com.wms.inventory_management_service.repository.InventoryRepository;
import com.wms.inventory_management_service.service.InventoryService;
import com.wms.inventory_management_service.service.client.ProductCatalogClient;
import com.wms.inventory_management_service.service.client.StorageLocationClient;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryAdjustmentRepository inventoryAdjustmentRepository;
    private final ProductCatalogClient productCatalogClient;
    private final StorageLocationClient storageLocationClient;

    @Override
    public List<InventoryResponse> getAllInventories() {
        return inventoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public InventoryResponse getInventoryById(Long inventoryId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "inventoryId", inventoryId));
        return mapToResponse(inventory);
    }

    @Override
    public List<InventoryResponse> getInventoriesByProductId(UUID productId) {
        return inventoryRepository.findByProductId(productId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryResponse> getInventoriesByLocationId(Long locationId) {
        return inventoryRepository.findByLocationId(locationId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public InventoryResponse createInventory(InventoryRequest request) {
        inventoryRepository.findByBatchNo(request.getBatchNo())
                .ifPresent(inventory -> {
                    throw new ConflictException("Inventory with batch number '" + request.getBatchNo() + "' already exists");
                });

        productCatalogClient.getProductById(request.getProductId());
        storageLocationClient.getStorageLocationById(request.getLocationId());

        Inventory inventory = new Inventory();
        inventory.setBatchNo(request.getBatchNo());
        inventory.setQuantityAvailable(request.getQuantityAvailable());
        inventory.setQuantityReserved(request.getQuantityReserved() != null ? request.getQuantityReserved() : 0);
        inventory.setQuantityDamaged(request.getQuantityDamaged() != null ? request.getQuantityDamaged() : 0);
        inventory.setExpiryDate(request.getExpiryDate());
        inventory.setLowStockThreshold(request.getLowStockThreshold());
        inventory.setProductId(request.getProductId());
        inventory.setLocationId(request.getLocationId());

        Inventory saved = inventoryRepository.save(inventory);
        return mapToResponse(saved);
    }

    @Transactional
    @Override
    public InventoryResponse updateInventory(Long inventoryId, InventoryRequest request) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "inventoryId", inventoryId));

        inventoryRepository.findByBatchNo(request.getBatchNo())
                .ifPresent(existingInventory -> {
                    if (!existingInventory.getInventoryId().equals(inventoryId)) {
                        throw new ConflictException("Inventory with batch number '" + request.getBatchNo() + "' already exists");
                    }
                });

        productCatalogClient.getProductById(request.getProductId());
        storageLocationClient.getStorageLocationById(request.getLocationId());

        inventory.setBatchNo(request.getBatchNo());
        inventory.setQuantityAvailable(request.getQuantityAvailable());
        inventory.setQuantityReserved(request.getQuantityReserved() != null ? request.getQuantityReserved() : inventory.getQuantityReserved());
        inventory.setQuantityDamaged(request.getQuantityDamaged() != null ? request.getQuantityDamaged() : inventory.getQuantityDamaged());
        inventory.setExpiryDate(request.getExpiryDate());
        inventory.setLowStockThreshold(request.getLowStockThreshold());
        inventory.setProductId(request.getProductId());
        inventory.setLocationId(request.getLocationId());

        Inventory saved = inventoryRepository.save(inventory);
        return mapToResponse(saved);
    }

    @Transactional
    @Override
    public void deleteInventory(Long inventoryId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "inventoryId", inventoryId));
        inventoryRepository.delete(inventory);
    }

    @Transactional
    @Override
    public InventoryResponse updateStockOnReceiving(StockUpdateRequest request) {
        Inventory inventory = inventoryRepository.findById(request.getInventoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "inventoryId", request.getInventoryId()));

        inventory.setQuantityAvailable(inventory.getQuantityAvailable() + request.getQuantity());

        Inventory saved = inventoryRepository.save(inventory);
        return mapToResponse(saved);
    }

    @Transactional
    @Override
    public InventoryResponse updateStockOnPicking(StockUpdateRequest request) {
        Inventory inventory = inventoryRepository.findById(request.getInventoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "inventoryId", request.getInventoryId()));

        if (inventory.getQuantityReserved() < request.getQuantity()) {
            throw new BadRequestException("Insufficient reserved quantity. Available reserved: " + inventory.getQuantityReserved());
        }

        inventory.setQuantityReserved(inventory.getQuantityReserved() - request.getQuantity());
        inventory.setQuantityAvailable(inventory.getQuantityAvailable() - request.getQuantity());

        Inventory saved = inventoryRepository.save(inventory);
        return mapToResponse(saved);
    }

    @Transactional
    @Override
    public InventoryResponse reserveStock(StockUpdateRequest request) {
        Inventory inventory = inventoryRepository.findById(request.getInventoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "inventoryId", request.getInventoryId()));

        int available = inventory.getQuantityAvailable() - inventory.getQuantityReserved();
        if (available < request.getQuantity()) {
            throw new BadRequestException("Insufficient available stock. Available: " + available);
        }

        inventory.setQuantityReserved(inventory.getQuantityReserved() + request.getQuantity());

        Inventory saved = inventoryRepository.save(inventory);
        return mapToResponse(saved);
    }

    @Transactional
    @Override
    public InventoryResponse releaseReservedStock(StockUpdateRequest request) {
        Inventory inventory = inventoryRepository.findById(request.getInventoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "inventoryId", request.getInventoryId()));

        if (inventory.getQuantityReserved() < request.getQuantity()) {
            throw new BadRequestException("Insufficient reserved quantity. Available reserved: " + inventory.getQuantityReserved());
        }

        inventory.setQuantityReserved(inventory.getQuantityReserved() - request.getQuantity());

        Inventory saved = inventoryRepository.save(inventory);
        return mapToResponse(saved);
    }

    @Transactional
    @Override
    public InventoryResponse markAsDamaged(StockUpdateRequest request) {
        Inventory inventory = inventoryRepository.findById(request.getInventoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "inventoryId", request.getInventoryId()));

        int available = inventory.getQuantityAvailable() - inventory.getQuantityReserved();
        if (available < request.getQuantity()) {
            throw new BadRequestException("Insufficient available stock to mark as damaged. Available: " + available);
        }

        inventory.setQuantityDamaged(inventory.getQuantityDamaged() + request.getQuantity());
        inventory.setQuantityAvailable(inventory.getQuantityAvailable() - request.getQuantity());

        Inventory saved = inventoryRepository.save(inventory);
        return mapToResponse(saved);
    }

    @Override
    public LowStockAlertResponse getLowStockAlerts() {
        List<Inventory> allInventories = inventoryRepository.findAll();
        List<InventoryResponse> lowStockItems = allInventories.stream()
                .filter(inv -> {
                    int totalAvailable = inv.getQuantityAvailable() - inv.getQuantityReserved();
                    return inv.getLowStockThreshold() != null && totalAvailable <= inv.getLowStockThreshold();
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        String alertMessage = lowStockItems.isEmpty()
                ? "No low stock alerts"
                : String.format("Found %d items with low stock levels", lowStockItems.size());

        return new LowStockAlertResponse(lowStockItems, lowStockItems.size(), alertMessage);
    }

    @Override
    public List<InventoryResponse> getLowStockItems() {
        List<Inventory> allInventories = inventoryRepository.findAll();
        return allInventories.stream()
                .filter(inv -> {
                    int totalAvailable = inv.getQuantityAvailable() - inv.getQuantityReserved();
                    return inv.getLowStockThreshold() != null && totalAvailable <= inv.getLowStockThreshold();
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public InventoryAdjustmentResponse createInventoryAdjustment(InventoryAdjustmentRequest request) {
        Inventory inventory = inventoryRepository.findById(request.getInventoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "inventoryId", request.getInventoryId()));

        InventoryAdjustment adjustment = new InventoryAdjustment();
        adjustment.setInventory(inventory);
        adjustment.setAdjustmentType(request.getAdjustmentType());
        adjustment.setQuantityChange(request.getQuantityChange());
        adjustment.setReason(request.getReason());
        adjustment.setAdjustedBy(request.getAdjustedBy());

        // Apply adjustment based on type
        switch (request.getAdjustmentType()) {
            case INCREASE, RETURN:
                inventory.setQuantityAvailable(inventory.getQuantityAvailable() + request.getQuantityChange());
                break;
            case DECREASE, LOSS:
                int available = inventory.getQuantityAvailable() - inventory.getQuantityReserved();
                if (available < request.getQuantityChange()) {
                    throw new BadRequestException("Insufficient available stock. Available: " + available);
                }
                inventory.setQuantityAvailable(inventory.getQuantityAvailable() - request.getQuantityChange());
                break;
            case DAMAGE:
                available = inventory.getQuantityAvailable() - inventory.getQuantityReserved();
                if (available < request.getQuantityChange()) {
                    throw new BadRequestException("Insufficient available stock to mark as damaged. Available: " + available);
                }
                inventory.setQuantityDamaged(inventory.getQuantityDamaged() + request.getQuantityChange());
                inventory.setQuantityAvailable(inventory.getQuantityAvailable() - request.getQuantityChange());
                break;
            case CORRECTION:
                inventory.setQuantityAvailable(request.getQuantityChange());
                break;
        }

        inventoryRepository.save(inventory);
        InventoryAdjustment saved = inventoryAdjustmentRepository.save(adjustment);
        return mapAdjustmentToResponse(saved);
    }

    @Override
    public List<InventoryAdjustmentResponse> getAdjustmentHistory(Long inventoryId) {
        return inventoryAdjustmentRepository.findByInventoryInventoryId(inventoryId)
                .stream()
                .map(this::mapAdjustmentToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryAdjustmentResponse> getAllAdjustments() {
        return inventoryAdjustmentRepository.findAll()
                .stream()
                .map(this::mapAdjustmentToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryResponse> getExpiringSoon(int days) {
        List<Inventory> allInventories = inventoryRepository.findAll();
        return allInventories.stream()
                .filter(inv -> inv.getExpiryDate() != null)
                .filter(inv -> {
                    long daysUntilExpiry = java.time.temporal.ChronoUnit.DAYS.between(
                            java.time.LocalDate.now(), inv.getExpiryDate());
                    return daysUntilExpiry >= 0 && daysUntilExpiry <= days;
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private InventoryResponse mapToResponse(Inventory inventory) {
        int totalAvailable = inventory.getQuantityAvailable() - inventory.getQuantityReserved();
        boolean isLowStock = inventory.getLowStockThreshold() != null &&
                totalAvailable <= inventory.getLowStockThreshold();
        String productName = resolveProductName(inventory.getProductId());
        StorageLocationClient.StorageLocationDetails locationDetails = resolveLocationDetails(inventory.getLocationId());

        return new InventoryResponse(
                inventory.getInventoryId(),
                inventory.getBatchNo(),
                inventory.getQuantityAvailable(),
                inventory.getQuantityReserved(),
                inventory.getQuantityDamaged(),
                totalAvailable,
                inventory.getExpiryDate(),
                inventory.getStockStatus(),
                inventory.getLowStockThreshold(),
                isLowStock,
                inventory.getProductId(),
                productName,
                inventory.getLocationId(),
                locationDetails != null ? locationDetails.zone() : null,
                locationDetails != null ? locationDetails.rackNo() : null,
                locationDetails != null ? locationDetails.binNo() : null,
                inventory.getLastUpdated()
        );
    }

    private StorageLocationClient.StorageLocationDetails resolveLocationDetails(Long locationId) {
        try {
            return storageLocationClient.getStorageLocationById(locationId);
        } catch (ResourceNotFoundException ex) {
            return null;
        } catch (Exception ex) {
            return null;
        }
    }

    private InventoryAdjustmentResponse mapAdjustmentToResponse(InventoryAdjustment adjustment) {
        return new InventoryAdjustmentResponse(
                adjustment.getAdjustmentId(),
                adjustment.getAdjustmentType(),
                adjustment.getQuantityChange(),
                adjustment.getReason(),
                adjustment.getAdjustedBy(),
                adjustment.getInventory().getInventoryId(),
                adjustment.getInventory().getBatchNo(),
                resolveProductName(adjustment.getInventory().getProductId()),
                adjustment.getCreatedAt()
        );
    }

    private String resolveProductName(UUID productId) {
        try {
            ProductCatalogClient.ProductCatalogProduct product = productCatalogClient.getProductById(productId);
            return product != null && product.name() != null ? product.name() : "Unknown Product";
        } catch (ResourceNotFoundException ex) {
            return "Product Not Found";
        } catch (Exception ex) {
            return "Product Service Unavailable";
        }
    }
}
