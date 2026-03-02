package com.wms.dispatch_transportation_service.repository;

import com.wms.dispatch_transportation_service.model.Dispatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DispatchRepository extends JpaRepository<Dispatch, Long> {
}
