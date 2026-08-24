import shutil
import tempfile
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.services.static_scanner import static_scanner
from app.services.dynamic_scanner import dynamic_scanner
from app.utils.file_extractor import extract_zip_safely
from app.models.scan_models import StaticScanResult, DynamicScanResult

router = APIRouter(prefix="/api/scan", tags=["Scanning Engines"])

class DynamicScanBody(BaseModel):
    url: str
    port: Optional[int] = 443

@router.post("/static", response_model=StaticScanResult)
async def scan_codebase_zip(file: UploadFile = File(...)):
    """Upload and perform full AST & Regex cryptographic discovery on a codebase ZIP archive."""
    if not file.filename or not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip codebase archives are supported.")

    try:
        content = await file.read()
        extracted_dir, file_list = extract_zip_safely(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to unpack ZIP archive: {str(e)}")

    try:
        scan_result = static_scanner.scan_directory(extracted_dir, target_name=file.filename)
        return scan_result
    finally:
        # Cleanup temporary directory
        if extracted_dir.parent.exists():
            shutil.rmtree(extracted_dir.parent, ignore_errors=True)

@router.post("/dynamic", response_model=DynamicScanResult)
async def scan_live_endpoint(payload: DynamicScanBody):
    """Perform a live SSL/TLS socket handshake inspection against a target domain/endpoint."""
    if not payload.url or not payload.url.strip():
        raise HTTPException(status_code=400, detail="Target URL/domain is required.")

    result = dynamic_scanner.scan_endpoint(payload.url, payload.port)
    return result

@router.get("/demo/{demo_id}", response_model=StaticScanResult)
async def scan_demo_dataset(demo_id: str):
    """Instant execution on pre-loaded vulnerable codebase fixtures (Bank App, Node Crypto, Secure Reference)."""
    samples_dir = Path(__file__).resolve().parent.parent.parent / "samples"
    
    target_name = "Demo Codebase"
    single_file = None
    
    if demo_id == "bank-app":
        single_file = samples_dir / "vulnerable_bank_app.py"
        target_name = "Vulnerable Core Banking Backend (Python)"
    elif demo_id == "node-crypto":
        single_file = samples_dir / "legacy_crypto_node.js"
        target_name = "Legacy E-Commerce Authentication Service (Node.js)"
    elif demo_id == "java-enterprise":
        single_file = samples_dir / "LegacyEnterpriseSecurity.java"
        target_name = "Legacy Payment Gateway (Java Enterprise)"
    elif demo_id in ["secure-ref", "quantum-safe"]:
        single_file = samples_dir / "quantum_safe_stack.py"
        target_name = "Post-Quantum Reference Stack (ML-KEM, ML-DSA, AES-256)"
    else:
        single_file = samples_dir / "vulnerable_bank_app.py"
        target_name = "Quantum-Vulnerable Core Banking Backend"

    if single_file and single_file.exists():
        # Create a temp dir with just this file to provide an isolated demo scan
        temp_dir = Path(tempfile.mkdtemp(prefix="aegis_demo_"))
        try:
            dest = temp_dir / single_file.name
            shutil.copy2(single_file, dest)
            return static_scanner.scan_directory(temp_dir, target_name=target_name)
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    return static_scanner.scan_directory(samples_dir, target_name=target_name)
