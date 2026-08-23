package com.nguyencong.fieldmate.service;

import java.util.List;
import java.util.Map;

import com.nguyencong.fieldmate.dto.request.MomoIpnRequest;
import com.nguyencong.fieldmate.dto.request.PaymentRequest;
import com.nguyencong.fieldmate.dto.response.PaymentResponse;
import com.nguyencong.fieldmate.dto.response.VnPayIpnResponse;

public interface PaymentService {
    PaymentResponse createPayment(Long bookingId, PaymentRequest request);
    List<PaymentResponse> getPaymentsByBookingId(Long bookingId);
    PaymentResponse getPaymentById(Long id);
    void handleMomoIpn(MomoIpnRequest request);
    VnPayIpnResponse handleVnPayIpn(Map<String, String> parameters);
    String handleVnPayReturn(Map<String, String> parameters);
    String handleMomoReturn(Map<String, String> parameters);
    PaymentResponse receiveRemainingCashPayment(Long bookingId);
}
