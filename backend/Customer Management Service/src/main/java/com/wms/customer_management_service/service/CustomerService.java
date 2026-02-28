package com.wms.customer_management_service.service;

import com.wms.customer_management_service.dto.customer.CustomerRequest;
import com.wms.customer_management_service.dto.customer.CustomerResponse;
import java.util.List;
import java.util.UUID;

/**
 * Service interface for customer operations.
 */
public interface CustomerService {
	CustomerResponse registerCustomer(CustomerRequest request);
	CustomerResponse updateCustomer(UUID id, CustomerRequest request);
	CustomerResponse getCustomerById(UUID id);
	List<CustomerResponse> getAllCustomers();
	void deactivateCustomer(UUID id);
}
