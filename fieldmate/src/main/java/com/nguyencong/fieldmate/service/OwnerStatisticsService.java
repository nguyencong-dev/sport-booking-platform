package com.nguyencong.fieldmate.service;

import java.time.LocalDate;
import java.util.List;

import com.nguyencong.fieldmate.dto.response.BookingStatisticsResponse;
import com.nguyencong.fieldmate.dto.response.CourtRankingResponse;
import com.nguyencong.fieldmate.dto.response.PeakHourStatisticsResponse;
import com.nguyencong.fieldmate.dto.response.RevenueStatisticsResponse;

public interface OwnerStatisticsService {

    List<RevenueStatisticsResponse> getRevenueStatistics(LocalDate from, LocalDate to, String granularity, Long venueId, Long courtId);

    List<BookingStatisticsResponse> getBookingStatistics(LocalDate from, LocalDate to, String granularity, Long venueId, Long courtId);

    List<PeakHourStatisticsResponse> getPeakHourStatistics(LocalDate from, LocalDate to, Long venueId, Long courtId);

    List<CourtRankingResponse> getCourtRanking(LocalDate from, LocalDate to, String metric, Integer limit, Long venueId);
}
