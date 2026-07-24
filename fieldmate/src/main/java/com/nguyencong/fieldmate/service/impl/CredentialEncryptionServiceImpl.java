package com.nguyencong.fieldmate.service.impl;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.nguyencong.fieldmate.service.CredentialEncryptionService;

@Service
public class CredentialEncryptionServiceImpl implements CredentialEncryptionService {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final String PREFIX = "v1:";
    private static final int IV_LENGTH = 12;
    private static final int TAG_LENGTH_BITS = 128;

    private final SecureRandom secureRandom = new SecureRandom();

    private final SecretKeySpec secretKey;

    public CredentialEncryptionServiceImpl(@Value("${credential.encryption-key}") String encodedKey) {

        byte[] keyBytes = Base64.getDecoder().decode(encodedKey);

        if (keyBytes.length != 32) {
            throw new IllegalArgumentException("Credential encryption key phải có 32 bytes");
        }

        this.secretKey = new SecretKeySpec(keyBytes, ALGORITHM);
    }

    @Override
    public String encrypt(String plainText) {

        if (plainText == null || plainText.isBlank()) {
            throw new IllegalArgumentException("Dữ liệu cần mã hóa không được để trống");
        }

        try {
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);

            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(TAG_LENGTH_BITS, iv));

            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            byte[] payload = ByteBuffer.allocate(iv.length + cipherText.length).put(iv).put(cipherText).array();

            return PREFIX + Base64.getEncoder().encodeToString(payload);

        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Không thể mã hóa credential", exception);
        }
    }

    @Override
    public String decrypt(String encryptedValue) {

        if (encryptedValue == null || !encryptedValue.startsWith(PREFIX)) {
            throw new IllegalArgumentException("Credential không đúng định dạng mã hóa");
        }

        try {
            byte[] payload = Base64.getDecoder().decode(encryptedValue.substring(PREFIX.length()));

            if (payload.length <= IV_LENGTH) {
                throw new IllegalArgumentException("Credential mã hóa không hợp lệ");
            }

            ByteBuffer buffer = ByteBuffer.wrap(payload);

            byte[] iv = new byte[IV_LENGTH];
            buffer.get(iv);

            byte[] cipherText = new byte[buffer.remaining()];
            buffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);

            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(TAG_LENGTH_BITS, iv));

            byte[] plainText = cipher.doFinal(cipherText);

            return new String(plainText, StandardCharsets.UTF_8);

        } catch (GeneralSecurityException | IllegalArgumentException exception) {

            throw new IllegalStateException("Không thể giải mã credential", exception);
        }
    }
}