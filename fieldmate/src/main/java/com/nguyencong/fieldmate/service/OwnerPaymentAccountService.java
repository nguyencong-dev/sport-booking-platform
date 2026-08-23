package com.nguyencong.fieldmate.service;

import java.util.List;

import com.nguyencong.fieldmate.dto.request.MomoPaymentAccountRequest;
import com.nguyencong.fieldmate.dto.request.PaymentAccountStatusRequest;
import com.nguyencong.fieldmate.dto.request.VnPayPaymentAccountRequest;
import com.nguyencong.fieldmate.dto.response.PaymentAccountResponse;
import com.nguyencong.fieldmate.entity.enums.PaymentAccountStatus;

public interface OwnerPaymentAccountService {
    PaymentAccountResponse createMomoAccount(MomoPaymentAccountRequest request);
    List<PaymentAccountResponse> getCurrentOwnerPaymentAccounts();
    PaymentAccountResponse createVnPayAccount(VnPayPaymentAccountRequest request);
    PaymentAccountResponse getPaymentAccountById(Long id);
    PaymentAccountResponse updateMomoAccount(Long id, MomoPaymentAccountRequest request);
    PaymentAccountResponse updateVnPayAccount(Long id, VnPayPaymentAccountRequest request);
    PaymentAccountResponse deactivatePaymentAccount(Long id);
    List<PaymentAccountResponse> getAllPaymentAccounts(PaymentAccountStatus status);
    PaymentAccountResponse updatePaymentAccountStatus(Long id, PaymentAccountStatusRequest request);
    PaymentAccountResponse activatePaymentAccount(Long id);
}
