package com.nguyencong.fieldmate.service.impl;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cloudinary.Cloudinary;
import com.nguyencong.fieldmate.dto.request.LoginRequest;
import com.nguyencong.fieldmate.dto.request.RegisterRequest;
import com.nguyencong.fieldmate.dto.response.AuthResponse;
import com.nguyencong.fieldmate.dto.response.UserResponse;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.mapper.UserMapper;
import com.nguyencong.fieldmate.repository.UserRepository;
import com.nguyencong.fieldmate.service.AuthService;
import com.nguyencong.fieldmate.security.JwtTokenProvider;

@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtTokenProvider JwtTokenProvider;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private Cloudinary cloudinary;

    @Override
    public UserResponse registerUser(RegisterRequest request) throws IOException {
        User user = new User();

        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    request.getAvatar().getBytes(),
                    Map.of("folder", "fieldmate/avatars"));

            user.setAvatar((String) uploadResult.get("secure_url"));
        }

        User savedUser = userRepository.save(user);
        return UserMapper.toResponse(savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        String token = JwtTokenProvider.generateToken(user.getEmail());
        return new AuthResponse(token);
    }

}
