package com.wms.customer_management_service.dto.customer;

import com.wms.customer_management_service.enums.CustomerStatus;
import com.wms.customer_management_service.enums.AddressType;
import lombok.Data;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

/**
 * DTO for customer API responses.
 */
@Data
@Schema(description = "Customer response")
public class CustomerResponse {
	@Schema(description = "Customer ID")
	private UUID customerId;

	@Schema(description = "Customer name")
	private String customerName;

	@Schema(description = "Customer email")
	private String email;

	@Schema(description = "Customer phone")
	private String phone;

	@Schema(description = "Customer status")
	private CustomerStatus status;

	@Schema(description = "List of addresses")
	private List<AddressResponse> addresses;

	@Data
	@Schema(description = "Address response")
	public static class AddressResponse {
		@Schema(description = "Address ID")
		private UUID addressId;

		@Schema(description = "Address type")
		private AddressType type;

		@Schema(description = "Line 1")
		private String line1;

		@Schema(description = "Line 2")
		private String line2;

		@Schema(description = "City")
		private String city;

		@Schema(description = "District")
		private String district;

		@Schema(description = "Postal code")
		private String postalCode;

		@Schema(description = "Country")
		private String country;
	}
}
