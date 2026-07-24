package com.nguyencong.fieldmate.dto.response;

import java.time.LocalDateTime;

import com.nguyencong.fieldmate.entity.enums.PaymentAccountStatus;
import com.nguyencong.fieldmate.entity.enums.PaymentProvider;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentAccountResponse {

    private Long id;
    private PaymentProvider provider;
    private PaymentAccountStatus status;
    private String partnerCode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
