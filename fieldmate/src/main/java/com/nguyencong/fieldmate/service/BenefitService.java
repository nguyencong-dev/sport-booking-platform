package com.nguyencong.fieldmate.service;

import com.nguyencong.fieldmate.dto.request.BenefitRequest;
import com.nguyencong.fieldmate.dto.response.BenefitResponse;

public interface BenefitService {
    BenefitResponse createBenefit(Long venueId, BenefitRequest request);
    BenefitResponse updateBenefit(Long id, BenefitRequest request);
    void deleteBenefit(Long id);
}
