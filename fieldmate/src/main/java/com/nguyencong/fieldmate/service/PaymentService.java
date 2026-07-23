package com.nguyencong.fieldmate.service;

import java.util.List;

import com.nguyencong.fieldmate.dto.request.MomoIpnRequest;
import com.nguyencong.fieldmate.dto.request.PaymentRequest;
import com.nguyencong.fieldmate.dto.response.PaymentResponse;

public interface PaymentService {

    PaymentResponse createPayment(Long bookingId, PaymentRequest request);
    List<PaymentResponse> getPaymentsByBookingId(Long bookingId);
    PaymentResponse getPaymentById(Long id);
    void handleMomoIpn(MomoIpnRequest request);
}