# KLE ME Capstone Student Design Portfolio & Engineering Portal

A full-stack Institutional Capstone Engineering Portfolio Portal developed for **KLE Technological University, Hubballi** (Department of Mechanical Engineering). 

The platform supports institutional Google SSO authentication, team portfolio creation, S1–S11 engineering stage dossiers, dynamic kinematic mathematical solvers, Pugh decision matrices, 3D CAD WebGL visualization, and **Google Sites style portfolio publishing**.

---

## 🌟 Key Features

1. **Institutional Authentication (Google SSO)**
   - Domain-restricted login (`@kletech.ac.in`, `@bvb.edu`, `@gmail.com`).
   - Clean, credentials-ready login form with real-time feedback and session persistence.
   - Profile badge with student avatar, USN, academic credentials, and guide attribution.

2. **Team Portfolio Creation & Registration**
   - Direct portfolio configuration: **Team Name or Number** (e.g., `Team 07`), **Project Theme** (e.g., `Smart Campus`), and **Artefact / Project Title** (e.g., `Resource Allocation System`).
   - Seamless transition into the S1–S11 engineering workspace.
   - Dynamic profile synchronization and persistence across browser and database.

3. **S1–S11 Capstone Stage Dossiers**
   - Strictly structured around the KLE Mechanical Engineering Capstone Specification:
     - **S1**: Need Definition & Operational Context
     - **S2**: Concept Generation & Pugh Matrix Selection
     - **S3**: Function Structure & Energy/Material Flow Partitioning
     - **S4**: Preliminary Kinematics & Scotch-Yoke Motion Synthesis
     - **S5**: Detailed Design, Tolerances (ISO H7/g6), and Component Sizing
     - **S6**: Power Transmission & ASME Code Shaft Calculations
     - **S7**: 3D CAD Model Virtual Prototype & Clearances
     - **S8**: Engineering Analysis, FEA Stress Margins & Fatigue Life
     - **S9**: Manufacturing Plan, Tooling & Bill of Materials (BOM)
     - **S10**: Empirical Testing, ISO 5349 Vibration Verification
     - **S11**: Capstone Archival & Faculty Guide Sign-off
   - Full CRUD support for deliverable prompts, engineering images, interactive Chart.js graphs, 3D CAD models (Three.js WebGL), and simulation video embeds.

4. **Google Sites Style Portfolio Publishing**
   - One-click **Publish** button generates a clean, publication-ready, Google Sites style live portfolio.
   - Features team metadata banner, sticky stage navigation bar, formatted prompt cards, and rich media galleries.
   - Shareable live URL copying, PDF printing, and full persistence.

5. **FastAPI + SQLite REST Backend**
   - Asynchronous Python backend powered by FastAPI and `aiosqlite`.
   - Comprehensive endpoints for authentication, profile updates, S1–S11 stages, media uploads, kinematics solvers, and published portfolios.
   - Interactive Swagger API documentation at `/docs`.

---

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML5, Vanilla CSS3 (UrbanEye warm luxury terracotta & cream design system), Vanilla JavaScript (ES6+).
- **Visualization**: Three.js (WebGL 3D CAD rendering), Chart.js (vibration & kinematics telemetry plots), FontAwesome 6.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, aiosqlite (Async SQLite).

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd portfolio
```

### 2. Set Up the Python Backend
Ensure Python 3.10+ is installed:
```bash
pip install -r backend/requirements.txt
```

### 3. Run the Server
Launch the unified server (serves both API and frontend):
```bash
python run_server.py
```

### 4. Access the Application
- **Web Portal**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Interactive Swagger API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 📁 Project Structure

```
portfolio/
├── backend/
│   ├── app/
│   │   ├── config.py            # Environment configuration & limits
│   │   ├── database.py          # SQLite schema & async connection manager
│   │   ├── models.py            # Pydantic data schemas
│   │   ├── main.py              # FastAPI app & static file routing
│   │   └── routers/
│   │       ├── auth.py          # SSO login & profile management
│   │       ├── stages.py        # S1-S11 CRUD endpoints
│   │       ├── uploads.py       # CAD / image / video file upload handler
│   │       ├── kinematics.py    # Scotch-Yoke mathematical solvers
│   │       └── dossier.py       # Export/import & Google Sites publishing
│   ├── data/                    # SQLite database storage (portfolio.db)
│   ├── uploads/                 # Uploaded CAD models, images, and videos
│   └── requirements.txt         # Python dependencies
├── index.html                   # Single Page Application structure
├── styles.css                   # UrbanEye luxury responsive styling
├── script.js                    # Client-side state, 3D viewer & interactive logic
├── run_server.py                # Server launcher script
├── .gitignore                   # Git ignore patterns
└── README.md                    # Project documentation
```

---

## 📜 License
Developed for academic capstone engineering projects at KLE Technological University. All rights reserved.
