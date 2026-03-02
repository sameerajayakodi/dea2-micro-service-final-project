package com.wms.dispatch_transportation_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispatchRequest {

    @NotBlank(message = "Vehicle number is required")
    private String vehicleNo;

    @NotBlank(message = "Delivery status is required")
    private String deliveryStatus;

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Date is required")
    private LocalDate date;
}
