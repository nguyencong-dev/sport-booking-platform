package com.nguyencong.fieldmate.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nguyencong.fieldmate.dto.request.MomoIpnRequest;
import com.nguyencong.fieldmate.dto.request.PaymentRequest;
import com.nguyencong.fieldmate.dto.response.PaymentResponse;
import com.nguyencong.fieldmate.service.PaymentService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Payment")
@RestController
@RequestMapping("/api")
public class ApiPaymentController {
    @Autowired
    private PaymentService paymentService;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/secure/bookings/{id}/payments")
    public ResponseEntity<PaymentResponse> createPayment(@PathVariable Long id,
            @Valid @RequestBody PaymentRequest request) {

        return new ResponseEntity<>(this.paymentService.createPayment(id, request), HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'COURT_OWNER', 'ADMIN')")
    @GetMapping("/secure/bookings/{id}/payments")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByBookingId(@PathVariable Long id) {

        return new ResponseEntity<>(this.paymentService.getPaymentsByBookingId(id), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'COURT_OWNER', 'ADMIN')")
    @GetMapping("/secure/payments/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {

        return new ResponseEntity<>(this.paymentService.getPaymentById(id), HttpStatus.OK);
    }

    @PostMapping("/payments/momo/ipn")
    public ResponseEntity<Void> handleMomoIpn(@Valid @RequestBody MomoIpnRequest request) {

        this.paymentService.handleMomoIpn(request);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}