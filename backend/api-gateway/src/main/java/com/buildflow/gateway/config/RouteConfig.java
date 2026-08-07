package com.buildflow.gateway.config;

import com.buildflow.gateway.filter.JwtAuthenticationFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public RouteConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-service-programmatic", r -> r.path("/api/v1/auth/**")
                        .uri("http://localhost:8081"))
                .route("project-service-programmatic", r -> r.path("/api/v1/projects/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("http://localhost:8082"))
                .build();
    }
}
