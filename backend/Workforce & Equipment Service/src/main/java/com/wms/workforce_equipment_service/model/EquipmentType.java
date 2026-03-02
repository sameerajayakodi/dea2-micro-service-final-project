package com.wms.workforce_equipment_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Entity class representing a type of equipment in the warehouse.
 */
@Entity
@Table(name = "equipment_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private String manufacturer;

    @Column(nullable = false)
    private String model;

    @OneToMany(mappedBy = "equipmentType", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Equipment> equipments;
}
