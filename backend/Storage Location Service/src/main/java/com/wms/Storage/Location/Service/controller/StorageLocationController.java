package com.wms.Storage.Location.Service.controller;

import com.wms.Storage.Location.Service.dto.request.StorageLocationRequest;
import com.wms.Storage.Location.Service.dto.response.StorageLocationResponse;
import com.wms.Storage.Location.Service.service.StorageLocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@Tag(name = "Storage Locations", description = "Management APIs for Storage Locations and Zones")
public class StorageLocationController {

        private final StorageLocationService storageLocationService;

        @PostMapping
        @Operation(summary = "Creates a new storage bin", description = "Creates a new storage location matching the requested zone, rack, and bin.")
        public ResponseEntity<StorageLocationResponse> createLocation(
                        @Valid @RequestBody StorageLocationRequest request) {
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(storageLocationService.createLocation(request));
        }

        @GetMapping("/{id}")
        @Operation(summary = "Get storage location by ID", description = "Retrieves a specific storage location and its capacity.")
        public ResponseEntity<StorageLocationResponse> getLocationById(@PathVariable Long id) {
                return ResponseEntity.ok(storageLocationService.getLocationById(id));
        }

        @GetMapping
        @Operation(summary = "Get all storage locations", description = "Retrieves a list of all storage locations.")
        public ResponseEntity<List<StorageLocationResponse>> getAllLocations() {
                return ResponseEntity.ok(storageLocationService.getAllLocations());
        }

        @PutMapping("/{id}")
        @Operation(summary = "Updates an existing storage location", description = "Updates a storage location's zone or capacity information.")
        public ResponseEntity<StorageLocationResponse> updateLocation(@PathVariable Long id,
                        @Valid @RequestBody StorageLocationRequest request) {
                return ResponseEntity.ok(storageLocationService.updateLocation(id, request));
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "Deletes a storage bin", description = "Deletes a specific storage location by ID.")
        public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
                storageLocationService.deleteLocation(id);
                return ResponseEntity.noContent().build();
        }

        @PatchMapping("/{id}/capacity")
        @Operation(summary = "Updates bin capacity for Inventory Service", description = "Adds current weight and volume. Automatically flips status to FULL if limits are exceeded.")
        public ResponseEntity<StorageLocationResponse> updateCapacity(
                        @PathVariable Long id,
                        @RequestParam(required = false, defaultValue = "0") Double addedWeight,
                        @RequestParam(required = false, defaultValue = "0") Double addedVolume) {
                return ResponseEntity.ok(storageLocationService.updateCapacity(id, addedWeight, addedVolume));
        }

        @GetMapping("/available")
        @Operation(summary = "Get available locations", description = "Returns only locations matching AVAILABLE status.")
        public ResponseEntity<List<StorageLocationResponse>> getAvailableLocations() {
                return ResponseEntity.ok(storageLocationService.getAvailableLocations());
        }
}
