# Aegis-Q — Post-Quantum Cryptographic Discovery & CBOM Platform
**Smart India Hackathon (SIH26164) • Cryptographic Discovery, CycloneDX v1.6 CBOM & NIST PQC Migration Advisor**

---

## 🌟 Executive Overview
**Aegis-Q** is an enterprise cryptographic governance platform engineered to discover, analyze, and remediate quantum-vulnerable and classically deprecated encryption across software source code and live network endpoints.

### Core Capabilities:
1. **Multi-Language Static Cryptographic Discovery:**
   - Abstract Syntax Tree (AST) parsing and regex heuristics across Python, JavaScript/TypeScript, Java, and Go.
   - Categorizes cryptographic primitives into explicit purposes: Digital Signatures, Key Agreements, Key Encapsulation Mechanisms, Symmetric Block/Stream Ciphers, and Hash Functions.
2. **Live Dynamic TLS / Network Handshake Inspector:**
   - Non-intrusive SSL socket probing testing TLS protocol negotiation, negotiated cipher suites, and X.509 certificate chains against Shor's and Grover's quantum threat algorithms.
   - Dissects certificate public keys, TLS key exchanges, and symmetric record layer ciphers into distinct CBOM assets.
3. **CycloneDX v1.6 Standard CBOM Generation:**
   - Exports compliant **Cryptography Bill of Materials (CBOM)** formatted according to the official OWASP CycloneDX 1.6 Cryptography Extension with NIST quantum security levels, calculated classical security strength, and verified OIDs (unassigned OIDs omitted).
4. **AI & Deterministic Post-Quantum Remediation:**
   - Generates AI-assisted migration code suggestions aligning with:
     - **Digital Signatures (ECDSA, RSA-PSS) $\rightarrow$ NIST FIPS 204 (ML-DSA / Dilithium)** or **FIPS 205 (SLH-DSA)**
     - **Key Establishment (ECDH, DH, RSA) $\rightarrow$ NIST FIPS 203 (ML-KEM / Kyber)**
     - **Symmetric Encryption (AES-128, DES, ECB) $\rightarrow$ NIST FIPS 197 (AES-256-GCM)**
     - **Deprecated Hashes (MD5, SHA-1) $\rightarrow$ NIST FIPS 202 (SHA-256 / SHA3-512)**
   - Safe deterministic fallback returning explicit manual review notices for unrecognized algorithms (no silent default fallbacks).

---

## 🚀 Quick Start (Local Execution)

### 1. Launch FastAPI Backend & Universal Dashboard
```powershell
python backend/run.py
```
Open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your browser.

### 2. Run Automated Verification Tests
```powershell
python backend/tests/test_backend.py
```

---

## 🛡️ Cryptographic Threat Taxonomy & NIST Standards

| Cryptographic Purpose | Classical Algorithms | Threat Vector & Impact | Recommended NIST Standard |
|---|---|---|---|
| **Digital Signatures** | ECDSA, Ed25519, RSA-PSS | 🔴 **Broken by Shor's Algorithm** (Signature Forgery) | **NIST FIPS 204 (ML-DSA-65)** / **FIPS 205 (SLH-DSA)** |
| **Key Agreement / KEM** | ECDH, DH, RSA Key Exchange | 🔴 **Broken by Shor's Algorithm** ("Harvest Now, Decrypt Later") | **NIST FIPS 203 (ML-KEM-768)** |
| **Symmetric Encryption** | AES-256-GCM | 🟢 **QUANTUM_RESISTANT** (Retains ~128 bits under Grover's search) | **Already Resilient (NIST FIPS 197)** |
| **Symmetric Encryption** | AES-128, 3DES, DES, ECB | 🟡 **Grover Halving / Deprecated Mode** | **NIST FIPS 197 (AES-256-GCM)** |
| **Hash Functions** | SHA-384, SHA-512, SHA-3 | 🟢 **QUANTUM_RESISTANT** (>=128 bits quantum collision resistance) | **NIST FIPS 202 (SHA3-512)** |
| **Hash Functions** | MD5, SHA-1 | ⚠️ **Classically Deprecated (Collision Attacks)** | **NIST FIPS 202 (SHA-256 / SHA3-512)** |

---

## 📊 Aegis-Q Quantum Readiness Index Methodology
The Quantum Readiness Index is a **transparent heuristic score (0–100%)** designed to highlight post-quantum migration urgency:
- Deductions for **CRITICAL_SHOR** public-key assets (Shor polynomial-time threat).
- Deductions for **DEPRECATED_CLASSICAL** assets (broken classical security).
- Deductions for **MEDIUM_GROVER** assets (reduced brute-force search margin).
- Positive weighting for verified **QUANTUM_RESISTANT** implementations.

> **Validation Notice:** All AI-synthesized code patches are recommendations requiring developer review and unit testing before production deployment.
