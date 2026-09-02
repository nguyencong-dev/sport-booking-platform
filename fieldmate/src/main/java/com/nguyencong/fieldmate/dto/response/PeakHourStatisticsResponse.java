package com.nguyencong.fieldmate.dto.response;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PeakHourStatisticsResponse {

    private Integer dayOfWeek;
    private Integer hourOfDay;
    private BigDecimal bookedHours;
}
