package com.nguyencong.fieldmate.dto.response;

import java.time.LocalTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookedPeriodResponse {

    private Long bookingId;
    private LocalTime startTime;
    private LocalTime endTime;
}
