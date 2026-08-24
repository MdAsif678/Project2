# ==============================================================================
# Aegis-Q Sample Cryptographic Codebase (Post-Quantum Reference Stack)
# Demonstrates NIST FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), FIPS 197 (AES-256-GCM)
# ==============================================================================

import oqs  # type: ignore
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import hashlib

class PostQuantumBankingService:
    def __init__(self):
        # NIST FIPS 203 Module-Lattice Key Encapsulation (ML-KEM-768)
        self.kem = oqs.KeyEncapsulation("ML-KEM-768")
        self.kem_public_key = self.kem.generate_keypair()
        
        # NIST FIPS 204 Module-Lattice Digital Signatures (ML-DSA-65)
        self.signer = oqs.Signature("ML-DSA-65")
        self.signer_public_key = self.signer.generate_keypair()

    def establish_quantum_safe_channel(self, peer_public_key: bytes) -> tuple[bytes, bytes]:
        # Encapsulate shared secret using peer's ML-KEM-768 public key
        ciphertext, shared_secret = self.kem.encap_secret(peer_public_key)
        return ciphertext, shared_secret

    def sign_financial_transaction(self, transaction_data: bytes) -> bytes:
        # NIST FIPS 204 Lattice signature
        return self.signer.sign(transaction_data)

    def encrypt_transaction_payload(self, raw_data: bytes, symmetric_key: bytes) -> tuple[bytes, bytes]:
        # NIST FIPS 197 AES-256-GCM (Quantum-Resistant against Grover's algorithm)
        aesgcm = AESGCM(symmetric_key[:32])
        nonce = os.urandom(12)
        ciphertext = aesgcm.encrypt(nonce, raw_data, None)
        return nonce, ciphertext

    def compute_audit_hash(self, transaction_data: bytes) -> str:
        # NIST FIPS 202 SHA3-512 (256 bits of quantum collision resistance)
        return hashlib.sha3_512(transaction_data).hexdigest()
