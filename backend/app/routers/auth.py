from fastapi import APIRouter, HTTPException, Query, status
from datetime import datetime
from ..database import get_db_connection
from ..models import LoginRequest, UserProfile, UserProfileUpdate
from ..config import ALLOWED_DOMAINS

router = APIRouter(prefix="/api/auth", tags=["Institutional Authentication"])

@router.post("/login", response_model=UserProfile)
async def login(req: LoginRequest):
    email = req.email.strip().lower()
    
    # Institutional Domain Guard
    if not any(email.endswith(dom) for dom in ALLOWED_DOMAINS):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Domain restricted. Please use institutional email ({', '.join(ALLOWED_DOMAINS)})."
        )
    
    usn = (req.usn or "01FE22BME045").strip().upper()
    name = (req.name or "Shrihari V. Katti").strip()
    now = datetime.utcnow().isoformat()

    async with get_db_connection() as db:
        # Check if user exists by USN or email
        async with db.execute("SELECT * FROM users WHERE usn = ?", (usn,)) as cur:
            row_usn = await cur.fetchone()
        async with db.execute("SELECT * FROM users WHERE email = ?", (email,)) as cur2:
            row_email = await cur2.fetchone()

        if row_usn:
            await db.execute("""
                UPDATE users 
                SET last_login = ?, name = COALESCE(?, name), email = ? 
                WHERE usn = ?
            """, (now, name, email, usn))
            await db.commit()
            usn_target = usn
        elif row_email:
            await db.execute("""
                UPDATE users 
                SET last_login = ?, name = COALESCE(?, name), usn = ? 
                WHERE email = ?
            """, (now, name, usn, email))
            await db.commit()
            usn_target = usn
        else:
            # Insert new student record
            await db.execute("""
                INSERT INTO users (usn, name, email, department, semester, cgpa, guide, created_at, last_login)
                VALUES (?, ?, ?, 'Department of Mechanical Engineering', '8th Semester (Final Year B.Tech)', 9.42, 'Prof. Anand S.', ?, ?)
            """, (usn, name, email, now, now))
            await db.commit()
            usn_target = usn

        # Log audit event
        await db.execute("""
            INSERT INTO audit_events (action, details, timestamp)
            VALUES (?, ?, ?)
        """, ("LOGIN", f"Student {name} ({usn_target}) authenticated via KLE Google SSO", now))
        await db.commit()

        # Return full updated user profile
        async with db.execute("SELECT * FROM users WHERE usn = ?", (usn_target,)) as cur:
            user = await cur.fetchone()
            return UserProfile(
                usn=user["usn"],
                name=user["name"],
                email=user["email"],
                department=user["department"],
                semester=user["semester"],
                cgpa=user["cgpa"],
                guide=user["guide"],
                team_number=user["team_number"] if "team_number" in user.keys() else "Team B14 (4 Members)",
                project_theme=user["project_theme"] if "project_theme" in user.keys() else "Smart Campus",
                project_title=user["project_title"] if "project_title" in user.keys() else "Design and Kinematic Synthesis of Opposed Scotch- Yoke Dual Cutter-Bar for Grain Harvesters",
                last_login=user["last_login"]
            )

@router.get("/me", response_model=UserProfile)
async def get_current_user(usn: str = Query("01FE22BME045", description="Student USN Roll No")):
    async with get_db_connection() as db:
        async with db.execute("SELECT * FROM users WHERE usn = ?", (usn.upper(),)) as cur:
            user = await cur.fetchone()
            if not user:
                # Fallback to first user in database
                async with db.execute("SELECT * FROM users LIMIT 1") as cur2:
                    user = await cur2.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="Student profile not found")
            return UserProfile(
                usn=user["usn"],
                name=user["name"],
                email=user["email"],
                department=user["department"],
                semester=user["semester"],
                cgpa=user["cgpa"],
                guide=user["guide"],
                team_number=user["team_number"] if "team_number" in user.keys() else "Team B14 (4 Members)",
                project_theme=user["project_theme"] if "project_theme" in user.keys() else "Smart Campus",
                project_title=user["project_title"] if "project_title" in user.keys() else "Design and Kinematic Synthesis of Opposed Scotch- Yoke Dual Cutter-Bar for Grain Harvesters",
                last_login=user["last_login"]
            )

@router.put("/profile", response_model=UserProfile)
async def update_profile(updates: UserProfileUpdate, usn: str = Query("01FE22BME045")):
    async with get_db_connection() as db:
        async with db.execute("SELECT * FROM users WHERE usn = ?", (usn.upper(),)) as cur:
            user = await cur.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="Student not found")

        name = updates.name if updates.name is not None else user["name"]
        dept = updates.department if updates.department is not None else user["department"]
        sem = updates.semester if updates.semester is not None else user["semester"]
        cgpa = updates.cgpa if updates.cgpa is not None else user["cgpa"]
        guide = updates.guide if updates.guide is not None else user["guide"]
        team_no = updates.team_number if updates.team_number is not None else (user["team_number"] if "team_number" in user.keys() else "Team B14 (4 Members)")
        proj_theme = updates.project_theme if updates.project_theme is not None else (user["project_theme"] if "project_theme" in user.keys() else "Smart Campus")
        proj_title = updates.project_title if updates.project_title is not None else (user["project_title"] if "project_title" in user.keys() else "Design and Kinematic Synthesis of Opposed Scotch- Yoke Dual Cutter-Bar for Grain Harvesters")

        await db.execute("""
            UPDATE users
            SET name = ?, department = ?, semester = ?, cgpa = ?, guide = ?,
                team_number = ?, project_theme = ?, project_title = ?
            WHERE usn = ?
        """, (name, dept, sem, cgpa, guide, team_no, proj_theme, proj_title, usn.upper()))
        await db.commit()

        return UserProfile(
            usn=user["usn"],
            name=name,
            email=user["email"],
            department=dept,
            semester=sem,
            cgpa=cgpa,
            guide=guide,
            team_number=team_no,
            project_theme=proj_theme,
            project_title=proj_title,
            last_login=user["last_login"]
        )

@router.post("/logout")
async def logout(usn: str = Query("01FE22BME045")):
    now = datetime.utcnow().isoformat()
    async with get_db_connection() as db:
        await db.execute("""
            INSERT INTO audit_events (action, details, timestamp)
            VALUES (?, ?, ?)
        """, ("LOGOUT", f"Student {usn} logged out", now))
        await db.commit()
    return {"status": "success", "message": "Logged out successfully"}
