package com.nguyencong.fieldmate.repository.spec;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.nguyencong.fieldmate.entity.Booking;
import com.nguyencong.fieldmate.entity.enums.BookingStatus;

import jakarta.persistence.criteria.Predicate;

public final class BookingSpecification {

    private BookingSpecification() {
    }

    public static Specification<Booking> byFilters(Long venueId, LocalDate date, BookingStatus status, Long bookingId) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("court").get("venue").get("id"), venueId));

            if (date != null) {
                predicates.add(cb.equal(root.get("bookingDate"), date));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (bookingId != null) {
                predicates.add(cb.equal(root.get("id"), bookingId));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    public static Specification<Booking> byStatisticsFilters(Long ownerId, LocalDate from, LocalDate to, Long venueId, Long courtId) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("court").get("venue").get("owner").get("id"), ownerId));
            predicates.add(root.get("status").in(BookingStatus.CONFIRMED, BookingStatus.COMPLETED));
            predicates.add(cb.between(root.get("bookingDate"), from, to));

            if (venueId != null) {
                predicates.add(cb.equal(root.get("court").get("venue").get("id"), venueId));
            }

            if (courtId != null) {
                predicates.add(cb.equal(root.get("court").get("id"), courtId));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

}
