package com.nguyencong.fieldmate.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VenueImageResponse {
    private Long id;
    private String url;
}