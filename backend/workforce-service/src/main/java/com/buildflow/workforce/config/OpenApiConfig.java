package com.buildflow.workforce.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI workforceServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("BuildFlow Workforce API")
                        .description("Handles personnel and worker management")
                        .version("v1.0"));
    }
}
