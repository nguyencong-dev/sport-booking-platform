package com.nguyencong.fieldmate.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import lombok.Getter;

@Getter
@Configuration
public class MomoConfig {

    @Value("${momo.partner-code}")
    private String partnerCode;

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Value("${momo.base-url}")
    private String baseUrl;

    @Value("${momo.create-path}")
    private String createPath;

    @Value("${momo.redirect-url}")
    private String redirectUrl;

    @Value("${momo.ipn-url}")
    private String ipnUrl;

    @Value("${momo.request-type}")
    private String requestType;

    @Value("${momo.language}")
    private String language;

    @Bean
    public RestClient momoRestClient() {
        return RestClient.builder().baseUrl(baseUrl).build();
    }
}