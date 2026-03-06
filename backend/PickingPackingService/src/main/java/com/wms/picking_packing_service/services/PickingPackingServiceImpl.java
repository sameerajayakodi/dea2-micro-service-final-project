package com.wms.picking_packing_service.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.wms.picking_packing_service.dto.PickingPackingDTO;

@Service
public class PickingPackingServiceImpl implements PickingPackingService {

    private final PickingPackingCrudService crudService;
    private final PickingPackingWorkflowService workflowService;

    public PickingPackingServiceImpl(PickingPackingCrudService crudService,
                                     PickingPackingWorkflowService workflowService) {
        this.crudService = crudService;
        this.workflowService = workflowService;
    }

    @Override
    public PickingPackingDTO createPickingTask(PickingPackingDTO dto) {
        return crudService.createPickingTask(dto);
    }

    @Override
    public PickingPackingDTO getById(Long id) {
        return crudService.getById(id);
    }

    @Override
    public PickingPackingDTO updateStatus(Long id, String status) {
        return crudService.updateStatus(id, status);
    }

    @Override
    public List<PickingPackingDTO> getAll() {
        return crudService.getAll();
    }

    @Override
    public PickingPackingDTO update(Long id, PickingPackingDTO dto) {
        return crudService.update(id, dto);
    }

    @Override
    public void delete(Long id) {
        crudService.delete(id);
    }

    @Override
    public List<PickingPackingDTO> getByOrderId(UUID orderId) {
        return crudService.getByOrderId(orderId);
    }

    @Override
    public List<PickingPackingDTO> getByWorkerId(Long workerId) {
        return crudService.getByWorkerId(workerId);
    }

    @Override
    public List<PickingPackingDTO> getByStatus(String status) {
        return crudService.getByStatus(status);
    }

    @Override
    public PickingPackingDTO startPicking(Long id) {
        return workflowService.startPicking(id);
    }

    @Override
    public PickingPackingDTO completePicking(Long id) {
        return workflowService.completePicking(id);
    }

    @Override
    public PickingPackingDTO startPacking(Long id) {
        return workflowService.startPacking(id);
    }

    @Override
    public PickingPackingDTO completePacking(Long id) {
        return workflowService.completePacking(id);
    }
}