package com.nguyencong.fieldmate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nguyencong.fieldmate.entity.Rule;

public interface RuleRepository extends JpaRepository<Rule, Long> {

    List<Rule> findByVenueIdOrderByIdAsc(Long venueId);

    boolean existsByVenueIdAndNameIgnoreCase(
            Long venueId,
            String name);

    boolean existsByVenueIdAndNameIgnoreCaseAndIdNot(
            Long venueId,
            String name,
            Long id);
}