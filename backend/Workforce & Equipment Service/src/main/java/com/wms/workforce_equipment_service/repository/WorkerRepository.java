package com.wms.workforce_equipment_service.repository;

import com.wms.workforce_equipment_service.model.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing Worker entities.
 */
@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {
}
