package com.wms.picking_packing_service.services;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wms.picking_packing_service.client.InventoryClient;
import com.wms.picking_packing_service.client.OrderClient;
import com.wms.picking_packing_service.dto.PickingPackingDTO;
import com.wms.picking_packing_service.exception.BadRequestException;
import com.wms.picking_packing_service.models.PickingItem;
import com.wms.picking_packing_service.models.PickingPacking;
import com.wms.picking_packing_service.repositories.PickingPackingRepository;

@Service
public class PickingPackingWorkflowService {

    private static final Logger log = LoggerFactory.getLogger(PickingPackingWorkflowService.class);
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_PICKING = "PICKING";
    private static final String STATUS_PICKED = "PICKED";
    private static final String STATUS_PACKING = "PACKING";
    private static final String STATUS_COMPLETED = "COMPLETED";

    private final PickingPackingRepository repository;
    private final InventoryClient inventoryClient;
    private final OrderClient orderClient;
    private final PickingPackingMapper mapper;
    private final PickingPackingCrudService crudService;

    public PickingPackingWorkflowService(PickingPackingRepository repository,
                                        InventoryClient inventoryClient,
                                        OrderClient orderClient,
                                        PickingPackingMapper mapper,
                                        PickingPackingCrudService crudService) {
        this.repository = repository;
        this.inventoryClient = inventoryClient;
        this.orderClient = orderClient;
        this.mapper = mapper;
        this.crudService = crudService;
    }

    @Transactional
    public PickingPackingDTO startPicking(Long id) {
        PickingPacking entity = crudService.getEntityById(id);

        if (!STATUS_PENDING.equals(crudService.normalizeStatus(entity.getStatus()))) {
            throw new BadRequestException("Cannot start picking. Current status: " + entity.getStatus());
        }

        entity.setStatus(STATUS_PICKING);
        entity.setPickDate(LocalDateTime.now());

        PickingPacking updated = repository.save(entity);
        return mapper.toDTO(updated);
    }

    @Transactional
    public PickingPackingDTO completePicking(Long id) {
        PickingPacking entity = crudService.getEntityById(id);

        if (!STATUS_PICKING.equals(crudService.normalizeStatus(entity.getStatus()))) {
            throw new BadRequestException("Cannot complete picking. Current status: " + entity.getStatus());
        }

        if (entity.getItems() != null) {
            boolean allPicked = entity.getItems().stream()
                    .allMatch(item -> item.getQuantityPicked() >= item.getQuantityToPick());

            if (!allPicked) {
                throw new BadRequestException("Not all items have been picked");
            }

            for (PickingItem item : entity.getItems()) {
                try {
                    inventoryClient.updateInventoryAfterPicking(item.getItemId(), item.getQuantityPicked());
                } catch (Exception e) {
                    log.warn("Failed to update inventory for itemId={}: {}", item.getItemId(), e.getMessage());
                }
            }
        }

        entity.setStatus(STATUS_PICKED);
        PickingPacking updated = repository.save(entity);
        return mapper.toDTO(updated);
    }

    @Transactional
    public PickingPackingDTO startPacking(Long id) {
        PickingPacking entity = crudService.getEntityById(id);

        if (!STATUS_PICKED.equals(crudService.normalizeStatus(entity.getStatus()))) {
            throw new BadRequestException("Cannot start packing. Current status: " + entity.getStatus());
        }

        entity.setStatus(STATUS_PACKING);
        entity.setPackDate(LocalDateTime.now());

        PickingPacking updated = repository.save(entity);
        return mapper.toDTO(updated);
    }

    @Transactional
    public PickingPackingDTO completePacking(Long id) {
        PickingPacking entity = crudService.getEntityById(id);

        if (!STATUS_PACKING.equals(crudService.normalizeStatus(entity.getStatus()))) {
            throw new BadRequestException("Cannot complete packing. Current status: " + entity.getStatus());
        }

        if (entity.getPackingDetails() == null || entity.getPackingDetails().isEmpty()) {
            throw new BadRequestException("Packing details are required to complete packing");
        }

        entity.setStatus(STATUS_COMPLETED);
        PickingPacking updated = repository.save(entity);

        try {
            orderClient.updateOrderStatus(entity.getOrderId(), "READY_TO_SHIP");
        } catch (Exception e) {
            log.warn("Failed to update order status for orderId={}: {}", entity.getOrderId(), e.getMessage());
        }

        return mapper.toDTO(updated);
    }
}
