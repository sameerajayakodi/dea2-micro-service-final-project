package com.wms.inbound_receiving_service.service.impl;

import com.wms.inbound_receiving_service.client.ProductClient;
import com.wms.inbound_receiving_service.client.SupplierClient;
import com.wms.inbound_receiving_service.dto.*;
import com.wms.inbound_receiving_service.exception.ResourceNotFoundException;
import com.wms.inbound_receiving_service.model.*;
import com.wms.inbound_receiving_service.repository.*;
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

    // -------------------- RECEIVE SHIPMENT --------------------
    @Override
    @Transactional
    public InboundResponseDTO receiveShipment(InboundRequestDTO request) {

        // 1) Call Supplier Service safely
        Supplier supplier = fetchSupplierByName(request.getSupplierName());

        // 2) Call Product Service safely (prefer SKU, fallback to name)
        Product product = fetchProduct(request.getSku(), request.getProductName());

        // 3) Save shipment record (your own DB)
        InboundShipment shipment = InboundShipment.builder()
                .supplierName(request.getSupplierName())
                .productName(request.getProductName())
                .quantity(request.getQuantity())
                .status("RECEIVED")
                // .sku(request.getSku()) // uncomment ONLY if InboundShipment has sku field
                .build();

        shipment = shipmentRepository.save(shipment);

        // 4) Create receipt + receipt item
        InboundReceipt receipt = new InboundReceipt();
        receipt.setSupplierId(supplier.getSupplierId());
        receipt.setShipmentId(shipment.getId());
        receipt.setReceiptDate(LocalDate.now());
        receipt.setStatus("COMPLETED");
        receipt.setGrnNumber("GRN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        InboundReceiptItem item = new InboundReceiptItem();
        item.setProductId(product.getProductId());
        item.setQuantityReceived(request.getQuantity());
        item.setQualityStatus("GOOD");

        receipt.addItem(item);

        InboundReceipt savedReceipt = receiptRepository.save(receipt);

        return mapToResponse(savedReceipt, supplier.getSupplierName(), product.getProductName());
    }

    // -------------------- GET ALL SHIPMENTS --------------------
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

    // -------------------- GET ALL RECEIPTS --------------------
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

    // -------------------- GET ALL RECEIPT ITEMS --------------------
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
                            .quantityReceived(i.getQuantityReceived())
                            .condition(i.getQualityStatus())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // -------------------- GET SHIPMENT/RECEIPT BY ID --------------------
    @Override
    @Transactional(readOnly = true)
    public InboundResponseDTO getShipmentById(Long id) {
        // NOTE: You are using receiptRepository here; "id" is treated as receiptId
        InboundReceipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with id: " + id));

        String supplierName = safeSupplierName(receipt.getSupplierId());

        String productName = "N/A";
        if (receipt.getItems() != null && !receipt.getItems().isEmpty()) {
            productName = safeProductName(receipt.getItems().get(0).getProductId());
        }

        return mapToResponse(receipt, supplierName, productName);
    }

    // -------------------- UPDATE STATUS --------------------
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

    // -------------------- DELETE --------------------
    @Override
    @Transactional
    public void deleteShipment(Long id) {
        if (!receiptRepository.existsById(id)) {
            throw new ResourceNotFoundException("Receipt not found with id: " + id);
        }
        receiptRepository.deleteById(id);
    }

    // -------------------- GET ALL INBOUND DATA --------------------
    @Override
    @Transactional(readOnly = true)
    public List<InboundResponseDTO> getAllInboundData() {
        return getAllShipments();
    }

    // -------------------- HELPERS --------------------
    private Supplier fetchSupplierByName(String supplierName) {
        try {
            Supplier s = supplierClient.getSupplierByName(supplierName);
            if (s == null) {
                throw new ResourceNotFoundException("Supplier not found: " + supplierName);
            }
            return s;
        } catch (Exception ex) {
            // clear error instead of generic 503
            throw new ResourceNotFoundException("Supplier service error while finding supplier: " + supplierName);
        }
    }

    private Product fetchProduct(String sku, String productName) {
        // Prefer SKU if your Product service supports it
        try {
            // Uncomment if you have this method in ProductClient:
            // Product p = productClient.getProductBySku(sku);
            // if (p != null) return p;
        } catch (Exception ignored) {
            // ignore and fallback to name
        }

        try {
            Product p = productClient.getProductByName(productName);
            if (p == null) {
                throw new ResourceNotFoundException("Product not found: " + productName);
            }
            return p;
        } catch (Exception ex) {
            throw new ResourceNotFoundException("Product service error while finding product: " + productName);
        }
    }

    private String safeSupplierName(Long supplierId) {
        try {
            Supplier s = supplierClient.getSupplierById(supplierId);
            return (s != null && s.getSupplierName() != null) ? s.getSupplierName() : "N/A";
        } catch (Exception e) {
            return "N/A";
        }
    }

    private String safeProductName(Long productId) {
        try {
            Product p = productClient.getProductById(productId);
            return (p != null && p.getProductName() != null) ? p.getProductName() : "N/A";
        } catch (Exception e) {
            return "N/A";
        }
    }

    private InboundResponseDTO mapToResponse(InboundReceipt receipt, String supplierName, String productName) {
        int qty = (receipt.getItems() != null && !receipt.getItems().isEmpty())
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