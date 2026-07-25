package com.nguyencong.fieldmate.utils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

public final class VnPayUtils {

    private static final String SECURE_HASH = "vnp_SecureHash";
    private static final String SECURE_HASH_TYPE = "vnp_SecureHashType";

    private VnPayUtils() {
    }

    public static String buildQuery(Map<String, String> parameters) {
        return canonicalParameters(parameters).entrySet().stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    public static String sign(Map<String, String> parameters, String hashSecret) {
        String hashData = canonicalParameters(parameters).entrySet().stream()
                .map(entry -> entry.getKey() + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));

        return HmacUtils.hmacSha512(hashData, hashSecret);
    }

    public static boolean hasValidSignature(Map<String, String> parameters, String hashSecret) {
        String actualSignature = parameters.get(SECURE_HASH);

        if (actualSignature == null || actualSignature.isBlank()) {
            return false;
        }

        String expectedSignature = sign(parameters, hashSecret);

        return MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                actualSignature.toLowerCase().getBytes(StandardCharsets.UTF_8));
    }

    private static Map<String, String> canonicalParameters(Map<String, String> parameters) {
        Map<String, String> sortedParameters = new TreeMap<>();

        parameters.forEach((key, value) -> {
            if (key != null
                    && key.startsWith("vnp_")
                    && !SECURE_HASH.equals(key)
                    && !SECURE_HASH_TYPE.equals(key)
                    && value != null
                    && !value.isBlank()) {
                sortedParameters.put(key, value);
            }
        });

        return sortedParameters;
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
