package com.wms.customer_management_service.customer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wms.customer_management_service.constants.ApiConstants;
import com.wms.customer_management_service.dto.customer.CustomerRequest;
import com.wms.customer_management_service.dto.customer.CustomerResponse;
import com.wms.customer_management_service.enums.AddressType;
import com.wms.customer_management_service.enums.CustomerStatus;
import com.wms.customer_management_service.interfaces.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.bean.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for CustomerController REST endpoints.
 * Uses MockMvc to test HTTP request/response handling and validation.
 */
@WebMvcTest(com.wms.customer_management_service.controller.CustomerController.class)
public class CustomerControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CustomerService customerService;

    private CustomerRequest sampleRequest;
    private CustomerResponse sampleResponse;
    private UUID customerId;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();

        CustomerRequest.AddressRequest addressRequest = new CustomerRequest.AddressRequest();
        addressRequest.setType(AddressType.BILLING);
        addressRequest.setLine1("123 Main St");
        addressRequest.setLine2("Apt 4");
        addressRequest.setCity("Colombo");
        addressRequest.setDistrict("Western");
        addressRequest.setPostalCode("10100");
        addressRequest.setCountry("Sri Lanka");

        sampleRequest = new CustomerRequest();
        sampleRequest.setCustomerName("John Doe");
        sampleRequest.setEmail("john@example.com");
        sampleRequest.setPhone("0771234567");
        sampleRequest.setAddresses(List.of(addressRequest));

        sampleResponse = new CustomerResponse();
        sampleResponse.setCustomerId(customerId);
        sampleResponse.setCustomerName("John Doe");
        sampleResponse.setEmail("john@example.com");
        sampleResponse.setPhone("0771234567");
        sampleResponse.setStatus(CustomerStatus.ACTIVE);
    }

    @Test
	@DisplayName("POST /api/customers - should register a new customer")
	void registerCustomer_Success() throws Exception {
		when(customerService.registerCustomer(any(CustomerRequest.class))).thenReturn(sampleResponse);

		mockMvc.perform(post(ApiConstants.CUSTOMER_API_BASE)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(sampleRequest)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.customerName").value("John Doe"))
				.andExpect(jsonPath("$.email").value("john@example.com"));
	}

    @Test
    @DisplayName("POST /api/customers - should return 400 when name is blank")
    void registerCustomer_ValidationError() throws Exception {
        sampleRequest.setCustomerName("");

        mockMvc.perform(post(ApiConstants.CUSTOMER_API_BASE)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sampleRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
	@DisplayName("GET /api/customers/{id} - should return customer by ID")
	void getCustomerById_Success() throws Exception {
		when(customerService.getCustomerById(customerId)).thenReturn(sampleResponse);

		mockMvc.perform(get(ApiConstants.CUSTOMER_API_BASE + "/{id}", customerId))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.customerId").value(customerId.toString()))
				.andExpect(jsonPath("$.customerName").value("John Doe"));
	}

    @Test
	@DisplayName("GET /api/customers - should return all customers")
	void getAllCustomers_Success() throws Exception {
		when(customerService.getAllCustomers()).thenReturn(List.of(sampleResponse));

		mockMvc.perform(get(ApiConstants.CUSTOMER_API_BASE))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].customerName").value("John Doe"));
	}

    @Test
	@DisplayName("PUT /api/customers/{id} - should update customer")
	void updateCustomer_Success() throws Exception {
		when(customerService.updateCustomer(eq(customerId), any(CustomerRequest.class))).thenReturn(sampleResponse);

		mockMvc.perform(put(ApiConstants.CUSTOMER_API_BASE + "/{id}", customerId)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(sampleRequest)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.customerName").value("John Doe"));
	}

    @Test
    @DisplayName("DELETE /api/customers/{id} - should deactivate customer")
    void deactivateCustomer_Success() throws Exception {
        doNothing().when(customerService).deactivateCustomer(customerId);

        mockMvc.perform(delete(ApiConstants.CUSTOMER_API_BASE + "/{id}", customerId))
                .andExpect(status().isNoContent());
    }
}
