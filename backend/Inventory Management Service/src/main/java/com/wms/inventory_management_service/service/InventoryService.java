package com.wms.inventory_management_service.service;

import com.wms.inventory_management_service.dto.request.InventoryAdjustmentRequest;
import com.wms.inventory_management_service.dto.request.InventoryRequest;
import com.wms.inventory_management_service.dto.request.StockUpdateRequest;
import com.wms.inventory_management_service.dto.response.InventoryAdjustmentResponse;
import com.wms.inventory_management_service.dto.response.InventoryResponse;
import com.wms.inventory_management_service.dto.response.LowStockAlertResponse;
import com.wms.inventory_management_service.exception.BadRequestException;
import com.wms.inventory_management_service.exception.ConflictException;
import com.wms.inventory_management_service.exception.ResourceNotFoundException;
import com.wms.inventory_management_service.exception.ServiceException;
import com.wms.inventory_management_service.model.Inventory;
import com.wms.inventory_management_service.model.InventoryAdjustment;
import com.wms.inventory_management_service.model.StorageLocation;
import com.wms.inventory_management_service.repository.InventoryAdjustmentRepository;
import com.wms.inventory_management_service.repository.InventoryRepository;
import com.wms.inventory_management_service.repository.StorageLocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final StorageLocationRepository storageLocationRepository;
    private final InventoryAdjustmentRepository inventoryAdjustmentRepository;
    private final ProductCatalogClient productCatalogClient;

    public List<InventoryResponse> getAllInventories() {
        return inventoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public InventoryResponse getInventoryById(Long inventoryId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "inventoryId", inventoryId));
        return mapToResponse(inventory);
    }

    public List<InventoryResponse> getInventoriesByProductId(UUID productId) {
        return inventoryRepository.findByProductId(productId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<InventoryResponse> getInventoriesByLocationId(Long locationId) {
        return inventoryRepository.findByStorageLocationLocationId(locationId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InventoryResponse createInventory(InventoryRequest request) {
        inventoryRepository.findByBatchNo(request.getBatchNo())
                .ifPresent(inventory -> {
                    throw new ConflictException("Inventory with batch number '" + request.getBatchNo() + "' already exists");
                });

        productCatalogClient.getProductById(request.getProductId());

        StorageLocation location = storageLocationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("StorageLocation", "locationId", request.getLocationId()));

        Inventory inventory = new Inventory();
        inventory.setBatchNo(request.getBatchNo());
        inventory.setQuantityAvailable(request.getQuantityAvailable());
        inventory.setQuantityReserved(request.getQuantityReserved() != null ? request.getQuantityReserved() : 0);
        inventory.setQuantityDamaged(request.getQuantityDamaged() != null ? request.getQuantityDamaged() : 0);
        inventory.setExpiryDate(request.getExpiryDate());
        inventory.setLowStockThreshold(request.getLowStockThreshold());
        inventory.setProductId(request.getProductId());
        inventory.setStorageLocation(location);

        Inventory saved = inventoryRepository.save(inventory);
        return mapToResponse(saved);
    }

    @Transactional
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

        StorageLocation location = storageLocationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("StorageLocation", "locationId", request.getLocationId()));

        inventory.setBatchNo(request.getBatchNo());
        inventory.setQuantityAvailable(request.getQuantityAvailable());
        inventory.setQuantityReserved(request.getQuantityReserved() != null ? request.getQuantityReserved() : inventory.getQuantityReserved());
        inventory.setQuantityDamaged(request.getQuantityDamaged() != null ? request.getQuantityDamaged() : inventory.getQuantityDamaged());
        inventory.setExpiryDate(request.getExpiryDate());
        inventory.setLowStockThreshold(request.getLowStockThreshold());
        inventory.setProductId(request.getProductId());
        inventory.setStorageLocation(location);

        Inventory saved = inventoryRepository.save(inventory);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteInventory(Long inventoryId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "inventoryId", inventoryId));
        inventoryRepository.delete(inventory);
    }

    @Transactional
    public InventoryResponse updateStockOnReceiving(StockUpdateRequest request) {
        Inventory inventory = inventoryRepository.findById(request.getInventoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "inventoryId", request.getInventoryId()));

        inventory.setQuantityAvailable(inventory.getQuantityAvailable() + request.getQuantity());

        Inventory saved = inventoryRepository.save(inventory);
        return mapToResponse(saved);
    }

    @Transactional
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

    public List<InventoryAdjustmentResponse> getAdjustmentHistory(Long inventoryId) {
        return inventoryAdjustmentRepository.findByInventoryInventoryId(inventoryId)
                .stream()
                .map(this::mapAdjustmentToResponse)
                .collect(Collectors.toList());
    }

    public List<InventoryAdjustmentResponse> getAllAdjustments() {
        return inventoryAdjustmentRepository.findAll()
                .stream()
                .map(this::mapAdjustmentToResponse)
                .collect(Collectors.toList());
    }

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
                inventory.getStorageLocation().getLocationId(),
                inventory.getStorageLocation().getZone(),
                inventory.getStorageLocation().getRackNo(),
                inventory.getStorageLocation().getBinNo(),
                inventory.getLastUpdated()
        );
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
