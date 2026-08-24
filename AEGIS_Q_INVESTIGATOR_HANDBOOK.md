# 🛡️ Aegis-Q — Investigator Handbook & Cryptographic Reference Guide
**Smart India Hackathon (SIH26164) • Post-Quantum Cryptographic Discovery & CBOM Platform**

---

## 🌟 1. Executive Overview — What is Aegis-Q?

**Aegis-Q** is an automated cybersecurity platform built to solve a critical global security crisis: **The Quantum Threat to Modern Cryptography**.

Currently, almost all banks, government services, healthcare applications, and internet websites rely on mathematical encryption algorithms created in the 1970s and 1980s (like **RSA** and **Elliptic Curves**). While these algorithms take billions of years for conventional supercomputers to crack, **Quantum Computers will be able to crack them in a matter of seconds**.

### What Aegis-Q Does:
1. **Scans Source Code & Network Endpoints:** Discovers all cryptographic algorithms, key sizes, certificates, and cipher suites in your apps or live websites.
2. **Identifies Quantum & Classical Risks:** Classifies each algorithm against **Shor's Algorithm** and **Grover's Algorithm**.
3. **Calculates a Quantum Readiness Index:** Computes a transparent heuristic score (0–100%) indicating how urgent your migration is.
4. **Generates an Official CBOM:** Exports a standardized **CycloneDX v1.6 Cryptography Bill of Materials**.
5. **Provides Instant Migration Patches:** Generates AI-assisted code diffs replacing legacy crypto with official **NIST Post-Quantum Cryptography (PQC)** standards (**FIPS 203, FIPS 204, FIPS 205**).

---

## 🔄 2. Step-by-Step Walkthrough: What Happens Under the Hood?

```
┌────────────────────────┐      ┌─────────────────────────┐      ┌──────────────────────────┐
│  1. User Input         │ ───► │  2. Cryptographic Probe │ ───► │  3. Risk Classification │
│  (Codebase or Web URL) │      │  (AST & TLS 5-Step)     │      │  (Shor, Grover, PQC)     │
└────────────────────────┘      └─────────────────────────┘      └──────────────────────────┘
                                                                               │
                                                                               ▼
┌────────────────────────┐      ┌─────────────────────────┐      ┌──────────────────────────┐
│  6. AI Remediation     │ ◄─── │  5. CycloneDX CBOM      │ ◄─── │  4. Quantum Readiness   │
│  (NIST FIPS 203/204)   │      │  (Official v1.6 Spec)   │      │  (Heuristic Score 0-100%)│
└────────────────────────┘      └─────────────────────────┘      └──────────────────────────┘
```

### Step 1: Input Submission
* **Static Mode:** You upload a codebase archive (`.zip`) or pick a pre-loaded enterprise fixture (Bank App, Node Auth, Java Payment Gateway).
* **Dynamic Mode:** You enter a live domain name (e.g. `google.com`, `github.com`).

### Step 2: Discovery & Inspection
* **In Codebases:** The Python Abstract Syntax Tree (AST) engine and multi-language regex parsers scan source files (Python, JavaScript/TypeScript, Java, Go) without executing malicious code. It identifies function calls like `RSA.generate()`, `hashlib.md5()`, `crypto.createCipheriv()`, or `Cipher.getInstance("DES")`.
* **In Live Websites:** A non-intrusive SSL socket connects to port 443 and performs a **5-step TLS handshake progression**:
  1. `ClientHello` (Initiates connection)
  2. `ServerHello` (Negotiates protocol version, e.g. TLS 1.3)
  3. `Certificate` (Extracts X.509 leaf certificate public key)
  4. `KeyExchange` (Extracts asymmetric key agreement algorithm, e.g. ECDHE)
  5. `Finished` (Extracts symmetric record layer cipher, e.g. AES-256-GCM)

### Step 3: Decomposition into 3 Distinct Security Layers
The tool separates the assets into explicit categories:
* **Digital Signatures:** The certificate used to prove server identity.
* **Key Agreement / KEM:** The math used to create a shared secret key over the internet.
* **Symmetric Encryption:** The cipher used to scramble actual web page data or files.

### Step 4: Quantum Threat Assessment & Readiness Scoring
Each asset is mapped to its quantum vulnerability level:
* **🔴 CRITICAL_SHOR:** Asymmetric public-key crypto broken in polynomial time ($O(n^3)$).
* **🟡 MEDIUM_GROVER:** 128-bit symmetric ciphers whose key space is halved.
* **⚠️ DEPRECATED_CLASSICAL:** Broken classical algorithms (MD5, SHA-1, DES).
* **🟢 QUANTUM_RESISTANT:** Approved NIST post-quantum primitives (ML-KEM, ML-DSA) and AES-256-GCM.

### Step 5: CycloneDX v1.6 CBOM Generation
Formats the findings into the official OWASP CycloneDX Cryptography extension JSON format with calculated classical bit strength, NIST quantum security levels (0–5), and object identifiers (OIDs).

### Step 6: AI-Assisted PQC Remediation Diff
Generates side-by-side git patch diffs showing how to rewrite the vulnerable code into NIST FIPS 203 (`liboqs` ML-KEM) or FIPS 204 (`liboqs` ML-DSA).

---

## 📖 3. Plain-English Cryptography Dictionary

### Core Concepts:
* **Cryptography:** The science of protecting information by transforming it into an unreadable format (encryption) so only authorized parties with a secret key can read it (decryption).
* **TLS (Transport Layer Security):** The modern encryption protocol that secures **HTTPS** traffic (the padlock icon in your browser). It ensures no one in between you and a website can steal your passwords, credit card numbers, or messages.
* **CBOM (Cryptography Bill of Materials):** A standardized "nutrition facts / ingredients label" for software that lists every cryptographic algorithm, key length, certificate, and library used across an organization.
* **PQC (Post-Quantum Cryptography):** New mathematical encryption systems designed to run on ordinary computers, but based on math problems (like high-dimensional lattices) that **quantum computers cannot crack**.
* **HNDL (Harvest Now, Decrypt Later):** A threat where attackers intercept and store encrypted network traffic today. Even though they cannot read it now, they will decrypt everything retroactively once large quantum computers are built.

---

## 🔬 4. Classical Cryptographic Algorithms Explained

### 1. RSA (Rivest-Shamir-Adleman)
* **What it is:** The world's most famous public-key encryption and signature algorithm (created in 1977).
* **How it works:** Relies on the mathematical difficulty of factoring the product of two huge prime numbers ($N = p \times q$).
* **Why it is broken:** Peter Shor proved in 1994 that a quantum computer can factor large numbers in polynomial time. RSA-2048, RSA-3072, and RSA-4096 are **100% broken by Shor's algorithm**.
* **NIST PQC Replacement:**
  * For Encryption / Key Exchange $\rightarrow$ **NIST FIPS 203 (ML-KEM / Kyber)**
  * For Digital Signatures $\rightarrow$ **NIST FIPS 204 (ML-DSA / Dilithium)**

### 2. ECC / ECDSA / ECDH (Elliptic Curve Cryptography)
* **What it is:** Modern public-key cryptography used in smartphones, Bitcoin, TLS certificates, and messaging apps.
* **How it works:** Uses mathematical points on an algebraic curve ($y^2 = x^3 + ax + b$).
* **Why it is broken:** Shor's algorithm solves the *Elliptic Curve Discrete Logarithm Problem (ECDLP)* even faster than RSA. ECDSA-256 and ECDH-P256 are **100% broken by quantum computers**.
* **NIST PQC Replacement:**
  * ECDSA (Signatures) $\rightarrow$ **NIST FIPS 204 (ML-DSA)**
  * ECDH (Key Exchange) $\rightarrow$ **NIST FIPS 203 (ML-KEM)**

### 3. AES (Advanced Encryption Standard)
* **What it is:** The worldwide standard for symmetric block cipher encryption (used to encrypt hard drives, databases, and Wi-Fi).
* **Variants:**
  * **AES-128:** Halved by Grover's algorithm to ~64 bits of security $\rightarrow$ **Vulnerable to quantum brute-force**.
  * **AES-256:** Halved by Grover's algorithm to ~128 bits of security $\rightarrow$ **QUANTUM-RESISTANT** (128 bits of quantum security remains unbreakable).
* **Recommendation:** Upgrade all AES-128 to **AES-256-GCM (NIST FIPS 197)**.

### 4. DES & 3DES (Data Encryption Standard)
* **What it is:** Legacy 1970s symmetric encryption using 56-bit keys.
* **Status:** **Classically broken** (can be cracked in hours on a standard laptop using modern brute force). Must be replaced immediately with **AES-256-GCM**.

### 5. MD5 & SHA-1 (Cryptographic Hashes)
* **What it is:** Mathematical one-way fingerprint functions.
* **Status:** **Classically broken** due to practical collision attacks (where two different inputs produce the exact same hash output).
* **Recommendation:** Migrate to **SHA-256** or **SHA3-512 (NIST FIPS 202)**.

---

## ⚛️ 5. Quantum Algorithms & NIST Standards Explained

| Quantum Standard / Algorithm | Type | Description | Post-Quantum Impact |
|---|---|---|---|
| **Shor's Algorithm** | Quantum Attack | Solves prime factorization & discrete logs in $O(n^3)$ polynomial time. | Destroys all classical asymmetric crypto (RSA, ECC, DH). |
| **Grover's Algorithm** | Quantum Attack | Provides quadratic $O(\sqrt{N})$ speedup for searching unsorted databases / keys. | Halves symmetric encryption & hash pre-image security margins. |
| **NIST FIPS 203 (ML-KEM)** | PQC Standard | Module-Lattice Key Encapsulation Mechanism (formerly *CRYSTALS-Kyber*). | Replaces RSA encryption & ECDH key agreements. |
| **NIST FIPS 204 (ML-DSA)** | PQC Standard | Module-Lattice Digital Signature Algorithm (formerly *CRYSTALS-Dilithium*). | Replaces RSA-PSS, ECDSA, and Ed25519 digital signatures. |
| **NIST FIPS 205 (SLH-DSA)** | PQC Standard | Stateless Hash-Based Digital Signature Standard (formerly *SPHINCS+*). | Backup signature standard relying only on hash properties. |
| **NIST FIPS 197 (AES-256)** | Symmetric Standard | 256-bit symmetric block cipher in Galois/Counter Mode (GCM). | Retains ~128 bits of security against Grover's algorithm. |

---

## ❓ 6. Why Do Websites Like Google and Banks Score ~25%–35% Today?

When you scan `google.com`, `github.com`, or any online banking site, Aegis-Q shows a readiness index of around **25% to 35%**. 

### The Explanation to Give Judges:
1. **Public Key Certificate (ECDSA P-256):** 🔴 **0% Quantum Safe** (Broken by Shor's algorithm).
2. **TLS Key Exchange (ECDHE X25519):** 🔴 **0% Quantum Safe** (Broken by Shor's algorithm & vulnerable to Harvest Now, Decrypt Later).
3. **Record Symmetric Cipher (AES-256-GCM):** 🟢 **100% Quantum Safe** (Retains 128-bit quantum security against Grover's algorithm).

Because **2 of the 3 fundamental security layers** are completely vulnerable to Shor's algorithm, the overall readiness is low. 

Once major websites upgrade their web servers to support **Hybrid Post-Quantum TLS** (combining classical ECDH with **NIST FIPS 203 ML-KEM-768**), their score will reach **100%**!

---

## 🏆 7. Summary for SIH Judges

* **Mathematical Defensibility:** Key lengths do not equal security bits (e.g. RSA-2048 is ~112-bit classical security, ECC-256 is ~128-bit).
* **Strict Purpose Separation:** Aegis-Q strictly enforces that Digital Signatures migrate to **FIPS 204 (ML-DSA)**, while Key Exchange migrates to **FIPS 203 (ML-KEM)**.
* **OWASP CycloneDX v1.6 Standard:** Real-time generation of standardized, machine-readable CBOMs for enterprise DevSecOps pipelines.
* **100% Free & Open-Source:** Operates with zero paid cloud databases or proprietary dependencies.
