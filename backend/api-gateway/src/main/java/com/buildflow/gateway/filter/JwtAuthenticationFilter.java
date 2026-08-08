package com.buildflow.gateway.filter;

import com.buildflow.gateway.constants.GatewayConstants;
import com.buildflow.gateway.security.JwtUtil;
import com.buildflow.gateway.util.ResponseUtil;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    public static class Config {
        // Configuration properties can be added here
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return ResponseUtil.sendErrorResponse(exchange.getResponse(), HttpStatus.UNAUTHORIZED, "Missing authorization header", exchange.getRequest().getURI().getPath());
            }

            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith(GatewayConstants.BEARER_PREFIX)) {
                return ResponseUtil.sendErrorResponse(exchange.getResponse(), HttpStatus.UNAUTHORIZED, "Invalid authorization header format", exchange.getRequest().getURI().getPath());
            }

            String token = authHeader.substring(7);
            if (!jwtUtil.isTokenValid(token)) {
                return ResponseUtil.sendErrorResponse(exchange.getResponse(), HttpStatus.UNAUTHORIZED, "Invalid or expired JWT token", exchange.getRequest().getURI().getPath());
            }

            // Optional: Mutate request to pass claims to downstream services
            // Claims claims = jwtUtil.extractAllClaims(token);
            // exchange.getRequest().mutate().header("X-User-Id", claims.getSubject()).build();

            return chain.filter(exchange);
        };
    }
}
