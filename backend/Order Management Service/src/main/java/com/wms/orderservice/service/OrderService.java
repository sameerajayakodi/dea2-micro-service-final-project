package com.wms.orderservice.service;

import com.wms.orderservice.dto.request.ApproveOrderRequest;
import com.wms.orderservice.dto.request.CreateOrderRequest;
import com.wms.orderservice.dto.request.UpdateOrderStatusRequest;
import com.wms.orderservice.dto.request.UpdateWorkerRequest;
import com.wms.orderservice.dto.response.AvailabilityResponse;
import com.wms.orderservice.dto.response.OrderResponse;
import com.wms.orderservice.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface OrderService {

    OrderResponse createOrder(CreateOrderRequest request);

    OrderResponse getOrderById(UUID id);

    Page<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable);

    AvailabilityResponse validateOrder(UUID id);

    OrderResponse approveOrder(UUID id, ApproveOrderRequest request);

    OrderResponse cancelOrder(UUID id);

    OrderResponse updateOrderStatus(UUID id, UpdateOrderStatusRequest request);

    OrderResponse updateWorkerId(UUID id, UpdateWorkerRequest request);

    OrderResponse updateOrder(UUID id, com.wms.orderservice.dto.request.UpdateOrderRequest request);

    java.util.List<com.wms.orderservice.dto.response.OrderStatusHistoryResponse> getOrderStatusHistory(UUID id);
}
