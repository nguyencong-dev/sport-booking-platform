package com.nguyencong.fieldmate.mapper;

import com.nguyencong.fieldmate.dto.request.UserRequest;
import com.nguyencong.fieldmate.dto.response.UserResponse;
import com.nguyencong.fieldmate.entity.User;

public class UserMapper {
    private UserMapper() {
    }

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
                user.getUpdatedAt());
    }

    public static void updateEntity(
            User user,
            UserRequest request) {

        if (user == null || request == null) {
            return;
        }

        if (request.getFirstName() != null) {
            String firstName = request.getFirstName().trim();

            if (firstName.isBlank()) {
                throw new RuntimeException(
                        "Tên không được để trống");
            }

            user.setFirstName(firstName);
        }

        if (request.getLastName() != null) {
            String lastName = request.getLastName().trim();

            if (lastName.isBlank()) {
                throw new RuntimeException(
                        "Họ không được để trống");
            }

            user.setLastName(lastName);
        }

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(
                    request.getPhoneNumber().trim());
        }
    }
}