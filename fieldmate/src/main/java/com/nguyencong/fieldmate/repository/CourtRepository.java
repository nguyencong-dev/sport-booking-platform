package com.nguyencong.fieldmate.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nguyencong.fieldmate.entity.Court;

import jakarta.persistence.LockModeType;

public interface CourtRepository extends JpaRepository<Court, Long> {

    List<Court> findByVenueId(Long venueId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Court c WHERE c.id = :id")
    Optional<Court> findByIdForUpdate(@Param("id") Long id);
}