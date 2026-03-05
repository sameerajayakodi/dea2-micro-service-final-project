package com.wms.picking_packing_service.services;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.wms.picking_packing_service.dto.PackingDetailsDTO;
import com.wms.picking_packing_service.dto.PickingItemDTO;
import com.wms.picking_packing_service.dto.PickingPackingDTO;
import com.wms.picking_packing_service.models.PackingDetails;
import com.wms.picking_packing_service.models.PickingItem;
import com.wms.picking_packing_service.models.PickingPacking;

@Component
public class PickingPackingMapper {

    public PickingPackingDTO toDTO(PickingPacking entity) {
        PickingPackingDTO dto = new PickingPackingDTO();

        dto.setPickPackId(entity.getPickPackId());
        dto.setOrderId(entity.getOrderId());
        dto.setWorkerId(entity.getWorkerId());
        dto.setPickDate(entity.getPickDate());
        dto.setPackDate(entity.getPackDate());
        dto.setStatus(entity.getStatus());

        if (entity.getItems() != null) {
            List<PickingItemDTO> itemDTOs = entity.getItems().stream()
                    .map(item -> {
                        PickingItemDTO itemDTO = new PickingItemDTO();
                        itemDTO.setItemId(item.getItemId());
                        itemDTO.setQuantityToPick(item.getQuantityToPick());
                        itemDTO.setQuantityPicked(item.getQuantityPicked());
                        itemDTO.setBinNo(item.getBinNo());
                        return itemDTO;
                    })
                    .collect(Collectors.toList());
            dto.setItems(itemDTOs);
        }

        if (entity.getPackingDetails() != null) {
            List<PackingDetailsDTO> packingDTOs = entity.getPackingDetails().stream()
                    .map(packing -> {
                        PackingDetailsDTO packingDTO = new PackingDetailsDTO();
                        packingDTO.setPackingType(packing.getPackingType());
                        packingDTO.setWeight(packing.getWeight());
                        packingDTO.setDimensions(packing.getDimensions());
                        return packingDTO;
                    })
                    .collect(Collectors.toList());
            dto.setPackingDetails(packingDTOs);
        }

        return dto;
    }

    public void mapItemsForCreate(PickingPacking entity, List<PickingItemDTO> itemDTOs) {
        if (itemDTOs == null || itemDTOs.isEmpty()) {
            return;
        }

        List<PickingItem> items = itemDTOs.stream()
                .map(itemDTO -> {
                    PickingItem item = new PickingItem();
                    item.setItemId(itemDTO.getItemId());
                    item.setQuantityToPick(itemDTO.getQuantityToPick());
                    item.setQuantityPicked(0);
                    item.setBinNo(itemDTO.getBinNo());
                    item.setPickingPacking(entity);
                    return item;
                })
                .collect(Collectors.toList());
        entity.setItems(items);
    }

    public void replaceItems(PickingPacking entity, List<PickingItemDTO> itemDTOs) {
        if (itemDTOs == null) {
            return;
        }

        if (entity.getItems() != null) {
            entity.getItems().clear();
        } else {
            entity.setItems(new ArrayList<>());
        }

        List<PickingItem> items = itemDTOs.stream()
                .map(itemDTO -> {
                    PickingItem item = new PickingItem();
                    item.setItemId(itemDTO.getItemId());
                    item.setQuantityToPick(itemDTO.getQuantityToPick());
                    Integer quantityPicked = itemDTO.getQuantityPicked();
                    item.setQuantityPicked(quantityPicked != null ? quantityPicked : 0);
                    item.setBinNo(itemDTO.getBinNo());
                    item.setPickingPacking(entity);
                    return item;
                })
                .collect(Collectors.toList());

        entity.getItems().addAll(items);
    }

    public void replacePackingDetails(PickingPacking entity, List<PackingDetailsDTO> packingDTOs) {
        if (packingDTOs == null) {
            return;
        }

        if (entity.getPackingDetails() != null) {
            entity.getPackingDetails().clear();
        } else {
            entity.setPackingDetails(new ArrayList<>());
        }

        List<PackingDetails> packingDetails = packingDTOs.stream()
                .map(packingDTO -> {
                    PackingDetails details = new PackingDetails();
                    details.setPackingType(packingDTO.getPackingType());
                    details.setWeight(packingDTO.getWeight());
                    details.setDimensions(packingDTO.getDimensions());
                    details.setPickingPacking(entity);
                    return details;
                })
                .collect(Collectors.toList());

        entity.getPackingDetails().addAll(packingDetails);
    }
}
