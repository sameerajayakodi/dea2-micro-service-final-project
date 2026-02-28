package com.wms.customer_management_service.mapper;

import com.wms.customer_management_service.domain.customer.Address;
import com.wms.customer_management_service.domain.customer.Customer;
import com.wms.customer_management_service.dto.customer.CustomerRequest;
import com.wms.customer_management_service.dto.customer.CustomerResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Mapper for converting between Customer/Address entities and DTOs.
 */
@Component
public class CustomerMapper {
	public Customer toEntity(CustomerRequest request) {
		Customer customer = new Customer();
		customer.setCustomerName(request.getCustomerName());
		customer.setEmail(request.getEmail());
		customer.setPhone(request.getPhone());
		if (request.getAddresses() != null) {
			List<Address> addresses = request.getAddresses().stream().map(addrReq -> {
				Address address = new Address();
				address.setType(addrReq.getType());
				address.setLine1(addrReq.getLine1());
				address.setLine2(addrReq.getLine2());
				address.setCity(addrReq.getCity());
				address.setDistrict(addrReq.getDistrict());
				address.setPostalCode(addrReq.getPostalCode());
				address.setCountry(addrReq.getCountry());
				address.setCustomer(customer);
				return address;
			}).collect(Collectors.toList());
			customer.setAddresses(addresses);
		}
		return customer;
	}

	public CustomerResponse toResponse(Customer customer) {
		CustomerResponse response = new CustomerResponse();
		response.setCustomerId(customer.getCustomerId());
		response.setCustomerName(customer.getCustomerName());
		response.setEmail(customer.getEmail());
		response.setPhone(customer.getPhone());
		response.setStatus(customer.getStatus());
		if (customer.getAddresses() != null) {
			List<CustomerResponse.AddressResponse> addresses = customer.getAddresses().stream().map(addr -> {
				CustomerResponse.AddressResponse addrRes = new CustomerResponse.AddressResponse();
				addrRes.setAddressId(addr.getAddressId());
				addrRes.setType(addr.getType());
				addrRes.setLine1(addr.getLine1());
				addrRes.setLine2(addr.getLine2());
				addrRes.setCity(addr.getCity());
				addrRes.setDistrict(addr.getDistrict());
				addrRes.setPostalCode(addr.getPostalCode());
				addrRes.setCountry(addr.getCountry());
				return addrRes;
			}).collect(Collectors.toList());
			response.setAddresses(addresses);
		}
		return response;
	}
}
