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

# Mount Routers under /api
app.include_router(auth.router)
app.include_router(stages.router)
app.include_router(uploads.router)
app.include_router(kinematics.router)
app.include_router(dossier.router)

# Mount Uploads directory
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Frontend Static Assets Serving
@app.get("/", include_in_schema=False)
async def serve_index():
    index_file = PROJECT_ROOT / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return JSONResponse({"status": "API active", "docs": "/docs"})

@app.get("/styles.css", include_in_schema=False)
async def serve_styles():
    css_file = PROJECT_ROOT / "styles.css"
    if css_file.exists():
        return FileResponse(str(css_file), media_type="text/css")
    return JSONResponse(status_code=404, content={"detail": "styles.css not found"})

@app.get("/script.js", include_in_schema=False)
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
