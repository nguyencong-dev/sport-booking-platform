package com.nguyencong.fieldmate.service;

import com.nguyencong.fieldmate.dto.request.MomoPaymentAccountRequest;
import com.nguyencong.fieldmate.dto.response.PaymentAccountResponse;

public interface OwnerPaymentAccountService {

    PaymentAccountResponse createMomoAccount(MomoPaymentAccountRequest request);
}
