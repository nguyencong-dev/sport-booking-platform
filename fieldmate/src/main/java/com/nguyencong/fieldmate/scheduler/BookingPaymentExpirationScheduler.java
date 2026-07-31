package com.nguyencong.fieldmate.scheduler;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.nguyencong.fieldmate.entity.enums.BookingStatus;
import com.nguyencong.fieldmate.entity.enums.PaymentStatus;
import com.nguyencong.fieldmate.repository.BookingRepository;
import com.nguyencong.fieldmate.repository.PaymentRepository;


@Component
public class BookingPaymentExpirationScheduler {

    private @Autowired BookingRepository bookingRepository;
    private @Autowired PaymentRepository paymentRepository;

    @Value("${booking.payment-timeout-minutes:15}")
    private long timeoutMinutes;

    @Scheduled(fixedDelayString ="${booking.expiration-check-ms:60000}")
    @Transactional
    public void expirePendingRecords() {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = now.minusMinutes(timeoutMinutes);

        paymentRepository.expirePendingPayments(PaymentStatus.PENDING, PaymentStatus.EXPIRED, cutoff, now);

        bookingRepository.expirePendingBookings(BookingStatus.PENDING, BookingStatus.EXPIRED, cutoff, now);
    }
}