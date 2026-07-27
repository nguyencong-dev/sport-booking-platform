package com.nguyencong.fieldmate.dto.response;

import java.time.LocalDate;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VenueBookingScheduleResponse {

    private Long venueId;
    private LocalDate date;
    private List<CourtBookingScheduleResponse> courts;
}
