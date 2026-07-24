package com.nguyencong.fieldmate.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nguyencong.fieldmate.entity.MomoCredential;

public interface MomoCredentialRepository extends JpaRepository<MomoCredential, Long> {

    Optional<MomoCredential> findByPaymentAccount_Id(Long paymentAccountId);
    boolean existsByPartnerCode(String partnerCode);
}