package com.buildflow.auth.service;

import com.buildflow.auth.dto.AuthRequest;
import com.buildflow.auth.dto.AuthResponse;
import com.buildflow.auth.dto.RegisterRequest;
import com.buildflow.auth.dto.UpdatePasswordRequest;
import com.buildflow.auth.dto.UpdateUsernameRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(AuthRequest request);
    AuthResponse updateUsername(UpdateUsernameRequest request);
    void updatePassword(UpdatePasswordRequest request);
}
