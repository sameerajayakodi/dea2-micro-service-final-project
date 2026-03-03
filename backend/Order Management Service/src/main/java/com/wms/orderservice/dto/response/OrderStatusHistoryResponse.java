package com.wms.orderservice.dto.response;

import com.wms.orderservice.entity.OrderStatus;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record OrderStatusHistoryResponse(
        UUID id,
        OrderStatus previousStatus,
        OrderStatus newStatus,
        String reason,
        OffsetDateTime changedAt
) {}
