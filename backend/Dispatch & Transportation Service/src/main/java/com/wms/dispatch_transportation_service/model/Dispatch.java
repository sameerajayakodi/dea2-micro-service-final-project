package com.wms.dispatch_transportation_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Dispatch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "CHAR(36)")
    private String id;

    @Column(name = "order_id", nullable = false, columnDefinition = "CHAR(36)")
    private String orderId;

    @Column(name = "vehicle_id", columnDefinition = "CHAR(36)")
    private String vehicleId;

    @Column(name = "driver_id", columnDefinition = "CHAR(36)")
    private String driverId;

    @Column(name = "status")
    private String status = "PENDING"; // PENDING, IN_TRANSIT, DELIVERED, DELAYED

    @Column(name = "route_details", columnDefinition = "TEXT")
    private String routeDetails;

    @Column(name = "delivery_notes", columnDefinition = "TEXT")
    private String deliveryNotes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void setLastUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
