package com.wms.picking_packing_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PickingItemDTO {
    private Long itemId;
    private Integer quantityToPick;
    private Integer quantityPicked;
    private String binNo;

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public void setQuantityToPick(Integer quantityToPick) {
        this.quantityToPick = quantityToPick;
    }

    public void setQuantityPicked(Integer quantityPicked) {
        this.quantityPicked = quantityPicked;
    }

    public void setBinNo(String binNo) {
        this.binNo = binNo;
    }

    public Long getItemId() {
        return itemId;
    }

    public Integer getQuantityToPick() {
        return quantityToPick;
    }

    public Integer getQuantityPicked() {
        return quantityPicked;
    }

    public String getBinNo() {
        return binNo;
    }
}
