package com.nguyencong.fieldmate.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.nguyencong.fieldmate.service.AuthService;
import com.nguyencong.fieldmate.dto.request.LoginRequest;
import com.nguyencong.fieldmate.dto.request.RegisterRequest;
import com.nguyencong.fieldmate.dto.response.AuthResponse;
import com.nguyencong.fieldmate.dto.response.UserResponse;

import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import jakarta.validation.Valid;

@Tag(name = "Authentication")
@RestController
@RequestMapping("/api/auth")
public class ApiAuthController {
    @Autowired
    private AuthService authService;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> register(@ModelAttribute @Valid RegisterRequest request) throws IOException {
        UserResponse userResponse = authService.registerUser(request);
        return new ResponseEntity<>(userResponse, HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> Login(@RequestBody @Valid LoginRequest request) {
        return new ResponseEntity<>(this.authService.login(request), HttpStatus.OK);
    }

}
