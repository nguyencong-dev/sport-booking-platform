package com.nguyencong.fieldmate.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import com.nguyencong.fieldmate.dto.request.VenueRequest;
import com.nguyencong.fieldmate.dto.response.VenueImageResponse;
import com.nguyencong.fieldmate.dto.response.VenueResponse;
import com.nguyencong.fieldmate.entity.enums.StatusVenue;
import com.nguyencong.fieldmate.service.VenueService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Venue")
@RestController
@RequestMapping("/api")
public class ApiVenueController {

    @Autowired
    private VenueService venueService;

    @GetMapping("/venues")
    public ResponseEntity<List<VenueResponse.Summary>> getAllVenues(@RequestParam Map<String, String> params) {
        return new ResponseEntity<>(this.venueService.getAllVenues(params), HttpStatus.OK);
    }

    @GetMapping("/venues/{id}")
    public ResponseEntity<VenueResponse.Detail> getVenueById(@PathVariable Long id) {
        return new ResponseEntity<>(this.venueService.getVenueById(id), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PostMapping(value = "/secure/venues", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VenueResponse.Summary> createVenue(@Valid @ModelAttribute VenueRequest request)
            throws IOException {
        return new ResponseEntity<>(this.venueService.createVenue(request), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PutMapping(value = "/secure/venues/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VenueResponse.Summary> updateVenue(@PathVariable Long id,
            @Valid @ModelAttribute VenueRequest request) throws IOException {
        return new ResponseEntity<>(this.venueService.updateVenue(id, request), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @DeleteMapping("/secure/venues/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long id) {
        venueService.deleteVenue(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COURT_OWNER')")
    @PatchMapping("/secure/venues/{id}/status")
    public ResponseEntity<VenueResponse.Summary> updateVenueStatus(
            @PathVariable Long id,
            @RequestParam StatusVenue status) {
        return new ResponseEntity<>(venueService.updateVenueStatus(id, status), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/secure/venues/pending")
    public ResponseEntity<List<VenueResponse.Summary>> getPendingVenues() {
        return new ResponseEntity<>(this.venueService.getPendingVenues(), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PostMapping(value = "/secure/venues/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<VenueImageResponse>> uploadVenueImages(
            @PathVariable Long id,
            @RequestParam("images") List<MultipartFile> images) throws IOException {
        return new ResponseEntity<>(this.venueService.uploadVenueImages(id, images), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @DeleteMapping("/secure/venues/{venueId}/images/{imageId}")
    public ResponseEntity<Void> deleteVenueImage(
            @PathVariable Long venueId,
            @PathVariable Long imageId) {
        venueService.deleteVenueImage(venueId, imageId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}