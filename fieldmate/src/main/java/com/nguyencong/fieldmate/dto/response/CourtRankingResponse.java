package com.nguyencong.fieldmate.dto.response;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourtRankingResponse {

    private Long courtId;
    private String courtName;
    private String venueName;
    private BigDecimal value;
}
