package com.nguyencong.fieldmate.service;

import com.nguyencong.fieldmate.dto.request.LoginRequest;
import com.nguyencong.fieldmate.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
}
