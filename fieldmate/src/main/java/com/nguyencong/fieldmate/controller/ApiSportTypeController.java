package com.nguyencong.fieldmate.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nguyencong.fieldmate.dto.request.SportTypeRequest;
import com.nguyencong.fieldmate.dto.response.SportTypeResponse;
import com.nguyencong.fieldmate.service.SportTypeService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Sport-Type")
@RestController
@RequestMapping("/api")
public class ApiSportTypeController {
    @Autowired
    private SportTypeService sportTypeService;

    @GetMapping("/sport-types")
    public ResponseEntity<List<SportTypeResponse>> getAllSportTypes() {
        return new ResponseEntity<>(this.sportTypeService.getAllSportTypes(), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/secure/sport-types")
    public ResponseEntity<SportTypeResponse> createSportType(
            @Valid @RequestBody SportTypeRequest request) {
        return new ResponseEntity<>(this.sportTypeService.createSportType(request), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/secure/sport-types/{id}")
    public ResponseEntity<SportTypeResponse> updateSportType(
            @PathVariable Long id,
            @Valid @RequestBody SportTypeRequest request) {
        return new ResponseEntity<>(this.sportTypeService.updateSportType(id, request), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/secure/sport-types/{id}")
    public ResponseEntity<Void> deleteSportType(@PathVariable Long id) {
        sportTypeService.deleteSportType(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
