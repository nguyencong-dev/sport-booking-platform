package com.nguyencong.fieldmate.security;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.repository.UserRepository;

@Component
public class CurrentUserProvider {
    @Autowired
    private UserRepository userRepository;

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng đăng nhập"));
    }
}