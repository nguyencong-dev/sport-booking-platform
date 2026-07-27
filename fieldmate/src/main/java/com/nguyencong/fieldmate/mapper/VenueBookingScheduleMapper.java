package com.nguyencong.fieldmate.mapper;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.nguyencong.fieldmate.dto.response.BookedPeriodResponse;
import com.nguyencong.fieldmate.dto.response.CourtBookingScheduleResponse;
import com.nguyencong.fieldmate.dto.response.VenueBookingScheduleResponse;
import com.nguyencong.fieldmate.entity.Booking;
import com.nguyencong.fieldmate.entity.Court;
import com.nguyencong.fieldmate.entity.Venue;

public class VenueBookingScheduleMapper {

        private VenueBookingScheduleMapper() {
        }

        public static VenueBookingScheduleResponse toResponse(Venue venue, LocalDate date, List<Court> courts,
                        Map<Long, List<Booking>> bookingsByCourtId) {

                return VenueBookingScheduleResponse.builder().venueId(venue.getId()).date(date)
                                .courts(courts.stream().map(court -> toCourtResponse(court,
                                                bookingsByCourtId.getOrDefault(court.getId(), List.of()))).toList())
                                .build();
        }

        public static CourtBookingScheduleResponse toCourtResponse(Court court, List<Booking> bookings) {

                return CourtBookingScheduleResponse.builder().courtId(court.getId())
                                .courtName(court.getName()).bookedPeriods(bookings.stream()
                                                .map(VenueBookingScheduleMapper::toBookedPeriodResponse).toList())
                                .build();
        }

        public static BookedPeriodResponse toBookedPeriodResponse(Booking booking) {

                return BookedPeriodResponse.builder().bookingId(booking.getId()).startTime(booking.getStartTime())
                                .endTime(booking.getEndTime()).build();
        }
}
