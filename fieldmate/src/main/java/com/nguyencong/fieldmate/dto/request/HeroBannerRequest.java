package com.nguyencong.fieldmate.dto.request;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

public class HeroBannerRequest {

    private HeroBannerRequest() {
    }

    @Getter
    @Setter
    public static class Create {

        @NotNull
        private MultipartFile image;

        @Size(max = 500)
        private String targetUrl;
    }

    @Getter
    @Setter
    public static class Update {

        private MultipartFile image;
        @Size(max = 500)
        private String targetUrl;
    }
}