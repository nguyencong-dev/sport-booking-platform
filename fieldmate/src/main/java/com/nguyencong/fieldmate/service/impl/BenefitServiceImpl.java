package com.nguyencong.fieldmate.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.access.AccessDeniedException;

import com.nguyencong.fieldmate.dto.request.BenefitRequest;
import com.nguyencong.fieldmate.dto.response.BenefitResponse;
import com.nguyencong.fieldmate.entity.Benefit;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.Venue;
import com.nguyencong.fieldmate.exception.DuplicateResourceException;
import com.nguyencong.fieldmate.exception.ResourceNotFoundException;
import com.nguyencong.fieldmate.mapper.BenefitMapper;
import com.nguyencong.fieldmate.repository.BenefitRepository;
import com.nguyencong.fieldmate.repository.VenueRepository;
import com.nguyencong.fieldmate.security.CurrentUserProvider;
import com.nguyencong.fieldmate.service.BenefitService;

@Service
public class BenefitServiceImpl implements BenefitService {
    @Autowired
    private BenefitRepository benefitRepository;
    @Autowired
    private VenueRepository venueRepository;
    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Override
    @Transactional
    public BenefitResponse createBenefit(
            Long venueId,
            BenefitRequest request) {

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân"));

        User currentUser = currentUserProvider.getCurrentUser();

        if (!venue.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Bạn không có quyền thêm tiện ích cho cụm sân này");
        }

        String benefitName = request.getName().trim();

        boolean existed = benefitRepository.existsByVenueIdAndNameIgnoreCase(
                venueId,
                benefitName);

        if (existed) {
            throw new DuplicateResourceException("Tiện ích này đã tồn tại");
        }

        Benefit benefit = BenefitMapper.toEntity(request);
        benefit.setVenue(venue);

        Benefit savedBenefit = benefitRepository.save(benefit);

        return BenefitMapper.toResponse(savedBenefit);
    }

    @Override
    @Transactional
    public BenefitResponse updateBenefit(
            Long id,
            BenefitRequest request) {

        Benefit benefit = benefitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tiện ích"));

        User currentUser = currentUserProvider.getCurrentUser();

        if (!benefit.getVenue()
                .getOwner()
                .getId()
                .equals(currentUser.getId())) {
            throw new AccessDeniedException("Bạn không có quyền cập nhật tiện ích này");
        }

        String benefitName = request.getName().trim();

        boolean duplicated = benefitRepository
                .existsByVenueIdAndNameIgnoreCaseAndIdNot(
                        benefit.getVenue().getId(),
                        benefitName,
                        id);

        if (duplicated) {
            throw new DuplicateResourceException("Tiện ích này đã tồn tại");
        }

        BenefitMapper.updateEntity(benefit, request);

        Benefit savedBenefit = benefitRepository.save(benefit);

        return BenefitMapper.toResponse(savedBenefit);
    }

    @Override
    @Transactional
    public void deleteBenefit(Long id) {
        Benefit benefit = benefitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tiện ích"));

        User currentUser = currentUserProvider.getCurrentUser();

        if (!benefit.getVenue()
                .getOwner()
                .getId()
                .equals(currentUser.getId())) {
            throw new AccessDeniedException("Bạn không có quyền xóa tiện ích này");
        }

        benefitRepository.delete(benefit);
    }
}
