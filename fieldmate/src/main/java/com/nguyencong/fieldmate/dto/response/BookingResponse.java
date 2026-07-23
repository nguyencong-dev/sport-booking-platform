package com.nguyencong.fieldmate.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.nguyencong.fieldmate.entity.enums.BookingStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BookingResponse {

    private Long id;

    private Long customerId;
    private String customerName;

    private Long courtId;
    private String courtName;
    private String venueName;

    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private BigDecimal totalPrice;
    private BigDecimal requiredDeposit;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;

    private BookingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}