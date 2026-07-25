package com.nguyencong.fieldmate.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nguyencong.fieldmate.dto.request.MomoPaymentAccountRequest;
import com.nguyencong.fieldmate.dto.request.PaymentAccountStatusRequest;
import com.nguyencong.fieldmate.dto.request.VnPayPaymentAccountRequest;
import com.nguyencong.fieldmate.dto.response.PaymentAccountResponse;
import com.nguyencong.fieldmate.entity.enums.PaymentAccountStatus;
import com.nguyencong.fieldmate.service.OwnerPaymentAccountService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Payment Account")
@RestController
@RequestMapping("/api")
public class ApiPaymentAccountController {

    @Autowired
    private OwnerPaymentAccountService paymentAccountService;

    @PreAuthorize("hasRole('COURT_OWNER')")
    @GetMapping("/secure/payment-accounts/me")
    public ResponseEntity<List<PaymentAccountResponse>> getCurrentOwnerPaymentAccounts() {

        return new ResponseEntity<>(this.paymentAccountService.getCurrentOwnerPaymentAccounts(), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('COURT_OWNER', 'ADMIN')")
    @GetMapping("/secure/payment-accounts/{id}")
    public ResponseEntity<PaymentAccountResponse> getPaymentAccountById(@PathVariable Long id) {

        return new ResponseEntity<>(this.paymentAccountService.getPaymentAccountById(id), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PutMapping("/secure/payment-accounts/{id}/momo")
    public ResponseEntity<PaymentAccountResponse> updateMomoAccount(@PathVariable Long id,
            @Valid @RequestBody MomoPaymentAccountRequest request) {

        return new ResponseEntity<>(this.paymentAccountService.updateMomoAccount(id, request), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PutMapping("/secure/payment-accounts/{id}/vnpay")
    public ResponseEntity<PaymentAccountResponse> updateVnPayAccount(@PathVariable Long id,
            @Valid @RequestBody VnPayPaymentAccountRequest request) {

        return new ResponseEntity<>(this.paymentAccountService.updateVnPayAccount(id, request), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PatchMapping("/secure/payment-accounts/{id}/inactive")
    public ResponseEntity<PaymentAccountResponse> deactivatePaymentAccount(@PathVariable Long id) {

        return new ResponseEntity<>(this.paymentAccountService.deactivatePaymentAccount(id), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PatchMapping("/secure/payment-accounts/{id}/active")
    public ResponseEntity<PaymentAccountResponse> activatePaymentAccount(@PathVariable Long id) {

        return new ResponseEntity<>(this.paymentAccountService.activatePaymentAccount(id), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PostMapping("/secure/payment-accounts/vnpay")
    public ResponseEntity<PaymentAccountResponse> createVnPayAccount(
            @Valid @RequestBody VnPayPaymentAccountRequest request) {

        return new ResponseEntity<>(this.paymentAccountService.createVnPayAccount(request), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PostMapping("/secure/payment-accounts/momo")
    public ResponseEntity<PaymentAccountResponse> createMomoAccount(
            @Valid @RequestBody MomoPaymentAccountRequest request) {

        return new ResponseEntity<>(this.paymentAccountService.createMomoAccount(request), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/secure/payment-accounts")
    public ResponseEntity<List<PaymentAccountResponse>> getAllPaymentAccounts(
            @RequestParam(required = false) PaymentAccountStatus status) {

        return new ResponseEntity<>(this.paymentAccountService.getAllPaymentAccounts(status), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/secure/payment-accounts/{id}/status")
    public ResponseEntity<PaymentAccountResponse> updatePaymentAccountStatus(@PathVariable Long id,
            @Valid @RequestBody PaymentAccountStatusRequest request) {

        return new ResponseEntity<>(this.paymentAccountService.updatePaymentAccountStatus(id, request), HttpStatus.OK);
    }
}
