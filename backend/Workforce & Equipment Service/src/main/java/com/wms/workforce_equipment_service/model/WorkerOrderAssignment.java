package com.wms.workforce_equipment_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * a worker can have many orders, and an order can have many workers.
 */
@Entity
@Table(name = "worker_order_assignment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkerOrderAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker worker;

    @Column(name = "order_id", nullable = false, length = 50)
    private String orderId; // UUID from Order Service

    @Column(name = "assigned_date", nullable = false)
    private LocalDateTime assignedDate;
}
