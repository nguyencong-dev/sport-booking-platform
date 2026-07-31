package com.nguyencong.fieldmate.service.impl;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cloudinary.Cloudinary;
import com.nguyencong.fieldmate.dto.request.UserRequest;
import com.nguyencong.fieldmate.dto.response.UserResponse;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.exception.BusinessRuleViolationException;
import com.nguyencong.fieldmate.exception.FileUploadException;
import com.nguyencong.fieldmate.exception.ResourceNotFoundException;
import com.nguyencong.fieldmate.mapper.UserMapper;
import com.nguyencong.fieldmate.repository.UserRepository;
import com.nguyencong.fieldmate.repository.spec.UserSpecification;
import com.nguyencong.fieldmate.security.CurrentUserProvider;
import com.nguyencong.fieldmate.service.UserService;
import com.nguyencong.fieldmate.utils.PaginationUtils;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private Cloudinary cloudinary;
    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        User currentUser = currentUserProvider.getCurrentUser();

        return UserMapper.toResponse(currentUser);
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUser(UserRequest request) throws IOException {

        User currentUser = currentUserProvider.getCurrentUser();

        UserMapper.updateEntity(currentUser, request);

        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {

            Map<?, ?> uploadResult = cloudinary.uploader().upload(request.getAvatar().getBytes(),
                    Map.of("folder", "fieldmate/avatars"));

            Object secureUrl = uploadResult.get("secure_url");

            if (!(secureUrl instanceof String avatarUrl)) {
                throw new FileUploadException("Cloudinary không trả về URL ảnh");
            }

            currentUser.setAvatar(avatarUrl);
        }

        User savedUser = userRepository.save(currentUser);

        return UserMapper.toResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(String email, Boolean enabled, int page) {
        Pageable pageable = PaginationUtils.createPageable(page);
        String normalizedEmail = email == null || email.isBlank() ? null : email.trim();
        Specification<User> specification = UserSpecification.byFilters(normalizedEmail, enabled);

        return userRepository.findAll(specification, pageable).map(UserMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        return UserMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUserEnabled(Long id, boolean enabled) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        User currentAdmin = currentUserProvider.getCurrentUser();

        if (!enabled && user.getId().equals(currentAdmin.getId())) {
            throw new BusinessRuleViolationException("Admin không thể tự khóa tài khoản của mình");
        }

        user.setEnabled(enabled);

        User savedUser = userRepository.save(user);

        return UserMapper.toResponse(savedUser);
    }
}
