package com.nguyencong.fieldmate.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nguyencong.fieldmate.dto.response.BookingStatisticsResponse;
import com.nguyencong.fieldmate.dto.response.CourtRankingResponse;
import com.nguyencong.fieldmate.dto.response.PeakHourStatisticsResponse;
import com.nguyencong.fieldmate.dto.response.RevenueStatisticsResponse;
import com.nguyencong.fieldmate.service.OwnerStatisticsService;

import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Owner Statistics")
@RestController
@RequestMapping("/api")
public class ApiOwnerStatisticsController {

    @Autowired
    private OwnerStatisticsService ownerStatisticsService;

    @PreAuthorize("hasRole('COURT_OWNER')")
    @GetMapping("/secure/owner/statistics/revenue")
    public ResponseEntity<List<RevenueStatisticsResponse>> getRevenueStatistics(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to, @RequestParam(defaultValue = "DAY") String granularity, @RequestParam(required = false) Long venueId, @RequestParam(required = false) Long courtId) {

        return new ResponseEntity<>(this.ownerStatisticsService.getRevenueStatistics(from, to, granularity, venueId, courtId), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @GetMapping("/secure/owner/statistics/bookings")
    public ResponseEntity<List<BookingStatisticsResponse>> getBookingStatistics(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to, @RequestParam(defaultValue = "DAY") String granularity, @RequestParam(required = false) Long venueId, @RequestParam(required = false) Long courtId) {

        return new ResponseEntity<>(this.ownerStatisticsService.getBookingStatistics(from, to, granularity, venueId, courtId), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @GetMapping("/secure/owner/statistics/peak-hours")
    public ResponseEntity<List<PeakHourStatisticsResponse>> getPeakHourStatistics(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to, @RequestParam(required = false) Long venueId, @RequestParam(required = false) Long courtId) {

        return new ResponseEntity<>(this.ownerStatisticsService.getPeakHourStatistics(from, to, venueId, courtId), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('COURT_OWNER')")
    @GetMapping("/secure/owner/statistics/courts/ranking")
    public ResponseEntity<List<CourtRankingResponse>> getCourtRanking(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to, @RequestParam(defaultValue = "REVENUE") String metric, @RequestParam(defaultValue = "5") Integer limit, @RequestParam(required = false) Long venueId) {

        return new ResponseEntity<>(this.ownerStatisticsService.getCourtRanking(from, to, metric, limit, venueId), HttpStatus.OK);
    }
}
