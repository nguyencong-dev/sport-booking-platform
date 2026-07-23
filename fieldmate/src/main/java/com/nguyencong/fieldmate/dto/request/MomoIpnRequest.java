package com.nguyencong.fieldmate.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MomoIpnRequest {
    
    @NotBlank
    private String partnerCode;
    @NotBlank
    private String orderId;
    @NotBlank
    private String requestId;
    @NotNull
    private Long amount;
    @NotBlank
    private String orderInfo;
    @NotBlank
    private String orderType;
    @NotNull
    private Long transId;
    @NotNull
    private Integer resultCode;
    @NotNull
    private String message;
    @NotBlank
    private String payType;
    @NotNull
    private Long responseTime;
    @NotNull
    private String extraData;
    @NotBlank
    private String signature;
}