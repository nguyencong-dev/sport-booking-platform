package com.nguyencong.fieldmate.service.impl;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cloudinary.Cloudinary;
import com.nguyencong.fieldmate.dto.request.HeroBannerRequest;
import com.nguyencong.fieldmate.dto.response.HeroBannerResponse;
import com.nguyencong.fieldmate.entity.HeroBanner;
import com.nguyencong.fieldmate.mapper.HeroBannerMapper;
import com.nguyencong.fieldmate.repository.HeroBannerRepository;
import com.nguyencong.fieldmate.service.HeroBannerService;

@Service
public class HeroBannerServiceImpl
        implements HeroBannerService {
    @Autowired
    private HeroBannerRepository heroBannerRepository;
    @Autowired
    private Cloudinary cloudinary;

    @Override
    @Transactional(readOnly = true)
    public List<HeroBannerResponse> getAllHeroBanners() {
        return heroBannerRepository
                .findAllByOrderByIdDesc()
                .stream()
                .map(HeroBannerMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public HeroBannerResponse createHeroBanner(
            HeroBannerRequest.Create request) throws IOException {

        if (request.getImage() == null
                || request.getImage().isEmpty()) {
            throw new RuntimeException(
                    "Ảnh banner không được để trống");
        }

        Map<?, ?> uploadResult = cloudinary.uploader().upload(
                request.getImage().getBytes(),
                Map.of(
                        "folder",
                        "fieldmate/hero-banners"));

        Object secureUrl = uploadResult.get("secure_url");

        if (!(secureUrl instanceof String imageUrl)) {
            throw new RuntimeException(
                    "Cloudinary không trả về URL ảnh");
        }

        HeroBanner heroBanner = HeroBannerMapper.toEntity(request);

        heroBanner.setUrl(imageUrl);

        HeroBanner savedBanner = heroBannerRepository.save(heroBanner);

        return HeroBannerMapper.toResponse(savedBanner);
    }

    @Override
    @Transactional
    public HeroBannerResponse updateHeroBanner(
            Long id,
            HeroBannerRequest.Update request) throws IOException {

        HeroBanner heroBanner = heroBannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy hero banner"));

        HeroBannerMapper.updateEntity(heroBanner, request);

        if (request.getImage() != null
                && !request.getImage().isEmpty()) {

            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    request.getImage().getBytes(),
                    Map.of(
                            "folder",
                            "fieldmate/hero-banners"));

            Object secureUrl = uploadResult.get("secure_url");

            if (!(secureUrl instanceof String imageUrl)) {
                throw new RuntimeException(
                        "Cloudinary không trả về URL ảnh");
            }

            heroBanner.setUrl(imageUrl);
        }

        HeroBanner savedBanner = heroBannerRepository.save(heroBanner);

        return HeroBannerMapper.toResponse(savedBanner);
    }

    @Override
    @Transactional
    public void deleteHeroBanner(Long id) {
        HeroBanner heroBanner = heroBannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy hero banner này"));

        heroBannerRepository.delete(heroBanner);
    }
}