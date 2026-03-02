package com.wms.workforce_equipment_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity class representing the assignment of a worker to a storage location.
 */
@Entity
@Table(name = "worker_storage_location")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkerStorageLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker worker;

    @Column(name = "storage_location_id", nullable = false)
    private Long storageLocationId; // Reference to Inventory Service

    @Column(name = "assigned_date", nullable = false)
    private LocalDateTime assignedDate;
}
