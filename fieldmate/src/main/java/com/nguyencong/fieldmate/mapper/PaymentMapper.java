package com.nguyencong.fieldmate.mapper;

import com.nguyencong.fieldmate.dto.response.PaymentResponse;
import com.nguyencong.fieldmate.entity.Payment;
import com.nguyencong.fieldmate.payment.PaymentGatewayResult;

public class PaymentMapper {
    private PaymentMapper() {
    }

    public static PaymentResponse toResponse(Payment payment, PaymentGatewayResult gatewayResult) {

        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentType(payment.getType())
                .status(payment.getStatus())
                .transactionCode(payment.getTransactionCode())
                .checkoutUrl(gatewayResult.checkoutUrl())
                .deeplink(gatewayResult.deeplink())
                .qrCodeUrl(gatewayResult.qrCodeUrl())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    public static PaymentResponse toResponse(Payment payment) {

        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentType(payment.getType())
                .status(payment.getStatus())
                .transactionCode(payment.getTransactionCode())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }

}