package com.nguyencong.fieldmate.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nguyencong.fieldmate.entity.SportType;

public interface SportTypeResponsitory extends JpaRepository<SportType, Long>{
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
