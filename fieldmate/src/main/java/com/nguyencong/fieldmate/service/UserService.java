package com.nguyencong.fieldmate.service;

import java.io.IOException;

import org.springframework.data.domain.Page;

import com.nguyencong.fieldmate.dto.request.UserRequest;
import com.nguyencong.fieldmate.dto.response.UserResponse;

public interface UserService {
    UserResponse getCurrentUser();
    UserResponse updateCurrentUser(UserRequest request) throws IOException;
    Page<UserResponse> getAllUsers(String email, Boolean enabled, int page);
    UserResponse getUserById(Long id);
    UserResponse updateUserEnabled(Long id, boolean enabled);
}
