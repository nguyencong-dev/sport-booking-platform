package com.nguyencong.fieldmate.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.nguyencong.fieldmate.entity.enums.PaymentAccountStatus;
import com.nguyencong.fieldmate.entity.enums.PaymentProvider;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentAccountResponse {

    private Long id;
    private PaymentProvider provider;
    private PaymentAccountStatus status;

    private String partnerCode;
    private String tmnCode;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}