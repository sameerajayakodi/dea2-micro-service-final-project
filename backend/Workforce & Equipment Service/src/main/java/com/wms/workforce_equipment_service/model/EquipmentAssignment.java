package com.wms.workforce_equipment_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity class representing the assignment of equipment to workers.
 */
@Entity
@Table(name = "equipment_assignment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker worker;

    @Column(name = "assigned_date", nullable = false)
    private LocalDateTime assignedDate;

    @Column(name = "returned_date")
    private LocalDateTime returnedDate;

    @Column(nullable = false)
    private String status;
}
