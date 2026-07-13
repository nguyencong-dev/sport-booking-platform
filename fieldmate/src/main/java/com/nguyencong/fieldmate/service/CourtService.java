package com.nguyencong.fieldmate.service;

import java.util.List;

import com.nguyencong.fieldmate.dto.request.CourtRequest;
import com.nguyencong.fieldmate.dto.response.CourtResponse;
import com.nguyencong.fieldmate.entity.enums.CourtStatus;

public interface CourtService {

    List<CourtResponse> getCourtsByVenueId(Long venueId);

    CourtResponse getCourtById(Long id);

    CourtResponse createCourt(Long venueId, CourtRequest request);

    CourtResponse updateCourt(Long id, CourtRequest request);

    CourtResponse updateCourtStatus(Long id, CourtStatus status);

    void deleteCourt(Long id);
}