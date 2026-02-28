package com.wms.inbound_receiving_service.service.impl;

import com.wms.inbound_receiving_service.dto.*;
import com.wms.inbound_receiving_service.model.*;
import com.wms.inbound_receiving_service.repository.*;
import com.wms.inbound_receiving_service.service.InboundService;
import com.wms.inbound_receiving_service.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InboundServiceImpl implements InboundService {

    private final InboundRepository shipmentRepository;
    private final InboundReceiptRepository receiptRepository;
    private final InboundReceiptItemRepository receiptItemRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public InboundResponseDTO receiveShipment(InboundRequestDTO request) {
        Supplier supplier = supplierRepository.findBySupplierName(request.getSupplierName())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));

        Product product = productRepository.findByProductName(request.getProductName())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        InboundShipment shipment = InboundShipment.builder()
                .supplierName(request.getSupplierName())
                .productName(request.getProductName())
                .quantity(request.getQuantity())
                .status("RECEIVED")
                .build();
        shipment = shipmentRepository.save(shipment);

        InboundReceipt receipt = new InboundReceipt();
        receipt.setSupplier(supplier);
        receipt.setReceiptDate(LocalDate.now());
        receipt.setStatus("COMPLETED");
        receipt.setShipmentId(shipment.getId());
        receipt.setGrnNumber("GRN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        InboundReceiptItem item = new InboundReceiptItem();
        item.setProduct(product);
        item.setQuantityReceived(request.getQuantity());
        item.setQualityStatus("GOOD");
        receipt.addItem(item);

        InboundReceipt saved = receiptRepository.save(receipt);
        return mapToResponse(saved);
    }

    @Override
    public List<InboundResponseDTO> getAllShipments() {
        return shipmentRepository.findAll().stream()
                .map(s -> InboundResponseDTO.builder()
                        .id(s.getId())
                        .supplierName(s.getSupplierName())
                        .productName(s.getProductName())
                        .quantity(s.getQuantity())
                        .status(s.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<InboundReceiptDTO> getAllReceipts() {
        return receiptRepository.findAllWithSupplier().stream()
                .map(r -> InboundReceiptDTO.builder()
                        .id(r.getReceiptId())
                        .receiptNumber(r.getGrnNumber())
                        .supplierName(r.getSupplier().getSupplierName())
                        .receivedAt(r.getReceiptDate().atStartOfDay())
                        .status(r.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<InboundReceiptItemDTO> getAllReceiptItems() {
        return receiptItemRepository.findAllWithDetails().stream()
                .map(i -> InboundReceiptItemDTO.builder()
                        .id(i.getReceiptItemId())
                        .receiptId(i.getReceipt().getReceiptId())
                        .productName(i.getProduct().getProductName())
                        .quantityReceived(i.getQuantityReceived())
                        .condition(i.getQualityStatus()) // Map qualityStatus to condition
                        .build())
                .collect(Collectors.toList());
    }


    @Override
    public InboundResponseDTO getShipmentById(Long id) {
        InboundReceipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with ID: " + id));
        return mapToResponse(receipt);
    }

    @Override
    @Transactional
    public InboundResponseDTO updateShipmentStatus(Long id, String status) {
        InboundReceipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found"));
        receipt.setStatus(status);
        return mapToResponse(receiptRepository.save(receipt));
    }

    @Override
    @Transactional
    public void deleteShipment(Long id) {
        if (!receiptRepository.existsById(id)) {
            throw new ResourceNotFoundException("Receipt not found");
        }
        receiptRepository.deleteById(id);
    }

    private InboundResponseDTO mapToResponse(InboundReceipt receipt) {
        String productName = receipt.getItems().isEmpty() ? "N/A" :
                receipt.getItems().get(0).getProduct().getProductName();
        int qty = receipt.getItems().isEmpty() ? 0 :
                receipt.getItems().get(0).getQuantityReceived();

        return InboundResponseDTO.builder()
                .id(receipt.getReceiptId())
                .supplierName(receipt.getSupplier().getSupplierName())
                .productName(productName)
                .quantity(qty)
                .status(receipt.getStatus())
                .build();
    }
}