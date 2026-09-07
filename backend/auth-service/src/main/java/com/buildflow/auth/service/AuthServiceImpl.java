package com.buildflow.auth.service;

import com.buildflow.auth.dto.AuthRequest;
import com.buildflow.auth.dto.AuthResponse;
import com.buildflow.auth.dto.RegisterRequest;
import com.buildflow.auth.dto.UserDto;
import com.buildflow.auth.entity.User;
import com.buildflow.auth.exception.AuthException;
import com.buildflow.auth.repository.UserRepository;
import com.buildflow.auth.util.JwtUtil;
import com.buildflow.auth.enums.Role;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public static String activeAdminPasscode = "BF-ADMIN-2026";

    // Constructor Injection
    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AuthException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("Email is already in use");
        }

        boolean isAdminRole = request.getRole() == Role.ADMIN || request.getRole() == Role.CONTRACTOR || request.getRole() == Role.PROJECT_MANAGER || request.getRole() == Role.FINANCE_MANAGER;
        
        // SECURITY GUARD: Admin & Executive roles require valid Company Access Passcode
        if (isAdminRole) {
            String providedCode = request.getAdminSecretCode();
            if (providedCode == null || !providedCode.trim().equalsIgnoreCase(activeAdminPasscode.trim())) {
                throw new AuthException("Invalid Admin Access Passcode. Please contact company owner for the active security passcode.");
            }
        }

        boolean isSupervisor = request.getRole() == Role.SITE_SUPERVISOR || request.getRole() == Role.SUPERVISOR;
        String initialStatus = isSupervisor ? "PENDING_APPROVAL" : "APPROVED";

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(initialStatus)
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AuthException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthException("Invalid username or password");
        }

        // Supervisor Approval Check
        if ("PENDING_APPROVAL".equalsIgnoreCase(user.getStatus())) {
            throw new AuthException("Account pending admin approval. Please contact system administrator or contractor.");
        }

        if ("REJECTED".equalsIgnoreCase(user.getStatus())) {
            throw new AuthException("Account registration not approved or rejected by Admin.");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse updateUsername(com.buildflow.auth.dto.UpdateUsernameRequest request) {
        User user = userRepository.findByUsername(request.getCurrentUsername())
                .orElseThrow(() -> new AuthException("User not found with username: " + request.getCurrentUsername()));

        if (!request.getCurrentUsername().equalsIgnoreCase(request.getNewUsername()) &&
                userRepository.existsByUsername(request.getNewUsername())) {
            throw new AuthException("Username '" + request.getNewUsername() + "' is already taken");
        }

        user.setUsername(request.getNewUsername());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    @Override
    @Transactional
    public void updatePassword(com.buildflow.auth.dto.UpdatePasswordRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AuthException("User not found with username: " + request.getUsername()));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new AuthException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> UserDto.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .status(user.getStatus())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDto updateUserStatus(Long userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found with ID: " + userId));

        user.setStatus(status);
        userRepository.save(user);

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new AuthException("User not found with ID: " + userId);
        }
        userRepository.deleteById(userId);
    }
}
