package com.wms.workforce_equipment_service.service;

import com.wms.workforce_equipment_service.dto.request.EquipmentAssignmentRequest;
import com.wms.workforce_equipment_service.dto.response.EquipmentAssignmentResponse;
import com.wms.workforce_equipment_service.exception.ResourceNotFoundException;
import com.wms.workforce_equipment_service.model.Equipment;
import com.wms.workforce_equipment_service.model.EquipmentAssignment;
import com.wms.workforce_equipment_service.model.Worker;
import com.wms.workforce_equipment_service.repository.EquipmentAssignmentRepository;
import com.wms.workforce_equipment_service.repository.EquipmentRepository;
import com.wms.workforce_equipment_service.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for managing equipment assignments.
 */
@Service
@RequiredArgsConstructor
public class EquipmentAssignmentService implements IEquipmentAssignmentService {

    private final EquipmentAssignmentRepository assignmentRepository;
    private final EquipmentRepository equipmentRepository;
    private final WorkerRepository workerRepository;

    @Override
    public List<EquipmentAssignmentResponse> getAllAssignments() {
        return assignmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public EquipmentAssignmentResponse getAssignmentById(Long id) {
        EquipmentAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));
        return mapToResponse(assignment);
    }

    @Override
    public List<EquipmentAssignmentResponse> getAssignmentsByEquipmentId(Long equipmentId) {
        return assignmentRepository.findByEquipmentId(equipmentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<EquipmentAssignmentResponse> getAssignmentsByWorkerId(Long workerId) {
        return assignmentRepository.findByWorkerId(workerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public EquipmentAssignmentResponse createAssignment(EquipmentAssignmentRequest request) {
        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + request.getEquipmentId()));

        Worker worker = workerRepository.findById(request.getWorkerId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id: " + request.getWorkerId()));

        EquipmentAssignment assignment = new EquipmentAssignment();
        assignment.setEquipment(equipment);
        assignment.setWorker(worker);
        assignment.setAssignedDate(request.getAssignedDate());
        assignment.setReturnedDate(request.getReturnedDate());
        assignment.setStatus(request.getStatus());

        EquipmentAssignment saved = assignmentRepository.save(assignment);
        return mapToResponse(saved);
    }

    @Override
    public EquipmentAssignmentResponse updateAssignment(Long id, EquipmentAssignmentRequest request) {
        EquipmentAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + request.getEquipmentId()));

        Worker worker = workerRepository.findById(request.getWorkerId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id: " + request.getWorkerId()));

        assignment.setEquipment(equipment);
        assignment.setWorker(worker);
        assignment.setAssignedDate(request.getAssignedDate());
        assignment.setReturnedDate(request.getReturnedDate());
        assignment.setStatus(request.getStatus());

        EquipmentAssignment updated = assignmentRepository.save(assignment);
        return mapToResponse(updated);
    }

    @Override
    public void deleteAssignment(Long id) {
        EquipmentAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));
        assignmentRepository.delete(assignment);
    }

    private EquipmentAssignmentResponse mapToResponse(EquipmentAssignment assignment) {
        return new EquipmentAssignmentResponse(
                assignment.getId(),
                assignment.getEquipment().getId(),
                assignment.getEquipment().getName(),
                assignment.getWorker().getId(),
                assignment.getWorker().getName(),
                assignment.getAssignedDate(),
                assignment.getReturnedDate(),
                assignment.getStatus()
        );
    }
}
