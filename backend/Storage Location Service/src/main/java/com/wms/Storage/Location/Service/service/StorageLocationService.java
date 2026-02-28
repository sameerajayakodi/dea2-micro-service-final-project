package com.wms.Storage.Location.Service.service;

import com.wms.Storage.Location.Service.dto.request.StorageLocationRequest;
import com.wms.Storage.Location.Service.dto.response.StorageLocationResponse;

import java.util.List;

public interface StorageLocationService {

    StorageLocationResponse createLocation(StorageLocationRequest request);

    StorageLocationResponse getLocationById(Long id);

    List<StorageLocationResponse> getAllLocations();

    StorageLocationResponse updateLocation(Long id, StorageLocationRequest request);

    void deleteLocation(Long id);

    // Custom Methods for Inventory Service

    StorageLocationResponse updateCapacity(Long id, Double addedWeight, Double addedVolume);

    List<StorageLocationResponse> getAvailableLocations();
}
