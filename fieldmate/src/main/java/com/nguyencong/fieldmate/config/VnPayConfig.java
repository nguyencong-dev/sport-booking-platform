package com.nguyencong.fieldmate.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;

@Getter
@Configuration
public class VnPayConfig {

    @Value("${vnpay.payment-url}")
    private String paymentUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    @Value("${payment-front-end-return-url}")
    private String frontendReturnUrl;

    @Value("${vnpay.ipn-url}")
    private String ipnUrl;

    @Value("${vnpay.version}")
    private String version;

    @Value("${vnpay.command}")
    private String command;

    @Value("${vnpay.order-type}")
    private String orderType;

    @Value("${vnpay.currency}")
    private String currency;

    @Value("${vnpay.locale}")
    private String locale;

    @Value("${vnpay.expire-minutes}")
    private long expireMinutes;
}
