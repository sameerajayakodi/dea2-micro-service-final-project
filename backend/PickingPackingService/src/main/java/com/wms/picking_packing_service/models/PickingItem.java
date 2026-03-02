package com.wms.picking_packing_service.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "picking_items")
public class PickingItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long itemId;

    private Integer quantityToPick;
    private Integer quantityPicked;

    private String binNo;

    @ManyToOne
    @JoinColumn(name = "pick_pack_id")
    private PickingPacking pickingPacking;

    public Long getId() {
        return id;
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

    public PickingPacking getPickingPacking() {
        return pickingPacking;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public void setPickingPacking(PickingPacking pickingPacking) {
        this.pickingPacking = pickingPacking;
    }
}
