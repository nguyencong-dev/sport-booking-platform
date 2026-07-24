package com.nguyencong.fieldmate.mapper;

import com.nguyencong.fieldmate.dto.request.MomoPaymentAccountRequest;
import com.nguyencong.fieldmate.dto.response.PaymentAccountResponse;
import com.nguyencong.fieldmate.entity.MomoCredential;
import com.nguyencong.fieldmate.entity.OwnerPaymentAccount;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.enums.PaymentAccountStatus;
import com.nguyencong.fieldmate.entity.enums.PaymentProvider;

public final class OwnerPaymentAccountMapper {

    private OwnerPaymentAccountMapper() {
    }

    public static OwnerPaymentAccount toMomoAccount(User owner) {

        return OwnerPaymentAccount.builder().owner(owner).provider(PaymentProvider.MOMO)
                .status(PaymentAccountStatus.PENDING).build();
    }

    public static MomoCredential toMomoCredential(
            MomoPaymentAccountRequest request,
            OwnerPaymentAccount paymentAccount,
            String encryptedAccessKey,
            String encryptedSecretKey) {

        return MomoCredential.builder()
                .paymentAccount(paymentAccount)
                .partnerCode(request.getPartnerCode().trim())
                .accessKey(encryptedAccessKey)
                .secretKey(encryptedSecretKey)
                .build();
    }

    public static PaymentAccountResponse toResponse(OwnerPaymentAccount account, MomoCredential credential) {

        return PaymentAccountResponse.builder()
                .id(account.getId())
                .provider(account.getProvider())
                .status(account.getStatus())
                .partnerCode(credential.getPartnerCode())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}