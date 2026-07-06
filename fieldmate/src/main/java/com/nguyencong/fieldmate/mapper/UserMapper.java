package com.nguyencong.fieldmate.mapper;

import com.nguyencong.fieldmate.dto.response.UserResponse;
import com.nguyencong.fieldmate.entity.User;

public class UserMapper {
    private UserMapper() {}
    public static UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getPhoneNumber(),
            user.getFirstName(),
            user.getLastName(),
            user.getAvatar(),
            user.getRole(),
            user.getEnabled(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}