package com.sms.service;

import com.sms.dto.*;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request, HttpServletRequest httpRequest);
    AuthResponse register(RegisterRequest request, HttpServletRequest httpRequest);
    UserDto getCurrentUser(String username);
    String forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    void logout(String username, HttpServletRequest httpRequest);
}
