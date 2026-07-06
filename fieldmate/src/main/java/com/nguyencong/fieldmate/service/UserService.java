package com.nguyencong.fieldmate.service;

import java.io.IOException;
import com.nguyencong.fieldmate.dto.request.RegisterRequest;

public interface UserService {
    void registerUser(RegisterRequest request) throws IOException;
}