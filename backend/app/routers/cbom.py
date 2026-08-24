from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any
from app.models.scan_models import CryptoFinding
from app.services.cbom_builder import build_cyclonedx_cbom

router = APIRouter(prefix="/api/cbom", tags=["CBOM Generation"])

class CbomExportRequest(BaseModel):
    target_name: str
    scan_type: str = "static"
    findings: list[CryptoFinding]

@router.post("/export")
async def export_cyclonedx_cbom(payload: CbomExportRequest) -> dict[str, Any]:
    """Generate and return an official CycloneDX v1.6 CBOM document."""
    cbom_json = build_cyclonedx_cbom(
        target_name=payload.target_name,
        findings=payload.findings,
        scan_type=payload.scan_type
    )
    return cbom_json
