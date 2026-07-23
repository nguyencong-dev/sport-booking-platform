package com.nguyencong.fieldmate.dto.request;

import com.nguyencong.fieldmate.entity.enums.PaymentMethod;
import com.nguyencong.fieldmate.entity.enums.PaymentType;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequest {

    @NotNull
    private PaymentMethod paymentMethod;

    @NotNull
    private PaymentType paymentType;
}