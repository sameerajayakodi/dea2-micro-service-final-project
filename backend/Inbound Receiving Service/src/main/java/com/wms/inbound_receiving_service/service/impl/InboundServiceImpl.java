package com.wms.inbound_receiving_service.service.impl;

import com.wms.inbound_receiving_service.client.ProductClient;
import com.wms.inbound_receiving_service.client.SupplierClient;
import com.wms.inbound_receiving_service.dto.InboundReceiptDTO;
import com.wms.inbound_receiving_service.dto.InboundReceiptItemDTO;
import com.wms.inbound_receiving_service.dto.InboundRequestDTO;
import com.wms.inbound_receiving_service.dto.InboundResponseDTO;
import com.wms.inbound_receiving_service.dto.SupplierListResponseDTO;
import com.wms.inbound_receiving_service.exception.ResourceNotFoundException;
import com.wms.inbound_receiving_service.model.InboundReceipt;
import com.wms.inbound_receiving_service.model.InboundReceiptItem;
import com.wms.inbound_receiving_service.model.InboundShipment;
import com.wms.inbound_receiving_service.model.Product;
import com.wms.inbound_receiving_service.model.Supplier;
import com.wms.inbound_receiving_service.repository.InboundReceiptItemRepository;
import com.wms.inbound_receiving_service.repository.InboundReceiptRepository;
import com.wms.inbound_receiving_service.repository.InboundRepository;
import com.wms.inbound_receiving_service.service.InboundService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InboundServiceImpl implements InboundService {

    private final InboundRepository shipmentRepository;
    private final InboundReceiptRepository receiptRepository;
    private final InboundReceiptItemRepository receiptItemRepository;

    private final SupplierClient supplierClient;
    private final ProductClient productClient;

    @Override
    @Transactional
    public InboundResponseDTO receiveShipment(InboundRequestDTO request) {

        Supplier supplier = fetchSupplierByName(request.getSupplierName());
        Product product = fetchProductByName(request.getProductName());

        if (request.getSku() != null && product.getSkuCode() != null
                && !request.getSku().trim().equalsIgnoreCase(product.getSkuCode().trim())) {
            throw new ResourceNotFoundException(
                    "SKU mismatch. Selected product SKU is " + product.getSkuCode()
                            + " but you sent " + request.getSku()
            );
        }

        InboundShipment shipment = InboundShipment.builder()
                .supplierName(request.getSupplierName())
                .productName(request.getProductName())
                .quantity(request.getQuantity())
                .status("RECEIVED")
                .build();

        shipment = shipmentRepository.save(shipment);

        InboundReceipt receipt = new InboundReceipt();
        receipt.setSupplierId(supplier.getId());
        receipt.setShipmentId(shipment.getId());
        receipt.setReceiptDate(LocalDate.now());
        receipt.setStatus("COMPLETED");
        receipt.setGrnNumber("GRN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        InboundReceiptItem item = new InboundReceiptItem();
        item.setProductId(product.getId());
        item.setQuantityReceived(request.getQuantity());
        item.setQualityStatus("GOOD");
        receipt.addItem(item);

        InboundReceipt savedReceipt = receiptRepository.save(receipt);

        return mapToResponse(savedReceipt, supplier.getName(), product.getName());
    }

    @Override
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    public List<InboundReceiptDTO> getAllReceipts() {
        return receiptRepository.findAllByOrderByReceiptDateDesc().stream()
                .map(r -> {
                    String supplierName = safeSupplierName(r.getSupplierId());
                    return InboundReceiptDTO.builder()
                            .id(r.getReceiptId())
                            .receiptNumber(r.getGrnNumber())
                            .supplierName(supplierName)
                            .receivedAt(r.getReceiptDate().atStartOfDay())
                            .status(r.getStatus())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InboundReceiptItemDTO> getAllReceiptItems() {
        return receiptItemRepository.findAll().stream()
                .map(i -> {
                    String productName = safeProductName(i.getProductId());
                    return InboundReceiptItemDTO.builder()
                            .id(i.getReceiptItemId())
                            .receiptId(i.getReceipt().getReceiptId())
                            .productName(productName)
                            .quantityReceived(i.getQuantityReceived() == null ? 0 : i.getQuantityReceived())
                            .condition(i.getQualityStatus())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InboundResponseDTO getShipmentById(Long id) {
        InboundReceipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with id: " + id));

        String supplierName = safeSupplierName(receipt.getSupplierId());

        String productName = "N/A";
        if (receipt.getItems() != null && !receipt.getItems().isEmpty()) {
            productName = safeProductName(receipt.getItems().get(0).getProductId());
        }

        return mapToResponse(receipt, supplierName, productName);
    }

    @Override
    @Transactional
    public InboundResponseDTO updateShipmentStatus(Long id, String status) {
        InboundReceipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with id: " + id));

        receipt.setStatus(status);
        InboundReceipt saved = receiptRepository.save(receipt);

        String supplierName = safeSupplierName(saved.getSupplierId());

        String productName = "N/A";
        if (saved.getItems() != null && !saved.getItems().isEmpty()) {
            productName = safeProductName(saved.getItems().get(0).getProductId());
        }

        return mapToResponse(saved, supplierName, productName);
    }

    @Override
    @Transactional
    public void deleteShipment(Long id) {
        if (!receiptRepository.existsById(id)) {
            throw new ResourceNotFoundException("Receipt not found with id: " + id);
        }
        receiptRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InboundResponseDTO> getAllInboundData() {
        return getAllShipments();
    }

    private Supplier fetchSupplierByName(String supplierName) {
        try {
            SupplierListResponseDTO response = supplierClient.getAllSuppliers();

            if (response == null || response.getSuppliers() == null || response.getSuppliers().isEmpty()) {
                throw new ResourceNotFoundException("No suppliers returned from supplier service");
            }

            return response.getSuppliers().stream()
                    .filter(s -> s.getName() != null && s.getName().trim().equalsIgnoreCase(supplierName.trim()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + supplierName));

        } catch (ResourceNotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResourceNotFoundException("Supplier service error while finding supplier: " + supplierName);
        }
    }

    private Product fetchProductByName(String productName) {
        try {
            List<Product> products = productClient.getAllProducts();

            if (products == null || products.isEmpty()) {
                throw new ResourceNotFoundException("No products returned from product service");
            }

            return products.stream()
                    .filter(p -> p.getName() != null && p.getName().trim().equalsIgnoreCase(productName.trim()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productName));

        } catch (ResourceNotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResourceNotFoundException("Product service error while finding product: " + productName);
        }
    }

    private String safeSupplierName(String supplierId) {
        try {
            Supplier s = supplierClient.getSupplierById(supplierId);
            return (s != null && s.getName() != null) ? s.getName() : "N/A";
        } catch (Exception e) {
            return "N/A";
        }
    }

    private String safeProductName(String productId) {
        try {
            Product p = productClient.getProductById(productId);
            return (p != null && p.getName() != null) ? p.getName() : "N/A";
        } catch (Exception e) {
            return "N/A";
        }
    }

    private InboundResponseDTO mapToResponse(InboundReceipt receipt, String supplierName, String productName) {
        int qty = (receipt.getItems() != null
                && !receipt.getItems().isEmpty()
                && receipt.getItems().get(0).getQuantityReceived() != null)
                ? receipt.getItems().get(0).getQuantityReceived()
                : 0;

        return InboundResponseDTO.builder()
                .id(receipt.getReceiptId())
                .supplierName(supplierName)
                .productName(productName)
                .quantity(qty)
                .status(receipt.getStatus())
                .build();
    }
}