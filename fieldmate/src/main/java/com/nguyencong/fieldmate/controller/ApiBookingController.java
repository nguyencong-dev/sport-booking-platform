package com.nguyencong.fieldmate.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nguyencong.fieldmate.dto.request.BookingRequest;
import com.nguyencong.fieldmate.dto.response.BookingResponse;
import com.nguyencong.fieldmate.service.BookingService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Booking")
@RestController
@RequestMapping("/api")
public class ApiBookingController {
    @Autowired
    private BookingService bookingService;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/secure/bookings")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {

        return new ResponseEntity<>(this.bookingService.createBooking(request), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/secure/bookings/me")
    public ResponseEntity<List<BookingResponse>> getCurrentCustomerBookings() {

        return new ResponseEntity<>(this.bookingService.getCurrentCustomerBookings(), HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'COURT_OWNER', 'ADMIN')")
    @GetMapping("/secure/bookings/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {

        return new ResponseEntity<>(this.bookingService.getBookingById(id), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @GetMapping("/secure/venues/{id}/bookings")
    public ResponseEntity<List<BookingResponse>> getBookingsByVenueId(@PathVariable Long id) {

        return new ResponseEntity<>(this.bookingService.getBookingsByVenueId(id), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @PatchMapping("/secure/bookings/{id}/complete")
    public ResponseEntity<BookingResponse> completeBooking(@PathVariable Long id) {

        return new ResponseEntity<>(this.bookingService.completeBooking(id), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/secure/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {

        return new ResponseEntity<>( this.bookingService.getAllBookings(), HttpStatus.OK);
    }
}