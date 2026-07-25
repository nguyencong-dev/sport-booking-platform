package com.nguyencong.fieldmate.dto.request;

import com.nguyencong.fieldmate.entity.enums.PaymentAccountStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentAccountStatusRequest {

    @NotNull
    private PaymentAccountStatus status;
}