package com.enterprise.security;

import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

public class LegacyEnterpriseSecurity {

    // 1. Quantum-Vulnerable RSA Key Generator
    public static void generateKeys() throws NoSuchAlgorithmException {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048);
    }

    // 2. Classically Insecure MD5 Digest
    public static byte[] computeMd5(byte[] data) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("MD5");
        return md.digest(data);
    }

    // 3. Deprecated DES Block Cipher
    public static byte[] encryptDes(byte[] key, byte[] plaintext) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(key, "DES");
        Cipher cipher = Cipher.getInstance("DES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec);
        return cipher.doFinal(plaintext);
    }

    // 4. Insecure AES-ECB Cipher Mode
    public static byte[] encryptAesEcb(byte[] key, byte[] plaintext) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec);
        return cipher.doFinal(plaintext);
    }
}
