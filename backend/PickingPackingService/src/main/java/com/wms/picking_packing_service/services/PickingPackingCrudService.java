package com.wms.picking_packing_service.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wms.picking_packing_service.client.OrderClient;
import com.wms.picking_packing_service.client.WorkerClient;
import com.wms.picking_packing_service.dto.PickingPackingDTO;
import com.wms.picking_packing_service.exception.BadRequestException;
import com.wms.picking_packing_service.exception.ResourceNotFoundException;
import com.wms.picking_packing_service.models.PickingPacking;
import com.wms.picking_packing_service.repositories.PickingPackingRepository;

@Service
public class PickingPackingCrudService {

    private static final Logger log = LoggerFactory.getLogger(PickingPackingCrudService.class);
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_PICKING = "PICKING";
    private static final String STATUS_PICKED = "PICKED";
    private static final String STATUS_PACKING = "PACKING";
    private static final String STATUS_COMPLETED = "COMPLETED";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final Set<String> VALID_STATUSES = Set.of(
            STATUS_PENDING,
            STATUS_PICKING,
            STATUS_PICKED,
            STATUS_PACKING,
            STATUS_COMPLETED,
            STATUS_CANCELLED
    );

    private final PickingPackingRepository repository;
    private final OrderClient orderClient;
    private final WorkerClient workerClient;
    private final PickingPackingMapper mapper;

    public PickingPackingCrudService(PickingPackingRepository repository,
                                     OrderClient orderClient,
                                     WorkerClient workerClient,
                                     PickingPackingMapper mapper) {
        this.repository = repository;
        this.orderClient = orderClient;
        this.workerClient = workerClient;
        this.mapper = mapper;
    }

    @Transactional
    public PickingPackingDTO createPickingTask(PickingPackingDTO dto) {
        if (dto.getOrderId() == null) {
            throw new BadRequestException("Order ID is required");
        }
        if (dto.getWorkerId() == null) {
            throw new BadRequestException("Worker ID is required");
        }

        try {
            orderClient.getOrderById(dto.getOrderId());
        } catch (Exception e) {
            throw new BadRequestException("Order not found with ID: " + dto.getOrderId());
        }

        if (!workerClient.isWorkerAvailable(dto.getWorkerId())) {
            throw new BadRequestException("Worker is not available with ID: " + dto.getWorkerId());
        }

        PickingPacking entity = new PickingPacking();
        entity.setOrderId(dto.getOrderId());
        entity.setWorkerId(dto.getWorkerId());
        entity.setStatus(STATUS_PENDING);
        entity.setPickDate(null);
        entity.setPackDate(null);

        mapper.mapItemsForCreate(entity, dto.getItems());

        PickingPacking saved = repository.save(entity);
        return mapper.toDTO(saved);
    }

    public PickingPackingDTO getById(Long id) {
        return mapper.toDTO(getEntityById(id));
    }

    public List<PickingPackingDTO> getAll() {
        return repository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PickingPackingDTO update(Long id, PickingPackingDTO dto) {
        PickingPacking entity = getEntityById(id);

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
            entity.setStatus(normalizeStatus(dto.getStatus()));
        }

        mapper.replaceItems(entity, dto.getItems());
        mapper.replacePackingDetails(entity, dto.getPackingDetails());

        PickingPacking updated = repository.save(entity);
        return mapper.toDTO(updated);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("PickingPacking not found with ID: " + id);
        }
        repository.deleteById(id);
    }

    @Transactional
    public PickingPackingDTO updateStatus(Long id, String status) {
        PickingPacking entity = getEntityById(id);
        String normalizedStatus = normalizeStatus(status);
        entity.setStatus(normalizedStatus);

        if (STATUS_PICKING.equals(normalizedStatus)) {
            entity.setPickDate(LocalDateTime.now());
        } else if (STATUS_PACKING.equals(normalizedStatus)) {
            entity.setPackDate(LocalDateTime.now());
        }

        PickingPacking updated = repository.save(entity);

        try {
            if (STATUS_COMPLETED.equals(normalizedStatus)) {
                orderClient.updateOrderStatus(entity.getOrderId(), "READY_TO_SHIP");
            }
        } catch (Exception e) {
            log.warn("Failed to update order status for orderId={}: {}", entity.getOrderId(), e.getMessage());
        }

        return mapper.toDTO(updated);
    }

    public List<PickingPackingDTO> getByOrderId(Long orderId) {
        return repository.findByOrderId(orderId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<PickingPackingDTO> getByWorkerId(Long workerId) {
        return repository.findByWorkerId(workerId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<PickingPackingDTO> getByStatus(String status) {
        return repository.findByStatus(normalizeStatus(status)).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new BadRequestException("Status is required");
        }

        String normalizedStatus = status.trim().toUpperCase();
        if ("PACKED".equals(normalizedStatus)) {
            normalizedStatus = STATUS_COMPLETED;
        }

        if (!VALID_STATUSES.contains(normalizedStatus)) {
            throw new BadRequestException("Invalid status: " + status);
        }

        return normalizedStatus;
    }

    public PickingPacking getEntityById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PickingPacking not found with ID: " + id));
    }
}
