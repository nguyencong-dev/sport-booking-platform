package com.nguyencong.fieldmate.service;

public interface CredentialEncryptionService {

    String encrypt(String plainText);

    String decrypt(String encryptedValue);
}