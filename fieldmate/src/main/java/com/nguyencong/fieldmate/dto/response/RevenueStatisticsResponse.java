package com.nguyencong.fieldmate.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RevenueStatisticsResponse {

    private LocalDate periodStart;
    private BigDecimal revenue;
}
