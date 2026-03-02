package com.wms.picking_packing_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8092}")
    private String serverPort;

    @Bean
    public OpenAPI pickingPackingServiceAPI() {
        Server server = new Server();
        server.setUrl("http://localhost:" + serverPort);
        server.setDescription("Picking & Packing Service - Development");

        Contact contact = new Contact();
        contact.setName("WMS Development Team");
        contact.setEmail("support@wms.com");

        Info info = new Info()
                .title("Picking & Packing Service API")
                .version("1.0.0")
                .description("API for managing picking and packing operations in the Warehouse Management System. " +
                        "This service handles order fulfillment workflows including picking items from inventory, " +
                        "packing orders, and coordinating with Order, Inventory, and Worker services.")
                .contact(contact);

        return new OpenAPI()
                .info(info)
                .servers(List.of(server));
    }
}
