package com.wms.workforce_equipment_service.service;

import com.wms.workforce_equipment_service.dto.request.WorkerRequest;
import com.wms.workforce_equipment_service.dto.response.WorkerResponse;
import com.wms.workforce_equipment_service.exception.ResourceNotFoundException;
import com.wms.workforce_equipment_service.model.Worker;
import com.wms.workforce_equipment_service.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for managing workers.
 */
@Service
@RequiredArgsConstructor
public class WorkerService implements IWorkerService {

    private final WorkerRepository workerRepository;

    @Override
    public List<WorkerResponse> getAllWorkers() {
        return workerRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public WorkerResponse getWorkerById(Long id) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id: " + id));
        return mapToResponse(worker);
    }

    @Override
    public WorkerResponse createWorker(WorkerRequest request) {
        Worker worker = new Worker();
        worker.setName(request.getName());
        worker.setShift(request.getShift());
        worker.setRole(request.getRole());

        Worker saved = workerRepository.save(worker);
        return mapToResponse(saved);
    }

    @Override
    public WorkerResponse updateWorker(Long id, WorkerRequest request) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id: " + id));

        worker.setName(request.getName());
        worker.setShift(request.getShift());
        worker.setRole(request.getRole());

        Worker updated = workerRepository.save(worker);
        return mapToResponse(updated);
    }

    @Override
    public void deleteWorker(Long id) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id: " + id));
        workerRepository.delete(worker);
    }

    private WorkerResponse mapToResponse(Worker worker) {
        return new WorkerResponse(
                worker.getId(),
                worker.getName(),
                worker.getShift(),
                worker.getRole()
        );
    }
}
