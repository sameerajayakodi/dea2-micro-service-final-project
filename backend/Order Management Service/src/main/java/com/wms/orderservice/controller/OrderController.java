package com.wms.orderservice.controller;

import com.wms.orderservice.dto.request.ApproveOrderRequest;
import com.wms.orderservice.dto.request.CreateOrderRequest;
import com.wms.orderservice.dto.request.UpdateOrderStatusRequest;
import com.wms.orderservice.dto.response.AvailabilityResponse;
import com.wms.orderservice.dto.response.OrderResponse;
import com.wms.orderservice.entity.OrderStatus;
import com.wms.orderservice.exception.ApiError;
import com.wms.orderservice.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management endpoints for WMS")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(
            summary = "Create a new order",
            description = """
                    Creates a new order with one or more items. The order is initialized with status **CREATED**.
                    
                    **Business Rules:**
                    - `customerId` is required and cannot be blank
                    - At least one item must be provided
                    - Each item must have a valid `itemId` and `quantity >= 1`
                    - `partialAllowed` flag determines if partial fulfillment is acceptable during validation
                    - An order number in format `ORD-YYYY-NNNNNN` is auto-generated
                    - Total amount is calculated as sum of (quantity × unitPrice) for all items
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Order created successfully",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error — missing/invalid fields",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get order by ID",
            description = "Retrieves a single order by its UUID, including all order items with their requested and approved quantities."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order found",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "404", description = "Order not found",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<OrderResponse> getOrderById(
            @Parameter(description = "UUID of the order", required = true, example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
            @PathVariable UUID id) {
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(
            summary = "List orders",
            description = """
                    Returns a paginated list of orders. Optionally filter by status.
                    
                    **Available statuses:** CREATED, VALIDATED, APPROVED, PARTIALLY_APPROVED, REJECTED, CANCELLED, PICKING_REQUESTED, PACKED, DISPATCHED, DELIVERED
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of orders returned",
                    content = @Content(schema = @Schema(implementation = Page.class)))
    })
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @Parameter(description = "Filter by order status (optional)", example = "CREATED",
                    schema = @Schema(implementation = OrderStatus.class))
            @RequestParam(required = false) OrderStatus status,
            @ParameterObject @PageableDefault(size = 20) Pageable pageable) {
        Page<OrderResponse> responses = orderService.getAllOrders(status, pageable);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{id}/validate")
    @Operation(
            summary = "Validate order against inventory",
            description = """
                    Checks item availability via the Inventory Service.
                    
                    **Outcomes:**
                    - `canFulfill = true` → Order status set to **VALIDATED**
                    - `canFulfill = false` and `partialAllowed = false` → Order status set to **REJECTED**
                    - `canFulfill = false` and `partialAllowed = true` → Order status set to **VALIDATED** (partial fulfillment accepted)
                    
                    **Prerequisites:** Order must be in **CREATED** status.
                    
                    ⚠️ Requires the Inventory Service to be running.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Validation result returned",
                    content = @Content(schema = @Schema(implementation = AvailabilityResponse.class))),
            @ApiResponse(responseCode = "400", description = "Order is not in CREATED status",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Order not found",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "502", description = "Inventory Service unavailable",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<AvailabilityResponse> validateOrder(
            @Parameter(description = "UUID of the order to validate", required = true)
            @PathVariable UUID id) {
        AvailabilityResponse response = orderService.validateOrder(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/approve")
    @Operation(
            summary = "Approve order",
            description = """
                    Approves the order with one of three approval types:
                    
                    | Type | Description |
                    |------|------------|
                    | **FULL** | Approves all items with full requested quantities. Requires sufficient stock. |
                    | **PARTIAL** | Approves items with manually specified quantities via `approvedItems`. Each `approvedQty` must be ≤ `requestedQty`. |
                    | **AUTO** | Automatically determines quantities based on inventory availability. Uses `suggestedApprovedItems` from the validation response. |
                    
                    **Prerequisites:** Order must be in **VALIDATED** status.
                    
                    **Result:** Status becomes **APPROVED** (all items fully approved) or **PARTIALLY_APPROVED** (at least one item has reduced quantity).
                    
                    After approval, inventory is reserved via the Inventory Service.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order approved",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Business rule violation (e.g., insufficient stock, invalid quantities, wrong status)",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Order not found",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "502", description = "Inventory Service unavailable",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<OrderResponse> approveOrder(
            @Parameter(description = "UUID of the order to approve", required = true)
            @PathVariable UUID id,
            @Valid @RequestBody ApproveOrderRequest request) {
        OrderResponse response = orderService.approveOrder(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancel")
    @Operation(
            summary = "Cancel order",
            description = """
                    Cancels the order if it has not been dispatched or delivered.
                    
                    **Not allowed when status is:** DISPATCHED, DELIVERED
                    
                    **Result:** Status becomes **CANCELLED**.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order cancelled",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Cannot cancel — order already dispatched or delivered",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Order not found",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<OrderResponse> cancelOrder(
            @Parameter(description = "UUID of the order to cancel", required = true)
            @PathVariable UUID id) {
        OrderResponse response = orderService.cancelOrder(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(
            summary = "Update order status",
            description = """
                    Manual status update with transition validation.
                    
                    **Allowed transitions:**
                    | From | To |
                    |------|-----|
                    | APPROVED / PARTIALLY_APPROVED | PICKING_REQUESTED |
                    | PICKING_REQUESTED | PACKED |
                    | PACKED | DISPATCHED |
                    | DISPATCHED | DELIVERED |
                    
                    Any invalid transition will be rejected with a **BUSINESS_ERROR**.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid status transition",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Order not found",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @Parameter(description = "UUID of the order", required = true)
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse response = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/worker")
    @Operation(
            summary = "Update worker ID",
            description = "Assigns or updates the worker ID for a specific order."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Worker ID updated",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request or worker ID is empty",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Order not found",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<OrderResponse> updateWorkerId(
            @Parameter(description = "UUID of the order", required = true)
            @PathVariable UUID id,
            @Valid @RequestBody com.wms.orderservice.dto.request.UpdateWorkerRequest request) {
        OrderResponse response = orderService.updateWorkerId(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Modify order",
            description = "Modifies an existing order. Only allowed if the order is in CREATED status."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order updated",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request or order not in CREATED status",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Order not found",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<OrderResponse> updateOrder(
            @Parameter(description = "UUID of the order to modify", required = true)
            @PathVariable UUID id,
            @Valid @RequestBody com.wms.orderservice.dto.request.UpdateOrderRequest request) {
        OrderResponse response = orderService.updateOrder(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/history")
    @Operation(
            summary = "Get order status history",
            description = "Retrieves the history of status changes for a specific order."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order history returned",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = com.wms.orderservice.dto.response.OrderStatusHistoryResponse.class)))),
            @ApiResponse(responseCode = "404", description = "Order not found",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<java.util.List<com.wms.orderservice.dto.response.OrderStatusHistoryResponse>> getOrderStatusHistory(
            @Parameter(description = "UUID of the order", required = true)
            @PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderStatusHistory(id));
    }
}
