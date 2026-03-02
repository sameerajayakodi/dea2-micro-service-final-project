package com.wms.picking_packing_service.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wms.picking_packing_service.client.InventoryClient;
import com.wms.picking_packing_service.client.OrderClient;
import com.wms.picking_packing_service.client.WorkerClient;
import com.wms.picking_packing_service.dto.PackingDetailsDTO;
import com.wms.picking_packing_service.dto.PickingItemDTO;
import com.wms.picking_packing_service.dto.PickingPackingDTO;
import com.wms.picking_packing_service.exception.BadRequestException;
import com.wms.picking_packing_service.exception.ResourceNotFoundException;
import com.wms.picking_packing_service.models.PackingDetails;
import com.wms.picking_packing_service.models.PickingItem;
import com.wms.picking_packing_service.models.PickingPacking;
import com.wms.picking_packing_service.repositories.PickingPackingRepository;

@Service
public class PickingPackingServiceImpl implements PickingPackingService {

    private final PickingPackingRepository repository;
    private final OrderClient orderClient;
    private final InventoryClient inventoryClient;
    private final WorkerClient workerClient;

    public PickingPackingServiceImpl(PickingPackingRepository repository,
                                     OrderClient orderClient,
                                     InventoryClient inventoryClient,
                                     WorkerClient workerClient) {
        this.repository = repository;
        this.orderClient = orderClient;
        this.inventoryClient = inventoryClient;
        this.workerClient = workerClient;
    }

    @Override
    @Transactional
    public PickingPackingDTO createPickingTask(PickingPackingDTO dto) {
        // Validate input
        if (dto.getOrderId() == null) {
            throw new BadRequestException("Order ID is required");
        }
        if (dto.getWorkerId() == null) {
            throw new BadRequestException("Worker ID is required");
        }

        // Verify order exists in Order Service
        try {
            orderClient.getOrderById(dto.getOrderId());
        } catch (Exception e) {
            throw new BadRequestException("Order not found with ID: " + dto.getOrderId());
        }

        // Verify worker exists and is available
        try {
            if (!workerClient.isWorkerAvailable(dto.getWorkerId())) {
                throw new BadRequestException("Worker is not available with ID: " + dto.getWorkerId());
            }
        } catch (Exception e) {
            throw new BadRequestException("Worker not found with ID: " + dto.getWorkerId());
        }

        // Create picking packing entity
        PickingPacking entity = new PickingPacking();
        entity.setOrderId(dto.getOrderId());
        entity.setWorkerId(dto.getWorkerId());
        entity.setStatus("PENDING"); // Initial status
        entity.setPickDate(null);
        entity.setPackDate(null);

        // Map items if provided
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            List<PickingItem> items = dto.getItems().stream()
                    .map(itemDTO -> {
                        PickingItem item = new PickingItem();
                        item.setItemId(itemDTO.getItemId());
                        item.setQuantityToPick(itemDTO.getQuantityToPick());
                        item.setQuantityPicked(0);
                        item.setBinNo(itemDTO.getBinNo());
                        item.setPickingPacking(entity);
                        return item;
                    })
                    .collect(Collectors.toList());
            entity.setItems(items);
        }

        PickingPacking saved = repository.save(entity);

        return mapToDTO(saved);
    }

    @Override
    public PickingPackingDTO getById(Long id) {
        PickingPacking entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PickingPacking not found with ID: " + id));
        return mapToDTO(entity);
    }

    @Override
    @Transactional
    public PickingPackingDTO updateStatus(Long id, String status) {
        PickingPacking entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PickingPacking not found with ID: " + id));

        // Validate status
        List<String> validStatuses = List.of("PENDING", "PICKING", "PICKED", "PACKING", "PACKED", "COMPLETED", "CANCELLED");
        if (!validStatuses.contains(status.toUpperCase())) {
            throw new BadRequestException("Invalid status: " + status);
        }

        entity.setStatus(status.toUpperCase());

        // Update timestamps based on status
        if ("PICKING".equals(status.toUpperCase())) {
            entity.setPickDate(LocalDateTime.now());
        } else if ("PACKING".equals(status.toUpperCase())) {
            entity.setPackDate(LocalDateTime.now());
        }

        PickingPacking updated = repository.save(entity);

        // Update order status in Order Service
        try {
            if ("COMPLETED".equals(status.toUpperCase())) {
                orderClient.updateOrderStatus(entity.getOrderId(), "READY_TO_SHIP");
            }
        } catch (Exception e) {
            // Log error but don't fail the operation
            System.err.println("Failed to update order status: " + e.getMessage());
        }

        return mapToDTO(updated);
    }

    @Override
    public List<PickingPackingDTO> getAll() {
        return repository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PickingPackingDTO update(Long id, PickingPackingDTO dto) {
        PickingPacking entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PickingPacking not found with ID: " + id));

        if (dto.getOrderId() != null) {
            entity.setOrderId(dto.getOrderId());
        }
        if (dto.getWorkerId() != null) {
            entity.setWorkerId(dto.getWorkerId());
        }
        if (dto.getPickDate() != null) {
            entity.setPickDate(dto.getPickDate());
        }
        if (dto.getPackDate() != null) {
            entity.setPackDate(dto.getPackDate());
        }
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }

        // Update items if provided
        if (dto.getItems() != null) {
            // Clear existing items
            if (entity.getItems() != null) {
                entity.getItems().clear();
            } else {
                entity.setItems(new ArrayList<>());
            }

            // Add new items
            List<PickingItem> items = dto.getItems().stream()
                    .map(itemDTO -> {
                        PickingItem item = new PickingItem();
                        item.setItemId(itemDTO.getItemId());
                        item.setQuantityToPick(itemDTO.getQuantityToPick());
                        Integer quantityPicked = itemDTO.getQuantityPicked();
                        item.setQuantityPicked(quantityPicked != null ? quantityPicked : 0);
                        item.setBinNo(itemDTO.getBinNo());
                        item.setPickingPacking(entity);
                        return item;
                    })
                    .collect(Collectors.toList());
            entity.getItems().addAll(items);
        }

        // Update packing details if provided
        if (dto.getPackingDetails() != null) {
            // Clear existing packing details
            if (entity.getPackingDetails() != null) {
                entity.getPackingDetails().clear();
            } else {
                entity.setPackingDetails(new ArrayList<>());
            }

            // Add new packing details
            List<PackingDetails> packingDetailsList = dto.getPackingDetails().stream()
                    .map(packingDTO -> {
                        PackingDetails details = new PackingDetails();
                        details.setPackingType(packingDTO.getPackingType());
                        details.setWeight(packingDTO.getWeight());
                        details.setDimensions(packingDTO.getDimensions());
                        details.setPickingPacking(entity);
                        return details;
                    })
                    .collect(Collectors.toList());
            entity.getPackingDetails().addAll(packingDetailsList);
        }

        PickingPacking updated = repository.save(entity);

        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("PickingPacking not found with ID: " + id);
        }

        repository.deleteById(id);
    }

    @Override
    public List<PickingPackingDTO> getByOrderId(Long orderId) {
        return repository.findByOrderId(orderId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PickingPackingDTO> getByWorkerId(Long workerId) {
        return repository.findByWorkerId(workerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PickingPackingDTO> getByStatus(String status) {
        return repository.findByStatus(status.toUpperCase()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PickingPackingDTO startPicking(Long id) {
        PickingPacking entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PickingPacking not found with ID: " + id));

        if (!"PENDING".equals(entity.getStatus())) {
            throw new BadRequestException("Cannot start picking. Current status: " + entity.getStatus());
        }

        entity.setStatus("PICKING");
        entity.setPickDate(LocalDateTime.now());

        PickingPacking updated = repository.save(entity);

        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public PickingPackingDTO completePicking(Long id) {
        PickingPacking entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PickingPacking not found with ID: " + id));

        if (!"PICKING".equals(entity.getStatus())) {
            throw new BadRequestException("Cannot complete picking. Current status: " + entity.getStatus());
        }

        // Verify all items are picked
        if (entity.getItems() != null) {
            boolean allPicked = entity.getItems().stream()
                    .allMatch(item -> item.getQuantityPicked() >= item.getQuantityToPick());
            
            if (!allPicked) {
                throw new BadRequestException("Not all items have been picked");
            }

            // Update inventory for each picked item
            for (PickingItem item : entity.getItems()) {
                try {
                    inventoryClient.updateInventoryAfterPicking(item.getItemId(), item.getQuantityPicked());
                } catch (Exception e) {
                    System.err.println("Failed to update inventory for item " + item.getItemId() + ": " + e.getMessage());
                }
            }
        }

        entity.setStatus("PICKED");

        PickingPacking updated = repository.save(entity);

        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public PickingPackingDTO startPacking(Long id) {
        PickingPacking entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PickingPacking not found with ID: " + id));

        if (!"PICKED".equals(entity.getStatus())) {
            throw new BadRequestException("Cannot start packing. Current status: " + entity.getStatus());
        }

        entity.setStatus("PACKING");
        entity.setPackDate(LocalDateTime.now());

        PickingPacking updated = repository.save(entity);

        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public PickingPackingDTO completePacking(Long id) {
        PickingPacking entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PickingPacking not found with ID: " + id));

        if (!"PACKING".equals(entity.getStatus())) {
            throw new BadRequestException("Cannot complete packing. Current status: " + entity.getStatus());
        }

        // Verify packing details are provided
        if (entity.getPackingDetails() == null || entity.getPackingDetails().isEmpty()) {
            throw new BadRequestException("Packing details are required to complete packing");
        }

        entity.setStatus("COMPLETED");

        PickingPacking updated = repository.save(entity);

        // Update order status to READY_TO_SHIP
        try {
            orderClient.updateOrderStatus(entity.getOrderId(), "READY_TO_SHIP");
        } catch (Exception e) {
            System.err.println("Failed to update order status: " + e.getMessage());
        }

        return mapToDTO(updated);
    }

    private PickingPackingDTO mapToDTO(PickingPacking entity) {
        PickingPackingDTO dto = new PickingPackingDTO();

        dto.setPickPackId(entity.getPickPackId());
        dto.setOrderId(entity.getOrderId());
        dto.setWorkerId(entity.getWorkerId());
        dto.setPickDate(entity.getPickDate());
        dto.setPackDate(entity.getPackDate());
        dto.setStatus(entity.getStatus());

        // Map items
        if (entity.getItems() != null) {
            List<PickingItemDTO> itemDTOs = entity.getItems().stream()
                    .map(item -> {
                        PickingItemDTO itemDTO = new PickingItemDTO();
                        itemDTO.setItemId(item.getItemId());
                        itemDTO.setQuantityToPick(item.getQuantityToPick());
                        itemDTO.setQuantityPicked(item.getQuantityPicked());
                        itemDTO.setBinNo(item.getBinNo());
                        return itemDTO;
                    })
                    .collect(Collectors.toList());
            dto.setItems(itemDTOs);
        }

        // Map packing details
        if (entity.getPackingDetails() != null) {
            List<PackingDetailsDTO> packingDTOs = entity.getPackingDetails().stream()
                    .map(packing -> {
                        PackingDetailsDTO packingDTO = new PackingDetailsDTO();
                        packingDTO.setPackingType(packing.getPackingType());
                        packingDTO.setWeight(packing.getWeight());
                        packingDTO.setDimensions(packing.getDimensions());
                        return packingDTO;
                    })
                    .collect(Collectors.toList());
            dto.setPackingDetails(packingDTOs);
        }

        return dto;
    }
}