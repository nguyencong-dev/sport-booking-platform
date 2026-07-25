package com.nguyencong.fieldmate.utils;

import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public final class HmacUtils {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final String HMAC_SHA512 = "HmacSHA512";

    private HmacUtils() {
    }

    public static String hmacSha256(String rawData, String secretKey) {
        return hmac(rawData, secretKey, HMAC_SHA256);
    }

    public static String hmacSha512(String rawData, String secretKey) {
        return hmac(rawData, secretKey, HMAC_SHA512);
    }

    private static String hmac(String rawData, String secretKey, String algorithm) {
        try {
            Mac mac = Mac.getInstance(algorithm);

            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), algorithm);

            mac.init(keySpec);

            byte[] signature = mac.doFinal(rawData.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(signature);
        } catch (Exception exception) {
            throw new IllegalStateException("Không thể tạo chữ ký " + algorithm, exception);
        }
    }
}
