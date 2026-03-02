package com.wms.picking_packing_service.repositories;

import com.wms.picking_packing_service.models.PackingDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PackingDetailsRepository
        extends JpaRepository<PackingDetails, Long> {
}
