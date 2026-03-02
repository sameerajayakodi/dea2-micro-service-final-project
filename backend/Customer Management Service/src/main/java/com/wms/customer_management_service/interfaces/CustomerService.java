package com.wms.customer_management_service.interfaces;

import com.wms.customer_management_service.dto.customer.CustomerRequest;
import com.wms.customer_management_service.dto.customer.CustomerResponse;
import java.util.List;

/**
 * Service interface for customer operations.
 * Follows best practice: Interfaces in a separate package.
 */
import java.util.UUID;

public interface CustomerService {
    CustomerResponse registerCustomer(CustomerRequest request);
    CustomerResponse updateCustomer(UUID id, CustomerRequest request);
    CustomerResponse getCustomerById(UUID id);
    List<CustomerResponse> getAllCustomers();
    void deactivateCustomer(UUID id);
}
