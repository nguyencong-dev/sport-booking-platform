package com.nguyencong.fieldmate.payment;

public record PaymentGatewayResult(String checkoutUrl, String deeplink, String qrCodeUrl, String requestId) {

}