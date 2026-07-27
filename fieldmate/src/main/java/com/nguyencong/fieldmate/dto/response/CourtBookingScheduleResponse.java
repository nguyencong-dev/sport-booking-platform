package com.nguyencong.fieldmate.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourtBookingScheduleResponse {

    private Long courtId;
    private String courtName;
    private List<BookedPeriodResponse> bookedPeriods;
}
