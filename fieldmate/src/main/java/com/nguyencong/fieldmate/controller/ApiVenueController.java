package com.nguyencong.fieldmate.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nguyencong.fieldmate.dto.response.VenueResponse;
import com.nguyencong.fieldmate.service.VenueService;

@RestController
@RequestMapping("/api")
public class ApiVenueController {

    @Autowired
    private VenueService venueService;

    @GetMapping("/venues")
    public ResponseEntity<List<VenueResponse.Summary>> getAllVenues() {
        return ResponseEntity.ok(venueService.getAllVenues());
    }

    @GetMapping("/venues/{id}")
    public ResponseEntity<VenueResponse.Detail> getVenueById(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.getVenueById(id));
    }
}