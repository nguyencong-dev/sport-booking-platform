package com.nguyencong.fieldmate.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SportTypeRequest {
    @NotBlank
    @Size(max = 100)
    private String name;
}
