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

    @GetMapping("/users")
    @Operation(summary = "Get all registered users", description = "Retrieves all registered supervisors, admins, and workers")
    public ResponseEntity<java.util.List<com.buildflow.auth.dto.UserDto>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Update user registration status", description = "Approves or rejects a site supervisor account")
    public ResponseEntity<com.buildflow.auth.dto.UserDto> updateUserStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(authService.updateUserStatus(id, status));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user account", description = "Deletes a user account from the system")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        authService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin-passcode")
    @Operation(summary = "Get active admin registration passcode", description = "Returns the active passcode required to register as Admin")
    public ResponseEntity<java.util.Map<String, String>> getAdminPasscode() {
        return ResponseEntity.ok(java.util.Collections.singletonMap("passcode", com.buildflow.auth.service.AuthServiceImpl.activeAdminPasscode));
    }

    @PostMapping("/admin-passcode")
    @Operation(summary = "Update active admin registration passcode", description = "Generates or sets a new admin registration passcode")
    public ResponseEntity<java.util.Map<String, String>> updateAdminPasscode(@RequestBody java.util.Map<String, String> body) {
        String newCode = body.get("passcode");
        if (newCode != null && !newCode.trim().isEmpty()) {
            com.buildflow.auth.service.AuthServiceImpl.activeAdminPasscode = newCode.trim();
        }
        return ResponseEntity.ok(java.util.Collections.singletonMap("passcode", com.buildflow.auth.service.AuthServiceImpl.activeAdminPasscode));
    }
}
