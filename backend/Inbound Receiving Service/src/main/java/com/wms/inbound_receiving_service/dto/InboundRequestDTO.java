package com.wms.inbound_receiving_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class InboundRequestDTO {
    @NotBlank(message = "Supplier name is required")
    private String supplierName;

    @NotBlank(message = "Product name is required")
    private String productName;

    @NotBlank(message = "SKU/Reference is required")
    private String sku;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
}