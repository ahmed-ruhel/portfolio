import aiosqlite
import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from .config import SQLITE_DB_PATH

logger = logging.getLogger("backend.database")

# Default S1-S11 stages definition
INITIAL_STAGES_DEFINITIONS = [
    ("S1", "S1", "Need Definition", "What must the artefact accomplish for its user?", "Completed"),
    ("S2", "S2", "Concept Generation & Selection", "What principles and kinematic arrangements can fulfill the requirement specification?", "Completed"),
    ("S3", "S3", "Function Structure & Architecture", "How do energy, material, and signal flows partition into modular sub-assemblies?", "Completed"),
    ("S4", "S4", "Preliminary Design & Kinematics", "What geometric dimensions and kinematic linkages deliver the required stroke?", "Completed"),
    ("S5", "S5", "Detailed Design & Dimensioning", "What component tolerances, fits, and assembly sequences satisfy manufacturing limits?", "Completed"),
    ("S6", "S6", "Sizing Solvers & Power Transmission", "How are shaft diameters, gear ratios, and bearings mathematically verified against ASME codes?", "Completed"),
    ("S7", "S7", "3D CAD & Virtual Prototype", "How do full 3D CAD assemblies verify clearances, kinematics, and mass properties?", "Completed"),
    ("S8", "S8", "Engineering Analysis & FEA / Stress", "What finite-element stress, deflection, and fatigue life margins exist under peak cutting loads?", "Completed"),
    ("S9", "S9", "Manufacturing & Tooling Plan", "What tooling, machining operations, and bill of materials determine fabrication feasibility?", "Completed"),
    ("S10", "S10", "Verification, Testing & Certification", "How do empirical accelerometer measurements and field trials validate initial requirement specs?", "Completed"),
    ("S11", "S11", "Capstone Archival & Faculty Sign-Off", "How is the complete capstone portfolio verified, signed off, and archived?", "Completed")
]

# Exemplar initial deliverable prompts
EXEMPLAR_PROMPTS = [
    # S1
    ("S1", "S1.1", "Operating Context & Need Statement", "High-frequency reciprocating vibration in single-acting cutter bars causes hand-arm vibration syndrome (HAVS) in walk-behind power tillers, exceeding ISO 5349 limit of 2.5 m/s² (measured: 11.4 m/s²)."),
    ("S1", "S1.2", "Core Engineering Requirements", "REQ-01: Vibration reduction > 75% (Target Ahv < 2.5 m/s²)\nREQ-02: Reciprocating stroke = 76.2 mm (3.0 inches)\nREQ-03: Cutting frequency = 850 RPM input\nREQ-04: Total attachment mass < 38 kg\nREQ-05: Direct universal hitch mount for 12 HP tillers"),
    # S2
    ("S2", "S2.1", "Kinematic Architecture Selection", "Evaluated 4 concepts: Crank-rocker, Four-bar linkage, Opposed Scotch-Yoke, and Swashplate. Scotch-Yoke achieved highest Pugh score (+8) due to exact collinear harmonic motion and dynamic first-order force cancellation."),
    ("S2", "S2.2", "Pugh Decision Matrix Evaluation", "Criterion weights: Vibration attenuation (0.35), Mechanical efficiency (0.25), Manufacturing simplicity (0.20), Maintenance (0.20). Opposed Scotch-Yoke ranked #1 with 4.45 / 5.00 weighted score."),
    # S3
    ("S3", "S3.1", "Black-Box Flow Partitioning", "Energy: 850 RPM PTO shaft input (4.2 kW) -> 1.88:1 gearbox reducer -> dual sliding Scotch-Yoke yoke pins -> opposed shearing cutters.\nMaterial: Sorghum/paddy stalks -> counter-sheared clean swath (1.20 m width).\nSignals: Operator PTO lever & torque safety clutch engagement."),
    # S4
    ("S4", "S4.1", "Kinematic Loop & Harmonic Equation", "Dual collinear slider displacements:\nx1(t) = +r * cos(ωt)\nx2(t) = -r * cos(ωt)\nPrimary inertial shake force: F_net = m1*a1 + m2*a2 = m*ω²*r*cos(ωt) - m*ω²*r*cos(ωt) = 0 N."),
    # S5
    ("S5", "S5.1", "Tolerance Stack-up & Fits", "Yoke slider block to guide slot: ISO H7/g6 clearance fit (0.015 mm - 0.035 mm play). Shaft bearing journals: k5 transition fit for SKF 6206 deep-groove ball bearings."),
    # S6
    ("S6", "S6.1", "ASME Code Shaft Diameter Sizing", "Calculation per ASME B106.1M:\nT_design = 58.4 N-m, M_bending = 41.2 N-m. Material: AISI 4140 Quenched & Tempered (S_ut = 850 MPa, S_yt = 650 MPa). Required diameter: 22.4 mm; Selected standard: 25.0 mm (Safety Factor = 2.45)."),
    # S7
    ("S7", "S7.1", "3D CAD Assembly & Mass Properties", "Complete SolidWorks assembly modeled with 48 components. Total calculated assembly mass = 34.6 kg (below 38 kg budget limit). Center of mass aligned 12 mm forward of tiller hitch axle."),
    # S8
    ("S8", "S8.1", "FEA Stress & Fatigue Analysis", "ANSYS Mechanical static structural simulation under peak stall load (1850 N per knife): Max Von Mises stress = 184 MPa located at slider yoke fillet radius (Yield limit = 650 MPa, FoS = 3.53). High-cycle fatigue life > 10^7 cycles."),
    # S9
    ("S9", "S9.1", "Process Planning & Tooling BOM", "Bill of Materials: 18 unique fabricated parts, 30 COTS fasteners/bearings. Yoke blocks CNC milled from SAE 660 bronze on Haas VF-2; knife sections waterjet-cut from AISI 1080 high-carbon steel and induction hardened to 58 HRC."),
    # S10
    ("S10", "S10.1", "Field Testing & ISO 5349 Verification", "Empirical tri-axial accelerometer measurements at operator handles: Baseline single cutter = 11.4 m/s²; Opposed Scotch-Yoke = 2.1 m/s² (81.6% vibration attenuation, fully compliant with ISO 5349 safety limit)."),
    # S11
    ("S11", "S11.1", "Institutional Verification & Sign-off", "Capstone review committee evaluated working physical prototype on KLE Agricultural research plots. Unanimous grade 'S' awarded; patent disclosure KLE-IPR-2026-ME-019 submitted.")
]

# Exemplar media items
EXEMPLAR_MEDIA = [
    ("S1", "image", "Figure 1.1: Field Vibration Survey & Tiller PTO Hitch Rig", "Measured at 850 PTO RPM during Sorghum trials in Dharwad district.", "preset", "survey"),
    ("S2", "graph", "Pugh Concept Evaluation Multi-Criteria Radar Comparison", "Weighted score comparison across Scotch-Yoke, Four-bar, and Swashplate mechanisms.", "preset", "pugh_radar"),
    ("S3", "image", "Figure 3.1: Black-Box Energy, Material & Signal Flow Topology", "Functional decomposition diagram of opposed dual reciprocating system.", "preset", "functional"),
    ("S4", "cad", "Assembly 1: Opposed Scotch-Yoke Dual Kinematic Reciprocator", "Interactive 3D model with dual sliders and central rotating crank disc.", "preset", "scotchyoke"),
    ("S7", "cad", "Assembly 2: Serrated Knife Sections, Ledger Plates & Rock Guards", "Full cutterbar assembly featuring counter-stroking blades and guards.", "preset", "cutterbar"),
    ("S8", "graph", "Fatigue S-N Life Endurance Curve for AISI 4140 Quenched Steel", "Stress amplitude vs cycles demonstrating infinite life margin (>10^7 cycles).", "preset", "fatigue"),
    ("S10", "graph", "ISO 5349 Hand-Arm Vibration Spectrum (Baseline vs Scotch-Yoke)", "Comparison showing attenuation from 11.4 m/s² down to 2.1 m/s².", "preset", "vibration")
]

from contextlib import asynccontextmanager

@asynccontextmanager
async def get_db_connection():
    conn = await aiosqlite.connect(str(SQLITE_DB_PATH))
    conn.row_factory = aiosqlite.Row
    try:
        yield conn
    finally:
        await conn.close()

async def init_db():
    """Initializes tables and seeds default data if tables are empty."""
    async with get_db_connection() as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                usn TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                department TEXT DEFAULT 'Mechanical Engineering',
                semester TEXT DEFAULT '8th Semester (Final Year)',
                cgpa REAL DEFAULT 9.42,
                guide TEXT DEFAULT 'Prof. Anand S.',
                team_number TEXT DEFAULT 'Team B14 (4 Members)',
                project_theme TEXT DEFAULT 'Smart Campus',
                project_title TEXT DEFAULT 'Design and Kinematic Synthesis of Opposed Scotch- Yoke Dual Cutter-Bar for Grain Harvesters',
                created_at TEXT NOT NULL,
                last_login TEXT NOT NULL
            );
        """)

        # Add columns if migrating existing DB
        for col_def in [
            ("team_number", "TEXT DEFAULT 'Team B14 (4 Members)'"),
            ("project_theme", "TEXT DEFAULT 'Smart Campus'"),
            ("project_title", "TEXT DEFAULT 'Design and Kinematic Synthesis of Opposed Scotch- Yoke Dual Cutter-Bar for Grain Harvesters'")
        ]:
            try:
                await db.execute(f"ALTER TABLE users ADD COLUMN {col_def[0]} {col_def[1]}")
            except Exception:
                pass

        await db.execute("""
            CREATE TABLE IF NOT EXISTS stages (
                id TEXT PRIMARY KEY,
                number TEXT NOT NULL,
                title TEXT NOT NULL,
                question TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'In Progress',
                sort_order INTEGER NOT NULL DEFAULT 0,
                updated_at TEXT NOT NULL
            );
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS stage_prompts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                stage_id TEXT NOT NULL,
                prompt_code TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (stage_id) REFERENCES stages (id) ON DELETE CASCADE
            );
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS stage_media (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                stage_id TEXT NOT NULL,
                media_type TEXT NOT NULL, -- image, graph, cad, video
                title TEXT NOT NULL,
                caption TEXT DEFAULT '',
                source_type TEXT NOT NULL DEFAULT 'preset', -- preset, upload, url, custom, csv
                source_val TEXT NOT NULL,
                meta_json TEXT DEFAULT '{}',
                created_at TEXT NOT NULL,
                FOREIGN KEY (stage_id) REFERENCES stages (id) ON DELETE CASCADE
            );
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS telemetry_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usn TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                rpm REAL NOT NULL,
                stroke_mm REAL NOT NULL,
                peak_velocity_ms REAL NOT NULL,
                net_shake_force_n REAL NOT NULL,
                vibration_ahv REAL NOT NULL
            );
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS audit_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT NOT NULL,
                details TEXT NOT NULL,
                timestamp TEXT NOT NULL
            );
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS published_portfolios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usn TEXT NOT NULL,
                team_number TEXT,
                project_theme TEXT,
                project_title TEXT,
                payload_json TEXT NOT NULL,
                published_at TEXT NOT NULL
            );
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS uploaded_files (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL UNIQUE,
                mime_type TEXT NOT NULL,
                size_bytes INTEGER NOT NULL,
                data_base64 TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        """)

        # Seed default student user if empty
        async with db.execute("SELECT COUNT(*) as count FROM users") as cursor:
            row = await cursor.fetchone()
            if row["count"] == 0:
                now = datetime.utcnow().isoformat()
                await db.execute("""
                    INSERT INTO users (usn, name, email, department, semester, cgpa, guide, created_at, last_login)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    "01FE22BME045",
                    "Shrihari V. Katti",
                    "01fe22bme045@kletech.ac.in",
                    "Department of Mechanical Engineering",
                    "8th Semester (Final Year B.Tech)",
                    9.42,
                    "Prof. Anand S. (Associate Professor, Machine Design)",
                    now,
                    now
                ))

        # Check if stages table is empty
        async with db.execute("SELECT COUNT(*) as count FROM stages") as cursor:
            row = await cursor.fetchone()
            if row["count"] == 0:
                now = datetime.utcnow().isoformat()
                for idx, (s_id, num, title, question, status) in enumerate(INITIAL_STAGES_DEFINITIONS):
                    await db.execute("""
                        INSERT INTO stages (id, number, title, question, status, sort_order, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (s_id, num, title, question, status, idx + 1, now))
                
                # Seed exemplar prompts
                for stage_id, code, title, content in EXEMPLAR_PROMPTS:
                    await db.execute("""
                        INSERT INTO stage_prompts (stage_id, prompt_code, title, content, sort_order, created_at, updated_at)
                        VALUES (?, ?, ?, ?, 0, ?, ?)
                    """, (stage_id, code, title, content, now, now))

                # Seed exemplar media
                for stage_id, m_type, title, caption, s_type, s_val in EXEMPLAR_MEDIA:
                    await db.execute("""
                        INSERT INTO stage_media (stage_id, media_type, title, caption, source_type, source_val, meta_json, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, '{}', ?)
                    """, (stage_id, m_type, title, caption, s_type, s_val, now))

        await db.commit()
        logger.info("Database initialized successfully.")

async def fetch_full_stages() -> List[Dict[str, Any]]:
    """Returns the full S1-S11 stages array with prompts and media in frontend format."""
    async with get_db_connection() as db:
        stages_res = []
        async with db.execute("SELECT * FROM stages ORDER BY sort_order ASC") as cursor:
            stage_rows = await cursor.fetchall()
            for s in stage_rows:
                stage_dict = {
                    "id": s["id"],
                    "number": s["number"],
                    "title": s["title"],
                    "question": s["question"],
                    "status": s["status"],
                    "prompts": [],
                    "media": []
                }

                # Fetch prompts
                async with db.execute("SELECT * FROM stage_prompts WHERE stage_id = ? ORDER BY id ASC", (s["id"],)) as p_cur:
                    prompts = await p_cur.fetchall()
                    for p in prompts:
                        stage_dict["prompts"].append({
                            "id": p["id"],
                            "promptId": p["prompt_code"],
                            "title": p["title"],
                            "prompt": p["content"]
                        })

                # Fetch media
                async with db.execute("SELECT * FROM stage_media WHERE stage_id = ? ORDER BY id ASC", (s["id"],)) as m_cur:
                    media_items = await m_cur.fetchall()
                    for m in media_items:
                        meta = {}
                        try:
                            meta = json.loads(m["meta_json"]) if m["meta_json"] else {}
                        except Exception:
                            pass
                        
                        media_entry = {
                            "id": m["id"],
                            "type": m["media_type"],
                            "title": m["title"],
                            "caption": m["caption"],
                            "sourceType": m["source_type"],
                            **meta
                        }

                        if m["media_type"] == "image":
                            media_entry["src"] = meta.get("src") or m["source_val"]
                            if m["source_type"] == "preset":
                                media_entry["presetKey"] = m["source_val"]
                            elif m["source_type"] == "url":
                                media_entry["url"] = m["source_val"]
                            elif m["source_type"] == "upload":
                                media_entry["fileUrl"] = m["source_val"]

                        elif m["media_type"] == "graph":
                            media_entry["graphMode"] = m["source_type"]
                            if m["source_type"] == "preset":
                                media_entry["presetKey"] = m["source_val"]
                            elif m["source_type"] == "image":
                                media_entry["imageUrl"] = m["source_val"]

                        elif m["media_type"] == "cad":
                            media_entry["cadSource"] = m["source_type"]
                            if m["source_type"] == "preset":
                                media_entry["presetKey"] = m["source_val"]
                            else:
                                media_entry["fileUrl"] = m["source_val"]

                        elif m["media_type"] == "video":
                            media_entry["videoSource"] = m["source_type"]
                            if m["source_type"] == "workspace":
                                media_entry["fileName"] = m["source_val"]
                            else:
                                media_entry["videoUrl"] = m["source_val"]

                        stage_dict["media"].append(media_entry)

                stages_res.append(stage_dict)
        return stages_res

async def reset_to_exemplar():
    """Resets the database with fresh exemplar data."""
    async with get_db_connection() as db:
        await db.execute("DELETE FROM stage_media")
        await db.execute("DELETE FROM stage_prompts")
        await db.execute("DELETE FROM stages")
        now = datetime.utcnow().isoformat()
        for idx, (s_id, num, title, question, status) in enumerate(INITIAL_STAGES_DEFINITIONS):
            await db.execute("""
                INSERT INTO stages (id, number, title, question, status, sort_order, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (s_id, num, title, question, status, idx + 1, now))
        
        for stage_id, code, title, content in EXEMPLAR_PROMPTS:
            await db.execute("""
                INSERT INTO stage_prompts (stage_id, prompt_code, title, content, sort_order, created_at, updated_at)
                VALUES (?, ?, ?, ?, 0, ?, ?)
            """, (stage_id, code, title, content, now, now))

        for stage_id, m_type, title, caption, s_type, s_val in EXEMPLAR_MEDIA:
            await db.execute("""
                INSERT INTO stage_media (stage_id, media_type, title, caption, source_type, source_val, meta_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, '{}', ?)
            """, (stage_id, m_type, title, caption, s_type, s_val, now))
        await db.commit()

async def save_file_to_db(file_id: str, filename: str, mime_type: str, size_bytes: int, data_base64: str):
    """Persists uploaded file directly into SQLite database so it survives Render restarts."""
    now = datetime.utcnow().isoformat()
    async with get_db_connection() as db:
        await db.execute("""
            INSERT OR REPLACE INTO uploaded_files (id, filename, mime_type, size_bytes, data_base64, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (file_id, filename, mime_type, size_bytes, data_base64, now))
        await db.commit()

async def get_file_from_db(filename: str):
    """Retrieves uploaded file from SQLite database if missing from disk."""
    async with get_db_connection() as db:
        async with db.execute("SELECT * FROM uploaded_files WHERE filename = ?", (filename,)) as cursor:
            row = await cursor.fetchone()
            if row:
                return dict(row)
    return None
