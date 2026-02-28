package com.wms.inbound_receiving_service.repository;

import com.wms.inbound_receiving_service.model.InboundReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InboundReceiptRepository extends JpaRepository<InboundReceipt, Long> {
    @Query("SELECT r FROM InboundReceipt r JOIN FETCH r.supplier ORDER BY r.receiptDate DESC")
    List<InboundReceipt> findAllWithSupplier();
}