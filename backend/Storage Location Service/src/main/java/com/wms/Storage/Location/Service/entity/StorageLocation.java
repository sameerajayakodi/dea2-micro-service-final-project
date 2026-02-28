package com.wms.Storage.Location.Service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "storage_location", indexes = {
        @Index(name = "idx_storage_location_zone", columnList = "zone"),
        @Index(name = "idx_storage_location_rack_bin", columnList = "rack_no, bin_no")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class StorageLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "location_id", updatable = false, nullable = false)
    private Long locationId;

    @Column(name = "zone", nullable = false)
    private String zone;

    @Column(name = "rack_no", nullable = false)
    private String rackNo;

    @Column(name = "bin_no", nullable = false)
    private String binNo;

    @Column(name = "max_weight", precision = 10, scale = 2)
    private BigDecimal maxWeight;

    @Column(name = "max_volume", precision = 10, scale = 2)
    private BigDecimal maxVolume;

    @Column(name = "current_weight", precision = 10, scale = 2)
    private BigDecimal currentWeight = BigDecimal.ZERO;

    @Column(name = "current_volume", precision = 10, scale = 2)
    private BigDecimal currentVolume = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status", nullable = false, length = 20)
    private LocationAvailabilityStatus availabilityStatus = LocationAvailabilityStatus.AVAILABLE;

    /**
     * Updates the availability status based on current capacity
     */
    public void updateAvailabilityStatus() {
        if (maxWeight != null && currentWeight.compareTo(maxWeight) >= 0) {
            this.availabilityStatus = LocationAvailabilityStatus.FULL;
        } else if (maxVolume != null && currentVolume.compareTo(maxVolume) >= 0) {
            this.availabilityStatus = LocationAvailabilityStatus.FULL;
        } else if (currentWeight.compareTo(BigDecimal.ZERO) > 0 || currentVolume.compareTo(BigDecimal.ZERO) > 0) {
            this.availabilityStatus = LocationAvailabilityStatus.OCCUPIED;
        } else {
            this.availabilityStatus = LocationAvailabilityStatus.AVAILABLE;
        }
    }
}
