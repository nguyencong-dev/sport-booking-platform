package com.nguyencong.fieldmate.dto.request;

import org.springframework.web.multipart.MultipartFile;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String email;
    private String password;
    private String phoneNumber;
    private String firstName;
    private String lastName;
    private MultipartFile avatar;
}