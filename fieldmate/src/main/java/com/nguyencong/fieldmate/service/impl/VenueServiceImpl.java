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
import com.nguyencong.fieldmate.dto.request.VenueRequest;
import com.nguyencong.fieldmate.dto.response.VenueImageResponse;
import com.nguyencong.fieldmate.dto.response.VenueResponse;
import com.nguyencong.fieldmate.dto.response.VenueResponse.Summary;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.Venue;
import com.nguyencong.fieldmate.entity.VenueImage;
import com.nguyencong.fieldmate.entity.enums.StatusVenue;
import com.nguyencong.fieldmate.mapper.VenueImageMapper;
import com.nguyencong.fieldmate.mapper.VenueMapper;
import com.nguyencong.fieldmate.repository.UserRepository;
import com.nguyencong.fieldmate.repository.VenueImageRepository;
import com.nguyencong.fieldmate.repository.VenueRepository;
import com.nguyencong.fieldmate.security.CurrentUserProvider;
import com.nguyencong.fieldmate.service.VenueService;

@Service
public class VenueServiceImpl implements VenueService {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Autowired
    private VenueImageRepository venueImageRepository;

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

    public Venue findVenue(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sân"));
    }

    @Override
    @Transactional(readOnly = true)
    public VenueResponse.Detail getVenueById(Long id) {
        Venue venue = findVenue(id);
        return VenueMapper.toDetail(venue);
    }

    @Override
    @Transactional
    public VenueResponse.Summary createVenue(VenueRequest request) throws IOException {
        Venue venue = VenueMapper.toEntity(request);
        User owner = currentUserProvider.getCurrentUser();
        venue.setOwner(owner);

        if (request.getBanner() != null && !request.getBanner().isEmpty()) {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    request.getBanner().getBytes(),
                    Map.of("folder", "fieldmate/venues/banners"));

            venue.setBanner((String) uploadResult.get("secure_url"));
        }

        if (request.getLogo() != null && !request.getLogo().isEmpty()) {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    request.getLogo().getBytes(),
                    Map.of("folder", "fieldmate/venues/logos"));

            venue.setLogo((String) uploadResult.get("secure_url"));
        }

        Venue savedVenue = venueRepository.save(venue);
        return VenueMapper.toSummary(savedVenue);
    }

    @Override
    @Transactional
    public VenueResponse.Summary updateVenue(Long id, VenueRequest request) throws IOException {
        Venue venue = findVenue(id);
        User owner = currentUserProvider.getCurrentUser();

        if (!venue.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Bạn không có quyền thao tác sân này");
        }

        VenueMapper.updateEntity(venue, request);

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

    @Override
    @Transactional
    public void deleteVenue(Long id) {
        Venue venue = findVenue(id);

        User owner = currentUserProvider.getCurrentUser();

        if (!venue.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Bạn không có quyền thao tác sân này");
        }

        venueRepository.delete(venue);
    }

    @Override
    public Summary updateVenueStatus(Long id, StatusVenue status) {
        Venue venue = findVenue(id);

        User currentUser = currentUserProvider.getCurrentUser();

        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");
        boolean isOwner = venue.getOwner().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("Bạn không có quyền đổi trạng thái sân này");
        }

        if (!isAdmin && (venue.getStatus() == StatusVenue.PENDING || venue.getStatus() == StatusVenue.REJECTED)) {
            throw new RuntimeException("Sân đang chờ duyệt hoặc đã bị từ chối, chủ sân không thể đổi trạng thái");
        }

        if (!isAdmin && status != StatusVenue.ACTIVE && status != StatusVenue.INACTIVE) {
            throw new RuntimeException("Chủ sân chỉ được bật hoặc tắt sân");
        }

        venue.setStatus(status);

        Venue savedVenue = venueRepository.save(venue);
        return VenueMapper.toSummary(savedVenue);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VenueResponse.Summary> getPendingVenues() {
        return venueRepository.findByStatus(StatusVenue.PENDING)
                .stream()
                .map(VenueMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional
    public List<VenueImageResponse> uploadVenueImages(Long venueId, List<MultipartFile> images) throws IOException {
        Venue venue = findVenue(venueId);
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

            Map uploadResult = cloudinary.uploader().upload(
                    image.getBytes(),
                    Map.of("folder", "fieldmate/venues/images"));

            String imageUrl = (String) uploadResult.get("secure_url");

            VenueImage venueImage = VenueImage.builder()
                    .venue(venue)
                    .url(imageUrl)
                    .build();

            VenueImage savedImage = venueImageRepository.save(venueImage);
            uploadedImages.add(savedImage);
        }

        venueRepository.save(venue);
        return uploadedImages.stream()
                .map(VenueImageMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteVenueImage(Long venueId, Long imageId) {
        Venue venue = findVenue(venueId);

        User currentUser = currentUserProvider.getCurrentUser();

        if (!venue.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa ảnh của sân này");
        }

        VenueImage image = venueImageRepository.findByIdAndVenueId(imageId, venueId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh của sân"));

        venueImageRepository.delete(image);
    }

}