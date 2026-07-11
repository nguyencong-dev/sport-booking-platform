package com.nguyencong.fieldmate.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nguyencong.fieldmate.entity.VenueImage;

public interface VenueImageRepository extends JpaRepository<VenueImage, Long> {
    Optional<VenueImage> findByIdAndVenueId(Long id, Long venueId);
}
