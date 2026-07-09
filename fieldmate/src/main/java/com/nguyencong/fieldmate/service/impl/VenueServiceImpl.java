package com.nguyencong.fieldmate.service.impl;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cloudinary.Cloudinary;
import com.nguyencong.fieldmate.dto.request.VenueRequest;
import com.nguyencong.fieldmate.dto.response.VenueResponse;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.Venue;
import com.nguyencong.fieldmate.mapper.VenueMapper;
import com.nguyencong.fieldmate.repository.UserRepository;
import com.nguyencong.fieldmate.repository.VenueRepository;
import com.nguyencong.fieldmate.service.VenueService;

@Service
public class VenueServiceImpl implements VenueService {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Cloudinary cloudinary;

    @Override
    @Transactional(readOnly = true)
    public List<VenueResponse.Summary> getAllVenues(Map<String, String> params) {
        String name = params.get("name");
        List<Venue> venues;
        if (name != null && !name.isBlank()) {
            venues = venueRepository.findByNameContainingIgnoreCase(name.trim());
        } else {
            venues = venueRepository.findAll();
        }
        return venues.stream()
                .map(VenueMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VenueResponse.Detail getVenueById(Long id) {
        Venue venue = venueRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy sân"));
        return VenueMapper.toDetail(venue);
    }

    @Override
    @Transactional
    public VenueResponse.Summary createVenue(VenueRequest request) throws IOException {
        Venue venue = VenueMapper.toEntity(request);

        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ sân"));

        venue.setOwner(owner);

        if (request.getBanner() != null && !request.getBanner().isEmpty()) {
            Map uploadResult = cloudinary.uploader().upload(
                    request.getBanner().getBytes(),
                    Map.of("folder", "fieldmate/venues/banners"));

            venue.setBanner((String) uploadResult.get("secure_url"));
        }

        if (request.getLogo() != null && !request.getLogo().isEmpty()) {
            Map uploadResult = cloudinary.uploader().upload(
                    request.getLogo().getBytes(),
                    Map.of("folder", "fieldmate/venues/logos"));

            venue.setLogo((String) uploadResult.get("secure_url"));
        }

        Venue savedVenue = venueRepository.save(venue);
        return VenueMapper.toSummary(savedVenue);
    }
}