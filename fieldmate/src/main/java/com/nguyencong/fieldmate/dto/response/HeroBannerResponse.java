package com.nguyencong.fieldmate.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class HeroBannerResponse {

    private Long id;
    private String url;
    private String targetUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}