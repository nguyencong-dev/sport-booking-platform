package com.nguyencong.fieldmate.mapper;

import com.nguyencong.fieldmate.dto.request.HeroBannerRequest;
import com.nguyencong.fieldmate.dto.response.HeroBannerResponse;
import com.nguyencong.fieldmate.entity.HeroBanner;

public class HeroBannerMapper {

    private HeroBannerMapper() {
    }

    public static HeroBannerResponse toResponse(
            HeroBanner heroBanner) {

        if (heroBanner == null) {
            return null;
        }

        return HeroBannerResponse.builder()
                .id(heroBanner.getId())
                .url(heroBanner.getUrl())
                .targetUrl(heroBanner.getTargetUrl())
                .createdAt(heroBanner.getCreatedAt())
                .updatedAt(heroBanner.getUpdatedAt())
                .build();
    }

    public static HeroBanner toEntity(
            HeroBannerRequest.Create request) {

        if (request == null) {
            return null;
        }

        return HeroBanner.builder()
                .targetUrl(normalizeTargetUrl(
                        request.getTargetUrl()))
                .build();
    }

    public static void updateEntity(
            HeroBanner heroBanner,
            HeroBannerRequest.Update request) {

        if (heroBanner == null || request == null) {
            return;
        }

        if (request.getTargetUrl() != null) {
            heroBanner.setTargetUrl(
                    normalizeTargetUrl(request.getTargetUrl()));
        }
    }

    private static String normalizeTargetUrl(String targetUrl) {
        if (targetUrl == null || targetUrl.isBlank()) {
            return null;
        }

        return targetUrl.trim();
    }
}