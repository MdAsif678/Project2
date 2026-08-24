from fastapi import APIRouter
from app.models.scan_models import RemediationRequest, RemediationResponse
from app.services.ai_remediation import ai_remediation_engine

router = APIRouter(prefix="/api/remediate", tags=["AI Remediation"])

@router.post("", response_model=RemediationResponse)
async def generate_pqc_remediation(payload: RemediationRequest):
    """Generate NIST Post-Quantum Cryptography code patches & unified diffs."""
    response = ai_remediation_engine.remediate(payload.finding, payload.user_api_key)
    return response
