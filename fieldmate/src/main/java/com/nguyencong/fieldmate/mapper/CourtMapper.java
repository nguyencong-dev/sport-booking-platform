package com.nguyencong.fieldmate.mapper;

import com.nguyencong.fieldmate.dto.request.CourtRequest;
import com.nguyencong.fieldmate.dto.response.CourtResponse;
import com.nguyencong.fieldmate.entity.Court;

public class CourtMapper {

    public static CourtResponse toResponse(Court court) {
        if (court == null) {
            return null;
        }

        return CourtResponse.builder()
                .id(court.getId())
                .name(court.getName())
                .pricePerHour(court.getPricePerHour())
                .status(court.getStatus())
                .sportTypeName(court.getSportType() != null ? court.getSportType().getName() : null)
                .venueName(court.getVenue() != null ? court.getVenue().getName() : null)
                .createdAt(court.getCreatedAt())
                .updatedAt(court.getUpdatedAt())
                .build();
    }

    public static Court toEntity(CourtRequest request) {
        if (request == null) {
            return null;
        }

        return Court.builder()
                .name(request.getName().trim())
                .pricePerHour(request.getPricePerHour())
                .build();
    }

    public static void updateEntity(Court court, CourtRequest request) {
        if (court == null || request == null) {
            return;
        }

        court.setName(request.getName().trim());
        court.setPricePerHour(request.getPricePerHour());
    }
}