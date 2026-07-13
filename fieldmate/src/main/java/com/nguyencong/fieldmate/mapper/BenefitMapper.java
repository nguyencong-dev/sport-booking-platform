package com.nguyencong.fieldmate.mapper;

import com.nguyencong.fieldmate.dto.request.BenefitRequest;
import com.nguyencong.fieldmate.dto.response.BenefitResponse;
import com.nguyencong.fieldmate.entity.Benefit;

public class BenefitMapper {
    public BenefitMapper() {
    }

    public static BenefitResponse toResponse(Benefit benefit) {
        if (benefit == null) {
            return null;
        }

        return BenefitResponse.builder()
                .id(benefit.getId())
                .name(benefit.getName())
                .build();
    }

    public static Benefit toEntity(BenefitRequest request) {
        if (request == null) {
            return null;
        }

        return Benefit.builder()
                .name(request.getName().trim())
                .build();
    }

    public static void updateEntity(
            Benefit benefit,
            BenefitRequest request) {

        if (benefit == null || request == null) {
            return;
        }

        benefit.setName(request.getName().trim());
    }
}
