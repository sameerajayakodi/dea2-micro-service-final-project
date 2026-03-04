package com.wms.orderservice.service.client;

import com.wms.orderservice.dto.response.AvailabilityResponse;
import com.wms.orderservice.dto.response.MissingItemResponse;
import com.wms.orderservice.entity.Order;
import com.wms.orderservice.entity.OrderItem;
import com.wms.orderservice.exception.ExternalServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryClient {

    private final RestClient inventoryRestClient;

    /**
     * DTO matching the Inventory Service's InventoryResponse
     */
    public record InventoryItemResponse(
            Long inventoryId,
            String batchNo,
            Integer quantityAvailable,
            Integer quantityReserved,
            Integer quantityDamaged,
            Integer totalAvailable,
            Long productId,
            String productName,
            Long locationId
    ) {}

    /**
     * Checks inventory availability for all items in the given order.
     * Calls: GET /api/inventory/product/{productId} for each order item.
     * Builds the AvailabilityResponse locally by comparing available stock vs requested quantities.
     */
    public AvailabilityResponse checkAvailability(Order order) {
        log.info("Checking inventory availability for order: {}", order.getOrderNumber());

        boolean canFulfillAll = true;
        List<MissingItemResponse> missingItems = new ArrayList<>();
        List<AvailabilityResponse.SuggestedApprovedItem> suggestedItems = new ArrayList<>();

        for (OrderItem orderItem : order.getItems()) {
            String itemId = orderItem.getItemId(); // This is the productId in Inventory Service
            int requestedQty = orderItem.getRequestedQty();

            int totalAvailable = getTotalAvailableForProduct(itemId);

            if (totalAvailable >= requestedQty) {
                // Fully available — suggest full requested qty
                suggestedItems.add(AvailabilityResponse.SuggestedApprovedItem.builder()
                        .itemId(itemId)
                        .approvedQty(requestedQty)
                        .build());
            } else {
                // Not enough stock
                canFulfillAll = false;
                int missingQty = requestedQty - totalAvailable;

                missingItems.add(MissingItemResponse.builder()
                        .itemId(itemId)
                        .missingQty(missingQty)
                        .build());

                // Suggest whatever is available (could be 0)
                suggestedItems.add(AvailabilityResponse.SuggestedApprovedItem.builder()
                        .itemId(itemId)
                        .approvedQty(Math.max(totalAvailable, 0))
                        .build());
            }
        }

        log.info("Availability check complete for order {} — canFulfill: {}, missingItems: {}",
                order.getOrderNumber(), canFulfillAll, missingItems.size());

        return AvailabilityResponse.builder()
                .canFulfill(canFulfillAll)
                .missingItems(missingItems)
                .suggestedApprovedItems(suggestedItems)
                .build();
    }

    /**
     * Gets total available quantity for a product by calling the Inventory Service.
     * Calls: GET /api/inventory/product/{productId}
     * Sums up quantityAvailable across all inventory records for that product.
     */
    private int getTotalAvailableForProduct(String productId) {
        try {
            log.debug("Fetching inventory for productId: {}", productId);

            List<InventoryItemResponse> inventories = inventoryRestClient.get()
                    .uri("/api/inventory/product/{productId}", productId)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<InventoryItemResponse>>() {});

            if (inventories == null || inventories.isEmpty()) {
                log.debug("No inventory records found for productId: {}", productId);
                return 0;
            }

            int total = inventories.stream()
                    .mapToInt(inv -> inv.quantityAvailable() != null ? inv.quantityAvailable() : 0)
                    .sum();

            log.debug("Total available for productId {}: {}", productId, total);
            return total;

        } catch (RestClientException ex) {
            log.error("Failed to fetch inventory for productId: {}", productId, ex);
            throw new ExternalServiceException(
                    "Inventory Service unavailable for product " + productId + ": " + ex.getMessage(), ex);
        }
    }

    /**
     * Reserves stock for the approved items in an order.
     * Calls: POST /api/inventory/reserve for each item.
     * Finds the best inventory record (by product) and reserves the required quantity.
     */
    public void reserveInventory(Order order) {
        log.info("Reserving inventory for order: {}", order.getOrderNumber());

        for (OrderItem orderItem : order.getItems()) {
            if (orderItem.getApprovedQty() <= 0) continue;

            String productId = orderItem.getItemId();
            int qtyToReserve = orderItem.getApprovedQty();

            reserveStockForProduct(productId, qtyToReserve, order.getOrderNumber());
        }

        log.info("Inventory reservation complete for order: {}", order.getOrderNumber());
    }

    /**
     * Reserves stock for a single product across its inventory records.
     * Distributes the reservation across multiple inventory records if needed (FIFO).
     */
    private void reserveStockForProduct(String productId, int qtyToReserve, String orderNumber) {
        try {
            List<InventoryItemResponse> inventories = inventoryRestClient.get()
                    .uri("/api/inventory/product/{productId}", productId)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<InventoryItemResponse>>() {});

            if (inventories == null || inventories.isEmpty()) {
                throw new ExternalServiceException(
                        "No inventory records found for product " + productId + " when reserving stock");
            }

            int remaining = qtyToReserve;

            for (InventoryItemResponse inv : inventories) {
                if (remaining <= 0) break;

                int available = inv.quantityAvailable() != null ? inv.quantityAvailable() : 0;
                if (available <= 0) continue;

                int toReserve = Math.min(remaining, available);

                Map<String, Object> requestBody = Map.of(
                        "inventoryId", inv.inventoryId(),
                        "quantity", toReserve,
                        "reason", "Reserved for order " + orderNumber
                );

                inventoryRestClient.post()
                        .uri("/api/inventory/reserve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(requestBody)
                        .retrieve()
                        .toBodilessEntity();

                log.debug("Reserved {} units from inventoryId {} for product {}",
                        toReserve, inv.inventoryId(), productId);

                remaining -= toReserve;
            }

            if (remaining > 0) {
                log.warn("Could not fully reserve product {} for order {} — short by {} units",
                        productId, orderNumber, remaining);
            }

        } catch (RestClientException ex) {
            log.error("Failed to reserve stock for product: {}", productId, ex);
            throw new ExternalServiceException(
                    "Inventory Service reservation failed for product " + productId + ": " + ex.getMessage(), ex);
        }
    }
}
