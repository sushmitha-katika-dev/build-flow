package com.buildflow.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUsernameRequest {
    @NotBlank(message = "Current username is required")
    private String currentUsername;

    @NotBlank(message = "New username is required")
    private String newUsername;
}
