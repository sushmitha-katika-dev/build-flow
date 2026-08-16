package com.buildflow.auth.controller;

import com.buildflow.auth.dto.AuthRequest;
import com.buildflow.auth.dto.AuthResponse;
import com.buildflow.auth.dto.RegisterRequest;
import com.buildflow.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration and login")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user and returns a JWT token")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticates a user and returns a JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PutMapping("/user/username")
    @Operation(summary = "Update username", description = "Updates user display username and returns a new JWT token")
    public ResponseEntity<AuthResponse> updateUsername(@Valid @RequestBody com.buildflow.auth.dto.UpdateUsernameRequest request) {
        return ResponseEntity.ok(authService.updateUsername(request));
    }

    @PutMapping("/user/password")
    @Operation(summary = "Update password", description = "Updates user account password")
    public ResponseEntity<Void> updatePassword(@Valid @RequestBody com.buildflow.auth.dto.UpdatePasswordRequest request) {
        authService.updatePassword(request);
        return ResponseEntity.ok().build();
    }
}
