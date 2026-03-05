package com.wms.orderservice.service.impl;

import com.wms.orderservice.dto.request.ApproveOrderRequest;
import com.wms.orderservice.dto.request.ApprovedItemRequest;
import com.wms.orderservice.dto.request.CreateOrderRequest;
import com.wms.orderservice.dto.request.UpdateOrderStatusRequest;
import com.wms.orderservice.dto.request.UpdateOrderRequest;
import com.wms.orderservice.dto.response.AvailabilityResponse;
import com.wms.orderservice.dto.response.OrderResponse;
import com.wms.orderservice.dto.response.OrderStatusHistoryResponse;
import com.wms.orderservice.entity.Order;
import com.wms.orderservice.entity.OrderItem;
import com.wms.orderservice.entity.OrderStatus;
import com.wms.orderservice.entity.OrderStatusHistory;
import com.wms.orderservice.exception.BusinessException;
import com.wms.orderservice.exception.NotFoundException;
import com.wms.orderservice.mapper.OrderMapper;
import com.wms.orderservice.repository.OrderRepository;
import com.wms.orderservice.service.OrderService;
import com.wms.orderservice.service.client.InventoryClient;
import com.wms.orderservice.util.OrderNumberGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderNumberGenerator orderNumberGenerator;
    private final InventoryClient inventoryClient;

    // Defines which status transitions are allowed for each order state
    private static final Map<OrderStatus, Set<OrderStatus>> LEGAL_TRANSITIONS = Map.ofEntries(
            Map.entry(OrderStatus.CREATED, Set.of(OrderStatus.VALIDATED, OrderStatus.REJECTED, OrderStatus.CANCELLED)),
            Map.entry(OrderStatus.VALIDATED, Set.of(OrderStatus.APPROVED, OrderStatus.PARTIALLY_APPROVED, OrderStatus.REJECTED, OrderStatus.CANCELLED)),
            Map.entry(OrderStatus.APPROVED, Set.of(OrderStatus.PICKING_REQUESTED, OrderStatus.CANCELLED)),
            Map.entry(OrderStatus.PARTIALLY_APPROVED, Set.of(OrderStatus.PICKING_REQUESTED, OrderStatus.CANCELLED)),
            Map.entry(OrderStatus.REJECTED, Set.of()),
            Map.entry(OrderStatus.CANCELLED, Set.of()),
            Map.entry(OrderStatus.PICKING_REQUESTED, Set.of(OrderStatus.PACKED, OrderStatus.CANCELLED)),
            Map.entry(OrderStatus.PACKED, Set.of(OrderStatus.DISPATCHED)),
            Map.entry(OrderStatus.DISPATCHED, Set.of(OrderStatus.DELIVERED)),
            Map.entry(OrderStatus.DELIVERED, Set.of())
    );


    @Override
    public OrderResponse createOrder(CreateOrderRequest request) {
        log.info("Creating order for customer: {}", request.customerId());

        Order order = orderMapper.toEntity(request);
        order.setOrderNumber(orderNumberGenerator.generateOrderNumber());
        changeOrderStatus(order, OrderStatus.CREATED, "Order created");

        calculateTotalAmount(order);

        Order saved = orderRepository.save(order);
        log.info("Order created: {} ({})", saved.getOrderNumber(), saved.getId());

        return orderMapper.toResponse(saved);
    }


    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID id) {
        Order order = findOrderOrThrow(id);
        return orderMapper.toResponse(order);
    }


    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable) {
        Page<Order> orders;
        if (status != null) {
            orders = orderRepository.findByStatus(status, pageable);
        } else {
            orders = orderRepository.findAll(pageable);
        }
        return orders.map(orderMapper::toResponse);
    }


    @Override
    public AvailabilityResponse validateOrder(UUID id) {
        Order order = findOrderOrThrow(id);

        if (order.getStatus() != OrderStatus.CREATED) {
            throw new BusinessException("Order can only be validated from CREATED status. Current status: " + order.getStatus());
        }

        log.info("Validating order: {} ({})", order.getOrderNumber(), id);

        AvailabilityResponse availability = inventoryClient.checkAvailability(order);

        if (!availability.canFulfill() && !order.isPartialAllowed()) {
            changeOrderStatus(order, OrderStatus.REJECTED, "Inventory cannot fulfill requested items and partial not allowed");
            orderRepository.save(order);
            log.info("Order {} REJECTED — cannot fulfill and partial not allowed", order.getOrderNumber());
        } else {
            changeOrderStatus(order, OrderStatus.VALIDATED, "Inventory check passed");
            orderRepository.save(order);
            log.info("Order {} VALIDATED", order.getOrderNumber());
        }

        return availability;
    }


    @Override
    public OrderResponse approveOrder(UUID id, ApproveOrderRequest request) {
        Order order = findOrderOrThrow(id);

        if (order.getStatus() != OrderStatus.VALIDATED) {
            throw new BusinessException("Order must be in VALIDATED status to approve. Current status: " + order.getStatus());
        }

        log.info("Approving order: {} ({}) with type: {}", order.getOrderNumber(), id, request.approvalType());

        // Re-check inventory before approving to ensure stock is still available
        AvailabilityResponse availability = inventoryClient.checkAvailability(order);

        switch (request.approvalType()) {
            case FULL -> handleFullApproval(order, availability);
            case AUTO -> handleAutoApproval(order, availability);
            case PARTIAL -> handlePartialApproval(order, request, availability);
        }

        calculateTotalAmount(order);
        Order saved = orderRepository.save(order);

        inventoryClient.reserveInventory(saved);

        return orderMapper.toResponse(saved);
    }


    @Override
    public OrderResponse cancelOrder(UUID id) {
        Order order = findOrderOrThrow(id);

        if (order.getStatus() == OrderStatus.DISPATCHED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessException("Cannot cancel order that is already " + order.getStatus());
        }

        changeOrderStatus(order, OrderStatus.CANCELLED, "Order cancelled by user");
        Order saved = orderRepository.save(order);
        log.info("Order {} CANCELLED", order.getOrderNumber());

        return orderMapper.toResponse(saved);
    }


    @Override
    public OrderResponse updateOrderStatus(UUID id, UpdateOrderStatusRequest request) {
        Order order = findOrderOrThrow(id);
        OrderStatus newStatus = request.status();

        validateTransition(order.getStatus(), newStatus);

        changeOrderStatus(order, newStatus, "Manual status update");
        Order saved = orderRepository.save(order);
        log.info("Order {} status updated: {} -> {}", order.getOrderNumber(), order.getStatus(), newStatus);

        return orderMapper.toResponse(saved);
    }

    @Override
    public OrderResponse updateWorkerId(UUID id, com.wms.orderservice.dto.request.UpdateWorkerRequest request) {
        Order order = findOrderOrThrow(id);
        
        order.setWorkerId(request.workerId());
        Order saved = orderRepository.save(order);
        log.info("Order {} worker ID updated to: {}", order.getOrderNumber(), request.workerId());
        
        return orderMapper.toResponse(saved);
    }

    @Override
    public OrderResponse updateOrder(UUID id, UpdateOrderRequest request) {
        Order order = findOrderOrThrow(id);

        if (order.getStatus() != OrderStatus.CREATED) {
            throw new BusinessException("Order can only be modified in CREATED status. Current status: " + order.getStatus());
        }

        log.info("Updating order: {} ({})", order.getOrderNumber(), id);

        order.setPartialAllowed(request.partialAllowed());
        
        // Clear existing items and add new ones
        order.getItems().clear();
        
        request.items().forEach(reqItem -> {
            OrderItem item = OrderItem.builder()
                    .itemId(reqItem.itemId())
                    .requestedQty(reqItem.quantity())
                    .unitPrice(reqItem.unitPrice())
                    .build();
            order.addItem(item);
        });

        calculateTotalAmount(order);
        Order saved = orderRepository.save(order);
        log.info("Order {} updated", saved.getOrderNumber());

        return orderMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderStatusHistoryResponse> getOrderStatusHistory(UUID id) {
        Order order = findOrderOrThrow(id);
        
        return order.getStatusHistory().stream()
                .map(history -> OrderStatusHistoryResponse.builder()
                        .id(history.getId())
                        .previousStatus(history.getPreviousStatus())
                        .newStatus(history.getNewStatus())
                        .reason(history.getReason())
                        .changedAt(history.getChangedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // --- Helper methods ---

    private void changeOrderStatus(Order order, OrderStatus newStatus, String reason) {
        if (order.getStatus() == newStatus) return;
        OrderStatusHistory history = OrderStatusHistory.builder()
                .previousStatus(order.getStatus())
                .newStatus(newStatus)
                .reason(reason)
                .build();
        order.addStatusHistory(history);
        order.setStatus(newStatus);
    }

    private Order findOrderOrThrow(UUID id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Order", id));
    }

    private void validateTransition(OrderStatus from, OrderStatus to) {
        Set<OrderStatus> allowed = LEGAL_TRANSITIONS.getOrDefault(from, Set.of());
        if (!allowed.contains(to)) {
            throw new BusinessException(
                    String.format("Invalid status transition: %s -> %s. Allowed: %s", from, to, allowed));
        }
    }

    private void calculateTotalAmount(Order order) {
        BigDecimal total = order.getItems().stream()
                .filter(item -> item.getUnitPrice() != null)
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(
                        item.getApprovedQty() > 0 ? item.getApprovedQty() : item.getRequestedQty())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(total);
    }


    private void handleFullApproval(Order order, AvailabilityResponse availability) {
        if (!availability.canFulfill()) {
            throw new BusinessException("Cannot fully approve — insufficient stock. Use AUTO or PARTIAL approval.");
        }
        order.getItems().forEach(item -> item.setApprovedQty(item.getRequestedQty()));
        changeOrderStatus(order, OrderStatus.APPROVED, "Order fully approved based on request");
        log.info("Order {} FULLY APPROVED", order.getOrderNumber());
    }


    private void handleAutoApproval(Order order, AvailabilityResponse availability) {
        if (availability.canFulfill()) {
            order.getItems().forEach(item -> item.setApprovedQty(item.getRequestedQty()));
            changeOrderStatus(order, OrderStatus.APPROVED, "Auto fully approved (sufficient stock)");
            log.info("Order {} AUTO → FULLY APPROVED (sufficient stock)", order.getOrderNumber());
        } else if (order.isPartialAllowed()) {
            // Partial fulfillment — use suggested quantities from the inventory check
            Map<String, Integer> suggestedMap = buildSuggestedMap(availability);
            order.getItems().forEach(item -> {
                int suggested = suggestedMap.getOrDefault(item.getItemId(), 0);
                item.setApprovedQty(Math.min(suggested, item.getRequestedQty()));
            });
            changeOrderStatus(order, OrderStatus.PARTIALLY_APPROVED, "Auto partially approved based on suggested quantities");
            log.info("Order {} AUTO → PARTIALLY APPROVED", order.getOrderNumber());
        } else {
            throw new BusinessException("Cannot auto-approve — insufficient stock and partial not allowed.");
        }
    }


    private void handlePartialApproval(Order order, ApproveOrderRequest request, AvailabilityResponse availability) {
        if (request.approvedItems() == null || request.approvedItems().isEmpty()) {
            throw new BusinessException("PARTIAL approval requires a list of approved items.");
        }

        Map<String, Integer> requestedMap = order.getItems().stream()
                .collect(Collectors.toMap(OrderItem::getItemId, OrderItem::getRequestedQty));

        for (ApprovedItemRequest ai : request.approvedItems()) {
            Integer requested = requestedMap.get(ai.itemId());
            if (requested == null) {
                throw new BusinessException("Item " + ai.itemId() + " does not exist in this order.");
            }
            if (ai.approvedQty() > requested) {
                throw new BusinessException(
                        String.format("Approved qty (%d) exceeds requested qty (%d) for item %s",
                                ai.approvedQty(), requested, ai.itemId()));
            }
        }

        Map<String, Integer> approvedMap = request.approvedItems().stream()
                .collect(Collectors.toMap(ApprovedItemRequest::itemId, ApprovedItemRequest::approvedQty));

        boolean allFull = true;
        for (OrderItem item : order.getItems()) {
            int approved = approvedMap.getOrDefault(item.getItemId(), 0);
            item.setApprovedQty(approved);
            if (approved < item.getRequestedQty()) {
                allFull = false;
            }
        }

        changeOrderStatus(order, allFull ? OrderStatus.APPROVED : OrderStatus.PARTIALLY_APPROVED, "Manual approval processed");
        log.info("Order {} PARTIAL → {}", order.getOrderNumber(), order.getStatus());
    }

    private Map<String, Integer> buildSuggestedMap(AvailabilityResponse availability) {
        if (availability.suggestedApprovedItems() == null) return Map.of();
        return availability.suggestedApprovedItems().stream()
                .collect(Collectors.toMap(
                        AvailabilityResponse.SuggestedApprovedItem::itemId,
                        AvailabilityResponse.SuggestedApprovedItem::approvedQty));
    }


}
