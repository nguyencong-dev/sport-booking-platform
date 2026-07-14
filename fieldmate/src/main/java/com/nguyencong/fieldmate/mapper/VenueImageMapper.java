package com.nguyencong.fieldmate.mapper;

import com.nguyencong.fieldmate.dto.response.VenueImageResponse;
import com.nguyencong.fieldmate.entity.VenueImage;

public class VenueImageMapper {
    private VenueImageMapper() {
    }

    public static VenueImageResponse toResponse(VenueImage image) {
        if (image == null) {
            return null;
        }

        return VenueImageResponse.builder()
                .id(image.getId())
                .url(image.getUrl())
                .build();
    }
}
