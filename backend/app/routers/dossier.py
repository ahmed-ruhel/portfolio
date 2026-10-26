from fastapi import APIRouter, HTTPException, Query, Body
from typing import Dict, Any, List
from datetime import datetime
import json
from ..database import get_db_connection, fetch_full_stages
from ..models import DossierPayload

router = APIRouter(prefix="/api/dossier", tags=["Capstone Engineering Dossier"])

@router.get("/export")
async def export_full_dossier(usn: str = Query("01FE22BME045")):
    """Generates and exports the complete project JSON schema with all S1-S11 stages and media."""
    async with get_db_connection() as db:
        async with db.execute("SELECT * FROM users WHERE usn = ?", (usn.upper(),)) as cur:
            user = await cur.fetchone()
            if not user:
                async with db.execute("SELECT * FROM users LIMIT 1") as cur2:
                    user = await cur2.fetchone()

    stages = await fetch_full_stages()

    return {
        "projectTitle": "Design and Kinematic Synthesis of Opposed Scotch-Yoke Dual Cutter-Bar for Grain Harvesters",
        "schemaVersion": "kle-me-portfolio-v2",
        "institution": "KLE Technological University, Hubballi",
        "exportTimestamp": datetime.utcnow().isoformat(),
        "student": {
            "name": user["name"] if user else "Shrihari V. Katti",
            "usn": user["usn"] if user else "01FE22BME045",
            "email": user["email"] if user else "01fe22bme045@kletech.ac.in",
            "department": user["department"] if user else "Mechanical Engineering",
            "semester": user["semester"] if user else "8th Semester",
            "cgpa": user["cgpa"] if user else 9.42,
            "guide": user["guide"] if user else "Prof. Anand S."
        },
        "kinematics": {
            "architecture": "Opposed Dual-Slider Scotch-Yoke",
            "strokeMm": 76.2,
            "inputRpm": 850,
            "cutterVelocityMs": 3.02,
            "requirementThresholdMs": 1.8,
            "netPrimaryShakeN": 0.0,
            "iso5349AhvMs2": 2.1
        },
        "stages": stages
    }

@router.post("/import")
async def import_dossier(dossier: Dict[str, Any] = Body(...)):
    """Restores full portfolio data from imported JSON schema into SQLite database."""
    stages = dossier.get("stages")
    if not stages or not isinstance(stages, list):
        raise HTTPException(status_code=400, detail="Invalid dossier: 'stages' list is missing")

    now = datetime.utcnow().isoformat()
    async with get_db_connection() as db:
        # Clear existing stages data
        await db.execute("DELETE FROM stage_media")
        await db.execute("DELETE FROM stage_prompts")
        await db.execute("DELETE FROM stages")

        # Insert new stages
        for idx, s in enumerate(stages):
            s_id = s.get("id") or f"S{idx+1}"
            number = s.get("number") or s_id
            title = s.get("title", f"Stage {s_id}")
            question = s.get("question", "")
            status_val = s.get("status", "In Progress")

            await db.execute("""
                INSERT INTO stages (id, number, title, question, status, sort_order, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (s_id, number, title, question, status_val, idx + 1, now))

            # Prompts
            for p_idx, p in enumerate(s.get("prompts", [])):
                p_code = p.get("promptId") or f"{s_id}.{p_idx+1}"
                p_title = p.get("title", "Deliverable")
                p_text = p.get("prompt", "")
                await db.execute("""
                    INSERT INTO stage_prompts (stage_id, prompt_code, title, content, sort_order, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (s_id, p_code, p_title, p_text, p_idx, now, now))

            # Media items
            for m in s.get("media", []):
                m_type = m.get("type", "image")
                m_title = m.get("title", "Attachment")
                m_caption = m.get("caption", "")
                source_type = m.get("sourceType") or m.get("graphMode") or m.get("cadSource") or m.get("videoSource") or "preset"
                source_val = m.get("presetKey") or m.get("url") or m.get("fileUrl") or m.get("imageUrl") or m.get("fileName") or ""
                meta_json = json.dumps(m)

                await db.execute("""
                    INSERT INTO stage_media (stage_id, media_type, title, caption, source_type, source_val, meta_json, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (s_id, m_type, m_title, m_caption, source_type, source_val, meta_json, now))

        # Update student if present
        student_data = dossier.get("student")
        if student_data and isinstance(student_data, dict):
            s_usn = student_data.get("usn", "01FE22BME045").upper()
            s_name = student_data.get("name", "Shrihari V. Katti")
            s_email = student_data.get("email", "01fe22bme045@kletech.ac.in")
            s_dept = student_data.get("department", "Department of Mechanical Engineering")
            s_sem = student_data.get("semester", "8th Semester")
            s_cgpa = float(student_data.get("cgpa", 9.42))
            s_guide = student_data.get("guide", "Prof. Anand S.")

            await db.execute("""
                INSERT INTO users (usn, name, email, department, semester, cgpa, guide, created_at, last_login)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(usn) DO UPDATE SET
                    name = excluded.name,
                    email = excluded.email,
                    department = excluded.department,
                    semester = excluded.semester,
                    cgpa = excluded.cgpa,
                    guide = excluded.guide,
                    last_login = excluded.last_login
            """, (s_usn, s_name, s_email, s_dept, s_sem, s_cgpa, s_guide, now, now))

        await db.execute("""
            INSERT INTO audit_events (action, details, timestamp)
            VALUES (?, ?, ?)
        """, ("IMPORT_DOSSIER", f"Restored {len(stages)} stages from imported dossier schema", now))
        await db.commit()

    return {"status": "success", "message": f"Successfully imported {len(stages)} stages into database"}

@router.get("/summary")
async def get_portfolio_summary():
    """Returns capstone progress metrics and summary statistics."""
    stages = await fetch_full_stages()
    total_stages = len(stages)
    completed_stages = sum(1 for s in stages if s["status"] == "Completed")
    total_prompts = sum(len(s.get("prompts", [])) for s in stages)
    total_media = sum(len(s.get("media", [])) for s in stages)
    
    return {
        "totalStages": total_stages,
        "completedStages": completed_stages,
        "completionPercentage": round((completed_stages / total_stages * 100), 1) if total_stages else 0,
        "totalDeliverables": total_prompts,
        "totalEngineeringMedia": total_media,
        "cadAssembliesCount": sum(1 for s in stages for m in s.get("media", []) if m.get("type") == "cad"),
        "graphsCount": sum(1 for s in stages for m in s.get("media", []) if m.get("type") == "graph"),
        "institutionalVerificationStatus": "Guide Sign-Off Verified" if completed_stages == total_stages else "Verification In-Progress"
    }

@router.post("/publish")
async def publish_portfolio(payload: Dict[str, Any] = Body(...)):
    """Publishes the full team portfolio with team information (Google Sites style)."""
    usn = payload.get("usn", "01FE24BME009").upper()
    team_number = payload.get("teamNumber", "Team 07")
    project_theme = payload.get("projectTheme", "Smart Campus")
    project_title = payload.get("projectTitle", "Resource Allocation System")
    now = datetime.utcnow().isoformat()
    payload_str = json.dumps(payload)

    async with get_db_connection() as db:
        await db.execute("""
            INSERT INTO published_portfolios (usn, team_number, project_theme, project_title, payload_json, published_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (usn, team_number, project_theme, project_title, payload_str, now))

        # Log audit event
        await db.execute("""
            INSERT INTO audit_events (action, details, timestamp)
            VALUES (?, ?, ?)
        """, ("PUBLISH_PORTFOLIO", f"Portfolio published for {team_number} ('{project_title}') by {usn}", now))
        await db.commit()

    return {
        "status": "success",
        "message": f"Successfully published portfolio for {team_number}",
        "publishedAt": now,
        "teamNumber": team_number,
        "projectTitle": project_title,
        "projectTheme": project_theme
    }

@router.get("/published")
async def get_published_portfolio(usn: str = Query(None)):
    """Retrieves the latest published portfolio."""
    async with get_db_connection() as db:
        if usn:
            async with db.execute("""
                SELECT * FROM published_portfolios WHERE usn = ? ORDER BY id DESC LIMIT 1
            """, (usn.upper(),)) as cur:
                row = await cur.fetchone()
        else:
            async with db.execute("""
                SELECT * FROM published_portfolios ORDER BY id DESC LIMIT 1
            """) as cur:
                row = await cur.fetchone()

        if not row:
            return {"status": "none", "published": False}

        data = json.loads(row["payload_json"])
        data["publishedAt"] = row["published_at"]
        data["published"] = True
        return data
