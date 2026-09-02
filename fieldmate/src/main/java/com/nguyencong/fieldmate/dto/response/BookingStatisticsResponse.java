package com.nguyencong.fieldmate.dto.response;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookingStatisticsResponse {

    private LocalDate periodStart;
    private Long bookingCount;
}
