package com.nguyencong.fieldmate.repository.spec;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;

import com.nguyencong.fieldmate.entity.Court;
import com.nguyencong.fieldmate.entity.Venue;
import com.nguyencong.fieldmate.entity.enums.StatusVenue;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

public final class VenueSpecification {

    private static final double EARTH_RADIUS_KM = 6371.0088;

    private VenueSpecification() {
    }

    public static Specification<Venue> byFilters(String name, String address, Long sportTypeId, StatusVenue status) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isTrue(root.get("owner").get("enabled")));

            if (name != null && !name.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")),
                        "%" + name.trim().toLowerCase(Locale.ROOT) + "%"));
            }

            if (address != null && !address.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("address")),
                        "%" + address.trim().toLowerCase(Locale.ROOT) + "%"));
            }

            if (sportTypeId != null) {
                predicates.add(hasCourtWithSportType(root, query, cb, sportTypeId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    public static Specification<Venue> byDistance(BigDecimal latitude, BigDecimal longitude, BigDecimal radiusKm) {

        return (root, query, cb) -> {
            Expression<Double> distance = distanceExpression(root, cb, latitude, longitude);
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isNotNull(root.get("latitude")));
            predicates.add(cb.isNotNull(root.get("longitude")));

            if (radiusKm != null) {
                predicates.add(cb.le(distance, radiusKm.doubleValue()));
            }

            if (!isCountQuery(query)) {
                query.orderBy(cb.asc(distance), cb.asc(root.get("id")));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static Predicate hasCourtWithSportType(Root<Venue> root, CriteriaQuery<?> query, CriteriaBuilder cb,
            Long sportTypeId) {

        Subquery<Integer> subquery = query.subquery(Integer.class);
        Root<Court> court = subquery.from(Court.class);

        subquery.select(cb.literal(1));
        subquery.where(
                cb.equal(court.get("venue").get("id"), root.get("id")),
                cb.equal(court.get("sportType").get("id"), sportTypeId));

        return cb.exists(subquery);
    }

    private static Expression<Double> distanceExpression(Root<Venue> root, CriteriaBuilder cb,
            BigDecimal latitude, BigDecimal longitude) {

        Expression<Double> userLatitudeRadians = radians(cb, cb.literal(latitude.doubleValue()));
        Expression<Double> userLongitudeRadians = radians(cb, cb.literal(longitude.doubleValue()));
        Expression<Double> venueLatitudeRadians = radians(cb, root.get("latitude").as(Double.class));
        Expression<Double> venueLongitudeRadians = radians(cb, root.get("longitude").as(Double.class));
        Expression<Double> longitudeDifference = cb.diff(venueLongitudeRadians, userLongitudeRadians);
        Expression<Double> cosinePart = cb.prod(cb.prod(cos(cb, userLatitudeRadians), cos(cb, venueLatitudeRadians)), cos(cb, longitudeDifference));
        Expression<Double> sinePart = cb.prod(sin(cb, userLatitudeRadians), sin(cb, venueLatitudeRadians));
        Expression<Double> centralAngleInput = cb.sum(cosinePart, sinePart);
        Expression<Double> lowerBoundedInput = cb.function("greatest", Double.class, cb.literal(-1.0), centralAngleInput);
        Expression<Double> boundedInput = cb.function("least", Double.class, cb.literal(1.0), lowerBoundedInput);
        Expression<Double> centralAngle = cb.function("acos", Double.class, boundedInput);

        return cb.prod(EARTH_RADIUS_KM, centralAngle).as(Double.class);
    }

    private static Expression<Double> radians(CriteriaBuilder cb, Expression<Double> value) {
        return cb.function("radians", Double.class, value);
    }

    private static Expression<Double> sin(CriteriaBuilder cb, Expression<Double> value) {
        return cb.function("sin", Double.class, value);
    }

    private static Expression<Double> cos(CriteriaBuilder cb, Expression<Double> value) {
        return cb.function("cos", Double.class, value);
    }

    private static boolean isCountQuery(CriteriaQuery<?> query) {
        return query.getResultType() == Long.class || query.getResultType() == long.class;
    }
}
