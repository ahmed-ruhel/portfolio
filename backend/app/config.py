import os
from pathlib import Path

# Base Paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_DIR = BACKEND_DIR / "data"
UPLOADS_DIR = BACKEND_DIR / "uploads"

# Sub-upload directories
CAD_UPLOAD_DIR = UPLOADS_DIR / "cad"
IMAGES_UPLOAD_DIR = UPLOADS_DIR / "images"
DATA_UPLOAD_DIR = UPLOADS_DIR / "data"
VIDEOS_UPLOAD_DIR = UPLOADS_DIR / "videos"

# Ensure all directories exist
for folder in [DATA_DIR, UPLOADS_DIR, CAD_UPLOAD_DIR, IMAGES_UPLOAD_DIR, DATA_UPLOAD_DIR, VIDEEOS_UPLOAD_DIR if 'VIDEEOS_UPLOAD_DIR' in locals() else VIDEOS_UPLOAD_DIR]:
    folder.mkdir(parents=True, exist_ok=True)

# Database
SQLITE_DB_PATH = DATA_DIR / "portfolio.db"

# Server Settings
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))

# Allowed Upload Extensions
ALLOWED_CAD_EXTENSIONS = {".stl", ".obj", ".gltf", ".glb", ".step", ".stp", ".iges", ".json"}
ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"}
ALLOWED_DATA_EXTENSIONS = {".csv", ".txt", ".tsv", ".json"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".mkv"}

# Max upload sizes (in bytes)
MAX_CAD_SIZE = 50 * 1024 * 1024      # 50 MB
MAX_IMAGE_SIZE = 20 * 1024 * 1024    # 20 MB
MAX_DATA_SIZE = 15 * 1024 * 1024     # 15 MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024   # 100 MB

# Institutional & Google Email Domains
ALLOWED_DOMAINS = ("@kletech.ac.in", "@bvb.edu", "@gmail.com")

