package com.nguyencong.fieldmate.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nguyencong.fieldmate.dto.request.UserRequest;
import com.nguyencong.fieldmate.dto.response.UserResponse;
import com.nguyencong.fieldmate.service.UserService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "User")
@RestController
@RequestMapping("/api")
public class ApiUserController {
    @Autowired
    private UserService userService;

    @GetMapping("/secure/users/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return new ResponseEntity<>(this.userService.getCurrentUser(), HttpStatus.OK);
    }

    @PutMapping(value = "/secure/users/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> updateCurrentUser(
            @Valid @ModelAttribute UserRequest request)
            throws IOException {

        return new ResponseEntity<>(this.userService.updateCurrentUser(request), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/secure/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return new ResponseEntity<>(this.userService.getAllUsers(), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/secure/users/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id) {
        return new ResponseEntity<>(this.userService.getUserById(id), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/secure/users/{id}/enabled")
    public ResponseEntity<UserResponse> updateUserEnabled(
            @PathVariable Long id,
            @RequestParam boolean enabled) {

        return new ResponseEntity<>(this.userService.updateUserEnabled(id, enabled), HttpStatus.OK);
    }
}