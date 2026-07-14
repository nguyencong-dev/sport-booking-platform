package com.nguyencong.fieldmate.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nguyencong.fieldmate.dto.request.HeroBannerRequest;
import com.nguyencong.fieldmate.dto.response.HeroBannerResponse;
import com.nguyencong.fieldmate.service.HeroBannerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Hero Banner")
@RestController
@RequestMapping("/api")
public class ApiHeroBannerController {
    @Autowired
    private HeroBannerService heroBannerService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/banners")
    public ResponseEntity<List<HeroBannerResponse>> getAllHeroBanners() {

        return new ResponseEntity<>(
                heroBannerService.getAllHeroBanners(),
                HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/secure/banners", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HeroBannerResponse> createHeroBanner(
            @Valid @ModelAttribute HeroBannerRequest.Create request)
            throws IOException {

        return new ResponseEntity<>(this.heroBannerService.createHeroBanner(request),
                HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/secure/banners/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HeroBannerResponse> updateHeroBanner(
            @PathVariable Long id,
            @Valid @ModelAttribute HeroBannerRequest.Update request)
            throws IOException {

        return new ResponseEntity<>(heroBannerService.updateHeroBanner(id, request), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/secure/banners/{id}")
    public ResponseEntity<Void> deleteHeroBanner(
            @PathVariable Long id) {
        heroBannerService.deleteHeroBanner(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}