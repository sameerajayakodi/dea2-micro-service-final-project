package com.wms.picking_packing_service.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class PickingItemDTO {
    @NotNull(message = "itemId is required")
    private UUID itemId;

    @Positive(message = "quantityToPick must be greater than zero")
    private Integer quantityToPick;

    @PositiveOrZero(message = "quantityPicked must be zero or a positive number")
    private Integer quantityPicked;

    @Size(max = 50, message = "binNo must be at most 50 characters")
    private String binNo;

    public void setItemId(UUID itemId) {
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

    public UUID getItemId() {
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
