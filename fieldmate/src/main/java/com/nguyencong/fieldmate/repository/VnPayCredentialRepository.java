package com.nguyencong.fieldmate.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nguyencong.fieldmate.entity.VnPayCredential;

public interface VnPayCredentialRepository extends JpaRepository<VnPayCredential, Long> {

    Optional<VnPayCredential> findByPaymentAccount_Id(Long paymentAccountId);

    boolean existsByTmnCode(String tmnCode);

    boolean existsByTmnCodeAndPaymentAccount_IdNot(String tmnCode, Long paymentAccountId);
}