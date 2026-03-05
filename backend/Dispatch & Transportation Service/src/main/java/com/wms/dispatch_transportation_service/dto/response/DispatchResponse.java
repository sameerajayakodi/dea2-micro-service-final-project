package com.wms.dispatch_transportation_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispatchResponse {

    private String id;
    private String orderId;
    private String vehicleId;
    private String driverId;
    private String status;
    private String routeDetails;
    private String deliveryNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
