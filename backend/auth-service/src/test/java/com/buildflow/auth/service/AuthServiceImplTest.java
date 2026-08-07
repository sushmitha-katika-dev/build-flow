package com.buildflow.auth.service;

import com.buildflow.auth.dto.AuthRequest;
import com.buildflow.auth.dto.AuthResponse;
import com.buildflow.auth.dto.RegisterRequest;
import com.buildflow.auth.entity.User;
import com.buildflow.auth.exception.AuthException;
import com.buildflow.auth.repository.UserRepository;
import com.buildflow.auth.util.JwtUtil;
import com.buildflow.auth.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    private User user;
    private RegisterRequest registerRequest;
    private AuthRequest loginRequest;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encoded_password")
                .role(Role.WORKER)
                .build();

        registerRequest = new RegisterRequest("testuser", "test@example.com", "password", Role.WORKER);
        loginRequest = new AuthRequest("testuser", "password");
    }

    @Test
    void register_Success() {
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("test_token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("test_token", response.getToken());
        assertEquals("testuser", response.getUsername());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_UsernameAlreadyExists() {
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        assertThrows(AuthException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "encoded_password")).thenReturn(true);
        when(jwtUtil.generateToken("testuser", "WORKER")).thenReturn("test_token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("test_token", response.getToken());
    }

    @Test
    void login_InvalidPassword() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "encoded_password")).thenReturn(false);

        assertThrows(AuthException.class, () -> authService.login(loginRequest));
    }
}
