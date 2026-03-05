package com.wms.orderservice.service.impl;

import com.wms.orderservice.dto.request.ApproveOrderRequest;
import com.wms.orderservice.dto.request.ApprovedItemRequest;
import com.wms.orderservice.dto.request.CreateOrderItemRequest;
import com.wms.orderservice.dto.request.CreateOrderRequest;
import com.wms.orderservice.dto.request.UpdateOrderStatusRequest;
import com.wms.orderservice.dto.response.AvailabilityResponse;
import com.wms.orderservice.dto.response.MissingItemResponse;
import com.wms.orderservice.dto.response.OrderResponse;
import com.wms.orderservice.entity.Order;
import com.wms.orderservice.entity.OrderItem;
import com.wms.orderservice.entity.OrderStatus;
import com.wms.orderservice.exception.BusinessException;
import com.wms.orderservice.exception.NotFoundException;
import com.wms.orderservice.mapper.OrderMapper;
import com.wms.orderservice.repository.OrderRepository;
import com.wms.orderservice.service.client.InventoryClient;
import com.wms.orderservice.util.OrderNumberGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Spy
    private OrderMapper orderMapper = new OrderMapper();

    @Mock
    private OrderNumberGenerator orderNumberGenerator;

    @Mock
    private InventoryClient inventoryClient;

    @InjectMocks
    private OrderServiceImpl orderService;

    private UUID orderId;
    private Order sampleOrder;

    @BeforeEach
    void setUp() {
        orderId = UUID.randomUUID();

        OrderItem item1 = OrderItem.builder()
                .id(UUID.randomUUID())
                .itemId("ITEM-001")
                .requestedQty(10)
                .approvedQty(0)
                .unitPrice(new BigDecimal("250.00"))
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        OrderItem item2 = OrderItem.builder()
                .id(UUID.randomUUID())
                .itemId("ITEM-002")
                .requestedQty(5)
                .approvedQty(0)
                .unitPrice(new BigDecimal("500.00"))
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        sampleOrder = Order.builder()
                .id(orderId)
                .orderNumber("ORD-2026-000001")
                .customerId("CUST-LK-001")
                .status(OrderStatus.CREATED)
                .partialAllowed(true)
                .totalAmount(BigDecimal.ZERO)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .items(new ArrayList<>(List.of(item1, item2)))
                .build();

        item1.setOrder(sampleOrder);
        item2.setOrder(sampleOrder);
    }

    @Nested
    @DisplayName("Create Order")
    class CreateOrderTests {

        @Test
        @DisplayName("Should create order with items successfully")
        void createOrder_success() {
            CreateOrderRequest request = CreateOrderRequest.builder()
                    .customerId("CUST-LK-001")
                    .partialAllowed(true)
                    .items(List.of(
                            CreateOrderItemRequest.builder()
                                    .itemId("ITEM-001")
                                    .quantity(10)
                                    .unitPrice(new BigDecimal("250.00"))
                                    .build()
                    ))
                    .build();

            when(orderNumberGenerator.generateOrderNumber()).thenReturn("ORD-2026-000001");
            when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
                Order saved = invocation.getArgument(0);
                saved.setId(UUID.randomUUID());
                saved.setCreatedAt(OffsetDateTime.now());
                saved.setUpdatedAt(OffsetDateTime.now());
                return saved;
            });

            OrderResponse response = orderService.createOrder(request);

            assertNotNull(response);
            assertEquals("CUST-LK-001", response.customerId());
            assertEquals(OrderStatus.CREATED, response.status());
            assertEquals("ORD-2026-000001", response.orderNumber());
            assertEquals(1, response.items().size());
            verify(orderRepository).save(any(Order.class));
            verify(orderNumberGenerator).generateOrderNumber();
        }
    }

    @Nested
    @DisplayName("Get Order")
    class GetOrderTests {

        @Test
        @DisplayName("Should return order when found")
        void getOrderById_found() {
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));

            OrderResponse response = orderService.getOrderById(orderId);

            assertNotNull(response);
            assertEquals(orderId, response.id());
            assertEquals("ORD-2026-000001", response.orderNumber());
        }

        @Test
        @DisplayName("Should throw NotFoundException when order not found")
        void getOrderById_notFound() {
            UUID unknownId = UUID.randomUUID();
            when(orderRepository.findById(unknownId)).thenReturn(Optional.empty());

            assertThrows(NotFoundException.class, () -> orderService.getOrderById(unknownId));
        }
    }

    @Nested
    @DisplayName("Get All Orders")
    class GetAllOrdersTests {

        private final Pageable pageable = PageRequest.of(0, 20);

        @Test
        @DisplayName("Should return all orders when no filter")
        void getAllOrders_noFilter() {
            Page<Order> orderPage = new PageImpl<>(List.of(sampleOrder));
            when(orderRepository.findAll(pageable)).thenReturn(orderPage);

            Page<OrderResponse> responses = orderService.getAllOrders(null, pageable);

            assertEquals(1, responses.getContent().size());
            verify(orderRepository).findAll(pageable);
            verify(orderRepository, never()).findByStatus(any(), any());
        }

        @Test
        @DisplayName("Should filter by status when provided")
        void getAllOrders_withStatusFilter() {
            Page<Order> orderPage = new PageImpl<>(List.of(sampleOrder));
            when(orderRepository.findByStatus(OrderStatus.CREATED, pageable)).thenReturn(orderPage);

            Page<OrderResponse> responses = orderService.getAllOrders(OrderStatus.CREATED, pageable);

            assertEquals(1, responses.getContent().size());
            verify(orderRepository).findByStatus(OrderStatus.CREATED, pageable);
            verify(orderRepository, never()).findAll(pageable);
        }
    }

    @Nested
    @DisplayName("Validate Order")
    class ValidateOrderTests {

        @Test
        @DisplayName("Should validate and set VALIDATED when canFulfill=true")
        void validateOrder_canFulfill() {
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
            when(inventoryClient.checkAvailability(sampleOrder))
                    .thenReturn(AvailabilityResponse.builder()
                            .canFulfill(true)
                            .missingItems(List.of())
                            .build());
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            AvailabilityResponse response = orderService.validateOrder(orderId);

            assertTrue(response.canFulfill());
            assertEquals(OrderStatus.VALIDATED, sampleOrder.getStatus());
            verify(orderRepository).save(sampleOrder);
        }

        @Test
        @DisplayName("Should REJECT when canFulfill=false and partialAllowed=false")
        void validateOrder_rejected() {
            sampleOrder.setPartialAllowed(false);
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
            when(inventoryClient.checkAvailability(sampleOrder))
                    .thenReturn(AvailabilityResponse.builder()
                            .canFulfill(false)
                            .missingItems(List.of(
                                    MissingItemResponse.builder().itemId("ITEM-001").missingQty(3).build()
                            ))
                            .build());
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            AvailabilityResponse response = orderService.validateOrder(orderId);

            assertFalse(response.canFulfill());
            assertEquals(OrderStatus.REJECTED, sampleOrder.getStatus());
        }

        @Test
        @DisplayName("Should VALIDATE when canFulfill=false but partialAllowed=true")
        void validateOrder_partialAllowed() {
            sampleOrder.setPartialAllowed(true);
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
            when(inventoryClient.checkAvailability(sampleOrder))
                    .thenReturn(AvailabilityResponse.builder()
                            .canFulfill(false)
                            .missingItems(List.of())
                            .build());
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            orderService.validateOrder(orderId);

            assertEquals(OrderStatus.VALIDATED, sampleOrder.getStatus());
        }

        @Test
        @DisplayName("Should throw BusinessException if order not in CREATED status")
        void validateOrder_wrongStatus() {
            sampleOrder.setStatus(OrderStatus.APPROVED);
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));

            assertThrows(BusinessException.class, () -> orderService.validateOrder(orderId));
        }
    }

    @Nested
    @DisplayName("Approve Order")
    class ApproveOrderTests {

        @BeforeEach
        void setValidated() {
            sampleOrder.setStatus(OrderStatus.VALIDATED);
        }

        @Test
        @DisplayName("FULL approval — sufficient stock")
        void approveOrder_full_success() {
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
            when(inventoryClient.checkAvailability(sampleOrder))
                    .thenReturn(AvailabilityResponse.builder().canFulfill(true).build());
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            ApproveOrderRequest request = ApproveOrderRequest.builder()
                    .approvalType(ApproveOrderRequest.ApprovalType.FULL)
                    .build();

            OrderResponse response = orderService.approveOrder(orderId, request);

            assertEquals(OrderStatus.APPROVED, sampleOrder.getStatus());
            sampleOrder.getItems().forEach(item ->
                    assertEquals(item.getRequestedQty(), item.getApprovedQty()));
            verify(inventoryClient).reserveInventory(any(Order.class));
        }

        @Test
        @DisplayName("FULL approval — insufficient stock — should throw")
        void approveOrder_full_insufficientStock() {
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
            when(inventoryClient.checkAvailability(sampleOrder))
                    .thenReturn(AvailabilityResponse.builder().canFulfill(false).build());

            ApproveOrderRequest request = ApproveOrderRequest.builder()
                    .approvalType(ApproveOrderRequest.ApprovalType.FULL)
                    .build();

            assertThrows(BusinessException.class, () -> orderService.approveOrder(orderId, request));
        }

        @Test
        @DisplayName("AUTO approval — sufficient stock → APPROVED")
        void approveOrder_auto_sufficientStock() {
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
            when(inventoryClient.checkAvailability(sampleOrder))
                    .thenReturn(AvailabilityResponse.builder().canFulfill(true).build());
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            ApproveOrderRequest request = ApproveOrderRequest.builder()
                    .approvalType(ApproveOrderRequest.ApprovalType.AUTO)
                    .build();

            orderService.approveOrder(orderId, request);

            assertEquals(OrderStatus.APPROVED, sampleOrder.getStatus());
        }

        @Test
        @DisplayName("AUTO approval — insufficient stock, partialAllowed → PARTIALLY_APPROVED")
        void approveOrder_auto_partialApproved() {
            sampleOrder.setPartialAllowed(true);
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
            when(inventoryClient.checkAvailability(sampleOrder))
                    .thenReturn(AvailabilityResponse.builder()
                            .canFulfill(false)
                            .suggestedApprovedItems(List.of(
                                    AvailabilityResponse.SuggestedApprovedItem.builder()
                                            .itemId("ITEM-001").approvedQty(7).build(),
                                    AvailabilityResponse.SuggestedApprovedItem.builder()
                                            .itemId("ITEM-002").approvedQty(3).build()
                            ))
                            .build());
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            ApproveOrderRequest request = ApproveOrderRequest.builder()
                    .approvalType(ApproveOrderRequest.ApprovalType.AUTO)
                    .build();

            orderService.approveOrder(orderId, request);

            assertEquals(OrderStatus.PARTIALLY_APPROVED, sampleOrder.getStatus());
            assertEquals(7, sampleOrder.getItems().get(0).getApprovedQty());
            assertEquals(3, sampleOrder.getItems().get(1).getApprovedQty());
        }

        @Test
        @DisplayName("AUTO approval — insufficient stock, partialAllowed=false → throws")
        void approveOrder_auto_notPartialAllowed() {
            sampleOrder.setPartialAllowed(false);
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
            when(inventoryClient.checkAvailability(sampleOrder))
                    .thenReturn(AvailabilityResponse.builder().canFulfill(false).build());

            ApproveOrderRequest request = ApproveOrderRequest.builder()
                    .approvalType(ApproveOrderRequest.ApprovalType.AUTO)
                    .build();

            assertThrows(BusinessException.class, () -> orderService.approveOrder(orderId, request));
        }

        @Test
        @DisplayName("PARTIAL approval — valid quantities")
        void approveOrder_partial_success() {
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
            when(inventoryClient.checkAvailability(sampleOrder))
                    .thenReturn(AvailabilityResponse.builder().canFulfill(true).build());
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            ApproveOrderRequest request = ApproveOrderRequest.builder()
                    .approvalType(ApproveOrderRequest.ApprovalType.PARTIAL)
                    .approvedItems(List.of(
                            ApprovedItemRequest.builder().itemId("ITEM-001").approvedQty(5).build(),
                            ApprovedItemRequest.builder().itemId("ITEM-002").approvedQty(3).build()
                    ))
                    .build();

            orderService.approveOrder(orderId, request);

            assertEquals(OrderStatus.PARTIALLY_APPROVED, sampleOrder.getStatus());
            assertEquals(5, sampleOrder.getItems().get(0).getApprovedQty());
            assertEquals(3, sampleOrder.getItems().get(1).getApprovedQty());
        }

        @Test
        @DisplayName("PARTIAL approval — approvedQty > requestedQty → throws")
        void approveOrder_partial_exceedsRequested() {
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
            when(inventoryClient.checkAvailability(sampleOrder))
                    .thenReturn(AvailabilityResponse.builder().canFulfill(true).build());

            ApproveOrderRequest request = ApproveOrderRequest.builder()
                    .approvalType(ApproveOrderRequest.ApprovalType.PARTIAL)
                    .approvedItems(List.of(
                            ApprovedItemRequest.builder().itemId("ITEM-001").approvedQty(999).build()
                    ))
                    .build();

            assertThrows(BusinessException.class, () -> orderService.approveOrder(orderId, request));
        }

        @Test
        @DisplayName("PARTIAL approval — unknown item → throws")
        void approveOrder_partial_unknownItem() {
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
            when(inventoryClient.checkAvailability(sampleOrder))
                    .thenReturn(AvailabilityResponse.builder().canFulfill(true).build());

            ApproveOrderRequest request = ApproveOrderRequest.builder()
                    .approvalType(ApproveOrderRequest.ApprovalType.PARTIAL)
                    .approvedItems(List.of(
                            ApprovedItemRequest.builder().itemId("UNKNOWN-ITEM").approvedQty(1).build()
                    ))
                    .build();

            assertThrows(BusinessException.class, () -> orderService.approveOrder(orderId, request));
        }

        @Test
        @DisplayName("PARTIAL approval — empty items list → throws")
        void approveOrder_partial_emptyList() {
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
            when(inventoryClient.checkAvailability(sampleOrder))
                    .thenReturn(AvailabilityResponse.builder().canFulfill(true).build());

            ApproveOrderRequest request = ApproveOrderRequest.builder()
                    .approvalType(ApproveOrderRequest.ApprovalType.PARTIAL)
                    .approvedItems(List.of())
                    .build();

            assertThrows(BusinessException.class, () -> orderService.approveOrder(orderId, request));
        }

        @Test
        @DisplayName("Approve requires VALIDATED status")
        void approveOrder_wrongStatus() {
            sampleOrder.setStatus(OrderStatus.CREATED);
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));

            ApproveOrderRequest request = ApproveOrderRequest.builder()
                    .approvalType(ApproveOrderRequest.ApprovalType.FULL)
                    .build();

            assertThrows(BusinessException.class, () -> orderService.approveOrder(orderId, request));
        }
    }

    @Nested
    @DisplayName("Cancel Order")
    class CancelOrderTests {

        @Test
        @DisplayName("Should cancel order from CREATED status")
        void cancelOrder_fromCreated() {
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            OrderResponse response = orderService.cancelOrder(orderId);

            assertEquals(OrderStatus.CANCELLED, sampleOrder.getStatus());
        }

        @Test
        @DisplayName("Should not cancel DISPATCHED order")
        void cancelOrder_dispatched_throws() {
            sampleOrder.setStatus(OrderStatus.DISPATCHED);
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));

            assertThrows(BusinessException.class, () -> orderService.cancelOrder(orderId));
        }

        @Test
        @DisplayName("Should not cancel DELIVERED order")
        void cancelOrder_delivered_throws() {
            sampleOrder.setStatus(OrderStatus.DELIVERED);
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));

            assertThrows(BusinessException.class, () -> orderService.cancelOrder(orderId));
        }
    }

    @Nested
    @DisplayName("Update Order Status")
    class UpdateStatusTests {

        @Test
        @DisplayName("Valid transition: APPROVED → PICKING_REQUESTED")
        void updateStatus_validTransition() {
            sampleOrder.setStatus(OrderStatus.APPROVED);
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                    .status(OrderStatus.PICKING_REQUESTED)
                    .build();

            OrderResponse response = orderService.updateOrderStatus(orderId, request);

            assertEquals(OrderStatus.PICKING_REQUESTED, sampleOrder.getStatus());
        }

        @Test
        @DisplayName("Valid transition: PACKED → DISPATCHED")
        void updateStatus_packedToDispatched() {
            sampleOrder.setStatus(OrderStatus.PACKED);
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                    .status(OrderStatus.DISPATCHED)
                    .build();

            orderService.updateOrderStatus(orderId, request);

            assertEquals(OrderStatus.DISPATCHED, sampleOrder.getStatus());
        }

        @Test
        @DisplayName("Invalid transition: CREATED → DELIVERED → throws")
        void updateStatus_invalidTransition() {
            sampleOrder.setStatus(OrderStatus.CREATED);
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));

            UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                    .status(OrderStatus.DELIVERED)
                    .build();

            assertThrows(BusinessException.class, () -> orderService.updateOrderStatus(orderId, request));
        }

        @Test
        @DisplayName("Invalid transition: CANCELLED → any → throws")
        void updateStatus_fromCancelled() {
            sampleOrder.setStatus(OrderStatus.CANCELLED);
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));

            UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                    .status(OrderStatus.APPROVED)
                    .build();

            assertThrows(BusinessException.class, () -> orderService.updateOrderStatus(orderId, request));
        }

        @Test
        @DisplayName("Invalid transition: DELIVERED → any → throws")
        void updateStatus_fromDelivered() {
            sampleOrder.setStatus(OrderStatus.DELIVERED);
            when(orderRepository.findById(orderId)).thenReturn(Optional.of(sampleOrder));

            UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                    .status(OrderStatus.CREATED)
                    .build();

            assertThrows(BusinessException.class, () -> orderService.updateOrderStatus(orderId, request));
        }
    }
}
