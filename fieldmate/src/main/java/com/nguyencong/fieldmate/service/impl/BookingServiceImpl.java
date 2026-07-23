package com.nguyencong.fieldmate.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nguyencong.fieldmate.dto.request.BookingRequest;
import com.nguyencong.fieldmate.dto.response.BookingResponse;
import com.nguyencong.fieldmate.entity.Booking;
import com.nguyencong.fieldmate.entity.Court;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.Venue;
import com.nguyencong.fieldmate.entity.enums.BookingStatus;
import com.nguyencong.fieldmate.entity.enums.CourtStatus;
import com.nguyencong.fieldmate.entity.enums.PaymentStatus;
import com.nguyencong.fieldmate.entity.enums.Role;
import com.nguyencong.fieldmate.entity.enums.StatusVenue;
import com.nguyencong.fieldmate.exception.BadRequestException;
import com.nguyencong.fieldmate.exception.BusinessRuleViolationException;
import com.nguyencong.fieldmate.exception.ResourceNotFoundException;
import com.nguyencong.fieldmate.mapper.BookingMapper;
import com.nguyencong.fieldmate.repository.BookingRepository;
import com.nguyencong.fieldmate.repository.CourtRepository;
import com.nguyencong.fieldmate.repository.VenueRepository;
import com.nguyencong.fieldmate.security.CurrentUserProvider;
import com.nguyencong.fieldmate.service.BookingService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private static final BigDecimal DEPOSIT_RATE = new BigDecimal("0.30");

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private CourtRepository courtRepository;
    @Autowired
    private CurrentUserProvider currentUserProvider;
    @Autowired
    private VenueRepository venueRepository;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {

        validateBookingTime(request);

        Court court = courtRepository.findByIdForUpdate(request.getCourtId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân"));

        if (court.getStatus() != CourtStatus.ACTIVE) {
            throw new BusinessRuleViolationException("Sân hiện không hoạt động");
        }

        if (court.getVenue().getStatus() != StatusVenue.ACTIVE) {
            throw new BusinessRuleViolationException("Cụm sân hiện không hoạt động");
        }

        boolean overlapping = bookingRepository.existsOverlappingBooking(
                court.getId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime(),
                BookingStatus.CANCELLED);

        if (overlapping) {
            throw new BusinessRuleViolationException("Khung giờ này đã được đặt");
        }

        long durationMinutes = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();

        BigDecimal durationHours = BigDecimal.valueOf(durationMinutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

        BigDecimal totalPrice = court.getPricePerHour().multiply(durationHours).setScale(2, RoundingMode.HALF_UP);

        BigDecimal requiredDeposit = totalPrice.multiply(DEPOSIT_RATE).setScale(2, RoundingMode.HALF_UP);

        User customer = currentUserProvider.getCurrentUser();

        Booking booking = BookingMapper.toEntity(request, customer, court, totalPrice, requiredDeposit);

        Booking savedBooking = bookingRepository.save(booking);

        return BookingMapper.toResponse(savedBooking);
    }

    private void validateBookingTime(BookingRequest request) {

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BadRequestException("Giờ kết thúc phải sau giờ bắt đầu");
        }

        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Ngày đặt sân không hợp lệ");
        }

        boolean bookingInPast = request.getBookingDate().isEqual(LocalDate.now())
                && request.getStartTime().isBefore(LocalTime.now());

        if (bookingInPast) {
            throw new BadRequestException("Không thể đặt khung giờ đã qua");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getCurrentCustomerBookings() {

        User customer = currentUserProvider.getCurrentUser();

        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(BookingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {

        Booking booking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch đặt sân"));

        User currentUser = currentUserProvider.getCurrentUser();

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        boolean isCustomer = booking.getCustomer().getId().equals(currentUser.getId());

        boolean isCourtOwner = booking.getCourt().getVenue().getOwner().getId().equals(currentUser.getId());

        if (!isAdmin && !isCustomer && !isCourtOwner) {
            throw new AccessDeniedException("Không có quyền xem lịch đặt sân này");
        }

        return BookingMapper.toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByVenueId(Long venueId) {

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân"));

        User currentUser = currentUserProvider.getCurrentUser();

        boolean isOwner = venue.getOwner().getId().equals(currentUser.getId());

        if (!isOwner) {
            throw new AccessDeniedException("Không có quyền xem lịch đặt của cụm sân này");
        }

        return bookingRepository.findByCourt_Venue_IdOrderByBookingDateDescStartTimeDesc(venueId).stream()
                .map(BookingMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public BookingResponse completeBooking(Long id) {

        Booking booking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch đặt sân"));

        User currentOwner = currentUserProvider.getCurrentUser();

        boolean isOwner = booking.getCourt().getVenue().getOwner().getId().equals(currentOwner.getId());

        if (!isOwner) {
            throw new AccessDeniedException("không có quyền hoàn thành lịch đặt sân này");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            return BookingMapper.toResponse(booking);
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BusinessRuleViolationException("Chỉ booking đã được xác nhận mới có thể hoàn thành");
        }

        LocalDateTime bookingEndTime = LocalDateTime.of(booking.getBookingDate(), booking.getEndTime());

        if (bookingEndTime.isAfter(LocalDateTime.now())) {
            throw new BusinessRuleViolationException("Booking chưa kết thúc nên không thể hoàn thành");
        }

        BigDecimal paidAmount = booking.getPayments().stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.PAID)
                .map(payment -> payment.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (paidAmount.compareTo(booking.getTotalPrice()) < 0) {
            throw new BusinessRuleViolationException("Booking chưa được thanh toán đủ");
        }

        booking.setStatus(BookingStatus.COMPLETED);

        Booking savedBooking = bookingRepository.save(booking);

        return BookingMapper.toResponse(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {

        return bookingRepository.findAllByOrderByCreatedAtDesc().stream().map(BookingMapper::toResponse).toList();
    }
}