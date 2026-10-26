import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from .config import PROJECT_ROOT, UPLOADS_DIR, CAD_UPLOAD_DIR, IMAGES_UPLOAD_DIR, DATA_UPLOAD_DIR, VIDEOS_UPLOAD_DIR
from .database import init_db
from .routers import auth, stages, uploads, kinematics, dossier

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize SQLite schema & seed default data
    await init_db()
    yield
    # Shutdown logic if any

app = FastAPI(
    title="KLE Tech Capstone Engineering Portal API",
    description="Backend REST API for Institutional Google SSO, Scotch-Yoke Kinematic Solvers, S1-S11 Stage Dossiers, and CAD/Telemetry Uploads.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for local development and institutional domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Allow Google Sites and institutional portals to embed the site in an iframe
@app.middleware("http")
async def add_iframe_friendly_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = "frame-ancestors *;"
    if "x-frame-options" in response.headers:
        del response.headers["x-frame-options"]
    return response

# Mount Routers under /api
app.include_router(auth.router)
app.include_router(stages.router)
app.include_router(uploads.router)
app.include_router(kinematics.router)
app.include_router(dossier.router)

import base64
from fastapi.responses import Response
from .database import init_db, get_file_from_db

# Auto-restoring uploads route (survives Render restarts)
@app.get("/uploads/{folder}/{filename}", include_in_schema=False)
async def serve_upload_with_db_fallback(folder: str, filename: str):
    file_path = UPLOADS_DIR / folder / filename
    if file_path.exists():
        return FileResponse(str(file_path))
    
    # Check SQLite database for persisted file
    row = await get_file_from_db(filename)
    if row and row.get("data_base64"):
        file_bytes = base64.b64decode(row["data_base64"])
        # Restore to disk cache
        try:
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(file_path, "wb") as f:
                f.write(file_bytes)
        except Exception:
            pass
        return Response(content=file_bytes, media_type=row.get("mime_type", "application/octet-stream"))
    
    return JSONResponse(status_code=404, content={"detail": f"File '{filename}' not found"})

# Mount Uploads directory fallback
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Frontend Static Assets Serving
@app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
async def serve_index():
    index_file = PROJECT_ROOT / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return JSONResponse({"status": "API active", "docs": "/docs"})

@app.api_route("/styles.css", methods=["GET", "HEAD"], include_in_schema=False)
async def serve_styles():
    css_file = PROJECT_ROOT / "styles.css"
    if css_file.exists():
        return FileResponse(str(css_file), media_type="text/css")
    return JSONResponse(status_code=404, content={"detail": "styles.css not found"})

@app.api_route("/script.js", methods=["GET", "HEAD"], include_in_schema=False)
async def serve_script():
    js_file = PROJECT_ROOT / "script.js"
    if js_file.exists():
        return FileResponse(str(js_file), media_type="application/javascript")
    return JSONResponse(status_code=404, content={"detail": "script.js not found"})

@app.get("/api/health", tags=["System Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "KLE Capstone Portal Backend",
        "database": "SQLite (portfolio.db)",
        "uploadsPath": str(UPLOADS_DIR)
    }
