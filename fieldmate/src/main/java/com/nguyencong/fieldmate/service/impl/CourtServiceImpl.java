package com.nguyencong.fieldmate.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nguyencong.fieldmate.dto.request.CourtRequest;
import com.nguyencong.fieldmate.dto.response.CourtResponse;
import com.nguyencong.fieldmate.entity.Court;
import com.nguyencong.fieldmate.entity.SportType;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.Venue;
import com.nguyencong.fieldmate.entity.enums.CourtStatus;
import com.nguyencong.fieldmate.exception.ResourceNotFoundException;
import com.nguyencong.fieldmate.mapper.CourtMapper;
import com.nguyencong.fieldmate.repository.CourtRepository;
import com.nguyencong.fieldmate.repository.SportTypeResponsitory;
import com.nguyencong.fieldmate.repository.VenueRepository;
import com.nguyencong.fieldmate.security.CurrentUserProvider;
import com.nguyencong.fieldmate.service.CourtService;

@Service
public class CourtServiceImpl implements CourtService {
    @Autowired
    private CourtRepository courtRepository;
    @Autowired
    private VenueRepository venueRepository;
    @Autowired
    private CurrentUserProvider currentUserProvider;
    @Autowired
    private SportTypeResponsitory sportTypeResponsitory;

    @Override
    @Transactional(readOnly = true)
    public List<CourtResponse> getCourtsByVenueId(Long venueId) {
        if (!venueRepository.existsById(venueId)) {
            throw new ResourceNotFoundException("Không tìm thấy cụm sân");
        }

        return courtRepository.findByVenueId(venueId)
                .stream()
                .map(CourtMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CourtResponse getCourtById(Long id) {
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân"));

        return CourtMapper.toResponse(court);
    }

    @Override
    @Transactional
    public CourtResponse createCourt(Long venueId, CourtRequest request) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân"));

        User currentUser = currentUserProvider.getCurrentUser();

        if (!venue.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Bạn không có quyền thêm sân vào cụm sân này");
        }

        SportType sportType = sportTypeResponsitory.findById(request.getSportTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại thể thao"));

        Court court = CourtMapper.toEntity(request);
        court.setVenue(venue);
        court.setSportType(sportType);

        Court savedCourt = courtRepository.save(court);

        return CourtMapper.toResponse(savedCourt);
    }

    @Override
    @Transactional
    public CourtResponse updateCourt(Long id, CourtRequest request) {
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân"));

        User currentUser = currentUserProvider.getCurrentUser();

        if (!court.getVenue().getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Bạn không có quyền cập nhật sân này");
        }

        SportType sportType = sportTypeResponsitory.findById(request.getSportTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại thể thao"));

        CourtMapper.updateEntity(court, request);
        court.setSportType(sportType);

        Court savedCourt = courtRepository.save(court);

        return CourtMapper.toResponse(savedCourt);
    }

    @Override
    @Transactional
    public CourtResponse updateCourtStatus(Long id, CourtStatus status) {
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân"));

        User currentUser = currentUserProvider.getCurrentUser();

        if (!court.getVenue().getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Bạn không có quyền cập nhật trạng thái sân này");
        }

        court.setStatus(status);

        Court savedCourt = courtRepository.save(court);
        return CourtMapper.toResponse(savedCourt);
    }

    @Override
    @Transactional
    public void deleteCourt(Long id) {
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân"));

        User currentUser = currentUserProvider.getCurrentUser();

        if (!court.getVenue().getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Bạn không có quyền xóa sân này");
        }

        courtRepository.delete(court);
    }
}