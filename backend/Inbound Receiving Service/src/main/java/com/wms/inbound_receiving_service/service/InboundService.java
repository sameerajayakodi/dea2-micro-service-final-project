package com.wms.inbound_receiving_service.service;

import com.wms.inbound_receiving_service.dto.*;
import java.util.List;

public interface InboundService {

    // Receive a new shipment
    InboundResponseDTO receiveShipment(InboundRequestDTO request);

    // Get shipment by ID
    InboundResponseDTO getShipmentById(Long id);

    // Get all shipments
    List<InboundResponseDTO> getAllShipments();

    // Update shipment status
    InboundResponseDTO updateShipmentStatus(Long id, String status);

    // Delete shipment
    void deleteShipment(Long id);

    // Get all receipts
    List<InboundReceiptDTO> getAllReceipts();

    // Get all receipt items
    List<InboundReceiptItemDTO> getAllReceiptItems();

    // NEW: Get all inbound data (for /all endpoint)
    List<InboundResponseDTO> getAllInboundData();
}