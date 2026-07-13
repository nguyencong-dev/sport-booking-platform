package com.nguyencong.fieldmate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nguyencong.fieldmate.entity.HeroBanner;

public interface HeroBannerRepository
        extends JpaRepository<HeroBanner, Long> {

    List<HeroBanner> findAllByOrderByIdDesc();
}