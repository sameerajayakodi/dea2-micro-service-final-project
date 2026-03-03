package com.wms.orderservice.dto.response;

import com.wms.orderservice.entity.OrderStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record OrderResponse(
        UUID id,
        String orderNumber,
        String customerId,
        OrderStatus status,
        boolean partialAllowed,
        BigDecimal totalAmount,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        String workerId,
        List<OrderItemResponse> items
) {}
