import sys
import os

# Ensure UTF-8 stdout encoding on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import uvicorn

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

if __name__ == "__main__":
    print("[+] Starting Aegis-Q Post-Quantum Cryptographic Discovery Backend...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
