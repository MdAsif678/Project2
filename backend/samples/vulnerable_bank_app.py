"""
Vulnerable Core Banking Backend Service
Contains multiple quantum-vulnerable and deprecated cryptographic primitives for static scan testing.
"""
import hashlib
from Crypto.PublicKey import RSA
from Crypto.Cipher import AES, DES, PKCS1_OAEP

class BankingAuthService:
    def __init__(self):
        # VULNERABILITY 1: RSA-2048 Asymmetric Key Generation (Shor's Algorithm broken)
        self.rsa_keypair = RSA.generate(2048)
        self.public_key = self.rsa_keypair.publickey().export_key()
        self.private_key = self.rsa_keypair.export_key()

    def hash_user_pin(self, pin: str) -> str:
        # VULNERABILITY 2: MD5 deprecated hashing for sensitive credentials
        return hashlib.md5(pin.encode('utf-8')).hexdigest()

    def generate_audit_checksum(self, transaction_data: bytes) -> str:
        # VULNERABILITY 3: SHA-1 collision-vulnerable digest
        return hashlib.sha1(transaction_data).hexdigest()

    def encrypt_account_payload(self, raw_data: bytes, symmetric_key: bytes) -> bytes:
        # VULNERABILITY 4: AES in Electronic Codebook (ECB) Mode (Pattern leakage)
        cipher = AES.new(symmetric_key[:16], AES.MODE_ECB)
        return cipher.encrypt(raw_data)

    def encrypt_legacy_magnetic_stripe(self, track2_data: bytes) -> bytes:
        # VULNERABILITY 5: Obsolete 56-bit DES
        des_cipher = DES.new(b"BANK8KEY", DES.MODE_ECB)
        return des_cipher.encrypt(track2_data)

    def exchange_session_token(self, token: bytes) -> bytes:
        # VULNERABILITY 6: RSA-OAEP Key Exchange (Harvest Now, Decrypt Later vulnerability)
        cipher = PKCS1_OAEP.new(RSA.import_key(self.public_key))
        return cipher.encrypt(token)
