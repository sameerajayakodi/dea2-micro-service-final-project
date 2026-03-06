package com.wms.inventory_management_service.controller;

import com.wms.inventory_management_service.service.StorageLocationClient;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/inventory/storage-locations")
@RequiredArgsConstructor
public class StorageLocationController {

    private final StorageLocationClient storageLocationClient;

    @GetMapping
    public ResponseEntity<List<StorageLocationResponse>> getAllStorageLocations() {
        List<StorageLocationResponse> response = storageLocationClient.getAllStorageLocations()
                .stream()
                .map(StorageLocationResponse::from)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{locationId}")
    public ResponseEntity<StorageLocationResponse> getStorageLocationById(@PathVariable Long locationId) {
        StorageLocationResponse response = StorageLocationResponse.from(
                storageLocationClient.getStorageLocationById(locationId)
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<StorageLocationResponse> createStorageLocation(
            @Valid @RequestBody StorageLocationRequest request) {
        StorageLocationClient.StorageLocationPayload payload = new StorageLocationClient.StorageLocationPayload(
                request.zone(),
                request.rackNo(),
                request.binNo(),
                request.maxWeight(),
                request.maxVolume()
        );

        StorageLocationResponse response = StorageLocationResponse.from(
                storageLocationClient.createStorageLocation(payload)
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{locationId}")
    public ResponseEntity<StorageLocationResponse> updateStorageLocation(
            @PathVariable Long locationId,
            @Valid @RequestBody StorageLocationRequest request) {
        StorageLocationClient.StorageLocationPayload payload = new StorageLocationClient.StorageLocationPayload(
                request.zone(),
                request.rackNo(),
                request.binNo(),
                request.maxWeight(),
                request.maxVolume()
        );

        StorageLocationResponse response = StorageLocationResponse.from(
                storageLocationClient.updateStorageLocation(locationId, payload)
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{locationId}")
    public ResponseEntity<Void> deleteStorageLocation(@PathVariable Long locationId) {
        storageLocationClient.deleteStorageLocation(locationId);
        return ResponseEntity.noContent().build();
    }

    public record StorageLocationRequest(
            @NotBlank(message = "Zone is required")
            String zone,
            @NotBlank(message = "Rack number is required")
            String rackNo,
            @NotBlank(message = "Bin number is required")
            String binNo,
            @NotNull(message = "Max weight is required")
            @Positive(message = "Max weight must be positive")
            BigDecimal maxWeight,
            @NotNull(message = "Max volume is required")
            @Positive(message = "Max volume must be positive")
            BigDecimal maxVolume
    ) {
    }

    public record StorageLocationResponse(
            Long locationId,
            String zone,
            String rackNo,
            String binNo,
            BigDecimal maxWeight,
            BigDecimal maxVolume,
            BigDecimal currentWeight,
            BigDecimal currentVolume,
            String availabilityStatus
    ) {
        static StorageLocationResponse from(StorageLocationClient.StorageLocationDetails details) {
            return new StorageLocationResponse(
                    details.locationId(),
                    details.zone(),
                    details.rackNo(),
                    details.binNo(),
                    details.maxWeight(),
                    details.maxVolume(),
                    details.currentWeight(),
                    details.currentVolume(),
                    details.availabilityStatus()
            );
        }
    }
}
