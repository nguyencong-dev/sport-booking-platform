package com.nguyencong.fieldmate.service;

import java.io.IOException;
import java.util.List;

import com.nguyencong.fieldmate.dto.request.UserRequest;
import com.nguyencong.fieldmate.dto.response.UserResponse;

public interface UserService {
    UserResponse getCurrentUser();

    UserResponse updateCurrentUser(UserRequest request) throws IOException;

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse updateUserEnabled(Long id, boolean enabled);
}
