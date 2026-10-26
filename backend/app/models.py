from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ---------------------------------------------------------
# AUTH & PROFILE SCHEMAS
# ---------------------------------------------------------
class LoginRequest(BaseModel):
    email: str = Field(..., example="01fe22bme045@kletech.ac.in")
    name: Optional[str] = Field("Shrihari V. Katti", example="Shrihari V. Katti")
    usn: Optional[str] = Field("01FE22BME045", example="01FE22BME045")

class UserProfile(BaseModel):
    usn: str
    name: str
    email: str
    department: str
    semester: str
    cgpa: float
    guide: str
    team_number: Optional[str] = "Team B14 (4 Members)"
    project_theme: Optional[str] = "Agricultural Automation"
    project_title: Optional[str] = "Design and Kinematic Synthesis of Opposed Scotch- Yoke Dual Cutter-Bar for Grain Harvesters"
    last_login: Optional[str] = None

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    cgpa: Optional[float] = None
    guide: Optional[str] = None
    team_number: Optional[str] = None
    project_theme: Optional[str] = None
    project_title: Optional[str] = None

# ---------------------------------------------------------
# STAGES, PROMPTS & MEDIA SCHEMAS
# ---------------------------------------------------------
class PromptModel(BaseModel):
    id: Optional[int] = None
    promptId: str = Field(..., example="S1.1")
    title: str = Field(..., example="Operating Context & Need Statement")
    prompt: str = Field(..., example="High-frequency vibration details...")

class MediaItemModel(BaseModel):
    id: Optional[int] = None
    type: str = Field(..., example="image") # image, graph, cad, video
    title: str = Field(..., example="Figure 1.1: Hitch Rig")
    caption: Optional[str] = ""
    sourceType: str = Field(..., example="preset") # preset, upload, url, custom, csv
    sourceVal: Optional[str] = None
    presetKey: Optional[str] = None
    url: Optional[str] = None
    fileUrl: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None

class StageHeaderUpdate(BaseModel):
    title: Optional[str] = None
    question: Optional[str] = None
    status: Optional[str] = None # Completed, In Progress, Under Review

class StageDetail(BaseModel):
    id: str
    number: str
    title: str
    question: str
    status: str
    prompts: List[PromptModel] = []
    media: List[Dict[str, Any]] = []

# ---------------------------------------------------------
# KINEMATICS SIMULATION SCHEMAS
# ---------------------------------------------------------
class KinematicsSimRequest(BaseModel):
    crank_radius_mm: float = Field(38.1, description="Radius of crank throw in mm (Total stroke = 2 * r = 76.2 mm)")
    rpm: float = Field(850.0, description="Input PTO rotational speed in RPM")
    blade_mass_kg: float = Field(1.65, description="Effective mass of each reciprocating knife assembly in kg")
    total_steps: int = Field(360, description="Angular resolution in steps across 0 to 360 deg")

class KinematicsSimResponse(BaseModel):
    stroke_mm: float
    angular_velocity_rad_s: float
    peak_velocity_m_s: float
    peak_acceleration_m_s2: float
    max_single_knife_inertia_force_n: float
    net_dynamic_shake_force_n: float
    vibration_attenuation_pct: float
    iso5349_compliant: bool
    data_points: List[Dict[str, float]]

# ---------------------------------------------------------
# DOSSIER EXPORT & IMPORT SCHEMAS
# ---------------------------------------------------------
class DossierPayload(BaseModel):
    projectTitle: str = Field(..., example="Design and Kinematic Synthesis of Opposed Scotch-Yoke Dual Cutter-Bar")
    schemaVersion: str = Field("kle-me-portfolio-v2")
    institution: str = Field("KLE Technological University, Hubballi")
    student: Dict[str, Any]
    kinematics: Dict[str, Any]
    stages: List[Dict[str, Any]]
