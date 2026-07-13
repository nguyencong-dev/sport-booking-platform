package com.nguyencong.fieldmate.service;

import java.io.IOException;
import java.util.List;

import com.nguyencong.fieldmate.dto.request.HeroBannerRequest;
import com.nguyencong.fieldmate.dto.response.HeroBannerResponse;

public interface HeroBannerService {
    List<HeroBannerResponse> getAllHeroBanners();

    HeroBannerResponse createHeroBanner(
            HeroBannerRequest.Create request) throws IOException;

    HeroBannerResponse updateHeroBanner(
            Long id,
            HeroBannerRequest.Update request) throws IOException;

    void deleteHeroBanner(Long id);
}