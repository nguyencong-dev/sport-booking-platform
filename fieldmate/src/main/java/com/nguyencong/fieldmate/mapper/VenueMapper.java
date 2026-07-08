package com.nguyencong.fieldmate.mapper;

import com.nguyencong.fieldmate.dto.response.VenueResponse;
import com.nguyencong.fieldmate.entity.Venue;

public class VenueMapper {

        private VenueMapper() {
        }

        public static VenueResponse.Summary toSummary(Venue venue) {
                if (venue == null) {
                        return null;
                }

                return VenueResponse.Summary.builder()
                                .id(venue.getId())
                                .name(venue.getName())
                                .address(venue.getAddress())
                                .latitude(venue.getLatitude())
                                .longitude(venue.getLongitude())
                                .banner(venue.getBanner())
                                .logo(venue.getLogo())
                                .status(venue.getStatus())
                                .build();
        }

        public static VenueResponse.Detail toDetail(Venue venue) {
                if (venue == null) {
                        return null;
                }

                return VenueResponse.Detail.builder()
                                .id(venue.getId())
                                .name(venue.getName())
                                .address(venue.getAddress())
                                .latitude(venue.getLatitude())
                                .longitude(venue.getLongitude())
                                .banner(venue.getBanner())
                                .logo(venue.getLogo())
                                .status(venue.getStatus())
                                .ownerId(venue.getOwner() != null ? venue.getOwner().getId() : null)
                                .ownerName(getOwnerName(venue))
                                .benefits(venue.getBenefits()
                                                .stream()
                                                .map(benefit -> benefit.getName())
                                                .toList())
                                .rules(venue.getRules()
                                                .stream()
                                                .map(rule -> rule.getName())
                                                .toList())
                                .images(venue.getImages()
                                                .stream()
                                                .map(image -> image.getUrl())
                                                .toList())
                                .createdAt(venue.getCreatedAt())
                                .updatedAt(venue.getUpdatedAt())
                                .build();
        }

        private static String getOwnerName(Venue venue) {
                if (venue.getOwner() == null) {
                        return null;
                }

                String firstName = venue.getOwner().getFirstName() != null
                                ? venue.getOwner().getFirstName()
                                : "";

                String lastName = venue.getOwner().getLastName() != null
                                ? venue.getOwner().getLastName()
                                : "";

                return (firstName + " " + lastName).trim();
        }
}