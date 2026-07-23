package com.nguyencong.fieldmate.payment;

import com.nguyencong.fieldmate.entity.Payment;
import com.nguyencong.fieldmate.entity.enums.PaymentMethod;

public interface PaymentGatewayStrategy {

    PaymentMethod getPaymentMethod();

    PaymentGatewayResult createPayment(Payment payment);
}