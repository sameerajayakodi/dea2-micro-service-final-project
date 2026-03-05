package com.wms.picking_packing_service.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class OpenApiConfig {

    @Bean
        public OpenAPI pickingPackingServiceAPI(
                        @Value("${app.public-base-url:}") String publicBaseUrl) {
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

        OpenAPI openAPI = new OpenAPI()
                .info(info);

        if (StringUtils.hasText(publicBaseUrl)) {
            Server server = new Server();
            server.setUrl(publicBaseUrl);
            server.setDescription("Public server url");
            openAPI.setServers(List.of(server));
        }

        return openAPI;
    }
}
