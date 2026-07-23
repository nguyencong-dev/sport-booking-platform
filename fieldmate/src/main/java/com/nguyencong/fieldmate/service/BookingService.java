package com.nguyencong.fieldmate.service;

import java.util.List;

import com.nguyencong.fieldmate.dto.request.BookingRequest;
import com.nguyencong.fieldmate.dto.response.BookingResponse;

public interface BookingService {

    BookingResponse createBooking(BookingRequest request);
    List<BookingResponse> getCurrentCustomerBookings();
    BookingResponse getBookingById(Long id);
    List<BookingResponse> getBookingsByVenueId(Long venueId);
    BookingResponse completeBooking(Long id);
    List<BookingResponse> getAllBookings();
}