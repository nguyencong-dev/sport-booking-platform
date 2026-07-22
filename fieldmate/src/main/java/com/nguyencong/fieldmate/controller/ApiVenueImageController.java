package com.nguyencong.fieldmate.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.nguyencong.fieldmate.dto.response.VenueImageResponse;
import com.nguyencong.fieldmate.service.VenueImageService;

import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Venue Image")
@RestController
@RequestMapping("/api")
@PreAuthorize("hasRole('COURT_OWNER')")
public class ApiVenueImageController {
    @Autowired
    private VenueImageService venueImageService;

    @PostMapping(value = "/secure/venues/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<VenueImageResponse>> uploadVenueImages(
            @PathVariable Long id,
            @RequestParam("images") List<MultipartFile> images) throws IOException {
        return new ResponseEntity<>(venueImageService.uploadVenueImages(id, images), HttpStatus.OK);
    }

    @DeleteMapping("/secure/images/{id}")
    public ResponseEntity<Void> deleteVenueImage(@PathVariable Long id) {
        venueImageService.deleteVenueImage(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
