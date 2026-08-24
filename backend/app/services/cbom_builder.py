import uuid
from datetime import datetime, timezone
from typing import Any
from app.models.scan_models import CryptoFinding
from app.models.quantum_risk import CryptoPrimitive, get_classical_security_bits

def build_cyclonedx_cbom(
    target_name: str,
    findings: list[CryptoFinding],
    scan_type: str = "static"
) -> dict[str, Any]:
    """Generates an official CycloneDX v1.6 Cryptography Bill of Materials (CBOM) document."""
    
    cbom_components = []

    for idx, f in enumerate(findings):
        # Explicit primitive mapping without loose substring matching
        prim_map = {
            CryptoPrimitive.DIGITAL_SIGNATURE: "digital-signature",
            CryptoPrimitive.KEY_AGREEMENT: "key-agreement",
            CryptoPrimitive.KEY_ENCAPSULATION: "key-encapsulation-mechanism",
            CryptoPrimitive.PUBLIC_KEY_ENCRYPTION: "public-key-encryption",
            CryptoPrimitive.SYMMETRIC_BLOCK_CIPHER: "block-cipher",
            CryptoPrimitive.SYMMETRIC_STREAM_CIPHER: "stream-cipher",
            CryptoPrimitive.HASH_FUNCTION: "message-digest",
            CryptoPrimitive.MAC: "message-authentication-code"
        }
        cdx_prim = prim_map.get(f.primitive, "cryptographic-primitive")

        # Explicit classical security strength (not key size)
        classical_bits = f.classical_security_bits or get_classical_security_bits(f.algorithm, key_size=f.key_size, curve_name=f.curve_name)

        algo_props: dict[str, Any] = {
            "primitive": cdx_prim,
            "parameterSetIdentifier": str(f.key_size) if f.key_size else (f.curve_name or "N/A"),
            "mode": f.mode_of_operation or "N/A",
            "nistQuantumSecurityLevel": f.quantum_security_level
        }
        if classical_bits is not None:
            algo_props["classicalSecurityBits"] = classical_bits

        crypto_props: dict[str, Any] = {
            "assetType": "algorithm",
            "algorithmProperties": algo_props,
            "detectionContext": {
                "location": f.file_path or "Network Endpoint",
                "line": f.line_number or 0,
                "detectedLibrary": f.framework_or_library or "Unknown",
                "confidence": f.confidence
            }
        }

        # ONLY emit OID if known (NEVER emit fake 1.3.6.1.4.1)
        if f.oid:
            crypto_props["oid"] = f.oid

        component_entry = {
            "type": "cryptographic-asset",
            "bom-ref": f"cbom-asset-{idx+1}-{uuid.uuid4().hex[:8]}",
            "name": f.algorithm,
            "version": "1.0",
            "description": f.risk_reason,
            "cryptoProperties": crypto_props,
            "properties": [
                {
                    "name": "aegis:quantumThreatLevel",
                    "value": f.risk_level.value
                },
                {
                    "name": "aegis:nistPqcReplacement",
                    "value": f.nist_replacement
                },
                {
                    "name": "aegis:nistTargetStandard",
                    "value": f.nist_standard
                },
                {
                    "name": "aegis:codeSnippet",
                    "value": (f.code_snippet or "")[:200]
                },
                {
                    "name": "aegis:aiValidationRequired",
                    "value": "true"
                }
            ]
        }
        cbom_components.append(component_entry)

    # CycloneDX 1.6 Envelope
    cbom_document = {
        "bomFormat": "CycloneDX",
        "specVersion": "1.6",
        "serialNumber": f"urn:uuid:{uuid.uuid4()}",
        "version": 1,
        "metadata": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "tools": {
                "components": [
                    {
                        "type": "application",
                        "name": "Aegis-Q Cryptographic Discovery & Post-Quantum Analysis",
                        "version": "1.0.0",
                        "vendor": "SIH26164 Quantum Safe Team",
                        "description": "Automated CBOM Generator & NIST PQC Migration Advisor"
                    }
                ]
            },
            "component": {
                "type": "application" if scan_type == "static" else "service",
                "name": target_name,
                "version": "latest",
                "description": f"Target analyzed by Aegis-Q ({scan_type.upper()} Discovery)"
            },
            "properties": [
                {"name": "totalCryptographicAssets", "value": str(len(findings))},
                {"name": "cycloneDxProfile", "value": "CBOM-1.6-Cryptography"}
            ]
        },
        "components": cbom_components
    }

    return cbom_document
