package com.nguyencong.fieldmate.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nguyencong.fieldmate.entity.Payment;
import com.nguyencong.fieldmate.entity.enums.PaymentStatus;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

  boolean existsByBookingIdAndStatus(Long bookingId, PaymentStatus status);

  List<Payment> findByBookingIdOrderByCreatedAtDesc(Long bookingId);

  @EntityGraph(attributePaths = {
      "booking",
      "booking.customer",
      "booking.court",
      "booking.court.venue",
      "booking.court.venue.owner"
  })
  @Query("""
      SELECT p
      FROM Payment p
      WHERE p.id = :id
      """)
  Optional<Payment> findByIdWithDetails(@Param("id") Long id);

  @EntityGraph(attributePaths = {
      "booking",
      "booking.payments",
      "paymentAccount"
  })
  Optional<Payment> findByTransactionCode(String transactionCode);

  boolean existsByBookingIdAndStatusAndCreatedAtAfter(Long bookingId, PaymentStatus status, LocalDateTime cutoff);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query("""
      UPDATE Payment p
      SET p.status = :expiredStatus,
          p.updatedAt = :now
      WHERE p.status = :pendingStatus
        AND p.createdAt <= :cutoff
      """)
  int expirePendingPayments(
      @Param("pendingStatus") PaymentStatus pendingStatus,
      @Param("expiredStatus") PaymentStatus expiredStatus,
      @Param("cutoff") LocalDateTime cutoff,
      @Param("now") LocalDateTime now);
}