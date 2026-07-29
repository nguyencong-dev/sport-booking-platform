package com.nguyencong.fieldmate.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.nguyencong.fieldmate.entity.Venue;
import com.nguyencong.fieldmate.entity.enums.StatusVenue;

public interface VenueRepository extends JpaRepository<Venue, Long>, JpaSpecificationExecutor<Venue> {
  List<Venue> findByStatus(StatusVenue status);

  Page<Venue> findByOwnerId(Long ownerId, Pageable pageable);
}
