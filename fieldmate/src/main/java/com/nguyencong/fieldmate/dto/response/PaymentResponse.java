package com.nguyencong.fieldmate.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.nguyencong.fieldmate.entity.enums.PaymentMethod;
import com.nguyencong.fieldmate.entity.enums.PaymentStatus;
import com.nguyencong.fieldmate.entity.enums.PaymentType;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PaymentResponse {

    private Long id;
    private Long bookingId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentType paymentType;
    private PaymentStatus status;
    private String transactionCode;

    private String checkoutUrl;
    private String deeplink;
    private String qrCodeUrl;

    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}