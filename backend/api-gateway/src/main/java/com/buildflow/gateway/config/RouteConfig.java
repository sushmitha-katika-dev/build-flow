package com.buildflow.gateway.config;

import com.buildflow.gateway.filter.JwtAuthenticationGatewayFilterFactory;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {

    private final JwtAuthenticationGatewayFilterFactory jwtAuthFilter;

    public RouteConfig(JwtAuthenticationGatewayFilterFactory jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-service-programmatic", r -> r.path("/api/v1/auth/**")
                        .uri("http://localhost:8081"))
                .route("project-service-programmatic", r -> r.path("/api/v1/projects/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthenticationGatewayFilterFactory.Config())))
                        .uri("http://localhost:8082"))
                .build();
    }
}
