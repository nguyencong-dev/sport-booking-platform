package com.nguyencong.fieldmate.dto.request;

import com.nguyencong.fieldmate.entity.enums.Role;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRoleRequest {
    @NotNull
    private Role role;
}
