package com.nguyencong.fieldmate.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VnPayPaymentAccountRequest {

    @NotBlank
    @Size(max = 100)
    private String tmnCode;

    @NotBlank
    @Size(max = 500)
    private String hashSecret;
}