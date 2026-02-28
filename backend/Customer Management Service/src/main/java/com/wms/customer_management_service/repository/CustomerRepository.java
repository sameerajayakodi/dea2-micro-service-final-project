package com.wms.customer_management_service.repository;

import com.wms.customer_management_service.domain.customer.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
	Optional<Customer> findByEmail(String email);

	Optional<Customer> findByCustomerIdAndStatus(UUID customerId, com.wms.customer_management_service.enums.CustomerStatus status);
	List<Customer> findAllByStatus(com.wms.customer_management_service.enums.CustomerStatus status);
}
