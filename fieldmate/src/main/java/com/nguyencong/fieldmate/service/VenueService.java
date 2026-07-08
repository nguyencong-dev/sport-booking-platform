package com.nguyencong.fieldmate.service;

import java.util.List;
import com.nguyencong.fieldmate.dto.response.VenueResponse;

public interface VenueService {

    List<VenueResponse.Summary> getAllVenues();

    VenueResponse.Detail getVenueById(Long id);
}