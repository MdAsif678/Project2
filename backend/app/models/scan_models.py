from typing import Optional
from pydantic import BaseModel, Field
from app.models.quantum_risk import QuantumRiskLevel, CryptoPrimitive

class CryptoFinding(BaseModel):
    id: str = Field(..., description="Unique UUID for finding")
    algorithm: str = Field(..., description="Detected algorithm (e.g. RSA-2048, MD5, AES-128)")
    primitive: CryptoPrimitive = Field(..., description="Cryptographic primitive category")
    key_size: Optional[int] = Field(None, description="Key length in bits if detected")
    curve_name: Optional[str] = Field(None, description="Elliptic curve name if applicable")
    mode_of_operation: Optional[str] = Field(None, description="Cipher mode (e.g. CBC, ECB, GCM)")
    classical_security_bits: Optional[int] = Field(None, description="Calculated classical security strength in bits")
    risk_level: QuantumRiskLevel = Field(..., description="Quantum & Classical threat classification")
    risk_reason: str = Field(..., description="Explanation of why this algorithm is vulnerable")
    nist_replacement: str = Field(..., description="Recommended NIST post-quantum standard")
    nist_standard: str = Field(..., description="Target NIST FIPS category (e.g. ML-KEM, ML-DSA)")
    file_path: Optional[str] = Field(None, description="Relative file path where discovered")
    line_number: Optional[int] = Field(None, description="Line number of usage")
    code_snippet: Optional[str] = Field(None, description="Discovered source code snippet")
    framework_or_library: Optional[str] = Field(None, description="Detected crypto package (e.g. hashlib, PyCryptodome, Node crypto)")
    confidence: float = Field(0.95, description="Confidence score 0.0 to 1.0")
    oid: Optional[str] = Field(None, description="Object Identifier if known; omitted if unknown")
    quantum_security_level: int = Field(0, description="NIST Quantum Security Level (0 to 5)")
    ai_confidence_estimate: float = Field(0.95, description="Estimated AI recommendation confidence")

class TlsHandshakeStep(BaseModel):
    step_number: int
    name: str
    status: str  # "completed", "active", "pending", "failed"
    detail: str
    timestamp_ms: float

class TlsCertificateInfo(BaseModel):
    subject: dict[str, str] = {}
    issuer: dict[str, str] = {}
    valid_from: Optional[str] = None
    valid_to: Optional[str] = None
    days_remaining: Optional[int] = None
    signature_algorithm: str = "Unknown"
    public_key_type: str = "Unknown"
    public_key_bits: Optional[int] = None
    curve_name: Optional[str] = None
    classical_security_bits: Optional[int] = None
    subject_alt_names: list[str] = []
    serial_number: Optional[str] = None
    is_quantum_vulnerable: bool = True
    quantum_risk: QuantumRiskLevel = QuantumRiskLevel.CRITICAL_SHOR

class TlsCipherInfo(BaseModel):
    cipher_suite: str
    protocol_version: str  # TLSv1.3, TLSv1.2, etc.
    key_exchange: str
    encryption: str
    mac_or_hash: str
    quantum_risk: QuantumRiskLevel
    is_pqc_hybrid: bool = False

class DynamicScanResult(BaseModel):
    target_host: str
    target_port: int
    resolved_ip: Optional[str] = None
    tls_version: str
    cipher_info: TlsCipherInfo
    certificate: TlsCertificateInfo
    supported_protocols: list[str] = []
    supported_ciphers: list[str] = []
    handshake_steps: list[TlsHandshakeStep] = []
    quantum_readiness_score: int  # 0 - 100 heuristic
    hndl_exposure_rating: str     # e.g. "CRITICAL (8-12 Years)"
    shor_vulnerable_count: int
    grover_vulnerable_count: int
    findings: list[CryptoFinding] = []

class StaticScanResult(BaseModel):
    scan_id: str
    target_name: str
    total_files_scanned: int
    total_crypto_assets: int
    quantum_readiness_score: int  # 0 - 100 heuristic
    hndl_exposure_rating: str     # e.g. "HIGH EXPOSURE"
    shor_broken_count: int
    grover_degraded_count: int
    deprecated_classical_count: int
    quantum_resistant_count: int
    findings: list[CryptoFinding] = []
    scan_logs: list[str] = []
    scanned_languages: list[str] = []

class RemediationRequest(BaseModel):
    finding: CryptoFinding
    user_api_key: Optional[str] = None
    custom_context: Optional[str] = None

class RemediationResponse(BaseModel):
    finding_id: str
    algorithm: str
    target_fips: str
    original_code: str
    patched_code: str
    unified_diff: str
    why_vulnerable: str
    what_changed: list[str]
    nist_reference: str
    nist_link: str
    confidence_score: int = 95
    ai_confidence_estimate: float = 0.95
    is_offline_template: bool = False
    requires_manual_review: bool = False
    validation_notice: str = "AI-assisted migration patch requiring developer validation and unit testing."
    required_dependencies: list[str] = []
