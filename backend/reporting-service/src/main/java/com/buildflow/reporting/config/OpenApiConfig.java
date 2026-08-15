package com.buildflow.reporting.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI reportingServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("BuildFlow Reporting Service API")
                        .description("API documentation for the BuildFlow Reporting and Analytics Service")
                        .version("v1.0.0"));
    }
}
