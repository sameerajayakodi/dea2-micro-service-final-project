package com.wms.workforce_equipment_service.repository;

import com.wms.workforce_equipment_service.model.EquipmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing EquipmentType entities.
 */
@Repository
public interface EquipmentTypeRepository extends JpaRepository<EquipmentType, Long> {
}
