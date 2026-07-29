package com.nguyencong.fieldmate.repository.spec;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;

import com.nguyencong.fieldmate.entity.Court;
import com.nguyencong.fieldmate.entity.SportType;
import com.nguyencong.fieldmate.entity.Venue;
import com.nguyencong.fieldmate.entity.enums.StatusVenue;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

public final class VenueSpecification {

    private VenueSpecification() {
    }

    public static Specification<Venue> byFilters(String name, String address, Long sportTypeId, StatusVenue status) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            query.distinct(true);

            if (name != null && !name.isBlank()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("name")),
                        "%" + name.trim().toLowerCase(Locale.ROOT) + "%"));
            }

            if (address != null && !address.isBlank()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("address")),
                        "%" + address.trim().toLowerCase(Locale.ROOT) + "%"));
            }

            if (sportTypeId != null) {
                Join<Venue, Court> courtJoin = root.join("courts", JoinType.LEFT);

                Join<Court, SportType> sportTypeJoin = courtJoin.join("sportType", JoinType.LEFT);

                predicates.add(criteriaBuilder.equal(sportTypeJoin.get("id"), sportTypeId));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }
}