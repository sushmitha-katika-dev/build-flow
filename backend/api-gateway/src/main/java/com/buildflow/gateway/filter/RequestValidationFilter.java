package com.buildflow.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.stereotype.Component;

@Component
public class RequestValidationFilter extends AbstractGatewayFilterFactory<RequestValidationFilter.Config> {

    public RequestValidationFilter() {
        super(Config.class);
    }

    public static class Config {
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // Add custom request validation logic if needed
            return chain.filter(exchange);
        };
    }
}
