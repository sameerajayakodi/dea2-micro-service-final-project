package com.wms.workforce_equipment_service.service;

import com.wms.workforce_equipment_service.dto.request.MaintenanceLogRequest;
import com.wms.workforce_equipment_service.dto.response.MaintenanceLogResponse;
import com.wms.workforce_equipment_service.exception.ResourceNotFoundException;
import com.wms.workforce_equipment_service.model.Equipment;
import com.wms.workforce_equipment_service.model.MaintenanceLog;
import com.wms.workforce_equipment_service.repository.EquipmentRepository;
import com.wms.workforce_equipment_service.repository.MaintenanceLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for managing maintenance logs.
 */
@Service
@RequiredArgsConstructor
public class MaintenanceLogService implements IMaintenanceLogService {

    private final MaintenanceLogRepository maintenanceLogRepository;
    private final EquipmentRepository equipmentRepository;

    @Override
    public List<MaintenanceLogResponse> getAllMaintenanceLogs() {
        return maintenanceLogRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MaintenanceLogResponse getMaintenanceLogById(Long id) {
        MaintenanceLog log = maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance Log not found with id: " + id));
        return mapToResponse(log);
    }

    @Override
    public List<MaintenanceLogResponse> getMaintenanceLogsByEquipmentId(Long equipmentId) {
        return maintenanceLogRepository.findByEquipmentId(equipmentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MaintenanceLogResponse createMaintenanceLog(MaintenanceLogRequest request) {
        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + request.getEquipmentId()));

        MaintenanceLog log = new MaintenanceLog();
        log.setEquipment(equipment);
        log.setDescription(request.getDescription());
        log.setMaintenanceDate(request.getMaintenanceDate());
        log.setPerformedBy(request.getPerformedBy());
        log.setStatus(request.getStatus());
        log.setNotes(request.getNotes());

        MaintenanceLog saved = maintenanceLogRepository.save(log);
        return mapToResponse(saved);
    }

    @Override
    public MaintenanceLogResponse updateMaintenanceLog(Long id, MaintenanceLogRequest request) {
        MaintenanceLog log = maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance Log not found with id: " + id));

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + request.getEquipmentId()));

        log.setEquipment(equipment);
        log.setDescription(request.getDescription());
        log.setMaintenanceDate(request.getMaintenanceDate());
        log.setPerformedBy(request.getPerformedBy());
        log.setStatus(request.getStatus());
        log.setNotes(request.getNotes());

        MaintenanceLog updated = maintenanceLogRepository.save(log);
        return mapToResponse(updated);
    }

    @Override
    public void deleteMaintenanceLog(Long id) {
        MaintenanceLog log = maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance Log not found with id: " + id));
        maintenanceLogRepository.delete(log);
    }

    private MaintenanceLogResponse mapToResponse(MaintenanceLog log) {
        return new MaintenanceLogResponse(
                log.getId(),
                log.getEquipment().getId(),
                log.getEquipment().getName(),
                log.getDescription(),
                log.getMaintenanceDate(),
                log.getPerformedBy(),
                log.getStatus(),
                log.getNotes()
        );
    }
}
