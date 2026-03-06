package com.wms.workforce_equipment_service.repository;

import com.wms.workforce_equipment_service.model.Worker;
import com.wms.workforce_equipment_service.model.WorkerStorageLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkerStorageLocationRepository extends JpaRepository<WorkerStorageLocation, Long> {
    
    boolean existsByWorkerAndStorageLocationId(Worker worker, Long storageLocationId);
    
    List<WorkerStorageLocation> findByWorkerId(Long workerId);
}
