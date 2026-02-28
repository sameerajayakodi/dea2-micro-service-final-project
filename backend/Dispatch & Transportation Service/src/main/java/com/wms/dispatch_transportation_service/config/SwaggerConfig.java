package com.wms.dispatch_transportation_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI dispatchTransportationOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Dispatch & Transportation Service API")
                        .description("API documentation for the Dispatch & Transportation Service")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("WMS Team")));
    }
}
