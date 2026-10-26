import os
import uuid
import csv
import io
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from ..config import (
    CAD_UPLOAD_DIR, IMAGES_UPLOAD_DIR, DATA_UPLOAD_DIR, VIDEOS_UPLOAD_DIR,
    ALLOWED_CAD_EXTENSIONS, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_DATA_EXTENSIONS, ALLOWED_VIDEO_EXTENSIONS,
    MAX_CAD_SIZE, MAX_IMAGE_SIZE, MAX_DATA_SIZE, MAX_VIDEO_SIZE
)

router = APIRouter(prefix="/api/uploads", tags=["Engineering Media Uploads"])

def _sanitize_filename(name: str) -> str:
    cleaned = "".join(c for c in name if c.isalnum() or c in (".", "-", "_")).strip()
    return cleaned or "upload_file"

@router.post("/cad")
async def upload_cad_model(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_CAD_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported 3D CAD extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_CAD_EXTENSIONS))}"
        )
    
    contents = await file.read()
    if len(contents) > MAX_CAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"CAD file exceeds max size limit of {MAX_CAD_SIZE // (1024*1024)} MB"
        )
    
    clean_name = _sanitize_filename(file.filename)
    unique_name = f"{uuid.uuid4().hex[:8]}_{clean_name}"
    target_path = CAD_UPLOAD_DIR / unique_name

    with open(target_path, "wb") as f:
        f.write(contents)

    format_label = ext.replace(".", "").upper()
    return {
        "status": "success",
        "fileName": file.filename,
        "format": format_label,
        "sizeBytes": len(contents),
        "fileUrl": f"/uploads/cad/{unique_name}",
        "mimeType": file.content_type
    }

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS))}"
        )
    
    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds max size limit of {MAX_IMAGE_SIZE // (1024*1024)} MB"
        )

    clean_name = _sanitize_filename(file.filename)
    unique_name = f"{uuid.uuid4().hex[:8]}_{clean_name}"
    target_path = IMAGES_UPLOAD_DIR / unique_name

    with open(target_path, "wb") as f:
        f.write(contents)

    return {
        "status": "success",
        "fileName": file.filename,
        "sizeBytes": len(contents),
        "fileUrl": f"/uploads/images/{unique_name}"
    }

@router.post("/csv")
async def upload_and_parse_csv(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_DATA_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported data extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_DATA_EXTENSIONS))}"
        )
    
    contents = await file.read()
    if len(contents) > MAX_DATA_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"CSV file exceeds max size limit of {MAX_DATA_SIZE // (1024*1024)} MB"
        )

    # Save raw file
    clean_name = _sanitize_filename(file.filename)
    unique_name = f"{uuid.uuid4().hex[:8]}_{clean_name}"
    target_path = DATA_UPLOAD_DIR / unique_name
    with open(target_path, "wb") as f:
        f.write(contents)

    # Parse CSV structure
    try:
        text_stream = io.StringIO(contents.decode("utf-8", errors="replace"))
        reader = csv.reader(text_stream)
        rows = [row for row in reader if row and any(c.strip() for c in row)]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    if not rows:
        raise HTTPException(status_code=400, detail="CSV file is empty")

    header = [h.strip() for h in rows[0]]
    data_rows = rows[1:]

    # Build numeric columns
    labels = []
    columns_data = {col_idx: [] for col_idx in range(len(header))}
    for r in data_rows:
        if len(r) > 0:
            labels.append(r[0].strip())
        for c_idx in range(1, min(len(r), len(header))):
            val_str = r[c_idx].strip()
            try:
                num_val = float(val_str)
            except ValueError:
                num_val = 0.0
            columns_data[c_idx].append(num_val)

    # Format into Chart.js datasets
    chart_datasets = []
    colors = ["#c99365", "#10b981", "#0284c7", "#f59e0b", "#ec4899", "#8b5cf6"]
    for c_idx in range(1, len(header)):
        series_label = header[c_idx] or f"Series {c_idx}"
        chart_datasets.append({
            "label": series_label,
            "data": columns_data[c_idx],
            "borderColor": colors[(c_idx - 1) % len(colors)],
            "backgroundColor": colors[(c_idx - 1) % len(colors)] + "22",
            "borderWidth": 2.5
        })

    return {
        "status": "success",
        "fileName": file.filename,
        "fileUrl": f"/uploads/data/{unique_name}",
        "rowCount": len(data_rows),
        "columnHeaders": header,
        "chartConfig": {
            "labels": labels[:50], # sample cap for UI smoothness
            "datasets": chart_datasets
        }
    }

@router.post("/video")
async def upload_simulation_video(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported video extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_VIDEO_EXTENSIONS))}"
        )
    
    contents = await file.read()
    if len(contents) > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Video exceeds max size limit of {MAX_VIDEO_SIZE // (1024*1024)} MB"
        )

    clean_name = _sanitize_filename(file.filename)
    unique_name = f"{uuid.uuid4().hex[:8]}_{clean_name}"
    target_path = VIDEOS_UPLOAD_DIR / unique_name

    with open(target_path, "wb") as f:
        f.write(contents)

    return {
        "status": "success",
        "fileName": file.filename,
        "sizeBytes": len(contents),
        "fileUrl": f"/uploads/videos/{unique_name}"
    }
