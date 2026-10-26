from fastapi import APIRouter, HTTPException, Path, Body
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
from ..database import get_db_connection, fetch_full_stages, reset_to_exemplar, INITIAL_STAGES_DEFINITIONS
from ..models import StageHeaderUpdate, PromptModel

router = APIRouter(prefix="/api/stages", tags=["Stages S1-S11 Dossier"])

@router.get("", response_model=List[Dict[str, Any]])
async def get_all_stages():
    """Retrieve all S1-S11 stages with prompts and media attachments."""
    return await fetch_full_stages()

@router.get("/{stage_id}")
async def get_stage(stage_id: str = Path(..., description="Stage ID, e.g. S1, S2")):
    stages = await fetch_full_stages()
    for s in stages:
        if s["id"].upper() == stage_id.upper():
            return s
    raise HTTPException(status_code=404, detail=f"Stage {stage_id} not found")

@router.put("/{stage_id}")
async def update_stage_header(
    stage_id: str,
    update: StageHeaderUpdate
):
    """Update stage title, driving question, or status."""
    now = datetime.utcnow().isoformat()
    async with get_db_connection() as db:
        async with db.execute("SELECT * FROM stages WHERE id = ?", (stage_id.upper(),)) as cur:
            stage = await cur.fetchone()
            if not stage:
                raise HTTPException(status_code=404, detail="Stage not found")
        
        title = update.title if update.title is not None else stage["title"]
        question = update.question if update.question is not None else stage["question"]
        status_val = update.status if update.status is not None else stage["status"]

        await db.execute("""
            UPDATE stages
            SET title = ?, question = ?, status = ?, updated_at = ?
            WHERE id = ?
        """, (title, question, status_val, now, stage_id.upper()))
        await db.commit()

    return {"status": "success", "stageId": stage_id.upper(), "title": title, "question": question, "stageStatus": status_val}

# ---------------------------------------------------------------------------
# PROMPT DELIVERABLE CRUD
# ---------------------------------------------------------------------------
@router.post("/{stage_id}/prompts")
async def add_prompt(stage_id: str, prompt_data: PromptModel):
    now = datetime.utcnow().isoformat()
    async with get_db_connection() as db:
        async with db.execute("SELECT * FROM stages WHERE id = ?", (stage_id.upper(),)) as cur:
            if not await cur.fetchone():
                raise HTTPException(status_code=404, detail="Stage not found")
        
        cursor = await db.execute("""
            INSERT INTO stage_prompts (stage_id, prompt_code, title, content, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, 0, ?, ?)
        """, (stage_id.upper(), prompt_data.promptId, prompt_data.title, prompt_data.prompt, now, now))
        new_id = cursor.lastrowid
        await db.commit()

    return {
        "status": "success",
        "id": new_id,
        "promptId": prompt_data.promptId,
        "title": prompt_data.title,
        "prompt": prompt_data.prompt
    }

@router.put("/{stage_id}/prompts/{prompt_id}")
async def update_prompt(stage_id: str, prompt_id: int, prompt_data: PromptModel):
    now = datetime.utcnow().isoformat()
    async with get_db_connection() as db:
        async with db.execute("SELECT * FROM stage_prompts WHERE id = ? AND stage_id = ?", (prompt_id, stage_id.upper())) as cur:
            if not await cur.fetchone():
                raise HTTPException(status_code=404, detail="Prompt not found")

        await db.execute("""
            UPDATE stage_prompts
            SET prompt_code = ?, title = ?, content = ?, updated_at = ?
            WHERE id = ?
        """, (prompt_data.promptId, prompt_data.title, prompt_data.prompt, now, prompt_id))
        await db.commit()

    return {
        "status": "success",
        "id": prompt_id,
        "promptId": prompt_data.promptId,
        "title": prompt_data.title,
        "prompt": prompt_data.prompt
    }

@router.delete("/{stage_id}/prompts/{prompt_id}")
async def delete_prompt(stage_id: str, prompt_id: int):
    async with get_db_connection() as db:
        await db.execute("DELETE FROM stage_prompts WHERE id = ? AND stage_id = ?", (prompt_id, stage_id.upper()))
        await db.commit()
    return {"status": "success", "message": f"Prompt {prompt_id} deleted"}

# ---------------------------------------------------------------------------
# MEDIA ATTACHMENTS (IMAGE, GRAPH, CAD, VIDEO)
# ---------------------------------------------------------------------------
@router.post("/{stage_id}/media")
async def add_media_to_stage(stage_id: str, media_item: Dict[str, Any] = Body(...)):
    now = datetime.utcnow().isoformat()
    media_type = media_item.get("type", "image")
    title = media_item.get("title", "Engineering Attachment")
    caption = media_item.get("caption", "")
    source_type = media_item.get("sourceType", "preset")
    
    # Determine source value
    source_val = ""
    if media_type == "image":
        source_val = media_item.get("presetKey") or media_item.get("url") or media_item.get("fileUrl") or ""
    elif media_type == "graph":
        source_val = media_item.get("presetKey") or media_item.get("imageUrl") or ""
        source_type = media_item.get("graphMode", source_type)
    elif media_type == "cad":
        source_val = media_item.get("presetKey") or media_item.get("fileUrl") or ""
        source_type = media_item.get("cadSource", source_type)
    elif media_type == "video":
        source_val = media_item.get("fileName") or media_item.get("videoUrl") or ""
        source_type = media_item.get("videoSource", source_type)

    meta_json = json.dumps(media_item)

    async with get_db_connection() as db:
        cursor = await db.execute("""
            INSERT INTO stage_media (stage_id, media_type, title, caption, source_type, source_val, meta_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (stage_id.upper(), media_type, title, caption, source_type, source_val, meta_json, now))
        new_id = cursor.lastrowid
        await db.commit()

    return {"status": "success", "mediaId": new_id, "stageId": stage_id.upper()}

@router.delete("/{stage_id}/media/{media_id}")
async def delete_media(stage_id: str, media_id: int):
    async with get_db_connection() as db:
        await db.execute("DELETE FROM stage_media WHERE id = ? AND stage_id = ?", (media_id, stage_id.upper()))
        await db.commit()
    return {"status": "success", "message": f"Media {media_id} deleted"}

# ---------------------------------------------------------------------------
# RESET & EXEMPLAR ACTIONS
# ---------------------------------------------------------------------------
@router.post("/exemplar")
async def load_exemplar():
    """Reset and load complete exemplar capstone project data into SQLite database."""
    await reset_to_exemplar()
    return {"status": "success", "message": "Exemplar capstone project loaded successfully"}

@router.post("/reset-empty")
async def reset_empty():
    """Reset to pristine empty S1-S11 stages."""
    async with get_db_connection() as db:
        await db.execute("DELETE FROM stage_media")
        await db.execute("DELETE FROM stage_prompts")
        await db.execute("DELETE FROM stages")
        now = datetime.utcnow().isoformat()
        for idx, (s_id, num, title, question, status) in enumerate(INITIAL_STAGES_DEFINITIONS):
            await db.execute("""
                INSERT INTO stages (id, number, title, question, status, sort_order, updated_at)
                VALUES (?, ?, ?, ?, 'In Progress', ?, ?)
            """, (s_id, num, title, question, idx + 1, now))
        await db.commit()
    return {"status": "success", "message": "Stages reset to empty default"}
