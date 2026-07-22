package com.nguyencong.fieldmate.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nguyencong.fieldmate.dto.request.RuleRequest;
import com.nguyencong.fieldmate.dto.response.RuleResponse;
import com.nguyencong.fieldmate.entity.Rule;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.Venue;
import com.nguyencong.fieldmate.exception.DuplicateResourceException;
import com.nguyencong.fieldmate.exception.ResourceNotFoundException;
import com.nguyencong.fieldmate.mapper.RuleMapper;
import com.nguyencong.fieldmate.repository.RuleRepository;
import com.nguyencong.fieldmate.repository.VenueRepository;
import com.nguyencong.fieldmate.security.CurrentUserProvider;
import com.nguyencong.fieldmate.service.RuleService;

@Service
public class RuleServiceImpl implements RuleService {

    @Autowired
    private VenueRepository venueRepository;
    @Autowired
    private RuleRepository ruleRepository;
    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Override
    @Transactional
    public RuleResponse createRule(
            Long venueId,
            RuleRequest request) {

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cụm sân"));

        User currentUser = currentUserProvider.getCurrentUser();

        if (!venue.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Bạn không có quyền thêm nội quy cho cụm sân này");
        }

        String ruleName = request.getName().trim();

        if (ruleRepository.existsByVenueIdAndNameIgnoreCase(
                venueId,
                ruleName)) {
            throw new DuplicateResourceException("Nội quy này đã tồn tại");
        }

        Rule rule = RuleMapper.toEntity(request);
        rule.setVenue(venue);

        Rule savedRule = ruleRepository.save(rule);

        return RuleMapper.toResponse(savedRule);
    }

    @Override
    @Transactional
    public RuleResponse updateRule(
            Long id,
            RuleRequest request) {

        Rule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nội quy"));

        User currentUser = currentUserProvider.getCurrentUser();

        if (!rule.getVenue()
                .getOwner()
                .getId()
                .equals(currentUser.getId())) {
            throw new AccessDeniedException("Bạn không có quyền cập nhật nội quy này");
        }

        String ruleName = request.getName().trim();

        boolean duplicated = ruleRepository.existsByVenueIdAndNameIgnoreCaseAndIdNot(
                rule.getVenue().getId(),
                ruleName,
                id);

        if (duplicated) {
            throw new DuplicateResourceException("Nội quy này đã tồn tại");
        }

        RuleMapper.updateEntity(rule, request);

        Rule savedRule = ruleRepository.save(rule);

        return RuleMapper.toResponse(savedRule);
    }

    @Override
    @Transactional
    public void deleteRule(Long id) {
        Rule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nội quy"));

        User currentUser = currentUserProvider.getCurrentUser();

        if (!rule.getVenue()
                .getOwner()
                .getId()
                .equals(currentUser.getId())) {
            throw new AccessDeniedException("Bạn không có quyền xóa nội quy này");
        }

        ruleRepository.delete(rule);
    }
}
