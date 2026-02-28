package com.wms.workforce_equipment_service.repository;

import com.wms.workforce_equipment_service.model.EquipmentAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for managing EquipmentAssignment entities.
 */
@Repository
public interface EquipmentAssignmentRepository extends JpaRepository<EquipmentAssignment, Long> {
    List<EquipmentAssignment> findByEquipmentId(Long equipmentId);
    List<EquipmentAssignment> findByWorkerId(Long workerId);
}
