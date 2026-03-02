package com.wms.dispatch_transportation_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispatchResponse {

    private Long id;
    private String vehicleNo;
    private String deliveryStatus;
    private Long orderId;
    private LocalDate date;
}
