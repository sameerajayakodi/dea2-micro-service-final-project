package com.wms.customer_management_service.controller;

import com.wms.customer_management_service.constants.ApiConstants;
import com.wms.customer_management_service.dto.customer.CustomerRequest;
import com.wms.customer_management_service.dto.customer.CustomerResponse;
import com.wms.customer_management_service.interfaces.CustomerService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for customer management operations.
 */
@RestController
@RequestMapping(ApiConstants.CUSTOMER_API_BASE)
@RequiredArgsConstructor
public class CustomerController {
	private static final Logger logger = LoggerFactory.getLogger(CustomerController.class);
	private final CustomerService customerService;


	@PostMapping
	public ResponseEntity<CustomerResponse> registerCustomer(@Valid @RequestBody CustomerRequest request) {
		logger.info("Registering new customer: {}", request.getEmail());
		return ResponseEntity.ok(customerService.registerCustomer(request));
	}

	@PutMapping("/{id}")
	public ResponseEntity<CustomerResponse> updateCustomer(@PathVariable UUID id, @Valid @RequestBody CustomerRequest request) {
		logger.info("Updating customer: {}", id);
		return ResponseEntity.ok(customerService.updateCustomer(id, request));
	}

	@GetMapping("/{id}")
	public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable UUID id) {
		logger.info("Fetching customer: {}", id);
		return ResponseEntity.ok(customerService.getCustomerById(id));
	}

	@GetMapping
	public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
		logger.info("Fetching all customers");
		return ResponseEntity.ok(customerService.getAllCustomers());
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deactivateCustomer(@PathVariable UUID id) {
		logger.info("Deactivating customer: {}", id);
		customerService.deactivateCustomer(id);
		return ResponseEntity.noContent().build();
	}
}
