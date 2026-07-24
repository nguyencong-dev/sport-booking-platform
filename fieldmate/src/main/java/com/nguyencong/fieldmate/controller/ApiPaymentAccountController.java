package com.nguyencong.fieldmate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nguyencong.fieldmate.dto.request.MomoPaymentAccountRequest;
import com.nguyencong.fieldmate.dto.response.PaymentAccountResponse;
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
    @PostMapping("/secure/payment-accounts/momo")
    public ResponseEntity<PaymentAccountResponse> createMomoAccount(@Valid @RequestBody MomoPaymentAccountRequest request) {
        
        return new ResponseEntity<>(this.paymentAccountService.createMomoAccount(request),HttpStatus.CREATED);
    }
}
