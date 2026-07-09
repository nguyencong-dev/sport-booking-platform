package com.nguyencong.fieldmate.mapper;

import com.nguyencong.fieldmate.dto.request.SportTypeRequest;
import com.nguyencong.fieldmate.dto.response.SportTypeResponse;
import com.nguyencong.fieldmate.entity.SportType;

public class SportTypeMapper {

    private SportTypeMapper() {
    }

    public static SportTypeResponse toResponse(SportType sportType) {
        if (sportType == null) {
            return null;
        }

        return SportTypeResponse.builder()
                .id(sportType.getId())
                .name(sportType.getName())
                .build();
    }

    public static SportType toEntity(SportTypeRequest request) {
        if (request == null) {
            return null;
        }

        return SportType.builder()
                .name(request.getName().trim())
                .build();
    }

    public static void updateEntity(SportType sportType, SportTypeRequest request) {
        if (sportType == null || request == null) {
            return;
        }

        sportType.setName(request.getName().trim());
    }
}
