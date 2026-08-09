package com.buildflow.equipment.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI equipmentServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("BuildFlow Equipment Service API")
                        .description("API documentation for the BuildFlow Equipment Management Service")
                        .version("v1.0.0"));
    }
}
