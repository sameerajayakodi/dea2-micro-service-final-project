package com.wms.inbound_receiving_service.dto;

import com.wms.inbound_receiving_service.model.Supplier;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierListResponseDTO {
    private List<Supplier> suppliers;
    private Integer totalCount;
}