package com.wms.inbound_receiving_service.repository;

import com.wms.inbound_receiving_service.model.InboundReceiptItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InboundReceiptItemRepository extends JpaRepository<InboundReceiptItem, Long> {
    @Query("SELECT i FROM InboundReceiptItem i JOIN FETCH i.product JOIN FETCH i.receipt")
    List<InboundReceiptItem> findAllWithDetails();
}