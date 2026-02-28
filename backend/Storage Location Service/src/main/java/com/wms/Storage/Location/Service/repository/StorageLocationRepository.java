package com.wms.Storage.Location.Service.repository;

import com.wms.Storage.Location.Service.entity.LocationAvailabilityStatus;
import com.wms.Storage.Location.Service.entity.StorageLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StorageLocationRepository extends JpaRepository<StorageLocation, Long> {

       List<StorageLocation> findByZone(String zone);

       Optional<StorageLocation> findByZoneAndRackNoAndBinNo(String zone, String rackNo, String binNo);

       List<StorageLocation> findByAvailabilityStatus(LocationAvailabilityStatus status);
}
