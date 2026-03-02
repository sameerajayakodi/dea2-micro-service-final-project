package com.wms.workforce_equipment_service.service;

import com.wms.workforce_equipment_service.client.InventoryServiceClient;
import com.wms.workforce_equipment_service.dto.request.WorkerStorageLocationRequest;
import com.wms.workforce_equipment_service.dto.response.StorageLocationResponse;
import com.wms.workforce_equipment_service.dto.response.WorkerStorageLocationResponse;
import com.wms.workforce_equipment_service.exception.ConflictException;
import com.wms.workforce_equipment_service.exception.ResourceNotFoundException;
import com.wms.workforce_equipment_service.model.Worker;
import com.wms.workforce_equipment_service.model.WorkerStorageLocation;
import com.wms.workforce_equipment_service.repository.WorkerRepository;
import com.wms.workforce_equipment_service.repository.WorkerStorageLocationRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkerStorageLocationService implements IWorkerStorageLocationService {

    private final WorkerStorageLocationRepository workerStorageLocationRepository;
    private final WorkerRepository workerRepository;
    private final InventoryServiceClient inventoryServiceClient;

    @Override
    @Transactional
    public WorkerStorageLocationResponse assignWorkerToStorageLocation(WorkerStorageLocationRequest request) {
        log.info("Assigning worker {} to storage location {}", request.getWorkerId(), request.getStorageLocationId());

        //validate Worker exists
        Worker worker = workerRepository.findById(request.getWorkerId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id: " + request.getWorkerId()));

        //validate Storage Location exists via Feign Client
        try {
            StorageLocationResponse locationResponse = inventoryServiceClient.getStorageLocationById(request.getStorageLocationId());
            if (locationResponse == null) {
                // if storage location is not found in inventory service
                throw new ResourceNotFoundException("Storage Location not found with id: " + request.getStorageLocationId());
            }
        } catch (FeignException.NotFound e) {
            log.error("Storage Location {} not found in Inventory Service", request.getStorageLocationId());
            throw new ResourceNotFoundException("Storage Location not found with id: " + request.getStorageLocationId());
        } catch (FeignException e) {
            log.error("Error communicating with Inventory Service", e);
            throw new RuntimeException("Error communicating with Inventory Service: " + e.getMessage());
        }

        //check for existing assignment
        if (workerStorageLocationRepository.existsByWorkerAndStorageLocationId(worker, request.getStorageLocationId())) {
            throw new ConflictException("Worker " + request.getWorkerId() + " is already assigned to storage location " + request.getStorageLocationId());
        }

        // save
        WorkerStorageLocation assignment = new WorkerStorageLocation();
        assignment.setWorker(worker);
        assignment.setStorageLocationId(request.getStorageLocationId());
        assignment.setAssignedDate(LocalDateTime.now());

        WorkerStorageLocation savedAssignment = workerStorageLocationRepository.save(assignment);
        
        return mapToResponse(savedAssignment);
    }

    @Override
    public List<WorkerStorageLocationResponse> getStorageLocationsByWorkerId(Long workerId) {
        // Validate worker exists first
        if (!workerRepository.existsById(workerId)) {
            throw new ResourceNotFoundException("Worker not found with id: " + workerId);
        }
        
        List<WorkerStorageLocation> assignments = workerStorageLocationRepository.findByWorkerId(workerId);
        return assignments.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeAssignment(Long id) {
        if (!workerStorageLocationRepository.existsById(id)) {
            throw new ResourceNotFoundException("WorkerStorageLocation assignment not found with id: " + id);
        }
        workerStorageLocationRepository.deleteById(id);
    }

    private WorkerStorageLocationResponse mapToResponse(WorkerStorageLocation entity) {
        return new WorkerStorageLocationResponse(
                entity.getId(),
                entity.getWorker().getId(),
                entity.getStorageLocationId(),
                entity.getAssignedDate()
        );
    }
}
