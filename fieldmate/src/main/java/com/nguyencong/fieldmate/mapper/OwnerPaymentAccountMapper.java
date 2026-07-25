package com.nguyencong.fieldmate.mapper;

import com.nguyencong.fieldmate.dto.request.MomoPaymentAccountRequest;
import com.nguyencong.fieldmate.dto.request.VnPayPaymentAccountRequest;
import com.nguyencong.fieldmate.dto.response.PaymentAccountResponse;
import com.nguyencong.fieldmate.entity.MomoCredential;
import com.nguyencong.fieldmate.entity.OwnerPaymentAccount;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.VnPayCredential;
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

    public static OwnerPaymentAccount toVnPayAccount(User owner) {
        return OwnerPaymentAccount.builder()
                .owner(owner)
                .provider(PaymentProvider.VNPAY)
                .status(PaymentAccountStatus.PENDING)
                .build();
    }

    public static VnPayCredential toVnPayCredential(VnPayPaymentAccountRequest request,
            OwnerPaymentAccount paymentAccount, String encryptedHashSecret) {

        return VnPayCredential.builder()
                .paymentAccount(paymentAccount)
                .tmnCode(request.getTmnCode().trim())
                .hashSecret(encryptedHashSecret)
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

    public static PaymentAccountResponse toResponse(OwnerPaymentAccount account, VnPayCredential credential) {

        return PaymentAccountResponse.builder()
                .id(account.getId())
                .provider(account.getProvider())
                .status(account.getStatus())
                .tmnCode(credential.getTmnCode())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }

    public static PaymentAccountResponse toResponse(OwnerPaymentAccount account) {

        return PaymentAccountResponse.builder()
                .id(account.getId())
                .provider(account.getProvider())
                .status(account.getStatus())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }

    public static void updateMomoCredential(MomoCredential credential, MomoPaymentAccountRequest request,
            String encryptedAccessKey, String encryptedSecretKey) {

        credential.setPartnerCode(request.getPartnerCode().trim());
        credential.setAccessKey(encryptedAccessKey);
        credential.setSecretKey(encryptedSecretKey);
    }

    public static void updateVnPayCredential(VnPayCredential credential, VnPayPaymentAccountRequest request,
            String encryptedHashSecret) {

        credential.setTmnCode(request.getTmnCode().trim());
        credential.setHashSecret(encryptedHashSecret);
    }
}