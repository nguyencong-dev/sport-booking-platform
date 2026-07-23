package com.nguyencong.fieldmate.utils;

import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public final class HmacUtils {

    private static final String HMAC_SHA256 = "HmacSHA256";

    private HmacUtils() {
    }

    public static String hmacSha256(String rawData, String secretKey) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);

            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);

            mac.init(keySpec);

            byte[] signature = mac.doFinal(rawData.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(signature);
        } catch (Exception exception) {
            throw new IllegalStateException("Không thể tạo chữ ký HMAC SHA256", exception);
        }
    }
}
