package com.nguyencong.fieldmate.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MomoPaymentAccountRequest {

    @NotBlank
    @Size(max = 100)
    private String partnerCode;

    @NotBlank
    @Size(max = 500)
    private String accessKey;

    @NotBlank
    @Size(max = 500)
    private String secretKey;
}