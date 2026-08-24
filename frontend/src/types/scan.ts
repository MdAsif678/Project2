export type QuantumRiskLevel = 
  | 'CRITICAL_SHOR'
  | 'HIGH_SHOR'
  | 'MEDIUM_GROVER'
  | 'LOW_CLASSICAL'
  | 'DEPRECATED_CLASSICAL'
  | 'QUANTUM_RESISTANT';

export type CryptoPrimitive = 
  | 'Key Agreement'
  | 'Key Encapsulation Mechanism'
  | 'Public-Key Encryption'
  | 'Digital Signature'
  | 'Symmetric Block Cipher'
  | 'Symmetric Stream Cipher'
  | 'Hash Function'
  | 'Message Authentication Code';

export interface CryptoFinding {
  id: string;
  algorithm: string;
  primitive: CryptoPrimitive;
  key_size?: number;
  curve_name?: string;
  mode_of_operation?: string;
  classical_security_bits?: number;
  risk_level: QuantumRiskLevel;
  risk_reason: string;
  nist_replacement: string;
  nist_standard: string;
  file_path?: string;
  line_number?: number;
  code_snippet?: string;
  framework_or_library?: string;
  confidence: number;
  oid?: string;
  quantum_security_level: number;
  ai_confidence_estimate?: number;
}

export interface TlsHandshakeStep {
  step_number: number;
  name: string;
  status: 'completed' | 'active' | 'pending' | 'failed';
  detail: string;
  timestamp_ms: number;
}

export interface TlsCertificateInfo {
  subject: Record<string, string>;
  issuer: Record<string, string>;
  valid_from?: string;
  valid_to?: string;
  days_remaining?: number;
  signature_algorithm: string;
  public_key_type: string;
  public_key_bits?: number;
  curve_name?: string;
  classical_security_bits?: number;
  subject_alt_names: string[];
  serial_number?: string;
  is_quantum_vulnerable: boolean;
  quantum_risk: QuantumRiskLevel;
}

export interface TlsCipherInfo {
  cipher_suite: string;
  protocol_version: string;
  key_exchange: string;
  encryption: string;
  mac_or_hash: string;
  quantum_risk: QuantumRiskLevel;
  is_pqc_hybrid: boolean;
}

export interface DynamicScanResult {
  target_host: string;
  target_port: number;
  resolved_ip?: string;
  tls_version: string;
  cipher_info: TlsCipherInfo;
  certificate: TlsCertificateInfo;
  supported_protocols: string[];
  supported_ciphers: string[];
  handshake_steps: TlsHandshakeStep[];
  quantum_readiness_score: number;
  hndl_exposure_rating: string;
  shor_vulnerable_count: number;
  grover_vulnerable_count: number;
  findings: CryptoFinding[];
}

export interface StaticScanResult {
  scan_id: string;
  target_name: string;
  total_files_scanned: number;
  total_crypto_assets: number;
  quantum_readiness_score: number;
  hndl_exposure_rating: string;
  shor_broken_count: number;
  grover_degraded_count: number;
  deprecated_classical_count: number;
  quantum_resistant_count: number;
  findings: CryptoFinding[];
  scan_logs: string[];
  scanned_languages: string[];
}

export interface RemediationResponse {
  finding_id: string;
  algorithm: string;
  target_fips: string;
  original_code: string;
  patched_code: string;
  unified_diff: string;
  why_vulnerable: string;
  what_changed: string[];
  nist_reference: string;
  nist_link: string;
  confidence_score: number;
  ai_confidence_estimate?: number;
  is_offline_template: boolean;
  requires_manual_review?: boolean;
  validation_notice?: string;
  required_dependencies: string[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}
