package com.nguyencong.fieldmate.dto.request;

import org.springframework.web.multipart.MultipartFile;

import com.nguyencong.fieldmate.entity.enums.Role;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @NotNull
    private String email;
    @NotNull
    private String password;
    @NotNull
    private String phoneNumber;
    @NotNull
    private String firstName;
    @NotNull
    private String lastName;
    private MultipartFile avatar;
    @NotNull
    private Role role;
}
