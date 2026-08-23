package com.nguyencong.fieldmate.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;

import com.nguyencong.fieldmate.dto.request.BookingRequest;
import com.nguyencong.fieldmate.dto.response.BookingResponse;
import com.nguyencong.fieldmate.entity.enums.BookingStatus;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request);
    List<BookingResponse> getCurrentCustomerBookings();
    BookingResponse getBookingById(Long id);
    Page<BookingResponse> getBookingsByVenueId(Long venueId, LocalDate date, BookingStatus status, Long bookingId, int page);
    BookingResponse completeBooking(Long id);
    Page<BookingResponse> getAllBookings(String search, BookingStatus status, int page);
}
