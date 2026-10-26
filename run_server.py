"""
Runner script for KLE Capstone Engineering Portal Backend
Starts Uvicorn ASGI server with FastAPI application.
"""
import uvicorn
import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import os

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    print("=" * 70)
    print("  KLE TECHNOLOGICAL UNIVERSITY - CAPSTONE PORTAL BACKEND")
    print(f"  FastAPI Server starting on http://{host}:{port}")
    print(f"  Interactive API Swagger Docs: http://{host}:{port}/docs")
    print(f"  Web App Frontend: http://{host}:{port}/")
    print("=" * 70)
    uvicorn.run(
        "backend.app.main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info"
    )
