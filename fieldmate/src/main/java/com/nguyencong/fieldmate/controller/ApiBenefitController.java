package com.nguyencong.fieldmate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nguyencong.fieldmate.dto.request.BenefitRequest;
import com.nguyencong.fieldmate.dto.response.BenefitResponse;
import com.nguyencong.fieldmate.service.BenefitService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Benefit")
@RestController
@RequestMapping("/api")
public class ApiBenefitController {
    @Autowired
    private BenefitService benefitService;

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PostMapping("/secure/venues/{id}/benefits")
    public ResponseEntity<BenefitResponse> createBenefit(
            @PathVariable Long id,
            @Valid @RequestBody BenefitRequest request) {

        return new ResponseEntity<>(this.benefitService.createBenefit(id, request), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PutMapping("/secure/benefits/{id}")
    public ResponseEntity<BenefitResponse> updateBenefit(
            @PathVariable Long id,
            @Valid @RequestBody BenefitRequest request) {

        return new ResponseEntity<>(this.benefitService.updateBenefit(id, request), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @DeleteMapping("/secure/benefits/{id}")
    public ResponseEntity<Void> deleteBenefit(
            @PathVariable Long id) {

        this.benefitService.deleteBenefit(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
