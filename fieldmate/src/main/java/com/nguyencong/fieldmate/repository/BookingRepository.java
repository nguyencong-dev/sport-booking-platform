package com.nguyencong.fieldmate.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
        AND b.status NOT IN :excludedStatuses
        AND NOT (
            b.status = :pendingStatus
            AND b.createdAt <= :cutoff
        )
        AND b.startTime < :endTime
        AND b.endTime > :startTime
      """)
  boolean existsOverlappingBooking(
      @Param("courtId") Long courtId,
      @Param("bookingDate") LocalDate bookingDate,
      @Param("startTime") LocalTime startTime,
      @Param("endTime") LocalTime endTime,
      @Param("excludedStatuses") Set<BookingStatus> excludedStatuses,
      @Param("pendingStatus") BookingStatus pendingStatus,
      @Param("cutoff") LocalDateTime cutoff);

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

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
      UPDATE Booking b
      SET b.status = :expiredStatus,
          b.updatedAt = :now
      WHERE b.status = :pendingStatus
        AND b.createdAt <= :cutoff
      """)
  int expirePendingBookings(
      @Param("pendingStatus") BookingStatus pendingStatus,
      @Param("expiredStatus") BookingStatus expiredStatus,
      @Param("cutoff") LocalDateTime cutoff,
      @Param("now") LocalDateTime now);
}