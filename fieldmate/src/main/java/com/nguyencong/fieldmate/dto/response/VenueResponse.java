package com.nguyencong.fieldmate.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.nguyencong.fieldmate.entity.enums.StatusVenue;

import lombok.*;
@NoArgsConstructor
public class VenueResponse {
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {

        private Long id;
        private String name;
        private String address;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private String banner;
        private String logo;
        private StatusVenue status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Detail {
        private Long id;
        private String name;
        private String address;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private String banner;
        private String logo;
        private StatusVenue status;
        private Long ownerId;
        private String ownerName;
        private List<String> benefits;
        private List<String> rules;
        private List<String> images;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}