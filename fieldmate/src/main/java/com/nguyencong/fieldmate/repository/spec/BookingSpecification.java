package com.nguyencong.fieldmate.repository.spec;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;

import com.nguyencong.fieldmate.entity.Booking;
import com.nguyencong.fieldmate.entity.Court;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.Venue;
import com.nguyencong.fieldmate.entity.enums.BookingStatus;

import jakarta.persistence.criteria.Join;
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

    public static Specification<Booking> byAdminFilters(String search, BookingStatus status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (search != null && !search.isBlank()) {
                String normalizedSearch = search.trim().toLowerCase(Locale.ROOT);
                String normalizedBookingId = normalizedSearch.replaceFirst("^#", "");
                String keyword = "%" + normalizedSearch + "%";

                Join<Booking, User> customerJoin = root.join("customer");
                Join<Booking, Court> courtJoin = root.join("court");
                Join<Court, Venue> venueJoin = courtJoin.join("venue");

                List<Predicate> searchPredicates = new ArrayList<>();

                searchPredicates.add(cb.like(cb.lower(customerJoin.get("email")), keyword));
                searchPredicates.add(cb.like(cb.lower(customerJoin.get("firstName")), keyword));
                searchPredicates.add(cb.like(cb.lower(customerJoin.get("lastName")), keyword));
                searchPredicates.add(cb.like(cb.lower(cb.concat(cb.concat(customerJoin.get("lastName"), " "), customerJoin.get("firstName"))), keyword));
                searchPredicates.add(cb.like(cb.lower(courtJoin.get("name")), keyword));
                searchPredicates.add(cb.like(cb.lower(venueJoin.get("name")), keyword));

                try {
                    searchPredicates.add(cb.equal(root.get("id"), Long.parseLong(normalizedBookingId)));
                } catch (NumberFormatException ignored) {
                }

                predicates.add(cb.or(searchPredicates.toArray(Predicate[]::new)));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
