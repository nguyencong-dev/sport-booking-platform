package com.nguyencong.fieldmate.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nguyencong.fieldmate.entity.Venue;
import com.nguyencong.fieldmate.entity.enums.StatusVenue;

public interface VenueRepository extends JpaRepository<Venue, Long> {
  List<Venue> findByStatus(StatusVenue status);

  @Query(value = """
      SELECT DISTINCT v
      FROM Venue v
      LEFT JOIN v.courts c
      LEFT JOIN c.sportType st
      WHERE LOWER(v.name) LIKE CONCAT('%', LOWER(COALESCE(:name, '')), '%')
        AND LOWER(v.address) LIKE CONCAT('%', LOWER(COALESCE(:address, '')), '%')
        AND (:sportTypeId IS NULL
          OR st.id = :sportTypeId)
        AND (:status IS NULL
          OR v.status = :status)
      """, countQuery = """
      SELECT COUNT(DISTINCT v.id)
      FROM Venue v
      LEFT JOIN v.courts c
      LEFT JOIN c.sportType st
      WHERE LOWER(v.name) LIKE CONCAT('%', LOWER(COALESCE(:name, '')), '%')
        AND LOWER(v.address) LIKE CONCAT('%', LOWER(COALESCE(:address, '')), '%')
        AND (:sportTypeId IS NULL
          OR st.id = :sportTypeId)
        AND (:status IS NULL
          OR v.status = :status)
      """)
  Page<Venue> findByFilters(@Param("name") String name, @Param("address") String address,
      @Param("sportTypeId") Long sportTypeId, @Param("status") StatusVenue status, Pageable pageable);

  Page<Venue> findByOwnerId(Long ownerId, Pageable pageable);
}
