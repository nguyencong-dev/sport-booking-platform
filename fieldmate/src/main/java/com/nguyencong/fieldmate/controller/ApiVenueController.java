package com.nguyencong.fieldmate.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;

import com.nguyencong.fieldmate.dto.request.VenueRequest;
import com.nguyencong.fieldmate.dto.response.VenueResponse;
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
        VenueResponse.Summary response = venueService.createVenue(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}