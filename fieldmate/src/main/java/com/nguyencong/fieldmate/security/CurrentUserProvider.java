package com.nguyencong.fieldmate.security;

import org.springframework.stereotype.Component;
import org.springframework.security.core.context.SecurityContextHolder;

import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CurrentUserProvider {
    private final UserRepository userRepository;

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
    }
}