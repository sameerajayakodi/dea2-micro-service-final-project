package com.wms.picking_packing_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class PackingDetailsDTO {
    private String packingType;
    private Double weight;
    private String dimensions;

    public String getPackingType() {
        return packingType;
    }

    public Double getWeight() {
        return weight;
    }

    public String getDimensions() {
        return dimensions;
    }

    public void setPackingType(String packingType) {
        this.packingType = packingType;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public void setDimensions(String dimensions) {
        this.dimensions = dimensions;
    }
}

