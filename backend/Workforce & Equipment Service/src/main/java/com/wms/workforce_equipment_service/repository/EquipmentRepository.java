package com.wms.workforce_equipment_service.repository;

import com.wms.workforce_equipment_service.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing Equipment entities.
 */
@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
}
