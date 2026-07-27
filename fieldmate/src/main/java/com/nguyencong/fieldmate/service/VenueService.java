package com.nguyencong.fieldmate.service;

import java.io.IOException;
import java.util.List;

import org.springframework.data.domain.Page;

import com.nguyencong.fieldmate.dto.request.VenueRequest;
import com.nguyencong.fieldmate.dto.response.VenueResponse;
import com.nguyencong.fieldmate.entity.enums.StatusVenue;

public interface VenueService {
    Page<VenueResponse.Summary> getAllVenues(String name, String address, Long sportTypeId, StatusVenue status,
            int page);

    VenueResponse.Detail getVenueById(Long id);

    VenueResponse.Summary createVenue(VenueRequest request) throws IOException;

    VenueResponse.Summary updateVenue(Long id, VenueRequest request) throws IOException;

    void deleteVenue(Long id);

    VenueResponse.Summary updateVenueStatus(Long id, StatusVenue status);

    List<VenueResponse.Summary> getPendingVenues();

    Page<VenueResponse.Summary> getMyVenues(int page);
}
