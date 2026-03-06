package com.wms.inventory_management_service.service;

import com.wms.inventory_management_service.exception.ResourceNotFoundException;
import com.wms.inventory_management_service.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StorageLocationClient {

    private static final String STORAGE_LOCATION_BASE_URL = "http://Storage-Location-Service/api/locations";

    private final RestClient.Builder restClientBuilder;

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

    public record StorageLocationDetails(
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
    }

    public record StorageLocationPayload(
            String zone,
            String rackNo,
            String binNo,
            BigDecimal maxWeight,
            BigDecimal maxVolume
    ) {
    }
}
