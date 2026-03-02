package com.wms.workforce_equipment_service.repository;

import com.wms.workforce_equipment_service.model.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for managing MaintenanceLog entities.
 */
@Repository
public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {
    List<MaintenanceLog> findByEquipmentId(Long equipmentId);
}
