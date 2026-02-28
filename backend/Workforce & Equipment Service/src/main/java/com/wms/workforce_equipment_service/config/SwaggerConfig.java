package com.wms.workforce_equipment_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for Swagger API documentation.
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI workforceEquipmentOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Workforce & Equipment Service API")
                        .description("API documentation for the Workforce & Equipment Service")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("WMS Team")));
    }
}
