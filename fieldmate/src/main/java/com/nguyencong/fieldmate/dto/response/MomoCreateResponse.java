package com.nguyencong.fieldmate.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MomoCreateResponse {

    private String partnerCode;
    private String requestId;
    private String orderId;
    private Long amount;
    private Long responseTime;

    private Integer resultCode;
    private String message;

    private String payUrl;
    private String deeplink;
    private String qrCodeUrl;
}
