package com.wms.picking_packing_service.services;

import com.wms.picking_packing_service.dto.PickingPackingDTO;

import java.util.List;

public interface PickingPackingService {
    PickingPackingDTO createPickingTask(PickingPackingDTO dto);

    PickingPackingDTO getById(Long id);

    PickingPackingDTO updateStatus(Long id, String status);

    List<PickingPackingDTO> getAll();

    PickingPackingDTO update(Long id, PickingPackingDTO dto);

    void delete(Long id);
    
    List<PickingPackingDTO> getByOrderId(Long orderId);
    
    List<PickingPackingDTO> getByWorkerId(Long workerId);
    
    List<PickingPackingDTO> getByStatus(String status);
    
    PickingPackingDTO startPicking(Long id);
    
    PickingPackingDTO completePicking(Long id);
    
    PickingPackingDTO startPacking(Long id);
    
    PickingPackingDTO completePacking(Long id);
}

