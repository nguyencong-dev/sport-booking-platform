package com.nguyencong.fieldmate.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.nguyencong.fieldmate.entity.enums.CourtStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourtResponse {

    private Long id;
    private String name;
    private BigDecimal pricePerHour;
    private CourtStatus status;
    private String sportTypeName;
    private String venueName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}