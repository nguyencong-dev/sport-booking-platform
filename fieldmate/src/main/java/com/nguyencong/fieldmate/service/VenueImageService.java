package com.nguyencong.fieldmate.service;

import java.io.IOException;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.nguyencong.fieldmate.dto.response.VenueImageResponse;

public interface VenueImageService {

    List<VenueImageResponse> uploadVenueImages(Long venueId, List<MultipartFile> images) throws IOException;

    void deleteVenueImage(Long id);
}
