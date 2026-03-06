package com.wms.inventory_management_service.service.client.impl;

import com.wms.inventory_management_service.exception.ResourceNotFoundException;
import com.wms.inventory_management_service.exception.ServiceException;
import com.wms.inventory_management_service.service.client.StorageLocationClient;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StorageLocationClientImpl implements StorageLocationClient {

    private static final String STORAGE_LOCATION_BASE_URL = "http://storage-location-service/api/locations";

    private final RestClient.Builder restClientBuilder;

    @Override
    public StorageLocationDetails getStorageLocationById(Long locationId) {
        try {
            return restClientBuilder.build()
                    .get()
                    .uri(STORAGE_LOCATION_BASE_URL + "/{id}", locationId)
                    .retrieve()
                    .body(StorageLocationDetails.class);
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("StorageLocation", "locationId", locationId);
        } catch (RestClientException ex) {
            throw new ServiceException("Unable to fetch storage location details", ex);
        }
    }

    @Override
    public List<StorageLocationDetails> getAllStorageLocations() {
        try {
            StorageLocationDetails[] response = restClientBuilder.build()
                    .get()
                    .uri(STORAGE_LOCATION_BASE_URL)
                    .retrieve()
                    .body(StorageLocationDetails[].class);
            return response == null ? List.of() : List.of(response);
        } catch (RestClientException ex) {
            throw new ServiceException("Unable to fetch storage locations", ex);
        }
    }

    @Override
    public StorageLocationDetails createStorageLocation(StorageLocationPayload payload) {
        try {
            return restClientBuilder.build()
                    .post()
                    .uri(STORAGE_LOCATION_BASE_URL)
                    .body(payload)
                    .retrieve()
                    .body(StorageLocationDetails.class);
        } catch (RestClientException ex) {
            throw new ServiceException("Unable to create storage location", ex);
        }
    }

    @Override
    public StorageLocationDetails updateStorageLocation(Long locationId, StorageLocationPayload payload) {
        try {
            return restClientBuilder.build()
                    .put()
                    .uri(STORAGE_LOCATION_BASE_URL + "/{id}", locationId)
                    .body(payload)
                    .retrieve()
                    .body(StorageLocationDetails.class);
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("StorageLocation", "locationId", locationId);
        } catch (RestClientException ex) {
            throw new ServiceException("Unable to update storage location", ex);
        }
    }

    @Override
    public void deleteStorageLocation(Long locationId) {
        try {
            restClientBuilder.build()
                    .delete()
                    .uri(STORAGE_LOCATION_BASE_URL + "/{id}", locationId)
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("StorageLocation", "locationId", locationId);
        } catch (RestClientException ex) {
            throw new ServiceException("Unable to delete storage location", ex);
        }
    }
}
