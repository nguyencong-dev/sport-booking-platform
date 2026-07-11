package com.nguyencong.fieldmate.service;

import java.io.IOException;

import com.nguyencong.fieldmate.dto.request.LoginRequest;
import com.nguyencong.fieldmate.dto.request.RegisterRequest;
import com.nguyencong.fieldmate.dto.response.AuthResponse;
import com.nguyencong.fieldmate.dto.response.UserResponse;

public interface AuthService {
    UserResponse registerUser(RegisterRequest request) throws IOException;
    AuthResponse login(LoginRequest request);
}
