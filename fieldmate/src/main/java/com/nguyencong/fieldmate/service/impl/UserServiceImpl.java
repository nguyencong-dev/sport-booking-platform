package com.nguyencong.fieldmate.service.impl;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cloudinary.Cloudinary;
import com.nguyencong.fieldmate.dto.request.RegisterRequest;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.repository.UserRepository;
import com.nguyencong.fieldmate.service.UserService;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private Cloudinary cloudinary;

    @Override
    public void registerUser(RegisterRequest request) throws IOException {
        User user = new User();

        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            Map uploadResult = cloudinary.uploader().upload(
                request.getAvatar().getBytes(),
                Map.of("folder", "fieldmate/avatars")
            );

            user.setAvatar((String) uploadResult.get("secure_url"));
        }

        userRepository.save(user);
    }
}
