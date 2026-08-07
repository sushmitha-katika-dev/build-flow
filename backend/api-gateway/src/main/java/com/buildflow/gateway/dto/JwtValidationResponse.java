package com.buildflow.gateway.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtValidationResponse {
    private boolean valid;
    private String username;
    private String role;
}
