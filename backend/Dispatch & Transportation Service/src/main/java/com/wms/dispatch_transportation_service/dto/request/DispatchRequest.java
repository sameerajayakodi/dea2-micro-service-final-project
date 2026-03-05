package com.wms.dispatch_transportation_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispatchRequest {

    @NotBlank(message = "Order ID is required")
    private String orderId;

    private String vehicleId;
    
    private String driverId;
    
    private String status;
    
    private String routeDetails;
    
    private String deliveryNotes;
}
