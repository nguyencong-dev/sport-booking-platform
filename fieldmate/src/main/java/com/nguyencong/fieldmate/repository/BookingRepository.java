package com.nguyencong.fieldmate.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nguyencong.fieldmate.entity.Booking;
import com.nguyencong.fieldmate.entity.enums.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

        @Query("""
                        SELECT COUNT(b) > 0
                        FROM Booking b
                        WHERE b.court.id = :courtId
                          AND b.bookingDate = :bookingDate
                          AND b.status <> :excludedStatus
                          AND b.startTime < :endTime
                          AND b.endTime > :startTime
                        """)
        boolean existsOverlappingBooking(
                        @Param("courtId") Long courtId,
                        @Param("bookingDate") LocalDate bookingDate,
                        @Param("startTime") LocalTime startTime,
                        @Param("endTime") LocalTime endTime,
                        @Param("excludedStatus") BookingStatus excludedStatus);

        @EntityGraph(attributePaths = {
                        "customer",
                        "court",
                        "court.venue",
                        "payments"
        })
        List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

        @EntityGraph(attributePaths = {
                        "customer",
                        "court",
                        "court.venue",
                        "court.venue.owner",
                        "payments"
        })
        @Query("""
                        SELECT b
                        FROM Booking b
                        WHERE b.id = :id
                        """)
        Optional<Booking> findByIdWithDetails(@Param("id") Long id);

        @EntityGraph(attributePaths = {
                        "customer",
                        "court",
                        "court.venue",
                        "payments"
        })
        List<Booking> findByCourt_Venue_IdOrderByBookingDateDescStartTimeDesc(Long venueId);

        @EntityGraph(attributePaths = {
                        "customer",
                        "court",
                        "court.venue",
                        "payments"
        })
        List<Booking> findAllByOrderByCreatedAtDesc();
}