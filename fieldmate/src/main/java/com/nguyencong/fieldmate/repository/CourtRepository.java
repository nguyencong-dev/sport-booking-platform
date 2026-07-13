package com.nguyencong.fieldmate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nguyencong.fieldmate.entity.Court;

public interface CourtRepository extends JpaRepository<Court, Long> {

    List<Court> findByVenueId(Long venueId);
}