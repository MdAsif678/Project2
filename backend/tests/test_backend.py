import os
import sys
from pathlib import Path

# Ensure UTF-8 stdout encoding for Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.models.quantum_risk import (
    CryptoPrimitive, QuantumRiskLevel, get_pqc_recommendation,
    get_classical_security_bits, classify_algorithm
)
from app.models.scan_models import CryptoFinding
from app.services.cbom_builder import build_cyclonedx_cbom
from app.services.ai_remediation import ai_remediation_engine
from app.services.dynamic_scanner import dynamic_scanner

def test_1_ecdsa_signature_mapping():
    """TEST 1: ECDSA-256 -> primitive = digital-signature, Shor-vulnerable, replacement = ML-DSA (NOT ML-KEM)."""
    rec = get_pqc_recommendation("ECDSA-256", primitive=CryptoPrimitive.DIGITAL_SIGNATURE)
    assert rec["primitive"] == CryptoPrimitive.DIGITAL_SIGNATURE
    assert rec["risk"] in [QuantumRiskLevel.CRITICAL_SHOR, QuantumRiskLevel.HIGH_SHOR]
    assert "ML-DSA" in rec["nist_replacement"]
    assert "ML-KEM" not in rec["nist_replacement"]
    print(" [PASS] TEST 1: ECDSA-256 -> Digital Signature -> ML-DSA (Never ML-KEM)")

def test_2_ecdh_key_agreement_mapping():
    """TEST 2: ECDH -> primitive = key-agreement, replacement = ML-KEM."""
    rec = get_pqc_recommendation("ECDH", primitive=CryptoPrimitive.KEY_AGREEMENT)
    assert rec["primitive"] in [CryptoPrimitive.KEY_AGREEMENT, CryptoPrimitive.KEY_ENCAPSULATION]
    assert "ML-KEM" in rec["nist_replacement"]
    assert "ML-DSA" not in rec["nist_replacement"]
    print(" [PASS] TEST 2: ECDH -> Key Agreement -> ML-KEM (Never ML-DSA)")

def test_3_rsa_encryption_mapping():
    """TEST 3: RSA-2048 used for encryption/key establishment -> replacement = ML-KEM."""
    rec = get_pqc_recommendation("RSA-2048", primitive=CryptoPrimitive.PUBLIC_KEY_ENCRYPTION)
    assert rec["risk"] == QuantumRiskLevel.CRITICAL_SHOR
    assert "ML-KEM" in rec["nist_replacement"]
    print(" [PASS] TEST 3: RSA-2048 Encryption -> ML-KEM Key Encapsulation")

def test_4_rsa_pss_signature_mapping():
    """TEST 4: RSA-PSS used for signatures -> replacement = ML-DSA or SLH-DSA."""
    rec = get_pqc_recommendation("RSA-PSS", primitive=CryptoPrimitive.DIGITAL_SIGNATURE, usage="Digital Signatures")
    assert rec["primitive"] == CryptoPrimitive.DIGITAL_SIGNATURE
    assert "ML-DSA" in rec["nist_replacement"] or "SLH-DSA" in rec["nist_replacement"]
    print(" [PASS] TEST 4: RSA-PSS Signatures -> ML-DSA / SLH-DSA")

def test_5_aes_256_gcm_quantum_resistant():
    """TEST 5: AES-256-GCM -> risk = QUANTUM_RESISTANT, NOT broken, NOT critical."""
    rec = get_pqc_recommendation("AES-256-GCM", primitive=CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER)
    assert rec["risk"] == QuantumRiskLevel.QUANTUM_RESISTANT
    assert rec["requires_pqc_migration"] == False
    assert rec["quantum_security_level"] == 5
    print(" [PASS] TEST 5: AES-256-GCM -> QUANTUM_RESISTANT (~128-bit quantum security)")

def test_6_aes_128_grover_affected():
    """TEST 6: AES-128 -> Grover-affected / reduced quantum security, recommend AES-256."""
    rec = get_pqc_recommendation("AES-128", primitive=CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER)
    assert rec["risk"] == QuantumRiskLevel.MEDIUM_GROVER
    assert "AES-256" in rec["nist_replacement"]
    print(" [PASS] TEST 6: AES-128 -> MEDIUM_GROVER -> Upgrade to AES-256")

def test_7_sha1_deprecated_classical():
    """TEST 7: SHA-1 -> deprecated classical, recommend SHA-256/SHA-3."""
    rec = get_pqc_recommendation("SHA-1", primitive=CryptoPrimitive.HASH_FUNCTION)
    assert rec["risk"] == QuantumRiskLevel.DEPRECATED_CLASSICAL
    assert "SHA-256" in rec["nist_replacement"] or "SHA3" in rec["nist_replacement"]
    print(" [PASS] TEST 7: SHA-1 -> DEPRECATED_CLASSICAL -> SHA-256 / SHA3-512")

def test_8_md5_broken_classical():
    """TEST 8: MD5 -> deprecated/broken classical, recommend SHA-256/SHA-3."""
    rec = get_pqc_recommendation("MD5", primitive=CryptoPrimitive.HASH_FUNCTION)
    assert rec["risk"] == QuantumRiskLevel.DEPRECATED_CLASSICAL
    assert "SHA-256" in rec["nist_replacement"] or "SHA3" in rec["nist_replacement"]
    print(" [PASS] TEST 8: MD5 -> DEPRECATED_CLASSICAL (Broken Collision)")

def test_9_unknown_oid_omitted():
    """TEST 9: Unknown OID -> OID omitted/null, NEVER '1.3.6.1.4.1'."""
    rec = get_pqc_recommendation("CUSTOM-EXPERIMENTAL-CIPHER", primitive=CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER)
    assert rec["oid"] is None
    
    finding = CryptoFinding(
        id="test-unknown-oid",
        algorithm="CUSTOM-CIPHER",
        primitive=CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER,
        risk_level=QuantumRiskLevel.LOW_CLASSICAL,
        risk_reason="Experimental",
        nist_replacement="Review",
        nist_standard="N/A",
        confidence=0.5,
        oid=None,
        quantum_security_level=1
    )
    cbom = build_cyclonedx_cbom("TestTarget", [finding], "static")
    comp = cbom["components"][0]
    # OID field must not exist or be null in cryptoProperties
    assert "oid" not in comp["cryptoProperties"] or comp["cryptoProperties"]["oid"] is None
    if "oid" in comp["cryptoProperties"]:
        assert comp["cryptoProperties"]["oid"] != "1.3.6.1.4.1"
    print(" [PASS] TEST 9: Unknown OID is safely omitted (Never 1.3.6.1.4.1)")

def test_10_unknown_algorithm_manual_review():
    """TEST 10: Unknown algorithm -> manual review required, NO random RSA fallback patch."""
    finding = CryptoFinding(
        id="test-unknown-algo",
        algorithm="X-CUSTOM-PROPRIETARY-CIPHER",
        primitive=CryptoPrimitive.MAC,
        risk_level=QuantumRiskLevel.LOW_CLASSICAL,
        risk_reason="Custom MAC algorithm",
        nist_replacement="Manual Review",
        nist_standard="N/A",
        confidence=0.5,
        quantum_security_level=1
    )
    remediation = ai_remediation_engine.remediate(finding)
    assert remediation.requires_manual_review == True
    assert "Manual" in remediation.patched_code or "manual" in remediation.patched_code
    assert "RSA" not in remediation.patched_code
    print(" [PASS] TEST 10: Unknown Algorithm -> Requires Manual Review (No RSA Fallback)")

def test_11_tls_distinct_assets():
    """TEST 11: TLS 1.3 + AES-256-GCM -> TLS version, key exchange and cipher suite represented as separate assets."""
    res = dynamic_scanner.scan_endpoint("google.com", 443)
    assert len(res.findings) >= 3
    
    primitives = [f.primitive for f in res.findings]
    assert CryptoPrimitive.DIGITAL_SIGNATURE in primitives  # Server Cert Public Key
    assert CryptoPrimitive.KEY_AGREEMENT in primitives      # TLS Key Exchange
    assert CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER in primitives  # Record layer encryption
    print(" [PASS] TEST 11: Live TLS Inspection decomposes Cert, Key Agreement & Symmetric Cipher separately")

def test_12_classical_security_strength_calculation():
    """TEST 12: Verify classical security strength calculation is not raw key size."""
    assert get_classical_security_bits("RSA-1024", 1024) == 80
    assert get_classical_security_bits("RSA-2048", 2048) == 112
    assert get_classical_security_bits("RSA-3072", 3072) == 128
    assert get_classical_security_bits("RSA-4096", 4096) == 152
    assert get_classical_security_bits("ECDSA-256", 256, "P-256") == 128
    assert get_classical_security_bits("ECDSA-384", 384, "P-384") == 192
    assert get_classical_security_bits("AES-128", 128) == 128
    assert get_classical_security_bits("AES-256", 256) == 256
    print(" [PASS] TEST 12: Classical Security Strength Mapping (NIST SP 800-57 aligned)")

if __name__ == "__main__":
    print("=========================================================")
    print("Running Aegis-Q Defensibility & Cryptographic Verification Suite")
    print("=========================================================")
    test_1_ecdsa_signature_mapping()
    test_2_ecdh_key_agreement_mapping()
    test_3_rsa_encryption_mapping()
    test_4_rsa_pss_signature_mapping()
    test_5_aes_256_gcm_quantum_resistant()
    test_6_aes_128_grover_affected()
    test_7_sha1_deprecated_classical()
    test_8_md5_broken_classical()
    test_9_unknown_oid_omitted()
    test_10_unknown_algorithm_manual_review()
    test_11_tls_distinct_assets()
    test_12_classical_security_strength_calculation()
    print("=========================================================")
    print("🎉 ALL 12 AUTOMATED CRYPTOGRAPHIC TESTS PASSED WITH 100% SUCCESS!")
    print("=========================================================")
