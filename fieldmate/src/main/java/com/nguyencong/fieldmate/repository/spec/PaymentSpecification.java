package com.nguyencong.fieldmate.repository.spec;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.nguyencong.fieldmate.entity.Payment;
import com.nguyencong.fieldmate.entity.enums.PaymentStatus;

import jakarta.persistence.criteria.Predicate;

public final class PaymentSpecification {

    private PaymentSpecification() {
    }

    public static Specification<Payment> byStatisticsFilters(Long ownerId, LocalDateTime from, LocalDateTime to, Long venueId, Long courtId) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("booking").get("court").get("venue").get("owner").get("id"), ownerId));
            predicates.add(cb.equal(root.get("status"), PaymentStatus.PAID));
            predicates.add(cb.greaterThanOrEqualTo(root.get("paidAt"), from));
            predicates.add(cb.lessThan(root.get("paidAt"), to));

            if (venueId != null) {
                predicates.add(cb.equal(root.get("booking").get("court").get("venue").get("id"), venueId));
            }

            if (courtId != null) {
                predicates.add(cb.equal(root.get("booking").get("court").get("id"), courtId));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
