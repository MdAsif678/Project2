import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.routers import scan, cbom, remediate

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="SIH26164 Quantum-Safe Cryptographic Discovery, CBOM Generation & NIST PQC Migration Engine."
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(scan.router)
app.include_router(cbom.router)
app.include_router(remediate.router)

# Static Files & Dashboard Mounting
static_dir = Path(__file__).resolve().parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.get("/")
async def serve_dashboard():
    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {
        "status": "online",
        "service": "Aegis-Q Cryptographic Discovery Engine",
        "version": settings.app_version,
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "quantum_engine": "ready",
        "cyclonedx_version": "1.6"
    }
