package com.nguyencong.fieldmate.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nguyencong.fieldmate.dto.response.BookingStatisticsResponse;
import com.nguyencong.fieldmate.dto.response.CourtRankingResponse;
import com.nguyencong.fieldmate.dto.response.PeakHourStatisticsResponse;
import com.nguyencong.fieldmate.dto.response.RevenueStatisticsResponse;
import com.nguyencong.fieldmate.entity.Booking;
import com.nguyencong.fieldmate.entity.Court;
import com.nguyencong.fieldmate.entity.Payment;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.exception.BadRequestException;
import com.nguyencong.fieldmate.repository.BookingRepository;
import com.nguyencong.fieldmate.repository.PaymentRepository;
import com.nguyencong.fieldmate.repository.spec.BookingSpecification;
import com.nguyencong.fieldmate.repository.spec.PaymentSpecification;
import com.nguyencong.fieldmate.security.CurrentUserProvider;
import com.nguyencong.fieldmate.service.OwnerStatisticsService;

@Service
public class OwnerStatisticsServiceImpl implements OwnerStatisticsService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Override
    @Transactional(readOnly = true)
    public List<RevenueStatisticsResponse> getRevenueStatistics(LocalDate from, LocalDate to, String granularity, Long venueId, Long courtId) {

        validateDateRange(from, to);

        User currentOwner = currentUserProvider.getCurrentUser();
        String normalizedGranularity = normalizeGranularity(granularity);
        Specification<Payment> specification = PaymentSpecification.byStatisticsFilters(currentOwner.getId(), from.atStartOfDay(), to.plusDays(1).atStartOfDay(), venueId, courtId);
        List<Payment> payments = paymentRepository.findAll(specification);

        Map<LocalDate, BigDecimal> revenueByPeriod = payments.stream()
                .collect(Collectors.groupingBy(payment -> getPeriodStart(payment.getPaidAt().toLocalDate(), normalizedGranularity), TreeMap::new, Collectors.reducing(BigDecimal.ZERO, Payment::getAmount, BigDecimal::add)));

        return revenueByPeriod.entrySet().stream()
                .map(entry -> RevenueStatisticsResponse.builder().periodStart(entry.getKey()).revenue(entry.getValue()).build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingStatisticsResponse> getBookingStatistics(LocalDate from, LocalDate to, String granularity, Long venueId, Long courtId) {

        validateDateRange(from, to);

        User currentOwner = currentUserProvider.getCurrentUser();
        String normalizedGranularity = normalizeGranularity(granularity);
        Specification<Booking> specification = BookingSpecification.byStatisticsFilters(currentOwner.getId(), from, to, venueId, courtId);
        List<Booking> bookings = bookingRepository.findAll(specification);

        Map<LocalDate, Long> bookingsByPeriod = bookings.stream()
                .collect(Collectors.groupingBy(booking -> getPeriodStart(booking.getBookingDate(), normalizedGranularity), TreeMap::new, Collectors.counting()));

        return bookingsByPeriod.entrySet().stream()
                .map(entry -> BookingStatisticsResponse.builder().periodStart(entry.getKey()).bookingCount(entry.getValue()).build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PeakHourStatisticsResponse> getPeakHourStatistics(LocalDate from, LocalDate to, Long venueId, Long courtId) {

        validateDateRange(from, to);

        User currentOwner = currentUserProvider.getCurrentUser();
        Specification<Booking> specification = BookingSpecification.byStatisticsFilters(currentOwner.getId(), from, to, venueId, courtId);
        List<Booking> bookings = bookingRepository.findAll(specification);
        Map<Integer, Long> occupiedSeconds = new HashMap<>();

        for (Booking booking : bookings) {
            LocalDateTime bookingStart = LocalDateTime.of(booking.getBookingDate(), booking.getStartTime());
            LocalDateTime bookingEnd = LocalDateTime.of(booking.getBookingDate(), booking.getEndTime());
            LocalDateTime currentHour = bookingStart.truncatedTo(ChronoUnit.HOURS);

            while (currentHour.isBefore(bookingEnd)) {
                LocalDateTime nextHour = currentHour.plusHours(1);
                LocalDateTime overlapStart = bookingStart.isAfter(currentHour) ? bookingStart : currentHour;
                LocalDateTime overlapEnd = bookingEnd.isBefore(nextHour) ? bookingEnd : nextHour;
                long seconds = Duration.between(overlapStart, overlapEnd).getSeconds();
                int key = booking.getBookingDate().getDayOfWeek().getValue() * 24 + currentHour.getHour();

                occupiedSeconds.merge(key, seconds, Long::sum);
                currentHour = nextHour;
            }
        }

        return occupiedSeconds.entrySet().stream()
                .map(entry -> PeakHourStatisticsResponse.builder().dayOfWeek(entry.getKey() / 24).hourOfDay(entry.getKey() % 24).bookedHours(toHours(entry.getValue())).build())
                .sorted((first, second) -> {
                    int dayComparison = first.getDayOfWeek().compareTo(second.getDayOfWeek());

                    if (dayComparison != 0) {
                        return dayComparison;
                    }

                    return first.getHourOfDay().compareTo(second.getHourOfDay());
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourtRankingResponse> getCourtRanking(LocalDate from, LocalDate to, String metric, Integer limit, Long venueId) {

        validateDateRange(from, to);
        validateLimit(limit);

        User currentOwner = currentUserProvider.getCurrentUser();
        String normalizedMetric = normalizeMetric(metric);

        if (normalizedMetric.equals("REVENUE")) {
            Specification<Payment> specification = PaymentSpecification.byStatisticsFilters(currentOwner.getId(), from.atStartOfDay(), to.plusDays(1).atStartOfDay(), venueId, null);
            return getCourtRevenueRanking(paymentRepository.findAll(specification), limit);
        }

        Specification<Booking> specification = BookingSpecification.byStatisticsFilters(currentOwner.getId(), from, to, venueId, null);
        List<Booking> bookings = bookingRepository.findAll(specification);

        if (normalizedMetric.equals("BOOKING_COUNT")) {
            return getCourtBookingRanking(bookings, limit);
        }

        return getCourtBookedHoursRanking(bookings, limit);
    }

    private List<CourtRankingResponse> getCourtRevenueRanking(List<Payment> payments, Integer limit) {

        Map<Long, Court> courts = payments.stream().map(payment -> payment.getBooking().getCourt()).collect(Collectors.toMap(Court::getId, court -> court, (first, second) -> first));
        Map<Long, BigDecimal> revenueByCourt = payments.stream().collect(Collectors.groupingBy(payment -> payment.getBooking().getCourt().getId(), Collectors.reducing(BigDecimal.ZERO, Payment::getAmount, BigDecimal::add)));

        return revenueByCourt.entrySet().stream()
                .sorted(Map.Entry.<Long, BigDecimal>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Court court = courts.get(entry.getKey());
                    return CourtRankingResponse.builder().courtId(court.getId()).courtName(court.getName()).venueName(court.getVenue().getName()).value(entry.getValue()).build();
                })
                .toList();
    }

    private List<CourtRankingResponse> getCourtBookingRanking(List<Booking> bookings, Integer limit) {

        Map<Long, Court> courts = bookings.stream().map(Booking::getCourt).collect(Collectors.toMap(Court::getId, court -> court, (first, second) -> first));
        Map<Long, Long> bookingsByCourt = bookings.stream().collect(Collectors.groupingBy(booking -> booking.getCourt().getId(), Collectors.counting()));

        return bookingsByCourt.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Court court = courts.get(entry.getKey());
                    return CourtRankingResponse.builder().courtId(court.getId()).courtName(court.getName()).venueName(court.getVenue().getName()).value(BigDecimal.valueOf(entry.getValue())).build();
                })
                .toList();
    }

    private List<CourtRankingResponse> getCourtBookedHoursRanking(List<Booking> bookings, Integer limit) {

        Map<Long, Court> courts = bookings.stream().map(Booking::getCourt).collect(Collectors.toMap(Court::getId, court -> court, (first, second) -> first));
        Map<Long, Long> secondsByCourt = bookings.stream().collect(Collectors.groupingBy(booking -> booking.getCourt().getId(), Collectors.summingLong(booking -> Duration.between(booking.getStartTime(), booking.getEndTime()).getSeconds())));

        return secondsByCourt.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Court court = courts.get(entry.getKey());
                    return CourtRankingResponse.builder().courtId(court.getId()).courtName(court.getName()).venueName(court.getVenue().getName()).value(toHours(entry.getValue())).build();
                })
                .toList();
    }

    private LocalDate getPeriodStart(LocalDate date, String granularity) {

        return switch (granularity) {
            case "DAY" -> date;
            case "WEEK" -> date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            case "MONTH" -> date.withDayOfMonth(1);
            default -> throw new BadRequestException("Granularity không hợp lệ");
        };
    }

    private BigDecimal toHours(long seconds) {

        return BigDecimal.valueOf(seconds).divide(BigDecimal.valueOf(3600), 2, RoundingMode.HALF_UP);
    }

    private String normalizeGranularity(String granularity) {

        String value = granularity == null ? "DAY" : granularity.trim().toUpperCase(Locale.ROOT);

        return switch (value) {
            case "DAY", "WEEK", "MONTH" -> value;
            default -> throw new BadRequestException("Chỉ hỗ trợ DAY, WEEK hoặc MONTH");
        };
    }

    private String normalizeMetric(String metric) {

        String value = metric == null ? "REVENUE" : metric.trim().toUpperCase(Locale.ROOT);

        return switch (value) {
            case "REVENUE", "BOOKING_COUNT", "BOOKED_HOURS" -> value;
            default -> throw new BadRequestException("Chỉ hỗ trợ REVENUE, BOOKING_COUNT hoặc BOOKED_HOURS");
        };
    }

    private void validateDateRange(LocalDate from, LocalDate to) {

        if (from == null || to == null || to.isBefore(from)) {
            throw new BadRequestException("Khoảng thời gian không hợp lệ");
        }
    }

    private void validateLimit(Integer limit) {

        if (limit == null || limit < 1 || limit > 20) {
            throw new BadRequestException("Limit phải nằm trong khoảng từ 1 đến 20");
        }
    }
}
