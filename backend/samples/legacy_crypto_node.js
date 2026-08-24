/**
 * Legacy E-Commerce Authentication & Payment Token Service (Node.js)
 * Demonstrates deprecated JavaScript cryptographic patterns.
 */
const crypto = require('crypto');

// 1. Quantum-Vulnerable RSA 2048-bit Key Pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// 2. MD5 User Password Digest
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

// 3. SHA-1 API Signature
function signApiPayload(payload, secret) {
  return crypto.createHmac('sha1', secret).update(payload).digest('hex');
}

// 4. Insecure AES-128-ECB Session Encryption
function encryptSessionCookie(cookieData, key) {
  const cipher = crypto.createCipheriv('aes-128-ecb', key.slice(0, 16), null);
  return Buffer.concat([cipher.update(cookieData, 'utf8'), cipher.final()]);
}

// 5. Deprecated TripleDES Legacy Card Processor
function encryptCardDetails(pan, key) {
  const cipher = crypto.createCipheriv('des-ede3-cbc', key.slice(0, 24), Buffer.alloc(8));
  return Buffer.concat([cipher.update(pan, 'utf8'), cipher.final()]);
}

module.exports = { hashPassword, signApiPayload, encryptSessionCookie, encryptCardDetails };
