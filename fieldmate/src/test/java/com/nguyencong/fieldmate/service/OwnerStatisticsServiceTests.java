package com.nguyencong.fieldmate.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;

@SpringBootTest
class OwnerStatisticsServiceTests {

    @Autowired
    private OwnerStatisticsService ownerStatisticsService;

    @Test
    @WithMockUser(username = "owner1@fieldmate.local", roles = "COURT_OWNER")
    void returnsStatisticsForCurrentOwner() {

        LocalDate from = LocalDate.now().minusYears(1);
        LocalDate to = LocalDate.now().plusYears(1);

        assertDoesNotThrow(() -> ownerStatisticsService.getRevenueStatistics(from, to, "DAY", null, null));
        assertDoesNotThrow(() -> ownerStatisticsService.getBookingStatistics(from, to, "WEEK", null, null));
        assertDoesNotThrow(() -> ownerStatisticsService.getPeakHourStatistics(from, to, null, null));
        assertDoesNotThrow(() -> ownerStatisticsService.getCourtRanking(from, to, "REVENUE", 5, null));
        assertDoesNotThrow(() -> ownerStatisticsService.getCourtRanking(from, to, "BOOKING_COUNT", 5, null));
        assertDoesNotThrow(() -> ownerStatisticsService.getCourtRanking(from, to, "BOOKED_HOURS", 5, null));
    }
}
