package com.nguyencong.fieldmate.mapper;

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
}
