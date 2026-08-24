import ast
import re
import uuid
from pathlib import Path
from typing import Optional
from app.models.quantum_risk import (
    classify_algorithm, get_pqc_recommendation, get_classical_security_bits,
    QuantumRiskLevel, CryptoPrimitive
)
from app.models.scan_models import CryptoFinding, StaticScanResult
from app.utils.file_extractor import traverse_source_files

# Regex Patterns for Multi-Language Cryptographic Discovery with Explicit Primitives
REGEX_PATTERNS = [
    # --- Python ---
    {
        "lang": "python",
        "regex": r"(?:RSA\.generate\s*\(\s*(\d+)|generate_private_key\s*\(\s*public_exponent=\d+,\s*key_size=(\d+))",
        "algo": "RSA",
        "primitive": CryptoPrimitive.PUBLIC_KEY_ENCRYPTION,
        "framework": "cryptography/pycryptodome",
        "key_group": (1, 2)
    },
    {
        "lang": "python",
        "regex": r"hashlib\.(md5|sha1|sha256|sha384|sha512)\s*\(",
        "algo_group": 1,
        "primitive": CryptoPrimitive.HASH_FUNCTION,
        "framework": "hashlib"
    },
    {
        "lang": "python",
        "regex": r"AES\.new\s*\([^,]+,\s*(?:AES\.)?MODE_(ECB|CBC|CTR|GCM)",
        "algo": "AES",
        "primitive": CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER,
        "mode_group": 1,
        "framework": "PyCryptodome"
    },
    {
        "lang": "python",
        "regex": r"DES(?:3)?\.new\s*\(",
        "algo": "DES",
        "primitive": CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER,
        "framework": "PyCryptodome"
    },
    {
        "lang": "python",
        "regex": r"ARC4\.new\s*\(",
        "algo": "RC4",
        "primitive": CryptoPrimitive.SYMMETRIC_STREAM_CIPHER,
        "framework": "PyCryptodome"
    },
    {
        "lang": "python",
        "regex": r"(?:ec\.SECP256R1|ec\.SECP384R1|ec\.SECP521R1|ec\.generate_private_key)\s*\(",
        "algo": "ECDSA",
        "primitive": CryptoPrimitive.DIGITAL_SIGNATURE,
        "framework": "cryptography.hazmat"
    },

    # --- JavaScript / TypeScript / Node.js ---
    {
        "lang": "javascript",
        "regex": r"crypto\.createHash\s*\(\s*['\"](md5|sha1|sha256|sha384|sha512|ripemd160)['\"]\s*\)",
        "algo_group": 1,
        "primitive": CryptoPrimitive.HASH_FUNCTION,
        "framework": "Node.js crypto"
    },
    {
        "lang": "javascript",
        "regex": r"crypto\.createCipher(?:iv)?\s*\(\s*['\"](aes-128-ecb|aes-128-cbc|aes-256-cbc|aes-256-gcm|des|des3|rc4|blowfish)[^'\"]*['\"]",
        "algo_group": 1,
        "primitive": CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER,
        "framework": "Node.js crypto"
    },
    {
        "lang": "javascript",
        "regex": r"generateKeyPair(?:Sync)?\s*\(\s*['\"](rsa|ec|dsa|ed25519)['\"](?:[^{]*{\s*modulusLength:\s*(\d+))?",
        "algo_group": 1,
        "key_group": 2,
        "primitive": CryptoPrimitive.DIGITAL_SIGNATURE,
        "framework": "Node.js crypto"
    },
    {
        "lang": "javascript",
        "regex": r"window\.crypto\.subtle\.generateKey\s*\(\s*{\s*name:\s*['\"](RSA-OAEP|RSASSA-PKCS1-v1_5|ECDSA|ECDH|AES-GCM|AES-CBC)['\"](?:[^}]*modulusLength:\s*(\d+))?",
        "algo_group": 1,
        "key_group": 2,
        "framework": "Web Crypto API"
    },
    {
        "lang": "javascript",
        "regex": r"CryptoJS\.(MD5|SHA1|SHA256|AES|DES|TripleDES|RC4)\s*\(",
        "algo_group": 1,
        "framework": "CryptoJS"
    },

    # --- Java (java.security / javax.crypto) ---
    {
        "lang": "java",
        "regex": r"MessageDigest\.getInstance\s*\(\s*\"(MD5|SHA-1|SHA-256|SHA-384|SHA-512|SHA3-256|SHA3-512)\"\s*\)",
        "algo_group": 1,
        "primitive": CryptoPrimitive.HASH_FUNCTION,
        "framework": "java.security.MessageDigest"
    },
    {
        "lang": "java",
        "regex": r"Cipher\.getInstance\s*\(\s*\"(AES|DES|DESede|RSA|Blowfish|RC4)(?:/([A-Z0-9]+)/[A-Za-z0-9]+)?\"\s*\)",
        "algo_group": 1,
        "mode_group": 2,
        "primitive": CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER,
        "framework": "javax.crypto.Cipher"
    },
    {
        "lang": "java",
        "regex": r"KeyPairGenerator\.getInstance\s*\(\s*\"(RSA|EC|DiffieHellman|DSA)\"\s*\)(?:[\s\S]{0,100}?initialize\s*\(\s*(\d+)\s*\))?",
        "algo_group": 1,
        "key_group": 2,
        "framework": "java.security.KeyPairGenerator"
    },

    # --- Go ---
    {
        "lang": "go",
        "regex": r"(?:md5|sha1|des|rc4)\.New\s*\(",
        "algo_group": 0,
        "primitive": CryptoPrimitive.HASH_FUNCTION,
        "framework": "Go crypto"
    },
    {
        "lang": "go",
        "regex": r"rsa\.GenerateKey\s*\(\s*rand\.Reader,\s*(\d+)\s*\)",
        "algo": "RSA",
        "primitive": CryptoPrimitive.PUBLIC_KEY_ENCRYPTION,
        "key_group": 1,
        "framework": "Go crypto/rsa"
    },
    {
        "lang": "go",
        "regex": r"ecdsa\.GenerateKey\s*\(\s*(?:elliptic\.(P224|P256|P384|P521))",
        "algo": "ECDSA",
        "primitive": CryptoPrimitive.DIGITAL_SIGNATURE,
        "curve_group": 1,
        "framework": "Go crypto/ecdsa"
    },

    # --- Hardcoded Private Keys ---
    {
        "lang": "generic",
        "regex": r"-----BEGIN (RSA|EC|DSA|ENCRYPTED)?\s?PRIVATE KEY-----",
        "algo_group": 1,
        "primitive": CryptoPrimitive.PUBLIC_KEY_ENCRYPTION,
        "framework": "Hardcoded Key PEM"
    }
]

class PythonCryptoASTVisitor(ast.NodeVisitor):
    """Deep Python AST visitor discovering cryptographic primitives with exact purpose classification."""
    def __init__(self, source_lines: list[str], file_path: str):
        self.source_lines = source_lines
        self.file_path = file_path
        self.findings: list[CryptoFinding] = []

    def _get_snippet(self, lineno: int) -> str:
        start = max(0, lineno - 2)
        end = min(len(self.source_lines), lineno + 2)
        return "\n".join(self.source_lines[start:end]).strip()

    def visit_Call(self, node: ast.Call):
        func_name = ""
        if isinstance(node.func, ast.Attribute):
            func_name = node.func.attr
            
            # Detect hashlib.md5(), hashlib.sha1(), etc.
            if isinstance(node.func.value, ast.Name) and node.func.value.id == "hashlib":
                algo = func_name.upper()
                info = get_pqc_recommendation(algo, primitive=CryptoPrimitive.HASH_FUNCTION)
                classical_bits = get_classical_security_bits(algo)
                self.findings.append(CryptoFinding(
                    id=str(uuid.uuid4()),
                    algorithm=algo,
                    primitive=CryptoPrimitive.HASH_FUNCTION,
                    classical_security_bits=classical_bits,
                    risk_level=info["risk"],
                    risk_reason=info["reason"],
                    nist_replacement=info["nist_replacement"],
                    nist_standard=info["nist_standard"],
                    file_path=self.file_path,
                    line_number=node.lineno,
                    code_snippet=self._get_snippet(node.lineno),
                    framework_or_library="Python hashlib",
                    confidence=0.98,
                    oid=info.get("oid"),
                    quantum_security_level=info.get("quantum_security_level", 0),
                    ai_confidence_estimate=0.98
                ))

            # Detect RSA.generate(bits)
            if func_name == "generate" and isinstance(node.func.value, ast.Attribute) and node.func.value.attr == "RSA":
                key_size = 2048
                if node.args and isinstance(node.args[0], ast.Constant) and isinstance(node.args[0].value, int):
                    key_size = node.args[0].value
                algo_str = f"RSA-{key_size}"
                info = get_pqc_recommendation(algo_str, primitive=CryptoPrimitive.PUBLIC_KEY_ENCRYPTION, key_size=key_size)
                classical_bits = get_classical_security_bits(algo_str, key_size=key_size)
                self.findings.append(CryptoFinding(
                    id=str(uuid.uuid4()),
                    algorithm=algo_str,
                    primitive=CryptoPrimitive.PUBLIC_KEY_ENCRYPTION,
                    key_size=key_size,
                    classical_security_bits=classical_bits,
                    risk_level=info["risk"],
                    risk_reason=info["reason"],
                    nist_replacement=info["nist_replacement"],
                    nist_standard=info["nist_standard"],
                    file_path=self.file_path,
                    line_number=node.lineno,
                    code_snippet=self._get_snippet(node.lineno),
                    framework_or_library="PyCryptodome RSA",
                    confidence=0.99,
                    oid=info.get("oid"),
                    quantum_security_level=info.get("quantum_security_level", 0),
                    ai_confidence_estimate=0.99
                ))

            # Detect generate_private_key(key_size=...) in cryptography.hazmat
            if func_name == "generate_private_key":
                key_size = 2048
                for kw in node.keywords:
                    if kw.arg == "key_size" and isinstance(kw.value, ast.Constant) and isinstance(kw.value.value, int):
                        key_size = kw.value.value
                algo_str = f"RSA-{key_size}"
                info = get_pqc_recommendation(algo_str, primitive=CryptoPrimitive.PUBLIC_KEY_ENCRYPTION, key_size=key_size)
                classical_bits = get_classical_security_bits(algo_str, key_size=key_size)
                self.findings.append(CryptoFinding(
                    id=str(uuid.uuid4()),
                    algorithm=algo_str,
                    primitive=CryptoPrimitive.PUBLIC_KEY_ENCRYPTION,
                    key_size=key_size,
                    classical_security_bits=classical_bits,
                    risk_level=info["risk"],
                    risk_reason=info["reason"],
                    nist_replacement=info["nist_replacement"],
                    nist_standard=info["nist_standard"],
                    file_path=self.file_path,
                    line_number=node.lineno,
                    code_snippet=self._get_snippet(node.lineno),
                    framework_or_library="cryptography.hazmat.primitives.asymmetric.rsa",
                    confidence=0.99,
                    oid=info.get("oid"),
                    quantum_security_level=info.get("quantum_security_level", 0),
                    ai_confidence_estimate=0.99
                ))

            # Detect AES.new(..., AES.MODE_ECB)
            if func_name == "new" and isinstance(node.func.value, ast.Attribute) and node.func.value.attr == "AES":
                mode = "CBC"
                for arg in node.args:
                    if isinstance(arg, ast.Attribute) and "MODE_" in arg.attr:
                        mode = arg.attr.replace("MODE_", "")
                algo_str = f"AES-{mode}" if mode == "ECB" else "AES-128"
                info = get_pqc_recommendation(algo_str, primitive=CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER)
                classical_bits = 128
                self.findings.append(CryptoFinding(
                    id=str(uuid.uuid4()),
                    algorithm=algo_str,
                    primitive=CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER,
                    mode_of_operation=mode,
                    classical_security_bits=classical_bits,
                    risk_level=info["risk"],
                    risk_reason=info["reason"],
                    nist_replacement=info["nist_replacement"],
                    nist_standard=info["nist_standard"],
                    file_path=self.file_path,
                    line_number=node.lineno,
                    code_snippet=self._get_snippet(node.lineno),
                    framework_or_library="PyCryptodome AES",
                    confidence=0.96,
                    oid=info.get("oid"),
                    quantum_security_level=info.get("quantum_security_level", 0),
                    ai_confidence_estimate=0.96
                ))

        self.generic_visit(node)


class StaticCryptoScanner:
    """Static Code Scanner for Multi-Language Cryptographic Discovery."""

    def __init__(self):
        self.logs: list[str] = []

    def _log(self, message: str):
        self.logs.append(message)

    def scan_file(self, file_path: Path, rel_path: str) -> list[CryptoFinding]:
        findings: list[CryptoFinding] = []
        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
            lines = content.splitlines()
        except Exception as e:
            self._log(f"⚠️ Could not read {rel_path}: {e}")
            return findings

        ext = file_path.suffix.lower()

        # 1. Python AST parsing for high-fidelity discovery
        if ext == ".py":
            try:
                tree = ast.parse(content, filename=str(file_path))
                visitor = PythonCryptoASTVisitor(lines, rel_path)
                visitor.visit(tree)
                findings.extend(visitor.findings)
            except Exception as e:
                self._log(f"ℹ️ AST parse fallback for {rel_path}: {e}")

        # 2. Multi-Language Regex Scanner (JS, TS, Java, Go, Python, Configs)
        for pattern_def in REGEX_PATTERNS:
            regex = pattern_def["regex"]
            framework = pattern_def.get("framework", "Standard Library")
            defined_primitive = pattern_def.get("primitive")

            for match in re.finditer(regex, content, re.IGNORECASE):
                char_idx = match.start()
                line_no = content[:char_idx].count("\n") + 1

                algo = ""
                if "algo" in pattern_def:
                    algo = pattern_def["algo"]
                elif "algo_group" in pattern_def:
                    g_idx = pattern_def["algo_group"]
                    if g_idx == 0:
                        algo = match.group(0).split(".")[0].upper()
                    else:
                        algo = match.group(g_idx) or ""
                
                algo = algo.strip().upper()
                if not algo:
                    continue

                key_size: Optional[int] = None
                if "key_group" in pattern_def:
                    kg = pattern_def["key_group"]
                    if isinstance(kg, tuple):
                        for k_idx in kg:
                            val = match.group(k_idx)
                            if val and val.isdigit():
                                key_size = int(val)
                                break
                    elif isinstance(kg, int):
                        val = match.group(kg)
                        if val and val.isdigit():
                            key_size = int(val)

                if algo == "RSA" and key_size:
                    algo = f"RSA-{key_size}"
                elif algo in ["MD5", "SHA1", "SHA256", "SHA384", "SHA512"]:
                    algo = algo.replace("SHA", "SHA-") if "SHA-" not in algo else algo
                elif algo.startswith("AES") and "ECB" in match.group(0).upper():
                    algo = "AES-ECB"

                # Deduce primitive if not predefined
                if defined_primitive:
                    prim = defined_primitive
                elif "RSA-OAEP" in algo or "ECDH" in algo:
                    prim = CryptoPrimitive.KEY_AGREEMENT if "ECDH" in algo else CryptoPrimitive.KEY_ENCAPSULATION
                elif "ECDSA" in algo or "DSA" in algo or "RSASSA" in algo:
                    prim = CryptoPrimitive.DIGITAL_SIGNATURE
                elif "MD5" in algo or "SHA" in algo:
                    prim = CryptoPrimitive.HASH_FUNCTION
                elif "RC4" in algo:
                    prim = CryptoPrimitive.SYMMETRIC_STREAM_CIPHER
                else:
                    prim = CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER

                start = max(0, line_no - 2)
                end = min(len(lines), line_no + 2)
                snippet = "\n".join(lines[start:end]).strip()

                if any(f.file_path == rel_path and f.line_number == line_no and f.algorithm.split("-")[0] == algo.split("-")[0] for f in findings):
                    continue

                info = get_pqc_recommendation(algo, primitive=prim, key_size=key_size)
                classical_bits = get_classical_security_bits(algo, key_size=key_size)

                findings.append(CryptoFinding(
                    id=str(uuid.uuid4()),
                    algorithm=algo,
                    primitive=prim,
                    key_size=key_size,
                    classical_security_bits=classical_bits,
                    risk_level=info["risk"],
                    risk_reason=info["reason"],
                    nist_replacement=info["nist_replacement"],
                    nist_standard=info["nist_standard"],
                    file_path=rel_path,
                    line_number=line_no,
                    code_snippet=snippet,
                    framework_or_library=framework,
                    confidence=0.92,
                    oid=info.get("oid"),
                    quantum_security_level=info.get("quantum_security_level", 0),
                    ai_confidence_estimate=0.92
                ))

        return findings

    def scan_directory(self, root_dir: Path, target_name: str = "Codebase") -> StaticScanResult:
        self.logs = []
        self._log(f"▶ Initializing Aegis-Q AST & Static Cryptographic Scanner on '{target_name}'...")
        
        all_findings: list[CryptoFinding] = []
        file_count = 0
        languages_seen = set()

        for file_path, rel_path in traverse_source_files(root_dir):
            file_count += 1
            ext = file_path.suffix.lower()
            if ext == ".py":
                languages_seen.add("Python")
            elif ext in [".js", ".jsx", ".ts", ".tsx"]:
                languages_seen.add("JavaScript/TypeScript")
            elif ext == ".java":
                languages_seen.add("Java")
            elif ext == ".go":
                languages_seen.add("Go")
            elif ext in [".c", ".cpp", ".h"]:
                languages_seen.add("C/C++")

            file_findings = self.scan_file(file_path, rel_path)
            if file_findings:
                for f in file_findings:
                    if f.risk_level in [QuantumRiskLevel.CRITICAL_SHOR, QuantumRiskLevel.HIGH_SHOR]:
                        self._log(f"🔴 Detected Shor-vulnerable {f.algorithm} ({f.primitive.value}) at {rel_path}:{f.line_number}")
                    elif f.risk_level == QuantumRiskLevel.DEPRECATED_CLASSICAL:
                        self._log(f"⚠️ Detected Deprecated {f.algorithm} at {rel_path}:{f.line_number}")
                    elif f.risk_level == QuantumRiskLevel.MEDIUM_GROVER:
                        self._log(f"🟡 Detected Grover-affected {f.algorithm} at {rel_path}:{f.line_number}")
                    else:
                        self._log(f"🟢 Found {f.algorithm} at {rel_path}:{f.line_number}")
                all_findings.extend(file_findings)

        # Compute quantum score and risk counts
        shor_count = sum(1 for f in all_findings if f.risk_level in [QuantumRiskLevel.CRITICAL_SHOR, QuantumRiskLevel.HIGH_SHOR])
        grover_count = sum(1 for f in all_findings if f.risk_level == QuantumRiskLevel.MEDIUM_GROVER)
        deprecated_count = sum(1 for f in all_findings if f.risk_level == QuantumRiskLevel.DEPRECATED_CLASSICAL)
        safe_count = sum(1 for f in all_findings if f.risk_level == QuantumRiskLevel.QUANTUM_RESISTANT)

        # Heuristic Readiness Score calculation (0 to 100)
        total_crypto = len(all_findings)
        if total_crypto == 0:
            quantum_score = 100
            hndl_rating = "ZERO RISK (No Cryptography Found)"
        else:
            penalty = (shor_count * 35) + (deprecated_count * 20) + (grover_count * 10)
            base_score = max(0, 100 - penalty)
            safe_boost = int((safe_count / total_crypto) * 20)
            quantum_score = min(100, max(5 if (shor_count > 0 or deprecated_count > 0) else 100, base_score + safe_boost))

            if shor_count > 0:
                hndl_rating = "CRITICAL (Immediate Harvest Now, Decrypt Later Exposure)"
            elif deprecated_count > 0:
                hndl_rating = "HIGH (Immediate Classical Exploit Risk)"
            elif grover_count > 0:
                hndl_rating = "MODERATE (Upgrade to 256-bit Key Lengths)"
            else:
                hndl_rating = "EXCELLENT (Quantum-Resistant)"

        self._log(f"▶ Scan complete. Discovered {len(all_findings)} cryptographic assets across {file_count} files.")
        self._log(f"▶ Aegis-Q Quantum Readiness Index (Heuristic): {quantum_score}% | Shor-vulnerable: {shor_count} | Grover-degraded: {grover_count}")

        return StaticScanResult(
            scan_id=str(uuid.uuid4()),
            target_name=target_name,
            total_files_scanned=file_count,
            total_crypto_assets=len(all_findings),
            quantum_readiness_score=quantum_score,
            hndl_exposure_rating=hndl_rating,
            shor_broken_count=shor_count,
            grover_degraded_count=grover_count,
            deprecated_classical_count=deprecated_count,
            quantum_resistant_count=safe_count,
            findings=all_findings,
            scan_logs=self.logs,
            scanned_languages=list(languages_seen) or ["General Source Code"]
        )

static_scanner = StaticCryptoScanner()
