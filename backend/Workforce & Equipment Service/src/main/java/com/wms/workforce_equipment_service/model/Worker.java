package com.wms.workforce_equipment_service.model;

import com.wms.workforce_equipment_service.model.enums.Shift;
import com.wms.workforce_equipment_service.model.enums.WorkerRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Entity class representing a worker in the workforce.
 */
@Entity
@Table(name = "worker")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Shift shift;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkerRole role;

    @OneToMany(mappedBy = "worker", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EquipmentAssignment> assignments;
}
