package com.wms.customer_management_service.service.impl;

import com.wms.customer_management_service.domain.customer.Customer;
import com.wms.customer_management_service.domain.customer.Address;
import com.wms.customer_management_service.dto.customer.CustomerRequest;
import com.wms.customer_management_service.dto.customer.CustomerResponse;
import com.wms.customer_management_service.enums.CustomerStatus;
import com.wms.customer_management_service.enums.AddressType;
import com.wms.customer_management_service.exception.NotFoundException;
import com.wms.customer_management_service.interfaces.CustomerService;
import com.wms.customer_management_service.mapper.CustomerMapper;
import com.wms.customer_management_service.repository.CustomerRepository;
import com.wms.customer_management_service.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service implementation for customer operations.
 */
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
	private static final Logger logger = LoggerFactory.getLogger(CustomerServiceImpl.class);

	private final CustomerRepository customerRepository;
	private final AddressRepository addressRepository;
	private final CustomerMapper customerMapper;

	@Override
	@Transactional
	public CustomerResponse registerCustomer(CustomerRequest request) {
		Customer customer = customerMapper.toEntity(request);
		customer.setStatus(CustomerStatus.ACTIVE);
		Customer saved = customerRepository.save(customer);
		return customerMapper.toResponse(saved);
	}

	@Override
	@Transactional
	public CustomerResponse updateCustomer(UUID id, CustomerRequest request) {
		Customer customer = customerRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Customer not found"));
		customer.setCustomerName(request.getCustomerName());
		customer.setEmail(request.getEmail());
		customer.setPhone(request.getPhone());
		// Update addresses if needed (not implemented for brevity)
		Customer updated = customerRepository.save(customer);
		return customerMapper.toResponse(updated);
	}

	@Override
	@Transactional(readOnly = true)
	public CustomerResponse getCustomerById(UUID id) {
		Customer customer = customerRepository.findByCustomerIdAndStatus(id, CustomerStatus.ACTIVE)
				.orElseThrow(() -> new NotFoundException("Customer not found or is inactive"));
		return customerMapper.toResponse(customer);
	}

	@Override
	@Transactional(readOnly = true)
	public List<CustomerResponse> getAllCustomers() {
		return customerRepository.findAllByStatus(CustomerStatus.ACTIVE).stream()
				.map(customerMapper::toResponse)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional
	public void deactivateCustomer(UUID id) {
		Customer customer = customerRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Customer not found"));
		customer.setStatus(CustomerStatus.INACTIVE);
		customerRepository.save(customer);
	}
}
