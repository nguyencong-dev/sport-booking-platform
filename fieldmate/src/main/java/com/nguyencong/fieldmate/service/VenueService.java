package com.nguyencong.fieldmate.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.nguyencong.fieldmate.dto.request.VenueRequest;
import com.nguyencong.fieldmate.dto.response.VenueImageResponse;
import com.nguyencong.fieldmate.dto.response.VenueResponse;
import com.nguyencong.fieldmate.entity.enums.StatusVenue;

public interface VenueService {
    List<VenueResponse.Summary> getAllVenues(Map<String, String> params);

    VenueResponse.Detail getVenueById(Long id);

    VenueResponse.Summary createVenue(VenueRequest request) throws IOException;

    VenueResponse.Summary updateVenue(Long id, VenueRequest request) throws IOException;

    void deleteVenue(Long id);

    VenueResponse.Summary updateVenueStatus(Long id, StatusVenue status);

    List<VenueResponse.Summary> getPendingVenues();

    List<VenueImageResponse> uploadVenueImages(Long venueId, List<MultipartFile> images) throws IOException;

    void deleteVenueImage(Long venueId, Long imageId);
}