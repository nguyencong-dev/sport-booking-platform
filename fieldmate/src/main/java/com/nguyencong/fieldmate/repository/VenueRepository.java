package com.nguyencong.fieldmate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nguyencong.fieldmate.entity.Venue;
import com.nguyencong.fieldmate.entity.enums.StatusVenue;

public interface VenueRepository extends JpaRepository<Venue, Long> {
    List<Venue> findByStatus(StatusVenue status);
    List<Venue> findByNameContainingIgnoreCase(String name);
}