package com.nguyencong.fieldmate.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nguyencong.fieldmate.dto.request.CourtRequest;
import com.nguyencong.fieldmate.dto.response.CourtResponse;
import com.nguyencong.fieldmate.entity.enums.CourtStatus;
import com.nguyencong.fieldmate.service.CourtService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Court")
@RestController
@RequestMapping("/api")
public class ApiCourtController {
    @Autowired
    private CourtService courtService;

    @GetMapping("/venues/{id}/courts")
    public ResponseEntity<List<CourtResponse>> getCourtsByVenueId(@PathVariable Long id) {
        return new ResponseEntity<>(this.courtService.getCourtsByVenueId(id), HttpStatus.OK);
    }

    @GetMapping("/courts/{id}")
    public ResponseEntity<CourtResponse> getCourtById(@PathVariable Long id) {
        return new ResponseEntity<>(this.courtService.getCourtById(id), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PostMapping("/secure/venues/{id}/courts")
    public ResponseEntity<CourtResponse> createCourt(
            @PathVariable Long id,
            @Valid @RequestBody CourtRequest request) {
        return new ResponseEntity<>(this.courtService.createCourt(id, request), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PutMapping("/secure/courts/{id}")
    public ResponseEntity<CourtResponse> updateCourt(
            @PathVariable Long id,
            @Valid @RequestBody CourtRequest request) {
        return new ResponseEntity<>(this.courtService.updateCourt(id, request), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PatchMapping("/secure/courts/{id}/status")
    public ResponseEntity<CourtResponse> updateCourtStatus(
            @PathVariable Long id,
            @RequestParam CourtStatus status) {
        return new ResponseEntity<>(this.courtService.updateCourtStatus(id, status), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @DeleteMapping("/secure/courts/{id}")
    public ResponseEntity<Void> deleteCourt(@PathVariable Long id) {
        this.courtService.deleteCourt(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}