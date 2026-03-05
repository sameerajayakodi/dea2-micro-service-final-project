package com.wms.inbound_receiving_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {
    private String id;
    private String supplierCode;
    private String name;
    private String address;
    private String phone;
    private String email;
    private String status;
}