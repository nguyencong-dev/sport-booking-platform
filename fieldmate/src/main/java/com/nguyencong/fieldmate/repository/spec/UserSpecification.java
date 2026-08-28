package com.nguyencong.fieldmate.repository.spec;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;

import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.enums.Role;

import jakarta.persistence.criteria.Predicate;

public final class UserSpecification {

    private UserSpecification() {
    }

    public static Specification<User> byFilters(String email, Boolean enabled, Role role) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (email != null && !email.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("email")), "%" + email.trim().toLowerCase(Locale.ROOT) + "%"));
            }

            if (enabled != null) {
                predicates.add(cb.equal(root.get("enabled"), enabled));
            }

            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
