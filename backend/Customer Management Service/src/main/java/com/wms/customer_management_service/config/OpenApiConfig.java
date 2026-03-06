package com.wms.customer_management_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI/Swagger configuration for the Customer Management Service.
 * Provides API metadata displayed on the Swagger UI documentation page.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customerManagementOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Customer Management Service API")
                        .description(
                                "REST API for managing customers and their addresses in the Warehouse Management System.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("WMS Team")
                                .email("support@wms.com")));
    }
}
