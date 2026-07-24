package com.nguyencong.fieldmate.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nguyencong.fieldmate.dto.request.MomoPaymentAccountRequest;
import com.nguyencong.fieldmate.dto.response.PaymentAccountResponse;
import com.nguyencong.fieldmate.entity.MomoCredential;
import com.nguyencong.fieldmate.entity.OwnerPaymentAccount;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.enums.PaymentProvider;
import com.nguyencong.fieldmate.exception.DuplicateResourceException;
import com.nguyencong.fieldmate.mapper.OwnerPaymentAccountMapper;
import com.nguyencong.fieldmate.repository.MomoCredentialRepository;
import com.nguyencong.fieldmate.repository.OwnerPaymentAccountRepository;
import com.nguyencong.fieldmate.security.CurrentUserProvider;
import com.nguyencong.fieldmate.service.CredentialEncryptionService;
import com.nguyencong.fieldmate.service.OwnerPaymentAccountService;

@Service
public class OwnerPaymentAccountServiceImpl implements OwnerPaymentAccountService {

    @Autowired
    private OwnerPaymentAccountRepository paymentAccountRepository;

    @Autowired
    private MomoCredentialRepository momoCredentialRepository;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Autowired
    private CredentialEncryptionService credentialEncryptionService;

    @Override
    @Transactional
    public PaymentAccountResponse createMomoAccount(MomoPaymentAccountRequest request) {

        User currentOwner = currentUserProvider.getCurrentUser();

        boolean momoAccountExists = paymentAccountRepository.existsByOwner_IdAndProvider(currentOwner.getId(),
                PaymentProvider.MOMO);

        if (momoAccountExists) {
            throw new DuplicateResourceException("Bạn đã có tài khoản thanh toán MoMo");
        }

        String partnerCode = request.getPartnerCode().trim();

        boolean partnerCodeExists = momoCredentialRepository.existsByPartnerCode(partnerCode);

        if (partnerCodeExists) {
            throw new DuplicateResourceException("Partner code MoMo đã được sử dụng");
        }

        OwnerPaymentAccount paymentAccount = OwnerPaymentAccountMapper.toMomoAccount(currentOwner);

        OwnerPaymentAccount savedAccount = paymentAccountRepository.save(paymentAccount);

        String encryptedAccessKey = credentialEncryptionService.encrypt(request.getAccessKey().trim());

        String encryptedSecretKey = credentialEncryptionService.encrypt(request.getSecretKey());

        MomoCredential momoCredential = OwnerPaymentAccountMapper.toMomoCredential(request, savedAccount,
                encryptedAccessKey, encryptedSecretKey);

        MomoCredential savedCredential = momoCredentialRepository.save(momoCredential);
        return OwnerPaymentAccountMapper.toResponse(savedAccount, savedCredential);
    }
}