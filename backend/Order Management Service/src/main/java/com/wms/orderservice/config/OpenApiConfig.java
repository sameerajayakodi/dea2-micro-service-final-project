package com.wms.orderservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI orderServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("WMS Order Service API")
                        .description("""
                                Order Management Microservice for the Warehouse Management System (WMS).
                                
                                ## Overview
                                This service handles the complete order lifecycle including creation, validation \
                                against inventory, approval (full/partial/auto), status tracking, and cancellation.
                                
                                ## Order Status Flow
                                ```
                                CREATED → VALIDATED → APPROVED/PARTIALLY_APPROVED → PICKING_REQUESTED → PACKED → DISPATCHED → DELIVERED
                                                   ↘ REJECTED
                                Any (except DISPATCHED/DELIVERED) → CANCELLED
                                ```
                                
                                ## Error Codes
                                | Code | HTTP Status | Description |
                                |------|------------|-------------|
                                | NOT_FOUND | 404 | Resource not found |
                                | BUSINESS_ERROR | 400 | Business rule violation |
                                | VALIDATION_ERROR | 400 | Request validation failure |
                                | EXTERNAL_SERVICE_ERROR | 502 | Inventory Service unavailable |
                                | INTERNAL_ERROR | 500 | Unexpected server error |
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("WMS Team")
                                .email("support@wms.lk"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Local Development Server")))
                .tags(List.of(
                        new Tag()
                                .name("Orders")
                                .description("Order management endpoints — create, modify, retrieve, validate, approve, cancel, track history, and update status")));
    }
}
