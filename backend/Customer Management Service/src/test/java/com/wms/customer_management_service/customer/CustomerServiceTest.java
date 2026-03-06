package com.wms.customer_management_service.customer;

import com.wms.customer_management_service.domain.customer.Customer;
import com.wms.customer_management_service.dto.customer.CustomerRequest;
import com.wms.customer_management_service.dto.customer.CustomerResponse;
import com.wms.customer_management_service.enums.CustomerStatus;
import com.wms.customer_management_service.exception.NotFoundException;
import com.wms.customer_management_service.mapper.CustomerMapper;
import com.wms.customer_management_service.repository.AddressRepository;
import com.wms.customer_management_service.repository.CustomerRepository;
import com.wms.customer_management_service.service.impl.CustomerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CustomerServiceImpl.
 * Uses Mockito to mock the repository and mapper layers.
 */
@ExtendWith(MockitoExtension.class)
public class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private CustomerMapper customerMapper;

    @InjectMocks
    private CustomerServiceImpl customerService;

    private Customer sampleCustomer;
    private CustomerResponse sampleResponse;
    private CustomerRequest sampleRequest;
    private UUID customerId;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();

        sampleCustomer = Customer.builder()
                .customerId(customerId)
                .customerName("John Doe")
                .email("john@example.com")
                .phone("0771234567")
                .status(CustomerStatus.ACTIVE)
                .build();

        sampleResponse = new CustomerResponse();
        sampleResponse.setCustomerId(customerId);
        sampleResponse.setCustomerName("John Doe");
        sampleResponse.setEmail("john@example.com");
        sampleResponse.setPhone("0771234567");
        sampleResponse.setStatus(CustomerStatus.ACTIVE);

        sampleRequest = new CustomerRequest();
        sampleRequest.setCustomerName("John Doe");
        sampleRequest.setEmail("john@example.com");
        sampleRequest.setPhone("0771234567");
    }

    @Test
	@DisplayName("Should register a new customer successfully")
	void registerCustomer_Success() {
		when(customerMapper.toEntity(any(CustomerRequest.class))).thenReturn(sampleCustomer);
		when(customerRepository.save(any(Customer.class))).thenReturn(sampleCustomer);
		when(customerMapper.toResponse(any(Customer.class))).thenReturn(sampleResponse);

		CustomerResponse result = customerService.registerCustomer(sampleRequest);

		assertNotNull(result);
		assertEquals("John Doe", result.getCustomerName());
		assertEquals("john@example.com", result.getEmail());
		verify(customerRepository, times(1)).save(any(Customer.class));
	}

    @Test
	@DisplayName("Should get customer by ID when customer exists and is active")
	void getCustomerById_Success() {
		when(customerRepository.findByCustomerIdAndStatus(customerId, CustomerStatus.ACTIVE))
				.thenReturn(Optional.of(sampleCustomer));
		when(customerMapper.toResponse(sampleCustomer)).thenReturn(sampleResponse);

		CustomerResponse result = customerService.getCustomerById(customerId);

		assertNotNull(result);
		assertEquals(customerId, result.getCustomerId());
		verify(customerRepository, times(1)).findByCustomerIdAndStatus(customerId, CustomerStatus.ACTIVE);
	}

    @Test
	@DisplayName("Should throw NotFoundException when customer is not found")
	void getCustomerById_NotFound() {
		when(customerRepository.findByCustomerIdAndStatus(customerId, CustomerStatus.ACTIVE))
				.thenReturn(Optional.empty());

		assertThrows(NotFoundException.class, () -> customerService.getCustomerById(customerId));
	}

    @Test
	@DisplayName("Should return all active customers")
	void getAllCustomers_Success() {
		when(customerRepository.findAllByStatus(CustomerStatus.ACTIVE))
				.thenReturn(List.of(sampleCustomer));
		when(customerMapper.toResponse(sampleCustomer)).thenReturn(sampleResponse);

		List<CustomerResponse> results = customerService.getAllCustomers();

		assertFalse(results.isEmpty());
		assertEquals(1, results.size());
		verify(customerRepository, times(1)).findAllByStatus(CustomerStatus.ACTIVE);
	}

    @Test
	@DisplayName("Should update customer details successfully")
	void updateCustomer_Success() {
		when(customerRepository.findById(customerId)).thenReturn(Optional.of(sampleCustomer));
		when(customerRepository.save(any(Customer.class))).thenReturn(sampleCustomer);
		when(customerMapper.toResponse(any(Customer.class))).thenReturn(sampleResponse);

		CustomerResponse result = customerService.updateCustomer(customerId, sampleRequest);

		assertNotNull(result);
		assertEquals("John Doe", result.getCustomerName());
		verify(customerRepository, times(1)).findById(customerId);
		verify(customerRepository, times(1)).save(any(Customer.class));
	}

    @Test
	@DisplayName("Should throw NotFoundException when updating non-existent customer")
	void updateCustomer_NotFound() {
		when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

		assertThrows(NotFoundException.class, () -> customerService.updateCustomer(customerId, sampleRequest));
	}

    @Test
	@DisplayName("Should deactivate customer successfully")
	void deactivateCustomer_Success() {
		when(customerRepository.findById(customerId)).thenReturn(Optional.of(sampleCustomer));
		when(customerRepository.save(any(Customer.class))).thenReturn(sampleCustomer);

		customerService.deactivateCustomer(customerId);

		assertEquals(CustomerStatus.INACTIVE, sampleCustomer.getStatus());
		verify(customerRepository, times(1)).save(sampleCustomer);
	}

    @Test
	@DisplayName("Should throw NotFoundException when deactivating non-existent customer")
	void deactivateCustomer_NotFound() {
		when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

		assertThrows(NotFoundException.class, () -> customerService.deactivateCustomer(customerId));
	}
}
