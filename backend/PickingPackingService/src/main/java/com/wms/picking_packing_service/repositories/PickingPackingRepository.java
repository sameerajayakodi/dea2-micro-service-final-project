package com.wms.picking_packing_service.repositories;

import com.wms.picking_packing_service.models.PickingPacking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PickingPackingRepository
        extends JpaRepository<PickingPacking, Long> {
    
    List<PickingPacking> findByOrderId(Long orderId);
    
    List<PickingPacking> findByWorkerId(Long workerId);
    
    List<PickingPacking> findByStatus(String status);
    
    Optional<PickingPacking> findByOrderIdAndStatus(Long orderId, String status);
}
