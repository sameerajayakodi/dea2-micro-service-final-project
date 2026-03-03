package com.wms.orderservice.mapper;

import com.wms.orderservice.dto.request.CreateOrderItemRequest;
import com.wms.orderservice.dto.request.CreateOrderRequest;
import com.wms.orderservice.dto.response.OrderItemResponse;
import com.wms.orderservice.dto.response.OrderResponse;
import com.wms.orderservice.entity.Order;
import com.wms.orderservice.entity.OrderItem;
import com.wms.orderservice.entity.OrderStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public Order toEntity(CreateOrderRequest request) {
        Order order = Order.builder()
                .customerId(request.customerId())
                .partialAllowed(request.partialAllowed())
                .status(OrderStatus.CREATED)
                .build();

        if (request.items() != null) {
            List<OrderItem> items = request.items().stream()
                    .map(this::toOrderItemEntity)
                    .collect(Collectors.toList());
            items.forEach(order::addItem);
        }

        return order;
    }

    public OrderItem toOrderItemEntity(CreateOrderItemRequest request) {
        return OrderItem.builder()
                .itemId(request.itemId())
                .requestedQty(request.quantity())
                .approvedQty(0)
                .unitPrice(request.unitPrice())
                .build();
    }

    public OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomerId())
                .status(order.getStatus())
                .partialAllowed(order.isPartialAllowed())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .workerId(order.getWorkerId())
                .items(toOrderItemResponses(order.getItems()))
                .build();
    }

    public List<OrderItemResponse> toOrderItemResponses(List<OrderItem> items) {
        if (items == null) return List.of();
        return items.stream()
                .map(this::toOrderItemResponse)
                .collect(Collectors.toList());
    }

    public OrderItemResponse toOrderItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .itemId(item.getItemId())
                .requestedQty(item.getRequestedQty())
                .approvedQty(item.getApprovedQty())
                .unitPrice(item.getUnitPrice())
                .build();
    }

    public List<OrderResponse> toResponseList(List<Order> orders) {
        return orders.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
