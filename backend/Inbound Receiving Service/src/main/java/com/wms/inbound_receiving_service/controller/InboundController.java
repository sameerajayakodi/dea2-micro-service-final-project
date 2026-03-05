package com.wms.inbound_receiving_service.controller;

import com.wms.inbound_receiving_service.dto.*;
import com.wms.inbound_receiving_service.service.InboundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/inbound")
@RequiredArgsConstructor
public class InboundController {

    private final InboundService inboundService;

    @PostMapping("/receive")
    @ResponseStatus(HttpStatus.CREATED)
    public InboundResponseDTO receive(@Valid @RequestBody InboundRequestDTO request) {
        return inboundService.receiveShipment(request);
    }

    @GetMapping("/{id}")
    public InboundResponseDTO getById(@PathVariable Long id) {
        return inboundService.getShipmentById(id);
    }

    @PatchMapping("/{id}/status")
    public InboundResponseDTO updateStatus(@PathVariable Long id, @RequestParam String status) {
        return inboundService.updateShipmentStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        inboundService.deleteShipment(id);
    }

    @GetMapping("/shipments")
    public List<InboundResponseDTO> getAllShipments() {
        return inboundService.getAllShipments();
    }

    @GetMapping("/receipts")
    public List<InboundReceiptDTO> getAllReceipts() {
        return inboundService.getAllReceipts();
    }

    @GetMapping("/receipt-items")
    public List<InboundReceiptItemDTO> getAllReceiptItems() {
        return inboundService.getAllReceiptItems();
    }

    @GetMapping("/all")
    public List<InboundResponseDTO> getAllInboundData() {
        return inboundService.getAllInboundData();
    }
}