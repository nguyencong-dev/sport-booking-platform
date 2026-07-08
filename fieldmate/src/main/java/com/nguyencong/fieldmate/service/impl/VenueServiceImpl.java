package com.nguyencong.fieldmate.service.impl;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nguyencong.fieldmate.dto.response.VenueResponse;
import com.nguyencong.fieldmate.entity.Venue;
import com.nguyencong.fieldmate.mapper.VenueMapper;
import com.nguyencong.fieldmate.repository.VenueRepository;
import com.nguyencong.fieldmate.service.VenueService;

@Service
public class VenueServiceImpl implements VenueService {

    @Autowired
    private VenueRepository venueRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VenueResponse.Summary> getAllVenues() {
        return venueRepository.findAll()
                .stream()
                .map(VenueMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VenueResponse.Detail getVenueById(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        return VenueMapper.toDetail(venue);
    }
}