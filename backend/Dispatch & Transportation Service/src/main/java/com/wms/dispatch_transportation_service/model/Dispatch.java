package com.wms.dispatch_transportation_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "dispatch")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Dispatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_no", nullable = false)
    private String vehicleNo;

    @Column(name = "delivery_status", nullable = false)
    private String deliveryStatus;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private LocalDate date;
}
