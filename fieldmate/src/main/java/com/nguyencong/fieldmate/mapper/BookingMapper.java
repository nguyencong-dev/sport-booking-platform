package com.nguyencong.fieldmate.mapper;

import java.math.BigDecimal;

import com.nguyencong.fieldmate.dto.request.BookingRequest;
import com.nguyencong.fieldmate.dto.response.BookingResponse;
import com.nguyencong.fieldmate.entity.Booking;
import com.nguyencong.fieldmate.entity.Court;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.enums.PaymentStatus;

public class BookingMapper {

    private BookingMapper() {
    }

    public static Booking toEntity(
            BookingRequest request,
            User customer,
            Court court,
            BigDecimal totalPrice,
            BigDecimal requiredDeposit) {

        return Booking.builder()
                .customer(customer)
                .court(court)
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .totalPrice(totalPrice)
                .requiredDeposit(requiredDeposit)
                .build();
    }

    public static BookingResponse toResponse(Booking booking) {
        if (booking == null) {
            return null;
        }

        BigDecimal paidAmount = booking.getPayments()
                .stream()
                .filter(payment ->payment.getStatus() == PaymentStatus.PAID)
                .map(payment -> payment.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remainingAmount = booking.getTotalPrice()
                .subtract(paidAmount)
                .max(BigDecimal.ZERO);

        String customerName = String.format(
                "%s %s",
                booking.getCustomer().getLastName(),
                booking.getCustomer().getFirstName())
                .trim();

        return BookingResponse.builder()
                .id(booking.getId())
                .customerId(booking.getCustomer().getId())
                .customerName(customerName)
                .courtId(booking.getCourt().getId())
                .courtName(booking.getCourt().getName())
                .venueName(booking.getCourt().getVenue().getName())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .totalPrice(booking.getTotalPrice())
                .requiredDeposit(booking.getRequiredDeposit())
                .paidAmount(paidAmount)
                .remainingAmount(remainingAmount)
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}