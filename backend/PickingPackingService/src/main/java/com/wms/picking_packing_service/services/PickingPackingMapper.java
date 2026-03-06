package com.wms.picking_packing_service.services;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.wms.picking_packing_service.dto.PackingDetailsDTO;
import com.wms.picking_packing_service.dto.PickingItemDTO;
import com.wms.picking_packing_service.dto.PickingPackingDTO;
import com.wms.picking_packing_service.exception.BadRequestException;
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

        List<PickingItem> existingItems = entity.getItems();
        if (existingItems == null || existingItems.isEmpty()) {
            if (!itemDTOs.isEmpty()) {
                throw new BadRequestException("Update cannot create new picking items. Create the task with items first.");
            }
            return;
        }

        Map<UUID, PickingItem> existingByItemId = existingItems.stream()
                .collect(Collectors.toMap(PickingItem::getItemId, item -> item, (first, second) -> first));

        for (PickingItemDTO itemDTO : itemDTOs) {
            UUID itemId = itemDTO.getItemId();
            if (itemId == null) {
                throw new BadRequestException("itemId is required for item updates");
            }

            PickingItem existingItem = existingByItemId.get(itemId);
            if (existingItem == null) {
                throw new BadRequestException("Update cannot create new item: " + itemId);
            }

            if (itemDTO.getQuantityToPick() != null) {
                existingItem.setQuantityToPick(itemDTO.getQuantityToPick());
            }
            if (itemDTO.getQuantityPicked() != null) {
                existingItem.setQuantityPicked(itemDTO.getQuantityPicked());
            }
            if (itemDTO.getBinNo() != null) {
                existingItem.setBinNo(itemDTO.getBinNo());
            }
        }
    }

    public void replacePackingDetails(PickingPacking entity, List<PackingDetailsDTO> packingDTOs) {
        if (packingDTOs == null) {
            return;
        }

        List<PackingDetails> existingPackingDetails = entity.getPackingDetails();
        if (existingPackingDetails == null || existingPackingDetails.isEmpty()) {
            if (!packingDTOs.isEmpty()) {
                throw new BadRequestException("Update cannot create new packing details.");
            }
            return;
        }

        if (packingDTOs.size() > existingPackingDetails.size()) {
            throw new BadRequestException("Update cannot create new packing details.");
        }

        for (int index = 0; index < packingDTOs.size(); index++) {
            PackingDetailsDTO packingDTO = packingDTOs.get(index);
            PackingDetails existingDetails = existingPackingDetails.get(index);

            if (packingDTO.getPackingType() != null) {
                existingDetails.setPackingType(packingDTO.getPackingType());
            }
            if (packingDTO.getWeight() != null) {
                existingDetails.setWeight(packingDTO.getWeight());
            }
            if (packingDTO.getDimensions() != null) {
                existingDetails.setDimensions(packingDTO.getDimensions());
            }
        }
    }
}
