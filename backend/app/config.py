import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    app_name: str = "Aegis-Q Post-Quantum Cryptographic Discovery & Analysis"
    app_version: str = "1.0.0"
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    environment: str = os.getenv("ENVIRONMENT", "development")
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    max_upload_size_mb: int = 50

settings = Settings()
