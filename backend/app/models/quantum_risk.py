from enum import Enum
from typing import Optional
from pydantic import BaseModel

class QuantumRiskLevel(str, Enum):
    CRITICAL_SHOR = "CRITICAL_SHOR"          # Vulnerable to polynomial-time break via Shor's algorithm (RSA, ECC, ECDSA, ECDH, DH)
    HIGH_SHOR = "HIGH_SHOR"                  # High Shor vulnerability / legacy asymmetric (DSA, RSA-1024)
    MEDIUM_GROVER = "MEDIUM_GROVER"          # Symmetric key space or hash search halved by Grover's algorithm (AES-128, 3DES)
    LOW_CLASSICAL = "LOW_CLASSICAL"          # Strong classical, adequate quantum collision/preimage resistance (SHA-256, AES-192)
    DEPRECATED_CLASSICAL = "DEPRECATED_CLASSICAL"  # Classically broken or deprecated (MD5, SHA-1, DES, RC4, ECB mode)
    QUANTUM_RESISTANT = "QUANTUM_RESISTANT"  # Post-quantum resistant or retains >=128-bit quantum security (ML-KEM, ML-DSA, SLH-DSA, AES-256, SHA3-512)

class CryptoPrimitive(str, Enum):
    KEY_AGREEMENT = "Key Agreement"
    KEY_ENCAPSULATION = "Key Encapsulation Mechanism"
    PUBLIC_KEY_ENCRYPTION = "Public-Key Encryption"
    DIGITAL_SIGNATURE = "Digital Signature"
    SYMMETRIC_BLOCK_CIPHER = "Symmetric Block Cipher"
    SYMMETRIC_STREAM_CIPHER = "Symmetric Stream Cipher"
    HASH_FUNCTION = "Hash Function"
    MAC = "Message Authentication Code"

class NistPqcStandard(BaseModel):
    standard_name: str
    fips_designation: str
    primary_algorithms: list[str]
    description: str
    official_link: str

NIST_STANDARDS_MAP = {
    "ML-KEM": NistPqcStandard(
        standard_name="Module-Lattice-Based Key-Encapsulation Mechanism",
        fips_designation="NIST FIPS 203",
        primary_algorithms=["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024", "Kyber-768"],
        description="Standardized post-quantum key encapsulation mechanism replacing discrete logarithm and factorization based key exchange (ECDH, DH, RSA).",
        official_link="https://csrc.nist.gov/pubs/fips/203/final"
    ),
    "ML-DSA": NistPqcStandard(
        standard_name="Module-Lattice-Based Digital Signature Algorithm",
        fips_designation="NIST FIPS 204",
        primary_algorithms=["ML-DSA-44", "ML-DSA-65", "ML-DSA-87", "Dilithium3"],
        description="Standardized post-quantum primary digital signature scheme replacing RSA-PSS, ECDSA, and Ed25519.",
        official_link="https://csrc.nist.gov/pubs/fips/204/final"
    ),
    "SLH-DSA": NistPqcStandard(
        standard_name="Stateless Hash-Based Digital Signature Algorithm",
        fips_designation="NIST FIPS 205",
        primary_algorithms=["SLH-DSA-SHAKE-128f", "SLH-DSA-SHA2-128f", "SPHINCS+"],
        description="Stateless hash-based backup digital signature scheme offering strong security guarantees without lattice-based hardness assumptions.",
        official_link="https://csrc.nist.gov/pubs/fips/205/final"
    ),
    "AES-256": NistPqcStandard(
        standard_name="Advanced Encryption Standard (256-bit)",
        fips_designation="NIST FIPS 197",
        primary_algorithms=["AES-256-GCM", "AES-256-CTR"],
        description="Symmetric block cipher resilient against Grover's quantum search algorithm (retains ~128 bits post-quantum security).",
        official_link="https://csrc.nist.gov/pubs/fips/197/final"
    ),
    "SHA3-512": NistPqcStandard(
        standard_name="SHA-3 Cryptographic Hash Function (512-bit)",
        fips_designation="NIST FIPS 202",
        primary_algorithms=["SHA3-512", "SHA-384", "SHAKE256"],
        description="Quantum-resilient hash function retaining 256 bits of collision resistance against quantum attacks.",
        official_link="https://csrc.nist.gov/pubs/fips/202/final"
    )
}

def get_classical_security_bits(algorithm: str, key_size: Optional[int] = None, curve_name: Optional[str] = None) -> Optional[int]:
    """Calculates NIST-aligned classical security strength in bits (not raw key size)."""
    algo_upper = algorithm.upper().strip().replace("_", "-")
    curve_upper = (curve_name or "").upper().strip()

    # 1. RSA Asymmetric (NIST SP 800-57 Part 1 Rev. 5)
    if "RSA" in algo_upper:
        effective_key = key_size or 2048
        if "1024" in algo_upper or effective_key <= 1024:
            return 80
        elif "2048" in algo_upper or effective_key <= 2048:
            return 112
        elif "3072" in algo_upper or effective_key <= 3072:
            return 128
        elif "4096" in algo_upper or effective_key >= 4096:
            return 152
        return 112

    # 2. Elliptic Curve Cryptography (ECDSA, ECDH, Ed25519)
    if any(k in algo_upper for k in ["ECDSA", "ECDH", "EC", "25519", "SECP", "PRIME"]):
        if "521" in algo_upper or "521" in curve_upper or (key_size and key_size >= 521):
            return 256
        if "384" in algo_upper or "384" in curve_upper or (key_size and key_size >= 384):
            return 192
        if "256" in algo_upper or "25519" in algo_upper or "224" not in algo_upper:
            return 128
        return 112

    # 3. Symmetric Ciphers
    if "AES" in algo_upper:
        if "256" in algo_upper or key_size == 256:
            return 256
        if "192" in algo_upper or key_size == 192:
            return 192
        return 128

    if "3DES" in algo_upper or "DES-EDE" in algo_upper or "TRIPLEDES" in algo_upper:
        return 112
    if "DES" in algo_upper:
        return 56
    if "RC4" in algo_upper or "ARC4" in algo_upper:
        return 64
    if "CHACHA20" in algo_upper:
        return 256

    # 4. Hash Functions (Collision Resistance Bits)
    if "MD5" in algo_upper:
        return 32
    if "SHA1" in algo_upper or "SHA-1" in algo_upper:
        return 60
    if "SHA256" in algo_upper or "SHA-256" in algo_upper:
        return 128
    if "SHA384" in algo_upper or "SHA-384" in algo_upper:
        return 192
    if "SHA512" in algo_upper or "SHA-512" in algo_upper or "SHA3" in algo_upper:
        return 256

    # 5. Post-Quantum Primitives (NIST PQC Security Levels)
    if "ML-KEM" in algo_upper or "KYBER" in algo_upper:
        if "1024" in algo_upper:
            return 256
        if "768" in algo_upper:
            return 192
        return 128

    if "ML-DSA" in algo_upper or "DILITHIUM" in algo_upper:
        if "87" in algo_upper:
            return 256
        if "65" in algo_upper:
            return 192
        return 128

    if key_size and key_size <= 512:
        return key_size
    return None

def get_pqc_recommendation(
    algorithm: str,
    primitive: CryptoPrimitive,
    usage: Optional[str] = None,
    key_size: Optional[int] = None
) -> dict:
    """
    Centralized, mathematically rigorous NIST Post-Quantum Cryptography recommendation engine.
    Ensures Digital Signatures (ECDSA/RSA-PSS) map ONLY to ML-DSA/SLH-DSA, and Key Establishment (ECDH/DH/RSA) maps ONLY to ML-KEM.
    """
    algo_upper = algorithm.upper().strip().replace("_", "-")
    usage_upper = (usage or "").upper().strip()

    # Case 1: Digital Signatures (ECDSA, Ed25519, RSA-PSS, RSA Signatures, DSA)
    if primitive == CryptoPrimitive.DIGITAL_SIGNATURE or "SIGN" in usage_upper or "ECDSA" in algo_upper or "ED25519" in algo_upper or "DSA" in algo_upper:
        if "ML-DSA" in algo_upper or "SLH-DSA" in algo_upper or "SPHINCS" in algo_upper or "DILITHIUM" in algo_upper:
            return {
                "primitive": CryptoPrimitive.DIGITAL_SIGNATURE,
                "risk": QuantumRiskLevel.QUANTUM_RESISTANT,
                "reason": "Standardized NIST FIPS 204/205 post-quantum digital signature scheme.",
                "nist_replacement": "Active NIST Post-Quantum Standard",
                "nist_standard": "ML-DSA",
                "oid": "2.16.840.1.101.3.4.3.18" if "65" in algo_upper else "2.16.840.1.101.3.4.3.17",
                "quantum_security_level": 5,
                "requires_pqc_migration": False
            }

        return {
            "primitive": CryptoPrimitive.DIGITAL_SIGNATURE,
            "risk": QuantumRiskLevel.CRITICAL_SHOR if "DSA" not in algo_upper or "EC" in algo_upper else QuantumRiskLevel.HIGH_SHOR,
            "reason": "Vulnerable to Shor's algorithm on a Cryptanalytically Relevant Quantum Computer (CRQC), which solves discrete logarithms and integer factorization in polynomial time O(n^3), allowing signature forgery.",
            "nist_replacement": "ML-DSA-65 (NIST FIPS 204) / SLH-DSA (NIST FIPS 205)",
            "nist_standard": "ML-DSA",
            "oid": "1.2.840.10045.2.1" if "ECDSA" in algo_upper else ("1.3.101.112" if "25519" in algo_upper else "1.2.840.113549.1.1.10"),
            "quantum_security_level": 0,
            "requires_pqc_migration": True
        }

    # Case 2: Key Agreement / Key Encapsulation (ECDH, DH, X25519, RSA Key Exchange)
    if primitive in [CryptoPrimitive.KEY_AGREEMENT, CryptoPrimitive.KEY_ENCAPSULATION] or "EXCHANGE" in usage_upper or "KEM" in algo_upper or "ECDH" in algo_upper or "DIFFIE" in algo_upper or "DH" in algo_upper:
        if "ML-KEM" in algo_upper or "KYBER" in algo_upper:
            return {
                "primitive": CryptoPrimitive.KEY_ENCAPSULATION,
                "risk": QuantumRiskLevel.QUANTUM_RESISTANT,
                "reason": "Standardized NIST FIPS 203 post-quantum module-lattice key encapsulation mechanism.",
                "nist_replacement": "Active NIST Post-Quantum Standard",
                "nist_standard": "ML-KEM",
                "oid": "2.16.840.1.101.3.4.4.2",
                "quantum_security_level": 5,
                "requires_pqc_migration": False
            }

        return {
            "primitive": CryptoPrimitive.KEY_AGREEMENT if "DH" in algo_upper or "ECDH" in algo_upper else CryptoPrimitive.KEY_ENCAPSULATION,
            "risk": QuantumRiskLevel.CRITICAL_SHOR,
            "reason": "Vulnerable to Shor's algorithm. Adversaries can record encrypted network sessions today to decrypt retroactively once CRQC quantum systems arrive ('Harvest Now, Decrypt Later').",
            "nist_replacement": "ML-KEM-768 (NIST FIPS 203) / Hybrid X25519+ML-KEM-768",
            "nist_standard": "ML-KEM",
            "oid": "1.3.132.1.12" if "ECDH" in algo_upper else ("1.3.101.110" if "25519" in algo_upper else "1.2.840.113549.1.3.1"),
            "quantum_security_level": 0,
            "requires_pqc_migration": True
        }

    # Case 3: Public-Key Encryption (RSA Encryption)
    if primitive == CryptoPrimitive.PUBLIC_KEY_ENCRYPTION or ("RSA" in algo_upper and primitive not in [CryptoPrimitive.DIGITAL_SIGNATURE, CryptoPrimitive.KEY_AGREEMENT]):
        return {
            "primitive": CryptoPrimitive.PUBLIC_KEY_ENCRYPTION,
            "risk": QuantumRiskLevel.CRITICAL_SHOR,
            "reason": "Vulnerable to polynomial-time prime factorization via Shor's algorithm on quantum computers.",
            "nist_replacement": "ML-KEM-768 (NIST FIPS 203) + AES-256-GCM Payload",
            "nist_standard": "ML-KEM",
            "oid": "1.2.840.113549.1.1.1",
            "quantum_security_level": 0,
            "requires_pqc_migration": True
        }

    # Case 4: Symmetric Block Ciphers & Stream Ciphers (Specifically Recognized)
    if any(k in algo_upper for k in ["AES", "DES", "RC4", "CHACHA", "3DES", "BLOWFISH", "IDEA"]):
        if "ECB" in algo_upper:
            return {
                "primitive": CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER,
                "risk": QuantumRiskLevel.DEPRECATED_CLASSICAL,
                "reason": "Electronic Codebook (ECB) mode lacks diffusion; identical plaintext blocks encrypt to identical ciphertext blocks, leaking confidential structure.",
                "nist_replacement": "AES-256-GCM (NIST FIPS 197 / SP 800-38D)",
                "nist_standard": "AES-256",
                "oid": "2.16.840.1.101.3.4.1.1",
                "quantum_security_level": 0,
                "requires_pqc_migration": True
            }

        if "DES" in algo_upper or "3DES" in algo_upper or "TRIPLEDES" in algo_upper or "RC4" in algo_upper or "ARC4" in algo_upper or "BLOWFISH" in algo_upper:
            return {
                "primitive": CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER if "RC4" not in algo_upper else CryptoPrimitive.SYMMETRIC_STREAM_CIPHER,
                "risk": QuantumRiskLevel.DEPRECATED_CLASSICAL,
                "reason": "Classically broken or deprecated cipher with weak key lengths (56-bit DES) or keystream biases (RC4 RFC 7465).",
                "nist_replacement": "AES-256-GCM (NIST FIPS 197)",
                "nist_standard": "AES-256",
                "oid": "1.3.14.3.2.7" if "DES" in algo_upper and "3DES" not in algo_upper else "1.2.840.113549.3.7",
                "quantum_security_level": 0,
                "requires_pqc_migration": True
            }

        if "256" in algo_upper or key_size == 256 or "CHACHA20" in algo_upper:
            return {
                "primitive": CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER if "CHACHA20" not in algo_upper else CryptoPrimitive.SYMMETRIC_STREAM_CIPHER,
                "risk": QuantumRiskLevel.QUANTUM_RESISTANT,
                "reason": "Grover's algorithm provides quadratic speedup for brute force, reducing 256-bit key search space to ~128 bits of security, which remains computationally infeasible for quantum computers.",
                "nist_replacement": "Already Quantum-Resistant (Ensure Authenticated GCM/AEAD mode)",
                "nist_standard": "AES-256",
                "oid": "2.16.840.1.101.3.4.1.46",
                "quantum_security_level": 5,
                "requires_pqc_migration": False
            }

        # AES-128
        return {
            "primitive": CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER,
            "risk": QuantumRiskLevel.MEDIUM_GROVER,
            "reason": "Grover's quantum search reduces effective exhaustive key search complexity from 128-bit to ~64-bit security margin.",
            "nist_replacement": "AES-256-GCM (NIST FIPS 197)",
            "nist_standard": "AES-256",
            "oid": "2.16.840.1.101.3.4.1.6",
            "quantum_security_level": 1,
            "requires_pqc_migration": True
        }

    # Case 5: Hash Functions (Specifically Recognized)
    if any(k in algo_upper for k in ["MD5", "SHA", "RIPEMD", "BLAKE"]):
        if "MD5" in algo_upper:
            return {
                "primitive": CryptoPrimitive.HASH_FUNCTION,
                "risk": QuantumRiskLevel.DEPRECATED_CLASSICAL,
                "reason": "Collision resistance is completely broken classically (CVE-2004-2761). Forgeries achievable in milliseconds.",
                "nist_replacement": "SHA-256 / SHA3-512 (NIST FIPS 202)",
                "nist_standard": "SHA3-512",
                "oid": "1.2.840.113549.2.5",
                "quantum_security_level": 0,
                "requires_pqc_migration": True
            }

        if "SHA1" in algo_upper or "SHA-1" in algo_upper:
            return {
                "primitive": CryptoPrimitive.HASH_FUNCTION,
                "risk": QuantumRiskLevel.DEPRECATED_CLASSICAL,
                "reason": "Practical collision attacks demonstrated (SHAttered attack). Deprecated by NIST SP 800-131A.",
                "nist_replacement": "SHA-256 / SHA3-512 (NIST FIPS 202)",
                "nist_standard": "SHA3-512",
                "oid": "1.3.14.3.2.26",
                "quantum_security_level": 0,
                "requires_pqc_migration": True
            }

        if "SHA256" in algo_upper or "SHA-256" in algo_upper:
            return {
                "primitive": CryptoPrimitive.HASH_FUNCTION,
                "risk": QuantumRiskLevel.LOW_CLASSICAL,
                "reason": "Strong classical hash function (128-bit collision resistance). Quantum BHT collision search gives ~85-bit security margin; preimage resistance is ~128 bits under Grover. Not broken by Shor.",
                "nist_replacement": "SHA-384 / SHA3-512 (NIST FIPS 202)",
                "nist_standard": "SHA3-512",
                "oid": "2.16.840.1.101.3.4.2.1",
                "quantum_security_level": 3,
                "requires_pqc_migration": False
            }

        # SHA-384, SHA-512, SHA-3
        return {
            "primitive": CryptoPrimitive.HASH_FUNCTION,
            "risk": QuantumRiskLevel.QUANTUM_RESISTANT,
            "reason": "Provides massive classical and quantum security margins (>=128 bits quantum collision resistance).",
            "nist_replacement": "Active Quantum-Resistant Standard",
            "nist_standard": "SHA3-512",
            "oid": "2.16.840.1.101.3.4.2.2" if "384" in algo_upper else "2.16.840.1.101.3.4.2.10",
            "quantum_security_level": 5,
            "requires_pqc_migration": False
        }

    # Default Unrecognized / Custom Asset (NO fake OID)
    return {
        "primitive": primitive,
        "risk": QuantumRiskLevel.LOW_CLASSICAL,
        "reason": f"Unrecognized cryptographic primitive '{algorithm}'. Requires manual evaluation.",
        "nist_replacement": "Manual Cryptographic Review Required",
        "nist_standard": "N/A",
        "oid": None,  # NEVER emit fake OID like 1.3.6.1.4.1
        "quantum_security_level": 1,
        "requires_pqc_migration": False
    }

def classify_algorithm(algo_name: str, key_size: Optional[int] = None, usage: Optional[str] = None) -> dict:
    """Wrapper mapping algorithm name and usage to get_pqc_recommendation."""
    algo_upper = algo_name.upper().strip().replace("_", "-")
    
    if "ECDSA" in algo_upper or "ED25519" in algo_upper or "DSA" in algo_upper or "SIGN" in (usage or "").upper():
        prim = CryptoPrimitive.DIGITAL_SIGNATURE
    elif "ECDH" in algo_upper or "DH" in algo_upper or "X25519" in algo_upper or "KEM" in algo_upper:
        prim = CryptoPrimitive.KEY_AGREEMENT
    elif "RSA" in algo_upper:
        prim = CryptoPrimitive.DIGITAL_SIGNATURE if "SIGN" in (usage or "").upper() or "PSS" in algo_upper else CryptoPrimitive.PUBLIC_KEY_ENCRYPTION
    elif "MD5" in algo_upper or "SHA" in algo_upper:
        prim = CryptoPrimitive.HASH_FUNCTION
    elif "RC4" in algo_upper or "CHACHA" in algo_upper:
        prim = CryptoPrimitive.SYMMETRIC_STREAM_CIPHER
    else:
        prim = CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER

    return get_pqc_recommendation(algo_name, primitive=prim, usage=usage, key_size=key_size)
