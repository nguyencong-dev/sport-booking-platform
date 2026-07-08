package com.nguyencong.fieldmate.service;

import java.util.List;

import com.nguyencong.fieldmate.dto.request.SportTypeRequest;
import com.nguyencong.fieldmate.dto.response.SportTypeResponse;

public interface SportTypeService {
    List<SportTypeResponse> getAllSportTypes();
    SportTypeResponse createSportType(SportTypeRequest request);
    SportTypeResponse updateSportType(Long id, SportTypeRequest request);
    void deleteSportType(Long id);
}
