package com.nguyencong.fieldmate.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nguyencong.fieldmate.entity.OwnerPaymentAccount;
import com.nguyencong.fieldmate.entity.enums.PaymentAccountStatus;
import com.nguyencong.fieldmate.entity.enums.PaymentProvider;

public interface OwnerPaymentAccountRepository extends JpaRepository<OwnerPaymentAccount, Long> {

    Optional<OwnerPaymentAccount> findByOwner_IdAndProviderAndStatus(Long ownerId, PaymentProvider provider,
            PaymentAccountStatus status);

    boolean existsByOwner_IdAndProvider(Long ownerId, PaymentProvider provider);
}