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

if __name__ == "__main__":
    print("=" * 70)
    print("  KLE TECHNOLOGICAL UNIVERSITY - CAPSTONE PORTAL BACKEND")
    print("  FastAPI Server starting on http://127.0.0.1:8000")
    print("  Interactive API Swagger Docs: http://127.0.0.1:8000/docs")
    print("  Web App Frontend: http://127.0.0.1:8000/")
    print("=" * 70)
    uvicorn.run(
        "backend.app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
        log_level="info"
    )
