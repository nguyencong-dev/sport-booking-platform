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

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(criteriaBuilder.equal(root.get("court").get("venue").get("id"), venueId));

            if (date != null) {
                predicates.add(criteriaBuilder.equal(root.get("bookingDate"), date));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (bookingId != null) {
                predicates.add(criteriaBuilder.equal(root.get("id"), bookingId));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }
}