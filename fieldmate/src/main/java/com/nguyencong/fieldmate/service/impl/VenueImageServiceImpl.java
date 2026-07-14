package com.nguyencong.fieldmate.service.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.nguyencong.fieldmate.dto.response.VenueImageResponse;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.Venue;
import com.nguyencong.fieldmate.entity.VenueImage;
import com.nguyencong.fieldmate.mapper.VenueImageMapper;
import com.nguyencong.fieldmate.repository.VenueImageRepository;
import com.nguyencong.fieldmate.repository.VenueRepository;
import com.nguyencong.fieldmate.security.CurrentUserProvider;
import com.nguyencong.fieldmate.service.VenueImageService;

@Service
public class VenueImageServiceImpl implements VenueImageService {
    @Autowired
    private VenueRepository venueRepository;
    @Autowired
    private VenueImageRepository venueImageRepository;
    @Autowired
    private CurrentUserProvider currentUserProvider;
    @Autowired
    private Cloudinary cloudinary;

    @Override
    @Transactional
    public List<VenueImageResponse> uploadVenueImages(
            Long venueId,
            List<MultipartFile> images) throws IOException {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sân"));

        User currentUser = currentUserProvider.getCurrentUser();

        if (!venue.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền thêm ảnh cho sân này");
        }

        if (images == null || images.isEmpty()) {
            throw new RuntimeException("Danh sách ảnh không được để trống");
        }

        List<VenueImage> uploadedImages = new ArrayList<>();

        for (MultipartFile image : images) {
            if (image == null || image.isEmpty()) {
                continue;
            }

            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    image.getBytes(),
                    Map.of("folder", "fieldmate/venues/images"));

            Object secureUrl = uploadResult.get("secure_url");
            if (!(secureUrl instanceof String imageUrl)) {
                throw new RuntimeException("Cloudinary không trả về URL ảnh");
            }

            VenueImage venueImage = VenueImage.builder().venue(venue).url(imageUrl).build();

            uploadedImages.add(venueImageRepository.save(venueImage));
        }

        return uploadedImages.stream()
                .map(VenueImageMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteVenueImage(Long id) {
        VenueImage image = venueImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh của sân"));

        User currentUser = currentUserProvider.getCurrentUser();

        if (!image.getVenue().getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa ảnh của sân này");
        }

        venueImageRepository.delete(image);
    }
}
