package com.nguyencong.fieldmate.service.impl;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cloudinary.Cloudinary;
import com.nguyencong.fieldmate.dto.request.VenueRequest;
import com.nguyencong.fieldmate.dto.response.VenueResponse;
import com.nguyencong.fieldmate.dto.response.VenueResponse.Summary;
import com.nguyencong.fieldmate.dto.response.VenueBookingScheduleResponse;
import com.nguyencong.fieldmate.entity.Booking;
import com.nguyencong.fieldmate.entity.Court;
import com.nguyencong.fieldmate.entity.User;
import com.nguyencong.fieldmate.entity.Venue;
import com.nguyencong.fieldmate.entity.enums.BookingStatus;
import com.nguyencong.fieldmate.entity.enums.CourtStatus;
import com.nguyencong.fieldmate.entity.enums.StatusVenue;
import com.nguyencong.fieldmate.exception.BadRequestException;
import com.nguyencong.fieldmate.exception.BusinessRuleViolationException;
import com.nguyencong.fieldmate.exception.ResourceNotFoundException;
import com.nguyencong.fieldmate.mapper.VenueMapper;
import com.nguyencong.fieldmate.mapper.VenueBookingScheduleMapper;
import com.nguyencong.fieldmate.repository.BookingRepository;
import com.nguyencong.fieldmate.repository.CourtRepository;
import com.nguyencong.fieldmate.repository.VenueRepository;
import com.nguyencong.fieldmate.repository.spec.VenueSpecification;
import com.nguyencong.fieldmate.security.CurrentUserProvider;
import com.nguyencong.fieldmate.service.VenueService;
import com.nguyencong.fieldmate.utils.PaginationUtils;

@Service
public class VenueServiceImpl implements VenueService {

    private static final double EARTH_RADIUS_KM = 6371.0088;
    private static final BigDecimal MIN_LATITUDE = BigDecimal.valueOf(-90);
    private static final BigDecimal MAX_LATITUDE = BigDecimal.valueOf(90);
    private static final BigDecimal MIN_LONGITUDE = BigDecimal.valueOf(-180);
    private static final BigDecimal MAX_LONGITUDE = BigDecimal.valueOf(180);
    private static final BigDecimal MIN_RADIUS_KM = BigDecimal.valueOf(0.1);
    private static final BigDecimal MAX_RADIUS_KM = BigDecimal.valueOf(100);

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private CurrentUserProvider currentUserProvider;

    @Override
    @Transactional(readOnly = true)
    public Page<VenueResponse.Summary> getAllVenues(String name, String address, Long sportTypeId, StatusVenue status,
            BigDecimal latitude, BigDecimal longitude, BigDecimal radiusKm, int page) {

        String normalizedName = name == null || name.isBlank() ? null : name.trim();
        String normalizedAddress = address == null || address.isBlank() ? null : address.trim();
        boolean hasLatitude = latitude != null;
        boolean hasLongitude = longitude != null;

        if (hasLatitude != hasLongitude) {
            throw new BadRequestException("Vĩ độ và kinh độ phải được truyền cùng nhau");
        }

        if (!hasLatitude && radiusKm != null) {
            throw new BadRequestException("Không thể lọc theo khoảng cách khi chưa có tọa độ");
        }

        validateSportTypeId(sportTypeId);

        Specification<Venue> specification = VenueSpecification.byFilters(normalizedName, normalizedAddress, sportTypeId, status);

        if (!hasLatitude) {
            Pageable pageable = PaginationUtils.createPageable(page);
            return venueRepository.findAll(specification, pageable).map(VenueMapper::toSummary);
        }

        validateRequiredRange(latitude, MIN_LATITUDE, MAX_LATITUDE,
                "Vĩ độ phải nằm trong khoảng từ -90 đến 90");
        validateRequiredRange(longitude, MIN_LONGITUDE, MAX_LONGITUDE,
                "Kinh độ phải nằm trong khoảng từ -180 đến 180");
        validateRadius(radiusKm);

        specification = specification.and(VenueSpecification.byDistance(latitude, longitude, radiusKm));

        Pageable pageable = PaginationUtils.createUnsortedPageable(page);

        return venueRepository.findAll(specification, pageable).map(venue -> {
            VenueResponse.Summary response = VenueMapper.toSummary(venue);
            response.setDistanceKm(calculateDistance(latitude, longitude,
                    venue.getLatitude(), venue.getLongitude()));
            return response;
        });
    }

    private void validateSportTypeId(Long sportTypeId) {
        if (sportTypeId != null && sportTypeId <= 0) {
            throw new BadRequestException("Mã môn thể thao phải lớn hơn 0");
        }
    }

    private void validateRequiredRange(BigDecimal value, BigDecimal minimum, BigDecimal maximum, String message) {
        if (value == null || value.compareTo(minimum) < 0 || value.compareTo(maximum) > 0) {
            throw new BadRequestException(message);
        }
    }

    private void validateRadius(BigDecimal radiusKm) {
        if (radiusKm != null
                && (radiusKm.compareTo(MIN_RADIUS_KM) < 0 || radiusKm.compareTo(MAX_RADIUS_KM) > 0)) {
            throw new BadRequestException("Khoảng cách phải nằm trong khoảng từ 0.1 đến 100 km");
        }
    }

    private double calculateDistance(BigDecimal sourceLatitude, BigDecimal sourceLongitude,
            BigDecimal targetLatitude, BigDecimal targetLongitude) {

        double sourceLatitudeRadians = Math.toRadians(sourceLatitude.doubleValue());
        double sourceLongitudeRadians = Math.toRadians(sourceLongitude.doubleValue());
        double targetLatitudeRadians = Math.toRadians(targetLatitude.doubleValue());
        double targetLongitudeRadians = Math.toRadians(targetLongitude.doubleValue());
        double centralAngleInput = Math.cos(sourceLatitudeRadians)
                * Math.cos(targetLatitudeRadians)
                * Math.cos(targetLongitudeRadians - sourceLongitudeRadians)
                + Math.sin(sourceLatitudeRadians)
                * Math.sin(targetLatitudeRadians);
        double boundedInput = Math.max(-1.0, Math.min(1.0, centralAngleInput));

        return EARTH_RADIUS_KM * Math.acos(boundedInput);
    }

    public Venue findVenue(Long id) {
        return venueRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân"));
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
            Map<?, ?> uploadResult = cloudinary.uploader().upload(request.getBanner().getBytes(),
                    Map.of("folder", "fieldmate/venues/banners"));

            venue.setBanner((String) uploadResult.get("secure_url"));
        }

        if (request.getLogo() != null && !request.getLogo().isEmpty()) {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(request.getLogo().getBytes(),
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
            throw new AccessDeniedException("Bạn không có quyền thao tác sân này");
        }

        VenueMapper.updateEntity(venue, request);

        if (request.getBanner() != null && !request.getBanner().isEmpty()) {
            Map uploadResult = cloudinary.uploader().upload(request.getBanner().getBytes(),
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
            throw new AccessDeniedException("Bạn không có quyền thao tác sân này");
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
            throw new AccessDeniedException("Bạn không có quyền đổi trạng thái sân này");
        }

        if (!isAdmin && (venue.getStatus() == StatusVenue.PENDING || venue.getStatus() == StatusVenue.REJECTED)) {
            throw new BusinessRuleViolationException(
                    "Sân đang chờ duyệt hoặc đã bị từ chối, chủ sân không thể đổi trạng thái");
        }

        if (!isAdmin && status != StatusVenue.ACTIVE && status != StatusVenue.INACTIVE) {
            throw new AccessDeniedException("Chủ sân chỉ được bật hoặc tắt sân");
        }

        venue.setStatus(status);

        Venue savedVenue = venueRepository.save(venue);
        return VenueMapper.toSummary(savedVenue);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VenueResponse.Summary> getPendingVenues() {
        return venueRepository.findByStatus(StatusVenue.PENDING).stream().map(VenueMapper::toSummary).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VenueResponse.Summary> getMyVenues(int page) {
        User currentUser = currentUserProvider.getCurrentUser();
        Pageable pageable = PaginationUtils.createPageable(page);

        return venueRepository.findByOwnerId(currentUser.getId(), pageable).map(VenueMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public VenueBookingScheduleResponse getBookingSchedule(Long venueId, LocalDate date) {
        Venue venue = findVenue(venueId);

        List<Court> courts = courtRepository.findByVenueId(venueId).stream()
                .filter(court -> court.getStatus() == CourtStatus.ACTIVE).toList();

        Map<Long, List<Booking>> bookingsByCourtId = bookingRepository
                .findBookedPeriodsByVenueIdAndDate(venueId, date,
                        Set.of(BookingStatus.PENDING, BookingStatus.CONFIRMED))
                .stream().collect(Collectors.groupingBy(booking -> booking.getCourt().getId()));

        return VenueBookingScheduleMapper.toResponse(venue, date, courts, bookingsByCourtId);
    }

}
