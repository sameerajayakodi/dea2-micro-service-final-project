package com.wms.Storage.Location.Service.service.impl;

import com.wms.Storage.Location.Service.dto.request.StorageLocationRequest;
import com.wms.Storage.Location.Service.dto.response.StorageLocationResponse;
import com.wms.Storage.Location.Service.entity.LocationAvailabilityStatus;
import com.wms.Storage.Location.Service.entity.StorageLocation;
import com.wms.Storage.Location.Service.exception.CapacityExceededException;
import com.wms.Storage.Location.Service.exception.NotFoundException;
import com.wms.Storage.Location.Service.repository.StorageLocationRepository;
import com.wms.Storage.Location.Service.service.StorageLocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StorageLocationServiceImpl implements StorageLocationService {

    private final StorageLocationRepository storageLocationRepository;

    @Override
    public StorageLocationResponse createLocation(StorageLocationRequest request) {
        log.info("Creating storage location: Zone={}, Rack={}, Bin={}", request.zone(), request.rackNo(),
                request.binNo());

        storageLocationRepository.findByZoneAndRackNoAndBinNo(request.zone(), request.rackNo(), request.binNo())
                .ifPresent(location -> {
                    throw new IllegalArgumentException(
                            String.format("Storage location already exists: Zone=%s, Rack=%s, Bin=%s", request.zone(),
                                    request.rackNo(), request.binNo()));
                });

        StorageLocation location = new StorageLocation();
        location.setZone(request.zone());
        location.setRackNo(request.rackNo());
        location.setBinNo(request.binNo());
        location.setMaxWeight(request.maxWeight());
        location.setMaxVolume(request.maxVolume());

        StorageLocation saved = storageLocationRepository.save(location);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public StorageLocationResponse getLocationById(Long id) {
        StorageLocation location = storageLocationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Storage location not found with id: " + id));
        return mapToResponse(location);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StorageLocationResponse> getAllLocations() {
        return storageLocationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public StorageLocationResponse updateLocation(Long id, StorageLocationRequest request) {
        log.info("Updating storage location with ID: {}", id);

        StorageLocation location = storageLocationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Storage location not found with id: " + id));

        // Check for duplicate if zone/rack/bin is being changed
        storageLocationRepository.findByZoneAndRackNoAndBinNo(request.zone(), request.rackNo(), request.binNo())
                .filter(existing -> !existing.getLocationId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            String.format("Another storage location already exists: Zone=%s, Rack=%s, Bin=%s",
                                    request.zone(), request.rackNo(), request.binNo()));
                });

        location.setZone(request.zone());
        location.setRackNo(request.rackNo());
        location.setBinNo(request.binNo());
        location.setMaxWeight(request.maxWeight());
        location.setMaxVolume(request.maxVolume());

        location.updateAvailabilityStatus();

        StorageLocation updated = storageLocationRepository.save(location);
        return mapToResponse(updated);
    }

    @Override
    public void deleteLocation(Long id) {
        StorageLocation location = storageLocationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Storage location not found with id: " + id));
        storageLocationRepository.delete(location);
        log.info("Deleted storage location with ID: {}", id);
    }

    @Override
    public StorageLocationResponse updateCapacity(Long id, Double addedWeight, Double addedVolume) {
        log.info("Updating capacity for location ID {}: AddedWeight={}, AddedVolume={}", id, addedWeight, addedVolume);

        StorageLocation location = storageLocationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Storage location not found with id: " + id));

        BigDecimal addW = addedWeight != null ? BigDecimal.valueOf(addedWeight) : BigDecimal.ZERO;
        BigDecimal addV = addedVolume != null ? BigDecimal.valueOf(addedVolume) : BigDecimal.ZERO;

        BigDecimal newWeight = location.getCurrentWeight().add(addW);
        BigDecimal newVolume = location.getCurrentVolume().add(addV);

        // Fail if exceeds max capacity limits
        if (location.getMaxWeight() != null && newWeight.compareTo(location.getMaxWeight()) > 0) {
            throw new CapacityExceededException(
                    String.format("Weight capacity exceeded for location ID %d. Current: %s, Adding: %s, Max: %s",
                            id, location.getCurrentWeight(), addW, location.getMaxWeight()));
        }

        if (location.getMaxVolume() != null && newVolume.compareTo(location.getMaxVolume()) > 0) {
            throw new CapacityExceededException(
                    String.format("Volume capacity exceeded for location ID %d. Current: %s, Adding: %s, Max: %s",
                            id, location.getCurrentVolume(), addV, location.getMaxVolume()));
        }

        location.setCurrentWeight(newWeight);
        location.setCurrentVolume(newVolume);

        // Let the entity dynamically determine if it's FULL or OCCUPIED based on new
        // capacity.
        location.updateAvailabilityStatus();

        StorageLocation updated = storageLocationRepository.save(location);
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StorageLocationResponse> getAvailableLocations() {
        return storageLocationRepository.findByAvailabilityStatus(LocationAvailabilityStatus.AVAILABLE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private StorageLocationResponse mapToResponse(StorageLocation location) {
        return new StorageLocationResponse(
                location.getLocationId(),
                location.getZone(),
                location.getRackNo(),
                location.getBinNo(),
                location.getMaxWeight(),
                location.getMaxVolume(),
                location.getCurrentWeight(),
                location.getCurrentVolume(),
                location.getAvailabilityStatus());
    }
}
