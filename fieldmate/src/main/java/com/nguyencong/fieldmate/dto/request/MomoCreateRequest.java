package com.nguyencong.fieldmate.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MomoCreateRequest {

    private String partnerCode;
    private String requestType;
    private String ipnUrl;
    private String redirectUrl;
    private String orderId;
    private Long amount;
    private String orderInfo;
    private String requestId;
    private String extraData;
    private String signature;
    private String lang;
}
