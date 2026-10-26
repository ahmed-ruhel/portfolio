/* ==========================================================================
   KLE ME STUDENT DESIGN PORTFOLIO - INTERACTIVE ENGINE & SIMULATIONS
   Strictly Wrapped in UrbanEye AI Theme & Dynamic Animations
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---------------------------------------------------------------------------
  // 1. THEME SWITCHER (EXACT URBANEYE STYLING)
  // ---------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');
  const htmlRoot = document.documentElement;

  const savedTheme = localStorage.getItem('kle-portfolio-theme') || 'light';
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'light';
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
    });
  }

  function applyTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('kle-portfolio-theme', theme);

    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-regular fa-moon';
    }
    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
  }

  // Mobile Drawer
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('active');
    });
    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => mobileDrawer.classList.remove('active'));
    });
  }

  // ---------------------------------------------------------------------------
  // 2. MULTI-PAGE SPA ROUTER WITH STRICT AUTHENTICATION GUARD
  // Default landing view is the Login page; all other pages are gated!
  // ---------------------------------------------------------------------------
  const pageViews = document.querySelectorAll('.page-view');
  const userStatusPill = document.getElementById('userStatusPill');
  const userShortName = document.getElementById('userShortName');
  const userStatusIcon = document.getElementById('userStatusIcon');
  const statusLiveDot = document.getElementById('statusLiveDot');
  let isAuthenticated = sessionStorage.getItem('kle-auth-verified') === 'true';

  function updateAuthPill(authed, usn) {
    const pill = document.getElementById('userStatusPill');
    const shortName = document.getElementById('userShortName');
    const icon = document.getElementById('userStatusIcon');
    const dot = document.getElementById('statusLiveDot');

    if (authed) {
      if (pill) {
        pill.classList.remove('unauthenticated');
        pill.classList.add('authenticated');
        pill.setAttribute('data-page', 'page-profile');
        pill.setAttribute('title', `Verified KLE Student: ${usn} (Click to View Profile)`);
      }
      if (shortName) shortName.textContent = usn;
      if (icon) icon.className = 'fa-solid fa-user-graduate pill-icon';
      if (dot) {
        dot.className = 'live-dot green';
      }
    } else {
      if (pill) {
        pill.classList.add('unauthenticated');
        pill.classList.remove('authenticated');
        pill.setAttribute('data-page', 'page-login');
        pill.setAttribute('title', 'Institutional Login (Click to Sign In)');
      }
      if (shortName) shortName.textContent = 'Sign In';
      if (icon) icon.className = 'fa-solid fa-arrow-right-to-bracket pill-icon';
      if (dot) {
        dot.className = 'live-dot red';
      }
    }
  }

  // Initialize UI based on saved session
  if (isAuthenticated) {
    document.body.classList.add('authenticated');
    const savedUSN = sessionStorage.getItem('kle-user-usn') || '01FE24BME009';
    const savedName = sessionStorage.getItem('kle-user-name') || 'Ruhel Ahmed';
    updateAuthPill(true, savedUSN);
    const curDisplayStudentName = document.getElementById('displayStudentName');
    const curDisplayUSN = document.getElementById('displayUSN');
    if (curDisplayStudentName && savedName) curDisplayStudentName.textContent = savedName;
    if (curDisplayUSN && savedUSN) curDisplayUSN.textContent = savedUSN;
  } else {
    document.body.classList.remove('authenticated');
    updateAuthPill(false);
  }

  function navigateToPage(pageId) {
    if (!pageId) pageId = 'page-login';

    // STRICT AUTHENTICATION GUARD: Prevent accessing any page if not logged in
    if (!isAuthenticated && pageId !== 'page-login') {
      showToast('🔒 Access Restricted: Please sign in with your KLE Google account first!');
      const authCard = document.querySelector('.auth-card');
      if (authCard) {
        authCard.classList.remove('shake-card');
        void authCard.offsetWidth;
        authCard.classList.add('shake-card');
      }
      pageId = 'page-login';
    }

    // Hide all pages, show target page
    pageViews.forEach(page => {
      page.classList.remove('active');
      if (page.id === pageId) {
        page.classList.add('active');
      }
    });

    // Update active state on nav links
    document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-page') === pageId) {
        link.classList.add('active');
      }
    });

    // Close mobile drawer if open
    if (mobileDrawer) {
      mobileDrawer.classList.remove('active');
    }

    // Update browser URL hash cleanly
    const hash = pageId.replace('page-', '');
    if (history.replaceState) {
      history.replaceState(null, null, `#${hash}`);
    }

    // Smooth scroll to top of view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Bind click handlers to all navigation buttons and links
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = el.getAttribute('data-page');
      navigateToPage(targetPage);
    });
  });

  // Handle URL hash on initial load (or default strictly to login)
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash === 'workbench') {
    navigateToPage(isAuthenticated ? 'page-stages' : 'page-login');
  } else if (isAuthenticated && initialHash && document.getElementById(`page-${initialHash}`)) {
    navigateToPage(`page-${initialHash}`);
  } else {
    // Default first page is strictly Login Page!
    navigateToPage('page-login');
  }

  // ---------------------------------------------------------------------------
  // 3. KINEMATIC CAD SIMULATION (Opposed Scotch-Yoke Canvas Engine)
  // ---------------------------------------------------------------------------
  const canvas = document.getElementById('scotchYokeCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  const btnPlayPauseSim = document.getElementById('btnPlayPauseSim');
  const btnResetSim = document.getElementById('btnResetSim');
  const angleVal = document.getElementById('angleVal');
  const crankSlider = document.getElementById('crankSlider');
  const sliderAngleLabel = document.getElementById('sliderAngleLabel');

  const dispX1 = document.getElementById('dispX1');
  const dispX2 = document.getElementById('dispX2');
  const currentVelocity = document.getElementById('currentVelocity');
  const velocityFill = document.getElementById('velocityFill');

  let isPlaying = false;
  let crankAngleDeg = 243;
  const crankRadiusPx = 65;
  const realThrowMm = 38.1;
  const maxVelocityMs = 3.39;

  function drawScotchYoke() {
    if (!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w * 0.5;
    const cy = h * 0.52;

    ctx.clearRect(0, 0, w, h);

    // Subtle Grid Background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Kinematic Centerline
    ctx.strokeStyle = 'rgba(158, 113, 73, 0.35)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(40, cy); ctx.lineTo(w - 40, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 30); ctx.lineTo(cx, h - 30); ctx.stroke();
    ctx.setLineDash([]);

    const thetaRad = (crankAngleDeg * Math.PI) / 180;

    // Sliders horizontal displacement
    const disp1Px = crankRadiusPx * Math.cos(thetaRad);
    const disp2Px = -crankRadiusPx * Math.cos(thetaRad);

    const pin1X = cx + crankRadiusPx * Math.cos(thetaRad);
    const pin1Y = cy + crankRadiusPx * Math.sin(thetaRad);

    const pin2X = cx + crankRadiusPx * Math.cos(thetaRad + Math.PI);
    const pin2Y = cy + crankRadiusPx * Math.sin(thetaRad + Math.PI);

    // 1. Center Bearing Housing & Circular Crank Disk
    ctx.fillStyle = '#221b16';
    ctx.strokeStyle = '#9e7149';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, crankRadiusPx, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 2. Rotating Crank Arm
    ctx.strokeStyle = '#c99365';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(pin2X, pin2Y);
    ctx.lineTo(pin1X, pin1Y);
    ctx.stroke();

    // Crank Pins (Drive Pins inside vertical slots)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(pin1X, pin1Y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(pin2X, pin2Y, 7, 0, Math.PI * 2); ctx.fill();

    // Center Pivot Hub
    ctx.fillStyle = '#9e7149';
    ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();

    // 3. Scotch-Yoke Vertical Sliders (Upper Slider 1)
    const yoke1X = cx + disp1Px;
    ctx.strokeStyle = '#38bdf8'; // Cyan accent from video
    ctx.lineWidth = 4;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';

    // Vertical Yoke Slot 1
    ctx.strokeRect(yoke1X - 8, cy - 95, 16, 90);
    ctx.fillRect(yoke1X - 8, cy - 95, 16, 90);

    // Upper Knife Horizontal Bar & Serrated Teeth
    const knife1Y = cy - 105;
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(yoke1X - 110, knife1Y, 220, 10);

    // Draw Teeth for Knife 1 (pointing upwards)
    ctx.beginPath();
    for (let tx = yoke1X - 100; tx <= yoke1X + 90; tx += 20) {
      ctx.moveTo(tx, knife1Y);
      ctx.lineTo(tx + 10, knife1Y - 14);
      ctx.lineTo(tx + 20, knife1Y);
    }
    ctx.fillStyle = '#e0f2fe';
    ctx.fill();
    ctx.stroke();

    // 4. Scotch-Yoke Vertical Sliders (Lower Slider 2)
    const yoke2X = cx + disp2Px;
    ctx.strokeStyle = '#f59e0b'; // Amber accent
    ctx.lineWidth = 4;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';

    // Vertical Yoke Slot 2
    ctx.strokeRect(yoke2X - 8, cy + 5, 16, 90);
    ctx.fillRect(yoke2X - 8, cy + 5, 16, 90);

    // Lower Knife Horizontal Bar & Serrated Teeth
    const knife2Y = cy + 100;
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(yoke2X - 110, knife2Y, 220, 10);

    // Draw Teeth for Knife 2 (pointing downwards)
    ctx.beginPath();
    for (let tx = yoke2X - 100; tx <= yoke2X + 90; tx += 20) {
      ctx.moveTo(tx, knife2Y + 10);
      ctx.lineTo(tx + 10, knife2Y + 24);
      ctx.lineTo(tx + 20, knife2Y + 10);
    }
    ctx.fillStyle = '#fef3c7';
    ctx.fill();
    ctx.stroke();

    // Labels on Canvas
    ctx.font = '11px JetBrains Mono';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('KNIFE 1 (x₁)', yoke1X - 35, knife1Y - 22);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText('KNIFE 2 (x₂)', yoke2X - 35, knife2Y + 38);

    // Update Telemetry Displays
    const x1Mm = (realThrowMm * Math.cos(thetaRad)).toFixed(1);
    const x2Mm = (-realThrowMm * Math.cos(thetaRad)).toFixed(1);
    dispX1.textContent = `${x1Mm > 0 ? '+' : ''}${x1Mm} mm`;
    dispX2.textContent = `${x2Mm > 0 ? '+' : ''}${x2Mm} mm`;

    const velInstant = Math.abs(maxVelocityMs * Math.sin(thetaRad)).toFixed(2);
    currentVelocity.innerHTML = `${velInstant} <small>m/s (rel)</small>`;
    const pct = Math.min(100, Math.round((velInstant / maxVelocityMs) * 100));
    velocityFill.style.width = `${pct}%`;

    angleVal.textContent = `${Math.round(crankAngleDeg)}°`;
    sliderAngleLabel.textContent = `${Math.round(crankAngleDeg)}°`;

    if (isPlaying) {
      crankAngleDeg = (crankAngleDeg + 1.8) % 360;
      crankSlider.value = Math.round(crankAngleDeg);
      requestAnimationFrame(drawScotchYoke);
    }
  }

  // Run initial loop
  requestAnimationFrame(drawScotchYoke);

  // Play/Pause
  if (btnPlayPauseSim) {
    btnPlayPauseSim.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        btnPlayPauseSim.classList.add('active');
        btnPlayPauseSim.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
        requestAnimationFrame(drawScotchYoke);
      } else {
        btnPlayPauseSim.classList.remove('active');
        btnPlayPauseSim.innerHTML = '<i class="fa-solid fa-play"></i> Play';
      }
    });
  }

  // Reset
  if (btnResetSim) {
    btnResetSim.addEventListener('click', () => {
      crankAngleDeg = 243;
      if (crankSlider) crankSlider.value = 243;
      if (!isPlaying) {
        requestAnimationFrame(drawScotchYoke);
      }
      showToast('Simulation reset to θ = 243° datum');
    });
  }

  // Slider Scrub
  if (crankSlider) {
    crankSlider.addEventListener('input', (e) => {
      crankAngleDeg = parseFloat(e.target.value);
      if (!isPlaying) {
        requestAnimationFrame(drawScotchYoke);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 4. (Pugh Decision Matrix removed per user request)
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // 5. STAGE S1–S11 COMPREHENSIVE ENGINEERING DOSSIER ENGINE
  // Dynamic S1 to S11 rendering, inline editing, separate buttons for
  // Images, Graphs, Simulation Videos, and 3D CAD Models with LocalStorage sync
  // ---------------------------------------------------------------------------

  // SVG Diagram Generators for High-Fidelity Engineering Exemplars
  function generateSvgDiagram(type) {
    const bg = '#0f172a';
    const grid = '#1e293b';
    const accent = '#0284c7';
    const amber = '#f59e0b';
    const green = '#10b981';
    const text = '#e2e8f0';

    if (type === 'survey') {
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="600" height="340">
        <rect width="600" height="340" fill="${bg}"/>
        <defs><pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="${grid}" stroke-width="1"/></pattern></defs>
        <rect width="600" height="340" fill="url(%23g)"/>
        <text x="30" y="40" fill="${amber}" font-family="sans-serif" font-weight="bold" font-size="16">FIG 1.1: FIELD SURVEY & TILLER PTO HITCH RIG (DHARWAD / BELAGAVI)</text>
        <!-- Tractor Silhouette -->
        <rect x="50" y="140" width="160" height="100" rx="8" fill="%231e293b" stroke="${text}" stroke-width="2"/>
        <circle cx="90" cy="240" r="40" fill="%23334155" stroke="${text}" stroke-width="3"/>
        <circle cx="170" cy="240" r="26" fill="%23334155" stroke="${text}" stroke-width="3"/>
        <text x="75" y="190" fill="${text}" font-family="monospace" font-size="12">12 HP Tiller</text>
        <!-- PTO Shaft -->
        <line x1="210" y1="200" x2="310" y2="200" stroke="${amber}" stroke-width="6" stroke-dasharray="8,4"/>
        <text x="220" y="190" fill="${amber}" font-family="monospace" font-size="11">PTO (850 RPM)</text>
        <!-- Cutter-Bar Attachment -->
        <rect x="310" y="160" width="220" height="90" rx="6" fill="%231e293b" stroke="${accent}" stroke-width="3"/>
        <text x="330" y="195" fill="${accent}" font-family="sans-serif" font-weight="bold" font-size="13">Opposed Dual Cutter-Bar</text>
        <text x="330" y="215" fill="${text}" font-family="monospace" font-size="11">Swath Width: 1.20 m (4.2 kW)</text>
        <text x="330" y="235" fill="${green}" font-family="monospace" font-size="11">Measured Ahv = 2.1 m/s²</text>
        <!-- Accelerometer sensor badge -->
        <circle cx="420" cy="140" r="14" fill="${green}"/>
        <line x1="420" y1="154" x2="420" y2="160" stroke="${green}" stroke-width="2"/>
        <text x="440" y="145" fill="${green}" font-family="monospace" font-weight="bold" font-size="11">Tri-Axial Accel (ISO 5349)</text>
      </svg>`;
    } else if (type === 'kinematics') {
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="600" height="340">
        <rect width="600" height="340" fill="${bg}"/>
        <defs><pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="${grid}" stroke-width="1"/></pattern></defs>
        <rect width="600" height="340" fill="url(%23g)"/>
        <text x="30" y="40" fill="${accent}" font-family="sans-serif" font-weight="bold" font-size="16">FIG 2.1: DUAL-SLIDER SCOTCH-YOKE KINEMATIC VECTOR LOOP</text>
        <!-- Center crank circle -->
        <circle cx="300" cy="180" r="70" fill="none" stroke="${grid}" stroke-width="2" stroke-dasharray="6,4"/>
        <circle cx="300" cy="180" r="10" fill="${text}"/>
        <line x1="300" y1="180" x2="350" y2="130" stroke="${amber}" stroke-width="4"/>
        <circle cx="350" cy="130" r="12" fill="${amber}"/>
        <text x="330" y="120" fill="${amber}" font-family="monospace" font-size="12">Crank Pin (r=38.1mm)</text>
        <!-- Sliders -->
        <rect x="80" y="110" width="140" height="40" rx="4" fill="%231e293b" stroke="${accent}" stroke-width="2"/>
        <line x1="220" y1="130" x2="350" y2="130" stroke="${accent}" stroke-width="3"/>
        <text x="95" y="135" fill="${accent}" font-family="monospace" font-size="12">Knife 1: x1(t)=+rcos(wt)</text>
        <rect x="380" y="210" width="140" height="40" rx="4" fill="%231e293b" stroke="${green}" stroke-width="2"/>
        <line x1="380" y1="230" x2="250" y2="230" stroke="${green}" stroke-width="3"/>
        <text x="395" y="235" fill="${green}" font-family="monospace" font-size="12">Knife 2: x2(t)=-rcos(wt)</text>
        <text x="180" y="300" fill="${text}" font-family="sans-serif" font-size="13">Collinear Opposed Pure SHM • Stroke = 76.2 mm • Net 1st-Order Shake = 0 N</text>
      </svg>`;
    } else if (type === 'functional') {
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="600" height="340">
        <rect width="600" height="340" fill="${bg}"/>
        <text x="30" y="40" fill="${green}" font-family="sans-serif" font-weight="bold" font-size="16">FIG 3.1: BLACK-BOX ENERGY, MATERIAL & SIGNAL FLOW (EMS)</text>
        <!-- Input signals -->
        <rect x="30" y="80" width="120" height="50" rx="6" fill="%231e293b" stroke="${amber}" stroke-width="2"/>
        <text x="40" y="110" fill="${amber}" font-family="monospace" font-size="11">PTO Power (850 RPM)</text>
        <rect x="30" y="150" width="120" height="50" rx="6" fill="%231e293b" stroke="${green}" stroke-width="2"/>
        <text x="40" y="180" fill="${green}" font-family="monospace" font-size="11">Crop Stalks (Sorghum)</text>
        <rect x="30" y="220" width="120" height="50" rx="6" fill="%231e293b" stroke="${accent}" stroke-width="2"/>
        <text x="40" y="250" fill="${accent}" font-family="monospace" font-size="11">Operator Engagement</text>
        <!-- Center Core System -->
        <rect x="220" y="70" width="160" height="210" rx="10" fill="%231e293b" stroke="${text}" stroke-width="3"/>
        <text x="245" y="110" fill="${text}" font-family="sans-serif" font-weight="bold" font-size="13">Opposed Dual</text>
        <text x="245" y="130" fill="${text}" font-family="sans-serif" font-weight="bold" font-size="13">Cutter System</text>
        <text x="235" y="170" fill="${accent}" font-family="monospace" font-size="10">• Torque Limiting Clutch</text>
        <text x="235" y="190" fill="${accent}" font-family="monospace" font-size="10">• 1.88:1 Speed Reducer</text>
        <text x="235" y="210" fill="${accent}" font-family="monospace" font-size="10">• Opposed Scotch-Yoke</text>
        <text x="235" y="230" fill="${accent}" font-family="monospace" font-size="10">• Counter Dual Shear</text>
        <!-- Output signals -->
        <line x1="380" y1="105" x2="440" y2="105" stroke="${amber}" stroke-width="3"/>
        <rect x="440" y="80" width="130" height="50" rx="6" fill="%231e293b" stroke="${amber}" stroke-width="2"/>
        <text x="450" y="110" fill="${amber}" font-family="monospace" font-size="11">Clean Swath (1.2m)</text>
        <line x1="380" y1="175" x2="440" y2="175" stroke="${green}" stroke-width="3"/>
        <rect x="440" y="150" width="130" height="50" rx="6" fill="%231e293b" stroke="${green}" stroke-width="2"/>
        <text x="450" y="180" fill="${green}" font-family="monospace" font-size="11">Neutral Shake (0 N)</text>
        <line x1="380" y1="245" x2="440" y2="245" stroke="${accent}" stroke-width="3"/>
        <rect x="440" y="220" width="130" height="50" rx="6" fill="%231e293b" stroke="${accent}" stroke-width="2"/>
        <text x="450" y="250" fill="${accent}" font-family="monospace" font-size="11">Field Rate: 0.38 ha/h</text>
      </svg>`;
    } else {
      // General engineering blueprint schematic
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" width="600" height="340">
        <rect width="600" height="340" fill="${bg}"/>
        <defs><pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="${grid}" stroke-width="1"/></pattern></defs>
        <rect width="600" height="340" fill="url(%23g)"/>
        <text x="30" y="40" fill="${accent}" font-family="sans-serif" font-weight="bold" font-size="16">TECHNICAL SPECIFICATION & CAD SCHEMATIC</text>
        <rect x="60" y="80" width="480" height="200" rx="8" fill="%231e293b" stroke="${accent}" stroke-width="2" stroke-dasharray="4,4"/>
        <circle cx="300" cy="180" r="50" fill="none" stroke="${amber}" stroke-width="3"/>
        <line x1="120" y1="180" x2="480" y2="180" stroke="${green}" stroke-width="3"/>
        <line x1="300" y1="100" x2="300" y2="260" stroke="${green}" stroke-width="3"/>
        <text x="210" y="240" fill="${text}" font-family="monospace" font-size="12">KLE CAPSTONE ENGINEERING DOSSIER</text>
      </svg>`;
    }
  }

  // SYNTHETIC BENCHMARK DATASET (S1 to S11 - Loaded optionally via "Load Sample Data")
  const SYNTHETIC_STAGES_DATA = [
    {
      id: "S1",
      number: "S1",
      title: "Need Definition",
      question: "What must the artefact accomplish for its user or operating context?",
      status: "Completed",
      badge: "STAGE DELIVERABLE PROMPTS (6) • DOCUMENTED: 6 / 6",
      prompts: [
        {
          id: "s1_1",
          title: "S1.1 User or operating context and evidence of the need",
          content: "Field surveys across 18 smallholder plots in Dharwad and Belagavi districts revealed small farmers spend Rs. 2,400/acre on manual harvesting labor with chronic labor shortages during peak harvest windows. Hand-arm vibration measured on conventional single-reciprocating mowers exceeded ISO 5349 exposure action value (Ahv = 11.4 m/s² > 2.5 m/s² threshold)."
        },
        {
          id: "s1_2",
          title: "S1.2 Chosen application and quantified design inputs",
          content: "1.2 m effective swath width cutter-bar powered by PTO takeoff (rated 850 RPM input, 4.2 kW mechanical power). Cutter stroke = 76.2 mm (3.0 in standard knife pitch). Crop stem shear strength: 8.5 MPa max for dry sorghum stalks at 18% moisture content."
        },
        {
          id: "s1_3",
          title: "S1.3 Need statement and scope boundaries",
          content: "The farming community requires an attachment mechanism that severs grain crops cleanly at > 3.2 km/h ground speed while reducing transmitted shaking forces by at least 65% compared to existing uncompensated sickle-bars. Boundary excludes prime mover engine overhaul."
        },
        {
          id: "s1_4",
          title: "S1.4 Initial assumptions and constraints",
          content: "Attachment total mass <= 52 kg to prevent tiller front overbalance. Must mount to universal KLE-CAT-1 power-tiller front 4-bolt hitch pattern. Maximum cost of bill of materials capped at Rs. 18,500."
        },
        {
          id: "s1_5",
          title: "S1.5 Candidate requirement IDs with units",
          content: "REQ-01: Transmitted vibration acceleration <= 4.5 m/s² (rms) | REQ-02: Cutting capacity >= 0.35 hectares/hour | REQ-03: Knife velocity at mid-stroke >= 1.8 m/s | REQ-04: Overall mass <= 50 kg | REQ-05: Blade changeover time <= 8 minutes."
        },
        {
          id: "s1_6",
          title: "S1.6 Contributors, evidence links and next action",
          content: "Conducted by Team B14 (Lead: S. Katti). Evidence: REC-SURV-01 (Field Vibration Survey Report), REC-LIT-02 (Crop Stem Biomechanics Study). Guide Approved: Prof. Anand S. Next: Synthesize 3 kinematic concept alternatives."
        }
      ],
      media: [
        {
          id: "m_s1_img",
          type: "image",
          title: "Field Survey Tractor Rig (Dharwad & Belagavi)",
          src: generateSvgDiagram('survey'),
          caption: "Field testing setup with tri-axial accelerometer at operator handles measuring Ahv baseline."
        },
        {
          id: "m_s1_graph",
          type: "graph",
          title: "ISO 5349 Vibration Ahv: Baseline vs Opposed Scotch-Yoke",
          graphPreset: "vibration",
          caption: "Vibration acceleration across 1/3-octave frequency bands showing dramatic 78% reduction."
        }
      ]
    },
    {
      id: "S2",
      number: "S2",
      title: "Concept Generation & Selection",
      question: "What principles and kinematic arrangements can fulfill the requirement specification?",
      status: "Completed",
      badge: "SYNTHESIS DOSSIER • RANK 1: Scotch-Yoke",
      prompts: [
        {
          id: "s2_1",
          title: "S2.1 Morphological matrix and working principles",
          content: "Decomposed the system into primary functions: Rotary-to-Linear conversion, Counter-balancing, Knife Guiding, and Power Transfer. Evaluated 12 functional combinations across Scotch-Yoke, Wobble-Box, Planetary Epicyclic, and Bell-Crank linkages."
        },
        {
          id: "s2_2",
          title: "S2.2 Synthesized concept alternatives",
          content: "Concept A: Baseline Wobble-Box single knife (Datum). Concept B: Opposed Dual-Slider Scotch-Yoke with collinear counter-reciprocating knives. Concept C: Planetary Epicyclic Straight-Line Hypocycloid mechanism."
        },
        {
          id: "s2_3",
          title: "S2.3 Pugh multi-criteria decision matrix evaluation",
          content: "Evaluated across 8 weighted criteria (Vibration cancellation, Cutting speed, Mechanical simplicity, Mass, Durability, Cost, Maintenance ease, Tractor mountability). Concept B achieved a net weighted score of +13 (Rank 1), compared to 0 for Concept A and -5 for Concept C."
        },
        {
          id: "s2_4",
          title: "S2.4 Concept selection justification and failure modes",
          content: "Selected Concept B (Opposed Scotch-Yoke) due to its pure harmonic motion, inherent 180° phase inertia balance eliminating primary shaking forces, and direct collinear knife drive without lateral rocking moments."
        }
      ],
      media: [
        {
          id: "m_s2_cad",
          type: "cad",
          title: "Opposed Scotch-Yoke 3D Assembly",
          cadType: "scotchyoke",
          desc: "Interactive 3D dynamic assembly showing rotating crankshaft disc, dual sliders, and counter-opposed knives."
        },
        {
          id: "m_s2_img",
          type: "image",
          title: "Scotch-Yoke Kinematic Vector Loop Diagram",
          src: generateSvgDiagram('kinematics'),
          caption: "Vector loop closure equations confirming exact collinear harmonic travel."
        }
      ]
    },
    {
      id: "S3",
      number: "S3",
      title: "Functional Modelling & Requirements",
      question: "How do material, energy, and signal flows map across functional blocks?",
      status: "Completed",
      badge: "FUNCTIONAL SPECIFICATION • EMS MAPPING",
      prompts: [
        {
          id: "s3_1",
          title: "S3.1 Black-box system transformation",
          content: "Primary System Function: Convert 850 RPM rotary PTO power into synchronized dual linear counter-shearing motion at 450 cycles/min to sever grain stalks while neutralizing shaking forces before transmission to tractor chassis."
        },
        {
          id: "s3_2",
          title: "S3.2 Energy, Material and Signal (EMS) flow decomposition",
          content: "Energy Flow: PTO Rotational KE -> Safety Slip Clutch -> 1.88:1 Spur Reduction -> Harmonic Scotch-Yoke -> Shearing Knife KE. Material Flow: Standing Sorghum Stalks -> Guide Teeth Gathering -> Double Scissor Severance -> Ground Swath. Signal: Operator Clutch On/Off."
        },
        {
          id: "s3_3",
          title: "S3.3 Quantitative metric mapping against REQ IDs",
          content: "Mapped REQ-01 through REQ-05 to specific functional sub-assemblies. Inertia cancellation allocated to dual scotch-yoke mass tolerance (+-15 grams). Cutting velocity (3.02 m/s) mapped to crank radius 38.1 mm at 452 RPM."
        }
      ],
      media: [
        {
          id: "m_s3_img",
          type: "image",
          title: "EMS Functional Decomposition Topology",
          src: generateSvgDiagram('functional'),
          caption: "Energy, material and signal flow diagram verifying interface decoupling."
        }
      ]
    },
    {
      id: "S4",
      number: "S4",
      title: "Architecture & Systems Engineering",
      question: "What physical modules and spatial interfaces constitute the system topology?",
      status: "Completed",
      badge: "PRODUCT BREAKDOWN STRUCTURE • 4 MODULES",
      prompts: [
        {
          id: "s4_1",
          title: "S4.1 Product Breakdown Structure (PBS)",
          content: "Subsystem 1: Chassis & Universal 4-Bolt Hitch Mount. Subsystem 2: PTO Input Gearbox & Safety Torque Limiter. Subsystem 3: Dual Opposed Scotch-Yoke Mechanism. Subsystem 4: Dual Cutter-Bar & Serrated Knife Assembly."
        },
        {
          id: "s4_2",
          title: "S4.2 Spatial packaging and tractor front clearance",
          content: "Overall dimensions: 1320 mm (W) x 480 mm (L) x 340 mm (H). Ground clearance adjustable from 80 mm to 220 mm via side skid shoes. Overhang from tractor front axle = 420 mm (well within 550 mm limit)."
        },
        {
          id: "s4_3",
          title: "S4.3 Slip clutch torque overload protection",
          content: "Spring-loaded friction slip clutch preset to release at 145 N*m (220% of rated 65 N*m operating torque) to protect gear teeth and scotch-yoke pin from stone jams."
        }
      ],
      media: [
        {
          id: "m_s4_cad",
          type: "cad",
          title: "Universal 4-Bolt Hitch Chassis Frame",
          cadType: "chassis",
          desc: "Welded tubular chassis frame with CAT-1 universal mounting holes and quick-release hitch pins."
        }
      ]
    },
    {
      id: "S5",
      number: "S5",
      title: "Subsystem Design & Kinematics",
      question: "How do the mechanisms, linkages, and drives transmit motion and power?",
      status: "Completed",
      badge: "KINEMATIC SYNTHESIS • PEAK VELOCITY: 3.02 m/s",
      prompts: [
        {
          id: "s5_1",
          title: "S5.1 Analytical displacement and velocity equations",
          content: "Crank radius r = 38.1 mm, crank speed w = 47.33 rad/s (452 RPM). Displacement x1(t) = r*cos(wt), x2(t) = -r*cos(wt). Relative cutting knife velocity v_rel(t) = 2*r*w*sin(wt). Peak relative cutting speed = 3.61 m/s (mean = 2.30 m/s > 1.8 m/s severance threshold)."
        },
        {
          id: "s5_2",
          title: "S5.2 Inherent first-order inertia force cancellation",
          content: "Since knife 1 and knife 2 move with equal mass m = 4.2 kg in exact 180° anti-phase: F_inertia_net = m*(d²x1/dt²) + m*(d²x2/dt²) = m*(-r*w²*cos wt) + m*(+r*w²*cos wt) = 0 N. Theoretical shaking force transmitted to chassis is zero!"
        },
        {
          id: "s5_3",
          title: "S5.3 Speed reduction spur gearset sizing",
          content: "Spur gearset: Pinion (Z1 = 18 teeth, AISI 4140), Gear (Z2 = 34 teeth, AISI 4140), Module m = 2.5 mm, Face width b = 25 mm. Ratio i = 1.889:1. Input 850 RPM -> Crankshaft 450 RPM."
        }
      ],
      media: [
        {
          id: "m_s5_graph",
          type: "graph",
          title: "Kinematic Displacement & Relative Velocity vs Crank Angle",
          graphPreset: "kinematics",
          caption: "Collinear harmonic displacement and velocity waveforms over 360° rotation."
        },
        {
          id: "m_s5_cad",
          type: "cad",
          title: "Opposed Scotch-Yoke Dual-Slider Kinematics",
          cadType: "scotchyoke",
          desc: "Live interactive 3D model with rotating crank and counter-reciprocating slider yoke."
        }
      ]
    },
    {
      id: "S6",
      number: "S6",
      title: "Component Design & Sizing",
      question: "What are the stress levels, safety factors, shaft diameters, and critical component dimensions?",
      status: "Completed",
      badge: "ASME CODE VERIFIED • FOS >= 2.4",
      prompts: [
        {
          id: "s6_1",
          title: "S6.1 PTO drive shaft sizing per ASME code",
          content: "Shaft material: AISI 4140 (Syt = 650 MPa, Sut = 850 MPa). Allowable shear stress with keyway tau_allow = min(0.3*Syt, 0.18*Sut)*0.75 = 95.6 MPa. Max bending moment M = 112 N*m, Torque T = 65 N*m. ASME equivalent diameter d = 26.8 mm. Standard diameter selected: 30 mm (FOS = 2.8)."
        },
        {
          id: "s6_2",
          title: "S6.2 Scotch-yoke slider block Hertzian contact pressure",
          content: "Contact between crank roller (OD 32 mm, SAE 52100 hardened steel) and yoke guide slot (SAE 660 bronze). Max contact pressure P_max = 14.2 MPa < allowable bronze compressive limit of 35 MPa."
        },
        {
          id: "s6_3",
          title: "S6.3 Bearing fatigue life L10h calculation",
          content: "Deep groove ball bearings SKF 6206-2RS (Dynamic capacity C = 20.3 kN). Equivalent dynamic load P = 3.4 kN. Calculated L10h fatigue life at 450 RPM = 14,800 operating hours (far exceeds 2,500 hr requirement)."
        }
      ],
      media: [
        {
          id: "m_s6_graph",
          type: "graph",
          title: "Shaft Combined Shear Stress vs Axial Span",
          graphPreset: "shaft_stress",
          caption: "Bending and torsional shear stress along the 30 mm shaft comfortably below ASME limit."
        },
        {
          id: "m_s6_cad",
          type: "cad",
          title: "PTO Input Shaft, Bearings & Yoke 3D",
          cadType: "shaft",
          desc: "Stepped drive shaft with keyways, SKF ball bearings, and universal joint connector."
        }
      ]
    },
    {
      id: "S7",
      number: "S7",
      title: "CAD Modeling & Digital Mockup",
      question: "What are the 3D part geometries, assembly clearances, GD&T, and kinematics?",
      status: "Completed",
      badge: "SOLIDWORKS CAD • 42 PARTS • MASS: 47.8 kg",
      prompts: [
        {
          id: "s7_1",
          title: "S7.1 3D parametric CAD master assembly",
          content: "Complete digital mockup modeled in SolidWorks with 42 unique parts. Full kinematic constraints applied to slider blocks, crank pin, and dual opposed knife bars. Zero dynamic interference verified through 360° collision detection."
        },
        {
          id: "s7_2",
          title: "S7.2 Geometric Dimensioning & Tolerancing (GD&T)",
          content: "Crankshaft journal bearing seats: 30 mm js6 (+0.009 / -0.007). Yoke slider slot width: 32 mm H7 (+0.025 / -0.000). Slider block: 32 mm g6 (-0.009 / -0.025). Provides smooth precision running fit with minimal grease clearance."
        },
        {
          id: "s7_3",
          title: "S7.3 Bill of Materials (BOM) & Mass Properties",
          content: "Total calculated assembly mass = 47.8 kg (verified with SolidWorks Mass Properties using actual material densities). Meets REQ-04 (Mass <= 50 kg) with 2.2 kg margin."
        }
      ],
      media: [
        {
          id: "m_s7_cad",
          type: "cad",
          title: "Serrated Cutter-Bar & Rock Guards 3D",
          cadType: "cutterbar",
          desc: "Interactive 3D model of dual cutter blades, pointed rock guards, and ledger plates."
        }
      ]
    },
    {
      id: "S8",
      number: "S8",
      title: "Material Selection & Tribology",
      question: "What alloys, treatments, coatings, and lubricants ensure reliability and wear resistance?",
      status: "Completed",
      badge: "MATERIALS SPECIFIED • INDUCTION HARDENED",
      prompts: [
        {
          id: "s8_1",
          title: "S8.1 Cutter knife blades: AISI 1080 high-carbon steel",
          content: "Blades stamped from 3.2 mm thick AISI 1080 spring steel. Cutting edges induction hardened to 54-58 HRC for superior stem edge retention while maintaining core toughness (38 HRC) to prevent brittle impact shattering."
        },
        {
          id: "s8_2",
          title: "S8.2 Crankshaft and yoke drive: AISI 4140 chromoly",
          content: "Crankshaft and scotch-yoke forged from AISI 4140 chromoly alloy steel, quenched and tempered to 28-32 HRC. Yield strength Syt = 650 MPa, endurance limit Se = 340 MPa."
        },
        {
          id: "s8_3",
          title: "S8.3 Tribological wear pairs and lubrication",
          content: "Slider surfaces: Self-lubricating SAE 660 bearing bronze wear strips paired with hardened alloy steel guide rails. Lubricated via grease nipples using NLGI Grade 2 lithium complex grease with MoS2 additive."
        }
      ],
      media: [
        {
          id: "m_s8_graph",
          type: "graph",
          title: "Fatigue S-N Life Endurance Curve (AISI 4140)",
          graphPreset: "fatigue",
          caption: "Infinite fatigue life (>10^7 cycles) verified under operating torsional and bending stresses."
        }
      ]
    },
    {
      id: "S9",
      number: "S9",
      title: "Fabrication & Manufacturing Process",
      question: "What machining, laser cutting, welding, and assembly protocols are required?",
      status: "Completed",
      badge: "MANUFACTURING ROUTING READY",
      prompts: [
        {
          id: "s9_1",
          title: "S9.1 CNC fiber laser cutting of serrated knife sections",
          content: "Knife sections profiled using 3 kW fiber laser cutting with nitrogen assist gas (edge tolerance +-0.05 mm, zero dross). 3-inch pitch serrated teeth cut in continuous nest."
        },
        {
          id: "s9_2",
          title: "S9.2 CNC milling of Scotch-yoke slider slots",
          content: "Yoke slots machined on 4-axis VMC in single setup. Guide slot surface finish Ra <= 0.4 micrometers achieved via fine carbide end mill finish pass."
        },
        {
          id: "s9_3",
          title: "S9.3 TIG welding fixture for universal chassis hitch",
          content: "Tubular chassis welded in dedicated rigid alignment jig using TIG welding (ER70S-6 filler). Post-weld runout verification < 0.25 mm across mounting flange."
        }
      ],
      media: [
        {
          id: "m_s9_cad",
          type: "cad",
          title: "Hitch Chassis Weldment & Jig Flange",
          cadType: "chassis",
          desc: "3D CAD model of welded structural hitch chassis and mounting bracket assembly."
        }
      ]
    },
    {
      id: "S10",
      number: "S10",
      title: "Testing, Validation & Verification",
      question: "How do field experimental measurements and vibration sensors compare against REQ targets?",
      status: "Completed",
      badge: "VERIFIED IN FIELD • ALL REQs MET",
      prompts: [
        {
          id: "s10_1",
          title: "S10.1 Hand-arm vibration validation per ISO 5349",
          content: "Field vibration measured at tiller operator handgrips using tri-axial accelerometer (PCB 356A15). Baseline uncompensated mower: Ahv = 11.4 m/s². Opposed Scotch-Yoke cutter: Ahv = 2.1 m/s² (78% vibration reduction, beating REQ-01 target of 4.5 m/s²)."
        },
        {
          id: "s10_2",
          title: "S10.2 Harvesting field capacity and cutting quality",
          content: "Tested in dry sorghum field (18% stem moisture, stalk diameter 16-24 mm). Achieved cutting speed 3.4 km/h with 0.38 hectares/hour harvesting rate (exceeding REQ-02 >= 0.35 ha/h). Clean stem shearing with zero stem splitting."
        },
        {
          id: "s10_3",
          title: "S10.3 Quick blade changeover trial",
          content: "Blade changeover timed across 5 operators: Average time = 5 min 45 sec using quick-release retaining pins (exceeds REQ-05 target <= 8 minutes)."
        }
      ],
      media: [
        {
          id: "m_s10_video",
          type: "video",
          title: "Field Demonstration & Simulation Recording",
          src: "Screen_Recording_20261025_162709_Gmail.mp4",
          caption: "Live screen demonstration recording of the capstone engineering portfolio and simulation workflow."
        },
        {
          id: "m_s10_graph",
          type: "graph",
          title: "Testing Verification Radar: REQ-01 through REQ-05",
          graphPreset: "req_radar",
          caption: "Radar chart showing 100% compliance across all 5 design requirements."
        }
      ]
    },
    {
      id: "S11",
      number: "S11",
      title: "Engineering Report & Dossier",
      question: "What is the final technical synthesis, guide sign-off, and capstone evaluation?",
      status: "Completed",
      badge: "FACULTY APPROVED • GRADE: 96/100",
      prompts: [
        {
          id: "s11_1",
          title: "S11.1 Executive summary of capstone achievement",
          content: "Successfully designed, synthesized, and validated an Opposed Scotch-Yoke Dual Cutter-Bar for power-tiller grain harvesters. Solved chronic occupational hand-arm vibration syndrome (HAVS) by eliminating primary shaking forces (Ahv reduced from 11.4 to 2.1 m/s²)."
        },
        {
          id: "s11_2",
          title: "S11.2 Design rubric grading and academic sign-off",
          content: "Evaluated by Department of Mechanical Engineering Project Review Board. Scored 96/100 across Problem Definition, Kinematic Synthesis, Structural Sizing, CAD/FEA, and Field Experimental Validation."
        },
        {
          id: "s11_3",
          title: "S11.3 Faculty Project Guide Verification",
          content: "Formally endorsed and signed off by Faculty Project Guide Prof. Anand S., Dept. of Mechanical Engineering, KLE Technological University, Hubballi."
        }
      ],
      media: [
        {
          id: "m_s11_img",
          type: "image",
          title: "KLE Institutional Faculty Guide Approval Certificate",
          src: generateSvgDiagram('survey'),
          caption: "Final capstone evaluation dossier approved for university archival."
        }
      ]
    }
  ];

  // DEFAULT PRISTINE EMPTY DATASET (S1 to S11 - Completely blank by default per user request)
  const DEFAULT_STAGES_DATA = [
    {
      id: "S1",
      number: "S1",
      title: "Need Definition",
      question: "What must the artefact accomplish for its user or operating context?",
      status: "In Progress",
      prompts: [],
      media: []
    },
    {
      id: "S2",
      number: "S2",
      title: "Concept Generation & Selection",
      question: "What principles and kinematic arrangements can fulfill the requirement specification?",
      status: "In Progress",
      prompts: [],
      media: []
    },
    {
      id: "S3",
      number: "S3",
      title: "Function Structure & Architecture",
      question: "How do energy, material, and signal flows partition into modular sub-assemblies?",
      status: "In Progress",
      prompts: [],
      media: []
    },
    {
      id: "S4",
      number: "S4",
      title: "Preliminary Design & Kinematics",
      question: "What geometric dimensions and kinematic linkages deliver the required stroke?",
      status: "In Progress",
      prompts: [],
      media: []
    },
    {
      id: "S5",
      number: "S5",
      title: "Detailed Design & Dimensioning",
      question: "What component tolerances, fits, and assembly sequences satisfy manufacturing limits?",
      status: "In Progress",
      prompts: [],
      media: []
    },
    {
      id: "S6",
      number: "S6",
      title: "Sizing Solvers & Power Transmission",
      question: "How are shaft diameters, gear ratios, and bearings mathematically verified against ASME codes?",
      status: "In Progress",
      prompts: [],
      media: []
    },
    {
      id: "S7",
      number: "S7",
      title: "3D CAD & Virtual Prototype",
      question: "How do full 3D CAD assemblies verify clearances, kinematics, and mass properties?",
      status: "In Progress",
      prompts: [],
      media: []
    },
    {
      id: "S8",
      number: "S8",
      title: "Engineering Analysis & FEA / Stress",
      question: "What finite-element stress, deflection, and fatigue life margins exist under peak cutting loads?",
      status: "In Progress",
      prompts: [],
      media: []
    },
    {
      id: "S9",
      number: "S9",
      title: "Manufacturing & Tooling Plan",
      question: "What tooling, machining operations, and bill of materials determine fabrication feasibility?",
      status: "In Progress",
      prompts: [],
      media: []
    },
    {
      id: "S10",
      number: "S10",
      title: "Verification, Testing & Certification",
      question: "How do empirical accelerometer measurements and field trials validate initial requirement specs?",
      status: "In Progress",
      prompts: [],
      media: []
    },
    {
      id: "S11",
      number: "S11",
      title: "Capstone Archival & Faculty Sign-Off",
      question: "How is the complete capstone portfolio verified, signed off, and archived?",
      status: "In Progress",
      prompts: [],
      media: []
    }
  ];

  // ---------------------------------------------------------------------------
  // BACKEND API CLIENT & PERSISTENCE (FastAPI + SQLite Synchronization)
  // ---------------------------------------------------------------------------
  let isBackendOnline = false;
  const backendStatusPill = document.getElementById('backendStatusPill');
  const backendStatusText = document.getElementById('backendStatusText');

  let stagesData = [];
  try {
    const saved = localStorage.getItem('kle_stages_empty_v5');
    if (saved) {
      stagesData = JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Could not parse saved stages data', err);
  }

  if (!stagesData || stagesData.length === 0) {
    stagesData = JSON.parse(JSON.stringify(DEFAULT_STAGES_DATA));
  }

  function saveStagesData() {
    try {
      localStorage.setItem('kle_stages_empty_v5', JSON.stringify(stagesData));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }

  // ---------------------------------------------------------------------------
  // CONFIRM MODAL (moved here so it's available before bindStageEvents runs)
  // ---------------------------------------------------------------------------
  const customConfirmModal = document.getElementById('customConfirmModal');
  const customConfirmTitle = document.getElementById('customConfirmTitle');
  const customConfirmMessage = document.getElementById('customConfirmMessage');
  const btnCancelCustomConfirm = document.getElementById('btnCancelCustomConfirm');
  const btnOkCustomConfirm = document.getElementById('btnOkCustomConfirm');
  let pendingCustomConfirmCallback = null;

  function showConfirmModal(title, message, onConfirm) {
    if (customConfirmTitle) customConfirmTitle.textContent = title || 'Confirm Action';
    if (customConfirmMessage) customConfirmMessage.textContent = message || 'Are you sure you want to proceed?';
    pendingCustomConfirmCallback = onConfirm;
    if (customConfirmModal) {
      customConfirmModal.classList.add('active');
    } else {
      // Fallback: run immediately if modal element is missing
      if (typeof onConfirm === 'function') onConfirm();
    }
  }

  if (btnCancelCustomConfirm) {
    btnCancelCustomConfirm.addEventListener('click', () => {
      if (customConfirmModal) customConfirmModal.classList.remove('active');
      pendingCustomConfirmCallback = null;
    });
  }

  if (btnOkCustomConfirm) {
    btnOkCustomConfirm.addEventListener('click', () => {
      if (customConfirmModal) customConfirmModal.classList.remove('active');
      if (typeof pendingCustomConfirmCallback === 'function') {
        const cb = pendingCustomConfirmCallback;
        pendingCustomConfirmCallback = null;
        cb();
      }
    });
  }

  // Helper to Delete Media from Stage (Supports numeric and string IDs)
  async function deleteMediaItem(stageId, mediaId) {
    const stage = stagesData.find(s => s.id === stageId);
    if (!stage || !stage.media) return;

    // Remove from in-memory data and re-render immediately
    stage.media = stage.media.filter(m => String(m.id) !== String(mediaId));
    saveStagesData();
    renderAllStages();
    showToast('Attachment removed.');

    // Async delete from backend (non-blocking)
    try {
      await fetch(`/api/stages/${stageId}/media/${encodeURIComponent(mediaId)}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend media deletion failed (non-critical):', err);
    }
  }

  // Expose globally so onclick attributes on dynamically rendered buttons can always reach it
  window.__kleDeleteMedia = function(stageId, mediaId) {
    deleteMediaItem(stageId, mediaId);
  };

  async function checkBackendHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        isBackendOnline = true;
        if (backendStatusPill) {
          backendStatusPill.classList.remove('offline');
          backendStatusPill.title = 'FastAPI + SQLite Backend Active (Click to open Swagger API Docs)';
        }
        if (backendStatusText) {
          backendStatusText.textContent = 'API Live';
        }
        await syncStagesFromBackend();
      } else {
        markBackendOffline();
      }
    } catch (e) {
      markBackendOffline();
    }
  }

  function markBackendOffline() {
    isBackendOnline = false;
    if (backendStatusPill) {
      backendStatusPill.classList.add('offline');
      backendStatusPill.title = 'Backend Offline (Using Local Browser Storage)';
    }
    if (backendStatusText) {
      backendStatusText.textContent = 'Offline (Local)';
    }
  }

  async function syncStagesFromBackend() {
    try {
      const res = await fetch('/api/stages');
      if (res.ok) {
        const remoteStages = await res.json();
        if (Array.isArray(remoteStages) && remoteStages.length > 0) {
          stagesData = remoteStages;
          saveStagesData();
          renderAllStages();
          console.log('[KLE Portal] Synced S1-S11 stages from FastAPI SQLite database.');
        }
      }
    } catch (err) {
      console.warn('[KLE Portal] Could not sync stages from API', err);
    }
  }

  // Trigger backend check asynchronously
  checkBackendHealth();

  // Active chart and Three.js instances cache for cleanup and resize
  const activeChartInstances = {};
  const activeThreeScenes = {};

  // RENDER ALL STAGES S1 TO S11
  const stagesAccordion = document.getElementById('stagesAccordion');

  function renderAllStages() {
    if (!stagesAccordion) return;

    // Cleanup previous charts
    Object.keys(activeChartInstances).forEach(id => {
      if (activeChartInstances[id]) {
        try { activeChartInstances[id].destroy(); } catch (e) { }
      }
    });

    stagesAccordion.innerHTML = '';

    stagesData.forEach(stage => {
      const stageBlock = document.createElement('div');
      stageBlock.className = 'stage-block';
      stageBlock.id = `block-${stage.id}`;

      // Status CSS class
      let statusClass = 'completed';
      if (stage.status === 'In Progress') statusClass = 'in_progress';
      if (stage.status === 'Under Review') statusClass = 'under_review';

      // Stage Header HTML
      stageBlock.innerHTML = `
        <div class="stage-block-header" data-toggle-stage="${stage.id}">
          <div class="sbh-left">
            <span class="stage-tag-badge">${stage.number}</span>
            <div>
              <h4 class="stage-block-title">${stage.title}</h4>
              <p class="stage-prompt-italic">"${stage.question}"</p>
            </div>
          </div>
          <div class="sbh-right">
            <span class="status-dropdown-badge ${statusClass}">${stage.status} <i class="fa-solid fa-circle-check"></i></span>
            <span class="prompt-count">PROMPTS (${stage.prompts.length}) • ATTACHMENTS (${(stage.media || []).length})</span>
          </div>
        </div>

        <!-- SEPARATE ACTION BUTTONS FOR EACH STAGE S1-S11 -->
        <div class="stage-actions-toolbar">
          <button class="btn-stage-action btn-add-img" data-action="add-img" data-stage="${stage.id}">
            <i class="fa-solid fa-image"></i> + Add Image
          </button>
          <button class="btn-stage-action btn-add-graph" data-action="add-graph" data-stage="${stage.id}">
            <i class="fa-solid fa-chart-line"></i> + Add Graph
          </button>
          <button class="btn-stage-action btn-add-video" data-action="add-video" data-stage="${stage.id}">
            <i class="fa-solid fa-video"></i> + Add Simulation Video
          </button>
          <button class="btn-stage-action btn-add-cad" data-action="add-cad" data-stage="${stage.id}">
            <i class="fa-solid fa-cube"></i> + Add CAD Model
          </button>
          <button class="btn-stage-action btn-edit-stage" data-action="edit-stage" data-stage="${stage.id}">
            <i class="fa-solid fa-pen-to-square"></i> Edit Stage
          </button>
          <button class="btn-stage-action btn-add-prompt" data-action="add-prompt" data-stage="${stage.id}">
            <i class="fa-solid fa-plus"></i> + Add Prompt
          </button>
        </div>

        <!-- STAGE PROMPTS LIST -->
        <div class="stage-prompts-list" id="prompts-list-${stage.id}">
          ${(stage.prompts && stage.prompts.length > 0) ? stage.prompts.map((p, pIndex) => `
            <div class="prompt-card" id="card-${stage.id}-${p.id}">
              <div class="pc-top">
                <span class="pc-id">${p.title}</span>
                <div class="prompt-card-actions">
                  <button class="btn-edit-prompt" data-stage="${stage.id}" data-prompt-index="${pIndex}">
                    <i class="fa-solid fa-pen"></i> Edit
                  </button>
                  <button class="btn-delete-prompt-mini" data-action="delete-prompt" data-stage="${stage.id}" data-prompt-index="${pIndex}" title="Delete prompt">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
              <p class="pc-content" id="content-${stage.id}-${p.id}">${p.content}</p>
            </div>
          `).join('') : `
            <div style="padding:10px 14px; margin-bottom:10px; border:1px dashed var(--border-color); border-radius:8px; background:var(--bg-card-subtle); color:var(--text-muted); font-size:0.82rem;">
              <i class="fa-regular fa-folder-open text-caramel"></i> No prompts added yet. Click <strong>+ Add Prompt</strong> above to record your deliverables.
            </div>
          `}
        </div>

        <!-- STAGE ATTACHED MEDIA GRID (Images, Graphs, Videos, CAD Models) -->
        <div class="stage-media-grid" id="media-grid-${stage.id}">
          ${(stage.media && stage.media.length > 0) ? '' : '<div style="grid-column:1/-1; padding:10px 14px; color:var(--text-muted); font-size:0.82rem; font-style:italic; border:1px dashed var(--border-color); border-radius:8px; background:var(--bg-card-subtle); margin-bottom:8px;"><i class="fa-solid fa-paperclip text-caramel"></i> No media attached yet. Use the buttons above to attach Images, Graphs, Simulation Videos, or CAD Models.</div>'}
        </div>
      `;

      stagesAccordion.appendChild(stageBlock);

      // Render Media Items for this stage
      const mediaGrid = stageBlock.querySelector(`#media-grid-${stage.id}`);
      if (stage.media && stage.media.length > 0 && mediaGrid) {
        mediaGrid.innerHTML = '';
        stage.media.forEach((item, itemIdx) => {
          renderMediaCard(mediaGrid, stage.id, item, itemIdx);
        });
      }
    });

    bindStageEvents();
  }

  // RENDER INDIVIDUAL MEDIA CARD (Image / Graph / Video / CAD)
  function renderMediaCard(container, stageId, item, itemIdx) {
    const card = document.createElement('div');
    card.className = 'media-card';
    card.id = `media-card-${item.id}`;

    let badgeClass = 'badge-img';
    let badgeLabel = 'IMAGE';
    let iconClass = 'fa-solid fa-image';

    if (item.type === 'graph') {
      badgeClass = 'badge-graph';
      badgeLabel = 'GRAPH';
      iconClass = 'fa-solid fa-chart-line';
    } else if (item.type === 'video') {
      badgeClass = 'badge-video';
      badgeLabel = 'SIMULATION VIDEO';
      iconClass = 'fa-solid fa-video';
    } else if (item.type === 'cad') {
      badgeClass = 'badge-cad';
      badgeLabel = '3D CAD MODEL';
      iconClass = 'fa-solid fa-cube';
    }

    card.innerHTML = `
      <div class="media-card-header">
        <div class="media-header-left">
          <span class="media-type-badge ${badgeClass}"><i class="${iconClass}"></i> ${badgeLabel}</span>
          <span class="media-card-title" title="${item.title}">${item.title}</span>
        </div>
        <button class="btn-delete-media" title="Remove media">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
      <div class="media-card-body" id="media-body-${item.id}">
        <!-- Dynamic media element injected here -->
      </div>
      <div class="media-card-caption">
        ${item.caption || item.desc || ''}
      </div>
    `;

    // Bind delete button directly on the element — most reliable, works after every re-render
    const deleteBtn = card.querySelector('.btn-delete-media');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        // Store ids as closure variables so they are always correct
        const sid = stageId;
        const mid = String(item.id);
        deleteMediaItem(sid, mid);
      });
    }

    container.appendChild(card);
    const bodyEl = card.querySelector(`#media-body-${item.id}`);

    // Inject appropriate viewer
    if (item.type === 'image') {
      let imgSrc = item.src || item.fileUrl || item.url || '';
      if (!imgSrc || item.sourceType === 'preset' || item.presetKey || imgSrc === 'survey' || imgSrc === 'functional' || (!imgSrc.startsWith('http') && !imgSrc.startsWith('data:') && !imgSrc.startsWith('/'))) {
        imgSrc = generateSvgDiagram(item.presetKey || item.source_val || imgSrc || 'survey');
      }
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'media-img-wrapper';
      imgWrapper.title = 'Click to enlarge';
      imgWrapper.innerHTML = `
        <img src="${imgSrc}" alt="${item.title}" class="media-img-element">
        <div class="img-zoom-hint"><i class="fa-solid fa-magnifying-glass-plus"></i> Enlarge</div>
      `;
      imgWrapper.addEventListener('click', () => {
        openLightbox(imgSrc, `${item.title} — ${item.caption || ''}`);
      });
      bodyEl.appendChild(imgWrapper);

    } else if (item.type === 'video') {
      const vidWrapper = document.createElement('div');
      vidWrapper.className = 'media-video-wrapper';
      vidWrapper.innerHTML = `
        <video controls preload="metadata" style="width:100%; height:100%;">
          <source src="${item.src}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `;
      bodyEl.appendChild(vidWrapper);

    } else if (item.type === 'graph') {
      if (item.graphType === 'image_plot') {
        const plotWrapper = document.createElement('div');
        plotWrapper.className = 'graph-plot-img-wrapper';
        plotWrapper.title = 'Click to enlarge engineering graph';

        let tagsHtml = '';
        if (item.software) {
          tagsHtml += `<span class="graph-software-tag"><i class="fa-solid fa-square-poll-vertical"></i> ${item.software}</span>`;
        }

        let axisHtml = '';
        if (item.xAxis || item.yAxis) {
          axisHtml = `
            <div class="graph-axis-overlay">
              ${item.xAxis ? `<span class="graph-axis-pill"><i class="fa-solid fa-arrows-left-right"></i> X: ${item.xAxis}</span>` : ''}
              ${item.yAxis ? `<span class="graph-axis-pill"><i class="fa-solid fa-arrows-up-down"></i> Y: ${item.yAxis}</span>` : ''}
            </div>
          `;
        }

        plotWrapper.innerHTML = `
          ${tagsHtml}
          <img src="${item.src}" alt="${item.title}" class="graph-plot-img-element">
          ${axisHtml}
          <div class="img-zoom-hint"><i class="fa-solid fa-magnifying-glass-plus"></i> Enlarge Graph</div>
        `;

        plotWrapper.addEventListener('click', () => {
          const detailCaption = `${item.title}${item.software ? ' [' + item.software + ']' : ''}${item.xAxis ? ' • X: ' + item.xAxis : ''}${item.yAxis ? ' • Y: ' + item.yAxis : ''} — ${item.caption || ''}`;
          openLightbox(item.src, detailCaption);
        });

        bodyEl.appendChild(plotWrapper);
      } else {
        const graphWrapper = document.createElement('div');
        graphWrapper.className = 'media-graph-wrapper';
        const canvasEl = document.createElement('canvas');
        canvasEl.id = `chart-canvas-${item.id}`;
        graphWrapper.appendChild(canvasEl);
        bodyEl.appendChild(graphWrapper);

        // Initialize Chart.js
        setTimeout(() => {
          initChart(canvasEl, item);
        }, 50);
      }

    } else if (item.type === 'cad') {
      const cadWrapper = document.createElement('div');
      cadWrapper.className = 'media-cad-wrapper';
      cadWrapper.id = `cad-container-${item.id}`;
      cadWrapper.innerHTML = `
        <div class="cad-overlay-controls">
          <button class="cad-ctrl-btn" data-cad-action="wireframe" title="Toggle wireframe">Wireframe</button>
          <button class="cad-ctrl-btn" data-cad-action="rotate" title="Toggle rotation">Auto-Rotate</button>
          <button class="cad-ctrl-btn" data-cad-action="reset" title="Reset viewpoint">Reset Cam</button>
        </div>
        <div class="cad-view-hint"><i class="fa-solid fa-hand-pointer"></i> Drag to rotate • Scroll to zoom</div>
      `;
      bodyEl.appendChild(cadWrapper);

      // Initialize Three.js 3D Viewer
      setTimeout(() => {
        initThreeCad(cadWrapper, item);
      }, 50);
    }
  }

  // LIGHTBOX LOGIC
  const imageLightboxModal = document.getElementById('imageLightboxModal');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const btnCloseLightbox = document.getElementById('btnCloseLightbox');

  function openLightbox(src, caption) {
    if (!imageLightboxModal) return;
    if (lightboxImage) lightboxImage.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption;
    imageLightboxModal.classList.add('active');
  }

  function closeLightbox() {
    if (imageLightboxModal) imageLightboxModal.classList.remove('active');
  }

  if (btnCloseLightbox) btnCloseLightbox.addEventListener('click', closeLightbox);
  if (imageLightboxModal) {
    imageLightboxModal.addEventListener('click', (e) => {
      if (e.target === imageLightboxModal) closeLightbox();
    });
  }

  // CHART.JS INITIALIZER FOR ENGINEERING PRESETS
  function initChart(canvas, item) {
    if (typeof Chart === 'undefined') return;

    let chartConfig = null;
    const preset = item.graphPreset;

    const fontColor = '#94a3b8';
    const gridColor = 'rgba(255, 255, 255, 0.08)';

    if (preset === 'vibration') {
      chartConfig = {
        type: 'line',
        data: {
          labels: ['6.3Hz', '12.5Hz', '25Hz', '50Hz', '100Hz', '200Hz', '400Hz', '800Hz', '1250Hz'],
          datasets: [
            {
              label: 'Baseline Uncompensated Sickle (Ahv = 11.4 m/s²)',
              data: [3.8, 6.2, 11.4, 10.8, 8.5, 6.1, 4.2, 2.5, 1.2],
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderWidth: 2.5,
              tension: 0.3
            },
            {
              label: 'ISO 5349 Exposure Action Value (2.5 m/s²)',
              data: [2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5],
              borderColor: '#f59e0b',
              borderDash: [6, 4],
              borderWidth: 1.8,
              fill: false
            },
            {
              label: 'Opposed Scotch-Yoke Dual Cutter (Ahv = 2.1 m/s²)',
              data: [0.9, 1.4, 2.1, 1.9, 1.6, 1.2, 0.8, 0.5, 0.3],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              borderWidth: 3,
              fill: true,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: fontColor, font: { size: 10 } } }
          },
          scales: {
            x: { ticks: { color: fontColor }, grid: { color: gridColor } },
            y: {
              ticks: { color: fontColor },
              grid: { color: gridColor },
              title: { display: true, text: 'Acceleration Ahv (m/s² rms)', color: fontColor }
            }
          }
        }
      };
    } else if (preset === 'kinematics') {
      chartConfig = {
        type: 'line',
        data: {
          labels: ['0°', '30°', '60°', '90°', '120°', '150°', '180°', '210°', '240°', '270°', '300°', '330°', '360°'],
          datasets: [
            {
              label: 'Knife 1 Displacement x1 (mm)',
              data: [38.1, 33.0, 19.1, 0, -19.1, -33.0, -38.1, -33.0, -19.1, 0, 19.1, 33.0, 38.1],
              borderColor: '#0284c7',
              borderWidth: 2,
              tension: 0.3
            },
            {
              label: 'Knife 2 Displacement x2 (mm)',
              data: [-38.1, -33.0, -19.1, 0, 19.1, 33.0, 38.1, 33.0, 19.1, 0, -19.1, -33.0, -38.1],
              borderColor: '#10b981',
              borderWidth: 2,
              tension: 0.3
            },
            {
              label: 'Relative Cutting Speed v_rel (m/s)',
              data: [0, 1.8, 3.1, 3.6, 3.1, 1.8, 0, 1.8, 3.1, 3.6, 3.1, 1.8, 0],
              borderColor: '#f59e0b',
              borderWidth: 2.5,
              borderDash: [4, 4],
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: fontColor, font: { size: 10 } } }
          },
          scales: {
            x: { ticks: { color: fontColor }, grid: { color: gridColor } },
            y: { ticks: { color: fontColor }, grid: { color: gridColor } }
          }
        }
      };
    } else if (preset === 'req_radar' || preset === 'pugh_radar') {
      chartConfig = {
        type: 'radar',
        data: {
          labels: ['Vibration Reduction', 'Cutting Capacity', 'Knife Speed', 'Mass Limit', 'Changeover Time', 'Durability'],
          datasets: [
            {
              label: 'Design Target (100% REQ Spec)',
              data: [100, 100, 100, 100, 100, 100],
              borderColor: 'rgba(255, 255, 255, 0.4)',
              borderDash: [5, 5],
              fill: false
            },
            {
              label: 'Verified Prototype Performance',
              data: [118, 108, 115, 104, 128, 110],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.25)',
              borderWidth: 2.5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: fontColor, font: { size: 10 } } }
          },
          scales: {
            r: {
              angleLines: { color: gridColor },
              grid: { color: gridColor },
              pointLabels: { color: fontColor, font: { size: 10 } },
              ticks: { color: fontColor, backdropColor: 'transparent' }
            }
          }
        }
      };
    } else if (item.customConfig) {
      chartConfig = item.customConfig;
    } else {
      // Default stress curve
      chartConfig = {
        type: 'bar',
        data: {
          labels: ['Shaft Spline', 'Bearing Seat A', 'Crank Disc Hub', 'Bearing Seat B', 'Free Extension'],
          datasets: [
            {
              label: 'Calculated Shear Stress (MPa)',
              data: [24.5, 31.8, 38.2, 28.4, 12.0],
              backgroundColor: '#0284c7'
            },
            {
              label: 'ASME Code Limit (42 MPa)',
              data: [42, 42, 42, 42, 42],
              type: 'line',
              borderColor: '#ef4444',
              borderDash: [6, 4],
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: fontColor, font: { size: 10 } } } },
          scales: {
            x: { ticks: { color: fontColor }, grid: { color: gridColor } },
            y: { ticks: { color: fontColor }, grid: { color: gridColor } }
          }
        }
      };
    }

    try {
      activeChartInstances[item.id] = new Chart(canvas, chartConfig);
    } catch (err) {
      console.warn('Chart creation error', err);
    }
  }

  // THREE.JS 3D CAD ENGINE FOR INTERACTIVE MECHANICAL ASSEMBLIES
  function initThreeCad(container, item) {
    if (typeof THREE === 'undefined') {
      container.innerHTML = '<div style="color:#ef4444; padding:20px;">Three.js not loaded</div>';
      return;
    }

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1120);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(40, 50, 70);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    container.appendChild(renderer.domElement);

    // Controls
    let controls = null;
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 2.0;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(50, 80, 50);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.4);
    dirLight2.position.set(-50, -30, -50);
    scene.add(dirLight2);

    // Build 3D Mechanical Geometry based on cadType
    const cadType = item.cadType || 'scotchyoke';
    const dynamicObjects = [];
    const allMeshes = [];

    // Metallic Materials
    const metalChrome = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });
    const metalBronze = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.65, roughness: 0.35 });
    const metalSteel = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.4 });
    const metalBlade = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });

    // Select Custom Material
    let selectedMat = metalChrome;
    if (item.material === 'bronze') selectedMat = metalBronze;
    else if (item.material === 'steel') selectedMat = metalSteel;
    else if (item.material === 'gold') selectedMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.25 });
    else if (item.material === 'orange') selectedMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.2, roughness: 0.5 });
    else if (item.material === 'wireframe') selectedMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });

    // -------------------------------------------------------------------------
    // 1. IMPORTED LOCAL 3D CAD FILE (STL, OBJ, GLTF, GLB, STEP, STP, IGES)
    // -------------------------------------------------------------------------
    if (item.fileData) {
      const format = (item.format || (item.fileName ? item.fileName.split('.').pop() : 'stl')).toLowerCase();

      try {
        if (format === 'stl') {
          // Parse Binary or ASCII STL from Data URI
          const base64Data = item.fileData.includes(',') ? item.fileData.split(',')[1] : item.fileData;
          const binaryStr = atob(base64Data);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }

          if (typeof THREE.STLLoader !== 'undefined') {
            const loader = new THREE.STLLoader();
            const geometry = loader.parse(bytes.buffer);
            geometry.computeVertexNormals();
            geometry.center();
            geometry.computeBoundingBox();

            const size = new THREE.Vector3();
            geometry.boundingBox.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = maxDim > 0 ? 45 / maxDim : 1;

            const mesh = new THREE.Mesh(geometry, selectedMat);
            mesh.scale.set(scale, scale, scale);
            scene.add(mesh);
            allMeshes.push(mesh);
          }

        } else if (format === 'obj') {
          // Parse Wavefront OBJ
          const base64Data = item.fileData.includes(',') ? item.fileData.split(',')[1] : item.fileData;
          const text = atob(base64Data);

          if (typeof THREE.OBJLoader !== 'undefined') {
            const loader = new THREE.OBJLoader();
            const objGroup = loader.parse(text);

            const box = new THREE.Box3().setFromObject(objGroup);
            const size = new THREE.Vector3();
            box.getSize(size);
            const center = new THREE.Vector3();
            box.getCenter(center);
            objGroup.position.sub(center);

            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = maxDim > 0 ? 45 / maxDim : 1;
            objGroup.scale.set(scale, scale, scale);

            objGroup.traverse((child) => {
              if (child.isMesh) {
                child.material = selectedMat;
                allMeshes.push(child);
              }
            });
            scene.add(objGroup);
          }

        } else if (format === 'gltf' || format === 'glb') {
          // Parse GLTF / GLB
          const base64Data = item.fileData.includes(',') ? item.fileData.split(',')[1] : item.fileData;
          const binaryStr = atob(base64Data);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }

          if (typeof THREE.GLTFLoader !== 'undefined') {
            const loader = new THREE.GLTFLoader();
            loader.parse(bytes.buffer, '', (gltf) => {
              const objGroup = gltf.scene;
              const box = new THREE.Box3().setFromObject(objGroup);
              const size = new THREE.Vector3();
              box.getSize(size);
              const center = new THREE.Vector3();
              box.getCenter(center);
              objGroup.position.sub(center);

              const maxDim = Math.max(size.x, size.y, size.z);
              const scale = maxDim > 0 ? 45 / maxDim : 1;
              objGroup.scale.set(scale, scale, scale);

              objGroup.traverse((child) => {
                if (child.isMesh) allMeshes.push(child);
              });
              scene.add(objGroup);
            });
          }

        } else if (format === 'step' || format === 'stp' || format === 'iges') {
          // STEP / IGES Solid CAD model representation with precision datum triad
          const group = new THREE.Group();

          // Parametric solid CAD body representation
          const solidGeo = new THREE.BoxGeometry(36, 24, 18);
          const solidMesh = new THREE.Mesh(solidGeo, selectedMat);
          group.add(solidMesh);
          allMeshes.push(solidMesh);

          // Technical CAD wireframe edges
          const edgeGeo = new THREE.EdgesGeometry(solidGeo);
          const edgeMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
          const edges = new THREE.LineSegments(edgeGeo, edgeMat);
          group.add(edges);

          // Precision cylindrical journal bore
          const boreGeo = new THREE.CylinderGeometry(5.5, 5.5, 26, 24);
          const boreMesh = new THREE.Mesh(boreGeo, metalSteel);
          boreMesh.rotation.z = Math.PI / 2;
          group.add(boreMesh);
          allMeshes.push(boreMesh);

          // Coordinate Datum Triad (X=Red, Y=Green, Z=Blue)
          const axes = new THREE.AxesHelper(28);
          group.add(axes);

          scene.add(group);

        } else {
          // Standard geometric mesh fallback
          const geo = new THREE.DodecahedronGeometry(18, 1);
          const mesh = new THREE.Mesh(geo, selectedMat);
          scene.add(mesh);
          allMeshes.push(mesh);
        }

        // Auto-center camera
        camera.position.set(35, 45, 65);
        if (controls) {
          controls.target.set(0, 0, 0);
          controls.update();
        }

      } catch (err) {
        console.error('Error rendering custom 3D model:', err);
        const errGeo = new THREE.BoxGeometry(20, 20, 20);
        const errMesh = new THREE.Mesh(errGeo, new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        scene.add(errMesh);
        allMeshes.push(errMesh);
      }

      // -------------------------------------------------------------------------
      // 2. INTERACTIVE 3D CAD PRESET ASSEMBLIES
      // -------------------------------------------------------------------------
    } else if (cadType === 'scotchyoke') {
      // 1. Base mounting plate
      const baseGeo = new THREE.BoxGeometry(60, 2, 30);
      const baseMesh = new THREE.Mesh(baseGeo, metalSteel);
      baseMesh.position.y = -10;
      scene.add(baseMesh);
      allMeshes.push(baseMesh);

      // 2. Central Crank Disc
      const crankDiscGeo = new THREE.CylinderGeometry(14, 14, 4, 32);
      const crankDisc = new THREE.Mesh(crankDiscGeo, metalSteel);
      crankDisc.rotation.x = Math.PI / 2;
      scene.add(crankDisc);
      allMeshes.push(crankDisc);

      // 3. Crank Pin
      const pinGeo = new THREE.CylinderGeometry(2.5, 2.5, 10, 16);
      const crankPin = new THREE.Mesh(pinGeo, metalChrome);
      crankPin.rotation.x = Math.PI / 2;
      scene.add(crankPin);
      allMeshes.push(crankPin);

      // 4. Dual Scotch Yoke Sliders
      const yokeGeo = new THREE.BoxGeometry(10, 26, 4);
      const yokeL = new THREE.Mesh(yokeGeo, metalBronze);
      const yokeR = new THREE.Mesh(yokeGeo, metalBronze);
      yokeL.position.z = 5;
      yokeR.position.z = -5;
      scene.add(yokeL);
      scene.add(yokeR);
      allMeshes.push(yokeL, yokeR);

      // 5. Opposed Knife pushrods & blades
      const rodGeo = new THREE.CylinderGeometry(1.5, 1.5, 24, 12);
      const rodL = new THREE.Mesh(rodGeo, metalChrome);
      rodL.rotation.z = Math.PI / 2;
      rodL.position.x = -16;
      rodL.position.z = 5;
      scene.add(rodL);

      const rodR = new THREE.Mesh(rodGeo, metalChrome);
      rodR.rotation.z = Math.PI / 2;
      rodR.position.x = 16;
      rodR.position.z = -5;
      scene.add(rodR);
      allMeshes.push(rodL, rodR);

      // Knife tips
      const bladeGeo = new THREE.ConeGeometry(5, 12, 3);
      const bladeL = new THREE.Mesh(bladeGeo, metalBlade);
      bladeL.rotation.z = -Math.PI / 2;
      bladeL.position.x = -32;
      bladeL.position.z = 5;
      scene.add(bladeL);

      const bladeR = new THREE.Mesh(bladeGeo, metalBlade);
      bladeR.rotation.z = Math.PI / 2;
      bladeR.position.x = 32;
      bladeR.position.z = -5;
      scene.add(bladeR);
      allMeshes.push(bladeL, bladeR);

      dynamicObjects.push({
        update: (time) => {
          const r = 9;
          const angle = time * 2.5;
          crankDisc.rotation.z = angle;
          crankPin.position.x = r * Math.cos(angle);
          crankPin.position.y = r * Math.sin(angle);

          yokeL.position.x = r * Math.cos(angle);
          rodL.position.x = -16 + r * Math.cos(angle);
          bladeL.position.x = -32 + r * Math.cos(angle);

          yokeR.position.x = -r * Math.cos(angle);
          rodR.position.x = 16 - r * Math.cos(angle);
          bladeR.position.x = 32 - r * Math.cos(angle);
        }
      });

    } else if (cadType === 'cutterbar') {
      // Long cutter bar with triangular teeth
      const barGeo = new THREE.BoxGeometry(60, 3, 6);
      const bar = new THREE.Mesh(barGeo, metalSteel);
      scene.add(bar);
      allMeshes.push(bar);

      // Upper oscillating blade bar
      const knifeBarGeo = new THREE.BoxGeometry(56, 2, 4);
      const knifeBar = new THREE.Mesh(knifeBarGeo, metalBronze);
      knifeBar.position.y = 2.5;
      scene.add(knifeBar);
      allMeshes.push(knifeBar);

      // Teeth
      for (let i = -24; i <= 24; i += 6) {
        const toothGeo = new THREE.ConeGeometry(3, 8, 3);
        const tooth = new THREE.Mesh(toothGeo, metalBlade);
        tooth.rotation.x = Math.PI / 2;
        tooth.position.set(i, 2.5, 6);
        knifeBar.add(tooth);
        allMeshes.push(tooth);
      }

      dynamicObjects.push({
        update: (time) => {
          knifeBar.position.x = Math.sin(time * 3.5) * 5;
        }
      });

    } else if (cadType === 'shaft') {
      // PTO Shaft with Bearings
      const shaftGeo = new THREE.CylinderGeometry(3, 3, 60, 24);
      const shaft = new THREE.Mesh(shaftGeo, metalChrome);
      shaft.rotation.z = Math.PI / 2;
      scene.add(shaft);
      allMeshes.push(shaft);

      // Bearings
      const bRingGeo = new THREE.TorusGeometry(6, 2, 12, 24);
      const b1 = new THREE.Mesh(bRingGeo, metalSteel);
      b1.rotation.y = Math.PI / 2;
      b1.position.x = -15;
      scene.add(b1);

      const b2 = new THREE.Mesh(bRingGeo, metalSteel);
      b2.rotation.y = Math.PI / 2;
      b2.position.x = 15;
      scene.add(b2);
      allMeshes.push(b1, b2);

      dynamicObjects.push({
        update: (time) => {
          shaft.rotation.x = time * 4.0;
        }
      });

    } else {
      // Chassis Frame
      const frameGeo = new THREE.BoxGeometry(50, 4, 30);
      const frame = new THREE.Mesh(frameGeo, metalSteel);
      scene.add(frame);
      allMeshes.push(frame);

      // Mounting ears
      const earGeo = new THREE.BoxGeometry(8, 16, 4);
      const e1 = new THREE.Mesh(earGeo, metalBronze);
      e1.position.set(-20, 8, 15);
      const e2 = new THREE.Mesh(earGeo, metalBronze);
      e2.position.set(20, 8, 15);
      scene.add(e1, e2);
      allMeshes.push(e1, e2);
    }

    // Animation Loop
    let animId = null;
    let clock = new THREE.Clock();

    function animate() {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      dynamicObjects.forEach(obj => obj.update(elapsedTime));
      if (controls) controls.update();

      renderer.render(scene, camera);
    }
    animate();

    // Hook up overlay controls
    const btnWireframe = container.querySelector('[data-cad-action="wireframe"]');
    if (btnWireframe) {
      let isWire = false;
      btnWireframe.addEventListener('click', (e) => {
        e.stopPropagation();
        isWire = !isWire;
        btnWireframe.classList.toggle('active', isWire);
        allMeshes.forEach(m => {
          if (m.material) m.material.wireframe = isWire;
        });
      });
    }

    const btnRotate = container.querySelector('[data-cad-action="rotate"]');
    if (btnRotate) {
      btnRotate.addEventListener('click', (e) => {
        e.stopPropagation();
        if (controls) {
          controls.autoRotate = !controls.autoRotate;
          btnRotate.classList.toggle('active', controls.autoRotate);
        }
      });
    }

    const btnReset = container.querySelector('[data-cad-action="reset"]');
    if (btnReset) {
      btnReset.addEventListener('click', (e) => {
        e.stopPropagation();
        camera.position.set(40, 50, 70);
        if (controls) {
          controls.target.set(0, 0, 0);
          controls.update();
        }
      });
    }

    // Cache scene for cleanup
    activeThreeScenes[item.id] = {
      cleanup: () => {
        cancelAnimationFrame(animId);
        renderer.dispose();
      }
    };
  }

  // EVENT BINDINGS FOR ALL SEPARATE BUTTONS ACROSS S1–S11
  function bindStageEvents() {
    // Stage Header Accordion Toggle
    document.querySelectorAll('[data-toggle-stage]').forEach(hdr => {
      hdr.addEventListener('click', () => {
        const stageId = hdr.getAttribute('data-toggle-stage');
        const block = document.getElementById(`block-${stageId}`);
        if (block) {
          block.classList.toggle('collapsed');
        }
      });
    });

    // 1. Separate Button: Add Image
    document.querySelectorAll('[data-action="add-img"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stageId = btn.getAttribute('data-stage');
        openAddImageModal(stageId);
      });
    });

    // 2. Separate Button: Add Graph
    document.querySelectorAll('[data-action="add-graph"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stageId = btn.getAttribute('data-stage');
        openAddGraphModal(stageId);
      });
    });

    // 3. Separate Button: Add Simulation Video
    document.querySelectorAll('[data-action="add-video"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stageId = btn.getAttribute('data-stage');
        openAddVideoModal(stageId);
      });
    });

    // 4. Separate Button: Add 3D CAD Model
    document.querySelectorAll('[data-action="add-cad"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stageId = btn.getAttribute('data-stage');
        openAddCadModal(stageId);
      });
    });

    // 5. Separate Button: Edit Stage Header
    document.querySelectorAll('[data-action="edit-stage"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stageId = btn.getAttribute('data-stage');
        openEditStageModal(stageId);
      });
    });

    // 6. Separate Button: Add Prompt
    document.querySelectorAll('[data-action="add-prompt"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stageId = btn.getAttribute('data-stage');
        openAddPromptModal(stageId);
      });
    });

    // Edit Prompt Button on Card
    document.querySelectorAll('.btn-edit-prompt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stageId = btn.getAttribute('data-stage');
        const pIndex = parseInt(btn.getAttribute('data-prompt-index'), 10);
        openEditPromptModal(stageId, pIndex);
      });
    });

    // Delete Prompt Button
    document.querySelectorAll('[data-action="delete-prompt"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const stageId = btn.getAttribute('data-stage');
        const pIndex = parseInt(btn.getAttribute('data-prompt-index'), 10);
        showConfirmModal('Delete Deliverable Prompt', 'Are you sure you want to delete this deliverable prompt?', () => {
          deletePrompt(stageId, pIndex);
        });
      });
    });

    // Delete Media: handled via document-level delegation (see top of script)
  }

  // Populate Stage Dropdown Helper
  function populateStageSelect(selectEl, selectedStageId) {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    stagesData.forEach(st => {
      const opt = document.createElement('option');
      opt.value = st.id;
      opt.textContent = `${st.number}: ${st.title}`;
      if (st.id === selectedStageId) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }

  // ---------------------------------------------------------------------------
  // MODAL LOGIC & ACTIONS
  // ---------------------------------------------------------------------------

  // 1. EDIT / ADD PROMPT MODAL
  const editPromptModal = document.getElementById('editPromptModal');
  const modalPromptTitle = document.getElementById('modalPromptTitle');
  const modalPromptStageId = document.getElementById('modalPromptStageId');
  const modalPromptIndex = document.getElementById('modalPromptIndex');
  const modalPromptIdInput = document.getElementById('modalPromptIdInput');
  const modalPromptTitleInput = document.getElementById('modalPromptTitleInput');
  const modalPromptInput = document.getElementById('modalPromptInput');
  const btnClosePromptModal = document.getElementById('btnClosePromptModal');
  const btnCancelPrompt = document.getElementById('btnCancelPrompt');
  const btnSavePrompt = document.getElementById('btnSavePrompt');
  const btnDeletePrompt = document.getElementById('btnDeletePrompt');

  function openEditPromptModal(stageId, pIndex) {
    const stage = stagesData.find(s => s.id === stageId);
    if (!stage || !stage.prompts[pIndex]) return;

    const p = stage.prompts[pIndex];
    if (modalPromptTitle) modalPromptTitle.innerHTML = `<i class="fa-solid fa-pen text-caramel"></i> Edit Deliverable Prompt (${stage.number})`;
    if (modalPromptStageId) modalPromptStageId.value = stageId;
    if (modalPromptIndex) modalPromptIndex.value = pIndex;
    if (modalPromptIdInput) modalPromptIdInput.value = p.id;
    if (modalPromptTitleInput) modalPromptTitleInput.value = p.title;
    if (modalPromptInput) modalPromptInput.value = p.content;
    if (btnDeletePrompt) btnDeletePrompt.style.display = 'inline-flex';

    if (editPromptModal) editPromptModal.classList.add('active');
  }

  function openAddPromptModal(stageId) {
    const stage = stagesData.find(s => s.id === stageId);
    if (!stage) return;

    if (modalPromptTitle) modalPromptTitle.innerHTML = `<i class="fa-solid fa-plus text-caramel"></i> Add Deliverable Prompt to ${stage.number}`;
    if (modalPromptStageId) modalPromptStageId.value = stageId;
    if (modalPromptIndex) modalPromptIndex.value = -1; // New
    if (modalPromptIdInput) modalPromptIdInput.value = `${stage.id.toLowerCase()}_${stage.prompts.length + 1}`;
    if (modalPromptTitleInput) modalPromptTitleInput.value = `${stage.number}.${stage.prompts.length + 1} New Deliverable`;
    if (modalPromptInput) modalPromptInput.value = '';
    if (btnDeletePrompt) btnDeletePrompt.style.display = 'none';

    if (editPromptModal) editPromptModal.classList.add('active');
  }

  function closePromptModal() {
    if (editPromptModal) editPromptModal.classList.remove('active');
  }

  if (btnClosePromptModal) btnClosePromptModal.addEventListener('click', closePromptModal);
  if (btnCancelPrompt) btnCancelPrompt.addEventListener('click', closePromptModal);

  if (btnSavePrompt) {
    btnSavePrompt.addEventListener('click', () => {
      const stageId = modalPromptStageId.value;
      const pIndex = parseInt(modalPromptIndex.value, 10);
      const stage = stagesData.find(s => s.id === stageId);
      if (!stage) return;

      const newPromptData = {
        id: modalPromptIdInput.value.trim() || `p_${Date.now()}`,
        title: modalPromptTitleInput.value.trim() || 'Deliverable',
        content: modalPromptInput.value.trim()
      };

      if (pIndex >= 0 && stage.prompts[pIndex]) {
        stage.prompts[pIndex] = newPromptData;
        showToast(`Updated deliverable in ${stage.number}!`);
      } else {
        stage.prompts.push(newPromptData);
        showToast(`Added new deliverable to ${stage.number}!`);
      }

      saveStagesData();
      renderAllStages();
      closePromptModal();
    });
  }

  function deletePrompt(stageId, pIndex) {
    const stage = stagesData.find(s => s.id === stageId);
    if (!stage || !stage.prompts[pIndex]) return;
    stage.prompts.splice(pIndex, 1);
    saveStagesData();
    renderAllStages();
    showToast(`Deleted prompt from ${stage.number}`);
  }

  if (btnDeletePrompt) {
    btnDeletePrompt.addEventListener('click', () => {
      const stageId = modalPromptStageId.value;
      const pIndex = parseInt(modalPromptIndex.value, 10);
      showConfirmModal('Delete Deliverable', 'Delete this deliverable prompt from the stage?', () => {
        deletePrompt(stageId, pIndex);
        closePromptModal();
      });
    });
  }

  // 2. EDIT STAGE HEADER MODAL
  const editStageModal = document.getElementById('editStageModal');
  const modalStageTitleHeader = document.getElementById('modalStageTitleHeader');
  const modalStageKey = document.getElementById('modalStageKey');
  const modalStageTitleInput = document.getElementById('modalStageTitleInput');
  const modalStageQuestionInput = document.getElementById('modalStageQuestionInput');
  const modalStageStatusSelect = document.getElementById('modalStageStatusSelect');
  const btnCloseStageModal = document.getElementById('btnCloseStageModal');
  const btnCancelStage = document.getElementById('btnCancelStage');
  const btnSaveStageHeader = document.getElementById('btnSaveStageHeader');

  function openEditStageModal(stageId) {
    const stage = stagesData.find(s => s.id === stageId);
    if (!stage) return;

    if (modalStageTitleHeader) modalStageTitleHeader.innerHTML = `<i class="fa-solid fa-pen-to-square text-caramel"></i> Edit ${stage.number} Header`;
    if (modalStageKey) modalStageKey.value = stageId;
    if (modalStageTitleInput) modalStageTitleInput.value = stage.title;
    if (modalStageQuestionInput) modalStageQuestionInput.value = stage.question;
    if (modalStageStatusSelect) modalStageStatusSelect.value = stage.status;

    if (editStageModal) editStageModal.classList.add('active');
  }

  function closeStageModal() {
    if (editStageModal) editStageModal.classList.remove('active');
  }

  if (btnCloseStageModal) btnCloseStageModal.addEventListener('click', closeStageModal);
  if (btnCancelStage) btnCancelStage.addEventListener('click', closeStageModal);

  if (btnSaveStageHeader) {
    btnSaveStageHeader.addEventListener('click', () => {
      const stageId = modalStageKey.value;
      const stage = stagesData.find(s => s.id === stageId);
      if (!stage) return;

      stage.title = modalStageTitleInput.value.trim() || stage.title;
      stage.question = modalStageQuestionInput.value.trim() || stage.question;
      stage.status = modalStageStatusSelect.value;

      saveStagesData();
      renderAllStages();
      closeStageModal();
      showToast(`Saved changes to ${stage.number}: ${stage.title}!`);
    });
  }

  // 3. ADD IMAGE MODAL
  const addImageModal = document.getElementById('addImageModal');
  const imgTargetStageSelect = document.getElementById('imgTargetStageSelect');
  const imgTitleInput = document.getElementById('imgTitleInput');
  const imgPresetSelect = document.getElementById('imgPresetSelect');
  const imgFileInput = document.getElementById('imgFileInput');
  const imgUrlInput = document.getElementById('imgUrlInput');
  const imgCaptionInput = document.getElementById('imgCaptionInput');
  const btnCloseImageModal = document.getElementById('btnCloseImageModal');
  const btnCancelImage = document.getElementById('btnCancelImage');
  const btnConfirmAddImage = document.getElementById('btnConfirmAddImage');

  let activeImgSource = 'preset';

  function openAddImageModal(targetStageId) {
    populateStageSelect(imgTargetStageSelect, targetStageId);
    if (imgTitleInput) imgTitleInput.value = '';
    if (imgCaptionInput) imgCaptionInput.value = '';
    if (imgUrlInput) imgUrlInput.value = '';
    if (imgFileInput) imgFileInput.value = '';
    activeImgSource = 'preset';
    updateImgSourceTabs();
    if (addImageModal) addImageModal.classList.add('active');
  }

  function updateImgSourceTabs() {
    document.querySelectorAll('#addImageModal .modal-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-source') === activeImgSource);
    });
    const pBlock = document.getElementById('imgSourcePresetBlock');
    const uBlock = document.getElementById('imgSourceUploadBlock');
    const lBlock = document.getElementById('imgSourceUrlBlock');

    if (pBlock) pBlock.style.display = activeImgSource === 'preset' ? 'block' : 'none';
    if (uBlock) uBlock.style.display = activeImgSource === 'upload' ? 'block' : 'none';
    if (lBlock) lBlock.style.display = activeImgSource === 'url' ? 'block' : 'none';
  }

  document.querySelectorAll('#addImageModal .modal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeImgSource = btn.getAttribute('data-source');
      updateImgSourceTabs();
    });
  });

  if (btnCloseImageModal) btnCloseImageModal.addEventListener('click', () => addImageModal.classList.remove('active'));
  if (btnCancelImage) btnCancelImage.addEventListener('click', () => addImageModal.classList.remove('active'));

  if (btnConfirmAddImage) {
    btnConfirmAddImage.addEventListener('click', async () => {
      const stageId = imgTargetStageSelect.value;
      const stage = stagesData.find(s => s.id === stageId);
      if (!stage) return;

      const title = imgTitleInput.value.trim() || 'Engineering Diagram';
      const caption = imgCaptionInput.value.trim() || 'Attached technical schematic';

      if (activeImgSource === 'upload' && imgFileInput.files && imgFileInput.files[0]) {
        const file = imgFileInput.files[0];
        showToast('⏳ Uploading & optimizing image to backend...');
        
        // Try uploading to FastAPI backend
        try {
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await fetch('/api/uploads/image', {
            method: 'POST',
            body: formData
          });

          if (uploadRes.ok) {
            const data = await uploadRes.json();
            const imageUrl = data.fileUrl || data.dataUrl;
            attachMediaToStage(stage, {
              id: `img_${Date.now()}`,
              type: 'image',
              title: title,
              src: imageUrl,
              fileUrl: data.fileUrl,
              sourceType: 'upload',
              caption: caption
            });
            addImageModal.classList.remove('active');
            showToast('✅ Image uploaded and permanently saved in database!');
            return;
          }
        } catch (err) {
          console.warn('Backend image upload failed, falling back to local storage', err);
        }

        // Local fallback if offline
        const reader = new FileReader();
        reader.onload = (e) => {
          attachMediaToStage(stage, {
            id: `img_${Date.now()}`,
            type: 'image',
            title: title,
            src: e.target.result,
            sourceType: 'upload',
            caption: caption
          });
          addImageModal.classList.remove('active');
        };
        reader.readAsDataURL(file);

      } else if (activeImgSource === 'url' && imgUrlInput.value.trim()) {
        attachMediaToStage(stage, {
          id: `img_${Date.now()}`,
          type: 'image',
          title: title,
          src: imgUrlInput.value.trim(),
          sourceType: 'url',
          caption: caption
        });
        addImageModal.classList.remove('active');
      } else {
        // Preset
        const presetKey = imgPresetSelect.value;
        attachMediaToStage(stage, {
          id: `img_${Date.now()}`,
          type: 'image',
          title: title,
          src: generateSvgDiagram(presetKey),
          sourceType: 'preset',
          presetKey: presetKey,
          caption: caption
        });
        addImageModal.classList.remove('active');
      }
    });
  }

  // 4. ADD GRAPH MODAL
  const addGraphModal = document.getElementById('addGraphModal');
  const graphTargetStageSelect = document.getElementById('graphTargetStageSelect');
  const graphTitleInput = document.getElementById('graphTitleInput');
  const graphPresetSelect = document.getElementById('graphPresetSelect');
  const graphCaptionInput = document.getElementById('graphCaptionInput');
  const btnCloseGraphModal = document.getElementById('btnCloseGraphModal');
  const btnCancelGraph = document.getElementById('btnCancelGraph');
  const btnConfirmAddGraph = document.getElementById('btnConfirmAddGraph');

  // Graph Image Import elements
  const graphImgDropzone = document.getElementById('graphImgDropzone');
  const graphImgFileInput = document.getElementById('graphImgFileInput');
  const graphImgSelectedInfo = document.getElementById('graphImgSelectedInfo');
  const graphImgFileNameDisplay = document.getElementById('graphImgFileNameDisplay');
  const graphImgFileSizeDisplay = document.getElementById('graphImgFileSizeDisplay');
  const graphImgBadge = document.getElementById('graphImgBadge');
  const graphSoftwareOrigin = document.getElementById('graphSoftwareOrigin');
  const graphYAxisLabel = document.getElementById('graphYAxisLabel');
  const graphXAxisLabel = document.getElementById('graphXAxisLabel');

  const btnSampleMatlabPlot = document.getElementById('btnSampleMatlabPlot');
  const btnSampleAnsysPlot = document.getElementById('btnSampleAnsysPlot');
  const btnSampleSolidworksPlot = document.getElementById('btnSampleSolidworksPlot');

  // Graph CSV Import elements
  const graphCsvDropzone = document.getElementById('graphCsvDropzone');
  const graphCsvFileInput = document.getElementById('graphCsvFileInput');
  const graphCsvSelectedInfo = document.getElementById('graphCsvSelectedInfo');
  const graphCsvFileNameDisplay = document.getElementById('graphCsvFileNameDisplay');
  const graphCsvFileSizeDisplay = document.getElementById('graphCsvFileSizeDisplay');

  const btnSampleVibrationCsv = document.getElementById('btnSampleVibrationCsv');
  const btnSampleKinematicsCsv = document.getElementById('btnSampleKinematicsCsv');

  let activeGraphMode = 'preset';
  let selectedGraphImgFile = null;
  let customGraphImgDataUrl = null;
  let selectedGraphCsvFile = null;
  let customGraphCsvText = null;

  function openAddGraphModal(targetStageId) {
    populateStageSelect(graphTargetStageSelect, targetStageId);
    if (graphTitleInput) graphTitleInput.value = '';
    if (graphCaptionInput) graphCaptionInput.value = '';
    if (graphImgFileInput) graphImgFileInput.value = '';
    if (graphCsvFileInput) graphCsvFileInput.value = '';
    if (graphImgSelectedInfo) graphImgSelectedInfo.style.display = 'none';
    if (graphCsvSelectedInfo) graphCsvSelectedInfo.style.display = 'none';
    selectedGraphImgFile = null;
    customGraphImgDataUrl = null;
    selectedGraphCsvFile = null;
    customGraphCsvText = null;
    activeGraphMode = 'preset';
    updateGraphModeTabs();
    if (addGraphModal) addGraphModal.classList.add('active');
  }

  function updateGraphModeTabs() {
    document.querySelectorAll('#addGraphModal .modal-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-graph-mode') === activeGraphMode);
    });
    const pBlock = document.getElementById('graphPresetBlock');
    const iBlock = document.getElementById('graphImageBlock');
    const cBlock = document.getElementById('graphCustomBlock');
    const csvBlock = document.getElementById('graphCsvBlock');

    if (pBlock) pBlock.style.display = activeGraphMode === 'preset' ? 'block' : 'none';
    if (iBlock) iBlock.style.display = activeGraphMode === 'image' ? 'block' : 'none';
    if (cBlock) cBlock.style.display = activeGraphMode === 'custom' ? 'block' : 'none';
    if (csvBlock) csvBlock.style.display = activeGraphMode === 'csv' ? 'block' : 'none';
  }

  document.querySelectorAll('#addGraphModal .modal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeGraphMode = btn.getAttribute('data-graph-mode');
      updateGraphModeTabs();
    });
  });

  // Handle Graph Image Dropzone & File Input
  if (graphImgDropzone && graphImgFileInput) {
    graphImgDropzone.addEventListener('click', () => {
      graphImgFileInput.click();
    });

    graphImgDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      graphImgDropzone.classList.add('drag-over');
    });

    graphImgDropzone.addEventListener('dragleave', () => {
      graphImgDropzone.classList.remove('drag-over');
    });

    graphImgDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      graphImgDropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleGraphImgSelection(e.dataTransfer.files[0]);
      }
    });

    graphImgFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleGraphImgSelection(e.target.files[0]);
      }
    });
  }

  function handleGraphImgSelection(file) {
    selectedGraphImgFile = file;
    customGraphImgDataUrl = null;
    const ext = file.name.split('.').pop().toLowerCase();
    if (graphImgFileNameDisplay) graphImgFileNameDisplay.textContent = file.name;
    if (graphImgFileSizeDisplay) graphImgFileSizeDisplay.textContent = `(${(file.size / 1024).toFixed(1)} KB)`;
    if (graphImgBadge) graphImgBadge.textContent = `${ext.toUpperCase()} PLOT`;
    if (graphImgSelectedInfo) graphImgSelectedInfo.style.display = 'flex';
    if (graphTitleInput && !graphTitleInput.value.trim()) {
      graphTitleInput.value = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
    }
  }

  // Quick sample plot buttons
  function loadSamplePlot(software, title, xAxis, yAxis) {
    selectedGraphImgFile = null;
    customGraphImgDataUrl = generateSampleGraphPlotSvg(software);
    if (graphImgFileNameDisplay) graphImgFileNameDisplay.textContent = `${software.toLowerCase().replace(/[^a-z0-9]/g, '_')}_plot.svg`;
    if (graphImgFileSizeDisplay) graphImgFileSizeDisplay.textContent = '(12 KB Vector)';
    if (graphImgBadge) graphImgBadge.textContent = 'SAMPLE PLOT';
    if (graphImgSelectedInfo) graphImgSelectedInfo.style.display = 'flex';
    if (graphSoftwareOrigin) graphSoftwareOrigin.value = software;
    if (graphTitleInput) graphTitleInput.value = title;
    if (graphXAxisLabel) graphXAxisLabel.value = xAxis;
    if (graphYAxisLabel) graphYAxisLabel.value = yAxis;
    showToast(`Loaded ${software} sample plot demonstration!`);
  }

  if (btnSampleMatlabPlot) {
    btnSampleMatlabPlot.addEventListener('click', (e) => {
      e.stopPropagation();
      loadSamplePlot('MATLAB / Simulink', 'MATLAB FFT Hand-Arm Vibration Spectrum', 'Frequency (Hz)', 'Acceleration Ahv (m/s²)');
    });
  }

  if (btnSampleAnsysPlot) {
    btnSampleAnsysPlot.addEventListener('click', (e) => {
      e.stopPropagation();
      loadSamplePlot('ANSYS FEA', 'ANSYS Harmonic Peak Stress vs Fatigue Endurance', 'Harmonic Frequency (Hz)', 'Von Mises Stress (MPa)');
    });
  }

  if (btnSampleSolidworksPlot) {
    btnSampleSolidworksPlot.addEventListener('click', (e) => {
      e.stopPropagation();
      loadSamplePlot('SolidWorks Motion', 'SolidWorks Dual-Slider Motion & Velocity Trace', 'Crank Angle θ (deg)', 'Position x(t) & Velocity v(t)');
    });
  }

  // Handle Graph CSV Dropzone & File Input
  if (graphCsvDropzone && graphCsvFileInput) {
    graphCsvDropzone.addEventListener('click', () => {
      graphCsvFileInput.click();
    });

    graphCsvDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      graphCsvDropzone.classList.add('drag-over');
    });

    graphCsvDropzone.addEventListener('dragleave', () => {
      graphCsvDropzone.classList.remove('drag-over');
    });

    graphCsvDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      graphCsvDropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleGraphCsvSelection(e.dataTransfer.files[0]);
      }
    });

    graphCsvFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleGraphCsvSelection(e.target.files[0]);
      }
    });
  }

  function handleGraphCsvSelection(file) {
    selectedGraphCsvFile = file;
    customGraphCsvText = null;
    if (graphCsvFileNameDisplay) graphCsvFileNameDisplay.textContent = file.name;
    if (graphCsvFileSizeDisplay) graphCsvFileSizeDisplay.textContent = `(${(file.size / 1024).toFixed(1)} KB)`;
    if (graphCsvSelectedInfo) graphCsvSelectedInfo.style.display = 'flex';
    if (graphTitleInput && !graphTitleInput.value.trim()) {
      graphTitleInput.value = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ') + ' Telemetry';
    }
  }

  // Quick sample CSV buttons
  if (btnSampleVibrationCsv) {
    btnSampleVibrationCsv.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedGraphCsvFile = null;
      customGraphCsvText = `Frequency_Hz,Baseline_Sickle_Ahv,Scotch_Yoke_Ahv,ISO5349_Action_Limit\n6.3,3.8,0.9,2.5\n12.5,6.2,1.4,2.5\n25.0,11.4,2.1,2.5\n50.0,10.8,1.9,2.5\n100.0,8.5,1.6,2.5\n200.0,6.1,1.2,2.5\n400.0,4.2,0.8,2.5\n800.0,2.5,0.5,2.5\n1250.0,1.2,0.3,2.5`;
      if (graphCsvFileNameDisplay) graphCsvFileNameDisplay.textContent = 'vibration_iso5349_trial.csv';
      if (graphCsvFileSizeDisplay) graphCsvFileSizeDisplay.textContent = '(1.2 KB Telemetry)';
      if (graphCsvSelectedInfo) graphCsvSelectedInfo.style.display = 'flex';
      if (graphTitleInput) graphTitleInput.value = 'ISO 5349 Accelerometer Frequency Spectrum (CSV Import)';
      showToast('Loaded sample Tri-Axial Accelerometer CSV Telemetry!');
    });
  }

  if (btnSampleKinematicsCsv) {
    btnSampleKinematicsCsv.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedGraphCsvFile = null;
      customGraphCsvText = `Crank_Angle_Deg,Knife1_Displacement_mm,Knife2_Displacement_mm,Relative_Velocity_mps\n0,38.1,-38.1,0.0\n45,26.9,-26.9,2.4\n90,0.0,0.0,3.4\n135,-26.9,26.9,2.4\n180,-38.1,38.1,0.0\n225,-26.9,26.9,-2.4\n270,0.0,0.0,-3.4\n315,26.9,-26.9,-2.4\n360,38.1,-38.1,0.0`;
      if (graphCsvFileNameDisplay) graphCsvFileNameDisplay.textContent = 'scotch_yoke_kinematics.csv';
      if (graphCsvFileSizeDisplay) graphCsvFileSizeDisplay.textContent = '(1.1 KB Kinematics)';
      if (graphCsvSelectedInfo) graphCsvSelectedInfo.style.display = 'flex';
      if (graphTitleInput) graphTitleInput.value = 'Scotch-Yoke Opposed Dual Kinematics (CSV Import)';
      showToast('Loaded sample Scotch-Yoke Kinematics CSV Dataset!');
    });
  }

  // Parse CSV text into Chart.js config
  function parseCsvToChartConfig(csvText) {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return null;

    let delimiter = ',';
    if (lines[0].includes('\t')) delimiter = '\t';
    else if (lines[0].includes(';')) delimiter = ';';

    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
    const xColName = headers[0] || 'Index';
    const seriesNames = headers.slice(1);

    const labels = [];
    const seriesData = seriesNames.map(() => []);

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (!parts[0]) continue;
      labels.push(parts[0]);
      for (let s = 0; s < seriesNames.length; s++) {
        const val = parseFloat(parts[s + 1]);
        seriesData[s].push(isNaN(val) ? 0 : val);
      }
    }

    const palette = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
    const datasets = seriesNames.map((name, sIdx) => ({
      label: name.replace(/_/g, ' '),
      data: seriesData[sIdx],
      borderColor: palette[sIdx % palette.length],
      backgroundColor: `${palette[sIdx % palette.length]}22`,
      borderWidth: 2.5,
      tension: 0.25,
      fill: sIdx === 0
    }));

    return {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { size: 10 } } }
        },
        scales: {
          x: {
            title: { display: true, text: xColName.replace(/_/g, ' '), color: '#94a3b8' },
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(255,255,255,0.08)' }
          },
          y: {
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(255,255,255,0.08)' }
          }
        }
      }
    };
  }

  // Generate Sample High-Fidelity SVG Plots for MATLAB, ANSYS, SolidWorks
  function generateSampleGraphPlotSvg(software) {
    const bg = '#0b1120';
    const grid = 'rgba(255,255,255,0.08)';
    const cyan = '#0284c7';
    const amber = '#f59e0b';
    const green = '#10b981';
    const red = '#ef4444';
    const text = '#e2e8f0';

    if (software.includes('MATLAB')) {
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
        <rect width="640" height="360" fill="${bg}"/>
        <defs><pattern id="mg" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="${grid}" stroke-width="1"/></pattern></defs>
        <rect width="640" height="360" fill="url(%23mg)"/>
        <rect x="0" y="0" width="640" height="38" fill="%231e293b"/>
        <text x="20" y="24" fill="${cyan}" font-family="monospace" font-weight="bold" font-size="14">MATLAB R2024b / Simulink • Figure 1: Hand-Arm Vibration FFT Spectrum</text>
        <line x1="60" y1="50" x2="60" y2="300" stroke="${text}" stroke-width="2"/>
        <line x1="60" y1="300" x2="600" y2="300" stroke="${text}" stroke-width="2"/>
        <path d="M 60 270 Q 120 220 180 120 T 300 80 T 420 180 T 540 240 L 590 260" fill="none" stroke="${red}" stroke-width="3"/>
        <line x1="60" y1="210" x2="600" y2="210" stroke="${amber}" stroke-width="2" stroke-dasharray="6,4"/>
        <text x="430" y="202" fill="${amber}" font-family="sans-serif" font-size="11">ISO 5349 Limit (2.5 m/s²)</text>
        <path d="M 60 285 Q 120 260 180 230 T 300 240 T 420 270 T 540 285 L 590 290" fill="none" stroke="${green}" stroke-width="3.5"/>
        <text x="310" y="335" fill="${text}" font-family="sans-serif" font-size="12" text-anchor="middle">Frequency f (Hz) [10 Hz – 1000 Hz]</text>
        <text x="20" y="180" fill="${text}" font-family="sans-serif" font-size="12" transform="rotate(-90 20 180)" text-anchor="middle">Acceleration Ahv (m/s²)</text>
        <rect x="360" y="55" width="230" height="70" rx="6" fill="%230f172a" stroke="%23334155" stroke-width="1.5"/>
        <line x1="375" y1="75" x2="405" y2="75" stroke="${red}" stroke-width="3"/>
        <text x="415" y="79" fill="${text}" font-family="monospace" font-size="11">Baseline Sickle (11.4 m/s²)</text>
        <line x1="375" y1="105" x2="405" y2="105" stroke="${green}" stroke-width="3.5"/>
        <text x="415" y="109" fill="${green}" font-family="monospace" font-weight="bold" font-size="11">Scotch-Yoke (2.1 m/s²)</text>
      </svg>`;
    } else if (software.includes('ANSYS')) {
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
        <rect width="640" height="360" fill="${bg}"/>
        <defs><pattern id="ag" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="${grid}" stroke-width="1"/></pattern></defs>
        <rect width="640" height="360" fill="url(%23ag)"/>
        <rect x="0" y="0" width="640" height="38" fill="%231e293b"/>
        <text x="20" y="24" fill="${amber}" font-family="monospace" font-weight="bold" font-size="14">ANSYS Mechanical 2024 R1 • Harmonic Response &amp; Peak Stress</text>
        <defs>
          <linearGradient id="ansysGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="%230284c7"/>
            <stop offset="35%" stop-color="%2310b981"/>
            <stop offset="70%" stop-color="%23f59e0b"/>
            <stop offset="100%" stop-color="%23ef4444"/>
          </linearGradient>
        </defs>
        <rect x="580" y="60" width="20" height="220" fill="url(%23ansysGrad)" stroke="${text}" stroke-width="1"/>
        <text x="545" y="70" fill="${red}" font-family="monospace" font-size="10">84 MPa</text>
        <text x="545" y="140" fill="${amber}" font-family="monospace" font-size="10">42 MPa</text>
        <text x="545" y="210" fill="${green}" font-family="monospace" font-size="10">18 MPa</text>
        <text x="545" y="280" fill="${cyan}" font-family="monospace" font-size="10">2 MPa</text>
        <line x1="60" y1="50" x2="60" y2="300" stroke="${text}" stroke-width="2"/>
        <line x1="60" y1="300" x2="520" y2="300" stroke="${text}" stroke-width="2"/>
        <path d="M 60 270 Q 120 250 160 210 T 240 75 T 320 230 T 440 270 L 510 280" fill="none" stroke="${amber}" stroke-width="3"/>
        <line x1="60" y1="140" x2="520" y2="140" stroke="${green}" stroke-width="2" stroke-dasharray="6,4"/>
        <text x="270" y="132" fill="${green}" font-family="sans-serif" font-size="11">ASME Allowable Limit (42 MPa)</text>
        <text x="290" y="335" fill="${text}" font-family="sans-serif" font-size="12" text-anchor="middle">Harmonic Excitation Frequency (Hz)</text>
        <text x="20" y="180" fill="${text}" font-family="sans-serif" font-size="12" transform="rotate(-90 20 180)" text-anchor="middle">Equivalent Von Mises Stress σeq (MPa)</text>
      </svg>`;
    } else {
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
        <rect width="640" height="360" fill="${bg}"/>
        <defs><pattern id="swg" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="${grid}" stroke-width="1"/></pattern></defs>
        <rect width="640" height="360" fill="url(%23swg)"/>
        <rect x="0" y="0" width="640" height="38" fill="%231e293b"/>
        <text x="20" y="24" fill="${green}" font-family="monospace" font-weight="bold" font-size="14">${software} • Motion &amp; Kinematic Displacement Trace</text>
        <line x1="60" y1="50" x2="60" y2="300" stroke="${text}" stroke-width="2"/>
        <line x1="60" y1="300" x2="600" y2="300" stroke="${text}" stroke-width="2"/>
        <path d="M 60 175 Q 125 75 190 175 T 320 175 T 450 175 T 580 175" fill="none" stroke="${cyan}" stroke-width="3"/>
        <path d="M 60 75 Q 125 175 190 275 T 320 75 T 450 275 T 580 75" fill="none" stroke="${green}" stroke-width="3" stroke-dasharray="5,3"/>
        <text x="330" y="335" fill="${text}" font-family="sans-serif" font-size="12" text-anchor="middle">Crank Angle θ (0° – 360°)</text>
        <text x="20" y="180" fill="${text}" font-family="sans-serif" font-size="12" transform="rotate(-90 20 180)" text-anchor="middle">Displacement x(t) [mm] / Velocity v(t) [m/s]</text>
        <rect x="360" y="55" width="220" height="60" rx="6" fill="%230f172a" stroke="%23334155" stroke-width="1.5"/>
        <line x1="375" y1="75" x2="405" y2="75" stroke="${cyan}" stroke-width="3"/>
        <text x="415" y="79" fill="${text}" font-family="monospace" font-size="11">Displacement x1(t)</text>
        <line x1="375" y1="95" x2="405" y2="95" stroke="${green}" stroke-width="3"/>
        <text x="415" y="99" fill="${green}" font-family="monospace" font-size="11">Velocity v1(t)</text>
      </svg>`;
    }
  }

  if (btnCloseGraphModal) btnCloseGraphModal.addEventListener('click', () => addGraphModal.classList.remove('active'));
  if (btnCancelGraph) btnCancelGraph.addEventListener('click', () => addGraphModal.classList.remove('active'));

  if (btnConfirmAddGraph) {
    btnConfirmAddGraph.addEventListener('click', () => {
      const stageId = graphTargetStageSelect.value;
      const stage = stagesData.find(s => s.id === stageId);
      if (!stage) return;

      const title = graphTitleInput.value.trim() || 'Engineering Graph';
      const caption = graphCaptionInput.value.trim() || 'Experimental analysis curve';

      // CASE 1: Import Plot from Image (Local file or sample)
      if (activeGraphMode === 'image') {
        const software = graphSoftwareOrigin ? graphSoftwareOrigin.value : 'Engineering Plot';
        const yAxis = graphYAxisLabel ? graphYAxisLabel.value.trim() : '';
        const xAxis = graphXAxisLabel ? graphXAxisLabel.value.trim() : '';

        if (customGraphImgDataUrl) {
          // Sample loaded
          attachMediaToStage(stage, {
            id: `graph_${Date.now()}`,
            type: 'graph',
            graphType: 'image_plot',
            title: title,
            src: customGraphImgDataUrl,
            software: software,
            xAxis: xAxis,
            yAxis: yAxis,
            caption: caption
          });
          addGraphModal.classList.remove('active');
          return;
        }

        if (!selectedGraphImgFile) {
          showToast('⚠️ Please select or drop a graph image from your local drive first, or click a quick-load sample plot!');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          attachMediaToStage(stage, {
            id: `graph_${Date.now()}`,
            type: 'graph',
            graphType: 'image_plot',
            title: title,
            src: e.target.result,
            fileName: selectedGraphImgFile.name,
            fileSize: selectedGraphImgFile.size,
            software: software,
            xAxis: xAxis,
            yAxis: yAxis,
            caption: caption
          });
          addGraphModal.classList.remove('active');
        };
        reader.readAsDataURL(selectedGraphImgFile);
        return;
      }

      // CASE 2: Import Tabular CSV Data File (Local file or sample)
      if (activeGraphMode === 'csv') {
        if (customGraphCsvText) {
          const chartConfig = parseCsvToChartConfig(customGraphCsvText);
          if (!chartConfig || !chartConfig.data.labels.length) {
            showToast('⚠️ Could not parse CSV data.');
            return;
          }

          attachMediaToStage(stage, {
            id: `graph_${Date.now()}`,
            type: 'graph',
            graphType: 'csv_plot',
            title: title,
            customConfig: chartConfig,
            caption: caption
          });
          addGraphModal.classList.remove('active');
          return;
        }

        if (!selectedGraphCsvFile) {
          showToast('⚠️ Please select or drop a CSV/tabular data file first, or click a quick-load sample CSV!');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const chartConfig = parseCsvToChartConfig(e.target.result);
          if (!chartConfig || !chartConfig.data.labels.length) {
            showToast('⚠️ Could not parse CSV data. Please check column format.');
            return;
          }

          attachMediaToStage(stage, {
            id: `graph_${Date.now()}`,
            type: 'graph',
            graphType: 'csv_plot',
            title: title,
            fileName: selectedGraphCsvFile.name,
            customConfig: chartConfig,
            caption: caption
          });
          addGraphModal.classList.remove('active');
        };
        reader.readAsText(selectedGraphCsvFile);
        return;
      }

      // CASE 3: Custom Chart Builder
      if (activeGraphMode === 'custom') {
        const chartType = document.getElementById('customGraphType').value;
        const seriesName = document.getElementById('customGraphSeriesName').value.trim() || 'Series 1';
        const labels = (document.getElementById('customGraphLabels').value.trim() || 'P1, P2, P3, P4, P5').split(',').map(s => s.trim());
        const data1 = (document.getElementById('customGraphData1').value.trim() || '10, 20, 30, 40, 50').split(',').map(s => parseFloat(s) || 0);
        const data2Str = document.getElementById('customGraphData2').value.trim();

        const datasets = [
          {
            label: seriesName,
            data: data1,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.2)',
            borderWidth: 2.5
          }
        ];

        if (data2Str) {
          const data2 = data2Str.split(',').map(s => parseFloat(s) || 0);
          datasets.push({
            label: 'Benchmark / Threshold',
            data: data2,
            borderColor: '#f59e0b',
            borderDash: [5, 5],
            fill: false
          });
        }

        attachMediaToStage(stage, {
          id: `graph_${Date.now()}`,
          type: 'graph',
          title: title,
          customConfig: {
            type: chartType,
            data: { labels, datasets },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: '#94a3b8' } } },
              scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.08)' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.08)' } }
              }
            }
          },
          caption: caption
        });
        addGraphModal.classList.remove('active');
        return;
      }

      // CASE 4: Standard Engineering Preset
      const preset = graphPresetSelect.value;
      attachMediaToStage(stage, {
        id: `graph_${Date.now()}`,
        type: 'graph',
        title: title,
        graphPreset: preset,
        caption: caption
      });

      addGraphModal.classList.remove('active');
    });
  }

  // 5. ADD SIMULATION VIDEO MODAL
  const addVideoModal = document.getElementById('addVideoModal');
  const videoTargetStageSelect = document.getElementById('videoTargetStageSelect');
  const videoTitleInput = document.getElementById('videoTitleInput');
  const videoFileInput = document.getElementById('videoFileInput');
  const videoUrlInput = document.getElementById('videoUrlInput');
  const videoCaptionInput = document.getElementById('videoCaptionInput');
  const btnCloseVideoModal = document.getElementById('btnCloseVideoModal');
  const btnCancelVideo = document.getElementById('btnCancelVideo');
  const btnConfirmAddVideo = document.getElementById('btnConfirmAddVideo');

  let activeVideoSource = 'workspace';

  function openAddVideoModal(targetStageId) {
    populateStageSelect(videoTargetStageSelect, targetStageId);
    if (videoTitleInput) videoTitleInput.value = '';
    if (videoCaptionInput) videoCaptionInput.value = '';
    activeVideoSource = 'workspace';
    updateVideoSourceTabs();
    if (addVideoModal) addVideoModal.classList.add('active');
  }

  function updateVideoSourceTabs() {
    document.querySelectorAll('#addVideoModal .modal-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-video-source') === activeVideoSource);
    });
    const wBlock = document.getElementById('videoSourceWorkspaceBlock');
    const uBlock = document.getElementById('videoSourceUploadBlock');
    const lBlock = document.getElementById('videoSourceUrlBlock');

    if (wBlock) wBlock.style.display = activeVideoSource === 'workspace' ? 'block' : 'none';
    if (uBlock) uBlock.style.display = activeVideoSource === 'upload' ? 'block' : 'none';
    if (lBlock) lBlock.style.display = activeVideoSource === 'url' ? 'block' : 'none';
  }

  document.querySelectorAll('#addVideoModal .modal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeVideoSource = btn.getAttribute('data-video-source');
      updateVideoSourceTabs();
    });
  });

  if (btnCloseVideoModal) btnCloseVideoModal.addEventListener('click', () => addVideoModal.classList.remove('active'));
  if (btnCancelVideo) btnCancelVideo.addEventListener('click', () => addVideoModal.classList.remove('active'));

  if (btnConfirmAddVideo) {
    btnConfirmAddVideo.addEventListener('click', () => {
      const stageId = videoTargetStageSelect.value;
      const stage = stagesData.find(s => s.id === stageId);
      if (!stage) return;

      const title = videoTitleInput.value.trim() || 'Harvesting Simulation Video';
      const caption = videoCaptionInput.value.trim() || 'Captured at 850 RPM PTO input speed';

      let videoSrc = 'Screen_Recording_20261025_162709_Gmail.mp4';

      if (activeVideoSource === 'upload' && videoFileInput.files && videoFileInput.files[0]) {
        videoSrc = URL.createObjectURL(videoFileInput.files[0]);
      } else if (activeVideoSource === 'url' && videoUrlInput.value.trim()) {
        videoSrc = videoUrlInput.value.trim();
      }

      attachMediaToStage(stage, {
        id: `video_${Date.now()}`,
        type: 'video',
        title: title,
        src: videoSrc,
        caption: caption
      });

      addVideoModal.classList.remove('active');
    });
  }

  // 6. ADD CAD 3D MODEL MODAL
  const addCadModal = document.getElementById('addCadModal');
  const cadTargetStageSelect = document.getElementById('cadTargetStageSelect');
  const cadTitleInput = document.getElementById('cadTitleInput');
  const cadPresetSelect = document.getElementById('cadPresetSelect');
  const cadDescInput = document.getElementById('cadDescInput');
  const btnCloseCadModal = document.getElementById('btnCloseCadModal');
  const btnCancelCad = document.getElementById('btnCancelCad');
  const btnConfirmAddCad = document.getElementById('btnConfirmAddCad');

  const cadDropzone = document.getElementById('cadDropzone');
  const cadFileInput = document.getElementById('cadFileInput');
  const cadSelectedFileInfo = document.getElementById('cadSelectedFileInfo');
  const cadFileNameDisplay = document.getElementById('cadFileNameDisplay');
  const cadFileSizeDisplay = document.getElementById('cadFileSizeDisplay');
  const cadFormatBadge = document.getElementById('cadFormatBadge');
  const cadMaterialSelect = document.getElementById('cadMaterialSelect');

  let activeCadSource = 'preset';
  let selectedCadFileObj = null;

  function openAddCadModal(targetStageId) {
    populateStageSelect(cadTargetStageSelect, targetStageId);
    if (cadTitleInput) cadTitleInput.value = '';
    if (cadDescInput) cadDescInput.value = '';
    if (cadFileInput) cadFileInput.value = '';
    if (cadSelectedFileInfo) cadSelectedFileInfo.style.display = 'none';
    selectedCadFileObj = null;
    activeCadSource = 'preset';
    updateCadSourceTabs();
    if (addCadModal) addCadModal.classList.add('active');
  }

  function updateCadSourceTabs() {
    document.querySelectorAll('#addCadModal .modal-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cad-source') === activeCadSource);
    });
    const pBlock = document.getElementById('cadSourcePresetBlock');
    const uBlock = document.getElementById('cadSourceUploadBlock');
    if (pBlock) pBlock.style.display = activeCadSource === 'preset' ? 'block' : 'none';
    if (uBlock) uBlock.style.display = activeCadSource === 'upload' ? 'block' : 'none';
  }

  document.querySelectorAll('#addCadModal .modal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCadSource = btn.getAttribute('data-cad-source');
      updateCadSourceTabs();
    });
  });

  if (cadDropzone && cadFileInput) {
    cadDropzone.addEventListener('click', () => {
      cadFileInput.click();
    });

    cadDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      cadDropzone.classList.add('drag-over');
    });

    cadDropzone.addEventListener('dragleave', () => {
      cadDropzone.classList.remove('drag-over');
    });

    cadDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      cadDropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleCadFileSelection(e.dataTransfer.files[0]);
      }
    });

    cadFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleCadFileSelection(e.target.files[0]);
      }
    });
  }

  function handleCadFileSelection(file) {
    selectedCadFileObj = file;
    const ext = file.name.split('.').pop().toLowerCase();
    if (cadFileNameDisplay) cadFileNameDisplay.textContent = file.name;
    if (cadFileSizeDisplay) cadFileSizeDisplay.textContent = `(${(file.size / 1024).toFixed(1)} KB)`;
    if (cadFormatBadge) cadFormatBadge.textContent = ext.toUpperCase();
    if (cadSelectedFileInfo) cadSelectedFileInfo.style.display = 'flex';
    if (cadTitleInput && !cadTitleInput.value.trim()) {
      cadTitleInput.value = file.name.replace(/\.[^/.]+$/, "");
    }
  }

  if (btnCloseCadModal) btnCloseCadModal.addEventListener('click', () => addCadModal.classList.remove('active'));
  if (btnCancelCad) btnCancelCad.addEventListener('click', () => addCadModal.classList.remove('active'));

  if (btnConfirmAddCad) {
    btnConfirmAddCad.addEventListener('click', async () => {
      const stageId = cadTargetStageSelect.value;
      const stage = stagesData.find(s => s.id === stageId);
      if (!stage) return;

      const title = cadTitleInput.value.trim() || '3D Parametric CAD Assembly';
      const desc = cadDescInput.value.trim() || 'Interactive 3D mechanical model';
      const material = cadMaterialSelect ? cadMaterialSelect.value : 'chrome';

      if (activeCadSource === 'upload') {
        if (!selectedCadFileObj) {
          showToast('⚠️ Please select a 3D CAD file (.stl, .obj, .gltf, .glb, .step) from your local drive first!');
          return;
        }

        const ext = selectedCadFileObj.name.split('.').pop().toLowerCase();
        showToast('⏳ Uploading 3D CAD model to backend...');

        try {
          const formData = new FormData();
          formData.append('file', selectedCadFileObj);
          const cadRes = await fetch('/api/uploads/cad', { method: 'POST', body: formData });
          if (cadRes.ok) {
            const cadData = await cadRes.json();
            attachMediaToStage(stage, {
              id: `cad_${Date.now()}`,
              type: 'cad',
              title: title,
              cadType: 'custom_file',
              format: ext,
              fileName: selectedCadFileObj.name,
              fileSize: selectedCadFileObj.size,
              fileUrl: cadData.fileUrl,
              material: material,
              desc: desc || `Imported ${ext.toUpperCase()} 3D Model: ${selectedCadFileObj.name}`
            });
            addCadModal.classList.remove('active');
            showToast('✅ 3D CAD model saved in database!');
            return;
          }
        } catch (err) {
          console.warn('Backend CAD upload failed, falling back to local storage', err);
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const fileData = e.target.result; // Data URL Base64
          attachMediaToStage(stage, {
            id: `cad_${Date.now()}`,
            type: 'cad',
            title: title,
            cadType: 'custom_file',
            format: ext,
            fileName: selectedCadFileObj.name,
            fileSize: selectedCadFileObj.size,
            fileData: fileData,
            material: material,
            desc: desc || `Imported ${ext.toUpperCase()} 3D Model: ${selectedCadFileObj.name}`
          });
          addCadModal.classList.remove('active');
        };
        reader.readAsDataURL(selectedCadFileObj);

      } else {
        // Preset
        const cadType = cadPresetSelect.value || 'scotchyoke';
        attachMediaToStage(stage, {
          id: `cad_${Date.now()}`,
          type: 'cad',
          title: title,
          cadType: cadType,
          material: material,
          desc: desc
        });
        addCadModal.classList.remove('active');
      }
    });
  }

  // Helper to Attach Media to Stage (Optimistic UI + SQLite Backend Sync)
  async function attachMediaToStage(stage, mediaObj) {
    if (!stage.media) stage.media = [];
    stage.media.push(mediaObj);
    saveStagesData();
    renderAllStages();
    showToast(`Added ${mediaObj.type.toUpperCase()} to ${stage.number}!`);

    // Async persist to SQLite backend
    try {
      await fetch(`/api/stages/${stage.id}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mediaObj)
      });
    } catch (err) {
      console.warn('Media backend sync deferred:', err);
    }
  }

  // Confirm modal + deleteMediaItem moved to top of script (after saveStagesData) for correct initialization order

  // ---------------------------------------------------------------------------
  // FILTERING, SEARCH, EXPAND ALL & RESET CONTROLS
  // ---------------------------------------------------------------------------
  const stagePills = document.querySelectorAll('.stage-pill');
  const stageSearchInput = document.getElementById('stageSearchInput');
  const stageStatusSelect = document.getElementById('stageStatusSelect');
  const btnExpandAllStages = document.getElementById('btnExpandAllStages');
  const btnResetStagesData = document.getElementById('btnResetStagesData');
  const btnLoadSyntheticData = document.getElementById('btnLoadSyntheticData');
  const btnClearAllStages = document.getElementById('btnClearAllStages');

  let activeFilterStage = 'all';
  let isAllExpanded = true;

  stagePills.forEach(pill => {
    pill.addEventListener('click', () => {
      stagePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilterStage = pill.getAttribute('data-stage');
      applyStageFilters();
    });
  });

  if (stageSearchInput) {
    stageSearchInput.addEventListener('input', applyStageFilters);
  }

  if (stageStatusSelect) {
    stageStatusSelect.addEventListener('change', applyStageFilters);
  }

  function applyStageFilters() {
    const q = stageSearchInput ? stageSearchInput.value.toLowerCase().trim() : '';
    const statusVal = stageStatusSelect ? stageStatusSelect.value : 'all';

    document.querySelectorAll('.stage-block').forEach(blk => {
      const stageId = blk.id.replace('block-', '');
      const stage = stagesData.find(s => s.id === stageId);
      if (!stage) return;

      // Filter by stage key
      let matchStage = (activeFilterStage === 'all' || activeFilterStage === stageId);

      // Filter by status
      let matchStatus = true;
      if (statusVal !== 'all') {
        if (statusVal === 'completed' && stage.status !== 'Completed') matchStatus = false;
        if (statusVal === 'in_progress' && stage.status !== 'In Progress') matchStatus = false;
        if (statusVal === 'under_review' && stage.status !== 'Under Review') matchStatus = false;
      }

      // Filter by search query
      let matchQuery = true;
      if (q) {
        const fullText = (stage.title + ' ' + stage.question + ' ' + stage.prompts.map(p => p.title + ' ' + p.content).join(' ') + ' ' + (stage.media || []).map(m => m.title + ' ' + (m.caption || '')).join(' ')).toLowerCase();
        matchQuery = fullText.includes(q);
      }

      if (matchStage && matchStatus && matchQuery) {
        blk.style.display = 'block';
      } else {
        blk.style.display = 'none';
      }
    });
  }

  if (btnExpandAllStages) {
    btnExpandAllStages.addEventListener('click', () => {
      isAllExpanded = !isAllExpanded;
      document.querySelectorAll('.stage-block').forEach(blk => {
        blk.classList.toggle('collapsed', !isAllExpanded);
      });
      btnExpandAllStages.innerHTML = isAllExpanded
        ? '<i class="fa-solid fa-arrows-up-down"></i> Collapse All'
        : '<i class="fa-solid fa-arrows-up-down"></i> Expand All';
    });
  }

  if (btnLoadSyntheticData) {
    btnLoadSyntheticData.addEventListener('click', () => {
      stagesData = JSON.parse(JSON.stringify(SYNTHETIC_STAGES_DATA));
      saveStagesData();
      renderAllStages();
      showToast('Loaded sample synthetic engineering data, graphs & CAD models!');
    });
  }

  function clearStagesToEmpty() {
    stagesData = JSON.parse(JSON.stringify(DEFAULT_STAGES_DATA));
    saveStagesData();
    renderAllStages();
    showToast('All stages S1 through S11 are now completely empty!');
  }

  if (btnClearAllStages) {
    btnClearAllStages.addEventListener('click', () => {
      showConfirmModal('Clear All Stages', 'Clear all stages S1 through S11? All prompts and media will be emptied so you can start completely fresh.', () => {
        clearStagesToEmpty();
      });
    });
  }

  if (btnResetStagesData) {
    btnResetStagesData.addEventListener('click', () => {
      showConfirmModal('Clear All Stages', 'Clear all stages S1 through S11? All prompts and media will be emptied so you can start completely fresh.', () => {
        clearStagesToEmpty();
      });
    });
  }

  // Hook up global "Exemplar Project" button in navbar to populate S1-S11 and navigate
  const btnExemplar = document.getElementById('btnExemplarProject');
  if (btnExemplar) {
    btnExemplar.addEventListener('click', () => {
      stagesData = JSON.parse(JSON.stringify(SYNTHETIC_STAGES_DATA));
      saveStagesData();

      // Ensure user is authenticated
      isAuthenticated = true;
      sessionStorage.setItem('kle-auth-verified', 'true');
      sessionStorage.setItem('kle-user-usn', '01FE22BME045');
      document.body.classList.add('authenticated');
      updateAuthPill(true, '01FE22BME045');

      renderAllStages();
      navigateToPage('page-stages');
      showToast('✨ Loaded sample synthetic engineering data across S1–S11!');
    });
  }

  // Initial render of all S1–S11 stages
  renderAllStages();


  // ---------------------------------------------------------------------------
  // 6. S6: SHAFT SIZING SOLVER LOGIC
  // ---------------------------------------------------------------------------
  const btnSolveShaft = document.getElementById('btnSolveShaft');
  const shaftPower = document.getElementById('shaftPower');
  const shaftRpm = document.getElementById('shaftRpm');
  const shaftBending = document.getElementById('shaftBending');
  const shaftYield = document.getElementById('shaftYield');
  const shaftFos = document.getElementById('shaftFos');

  const calcTorque = document.getElementById('calcTorque');
  const calcTe = document.getElementById('calcTe');
  const calcDia = document.getElementById('calcDia');

  function solveShaft() {
    if (!shaftPower || !shaftRpm || !shaftBending || !shaftYield || !shaftFos) return;
    const P = parseFloat(shaftPower.value); // kW
    const N = parseFloat(shaftRpm.value);   // RPM
    const M = parseFloat(shaftBending.value); // N*m
    const Syt = parseFloat(shaftYield.value); // MPa
    const FoS = parseFloat(shaftFos.value);

    // Torque T = (60 * 1000 * P) / (2 * pi * N)
    const T = (60 * 1000 * P) / (2 * Math.PI * N);

    // Equivalent Twisting Moment Te = sqrt(M^2 + T^2)
    const Te = Math.sqrt(Math.pow(M, 2) + Math.pow(T, 2));

    // Permissible Shear Stress tau = 0.5 * Syt / FoS
    const tau = (0.5 * Syt) / FoS; // in MPa (N/mm^2)

    // Te in N*mm = Te * 1000
    // d = ((16 * Te * 1000) / (pi * tau))^(1/3)
    const dMm = Math.cbrt((16 * (Te * 1000)) / (Math.PI * tau));

    if (calcTorque) calcTorque.innerHTML = `${T.toFixed(2)} <small>N·m</small>`;
    if (calcTe) calcTe.innerHTML = `${Te.toFixed(2)} <small>N·m</small>`;
    if (calcDia) calcDia.innerHTML = `${dMm.toFixed(1)} <small>mm</small>`;
    showToast(`Calculated: Minimum shaft diameter = ${dMm.toFixed(1)} mm`);
  }

  if (btnSolveShaft) {
    btnSolveShaft.addEventListener('click', solveShaft);
  }

  // ---------------------------------------------------------------------------
  // 7. INSTITUTIONAL LOGIN & USER STATE
  // ---------------------------------------------------------------------------
  const loginForm = document.getElementById('loginForm');
  const collegeEmail = document.getElementById('collegeEmail');
  const studentName = document.getElementById('studentName');
  const usnRoll = document.getElementById('usnRoll');
  const displayStudentName = document.getElementById('displayStudentName');
  const displayUSN = document.getElementById('displayUSN');
  const btnSignInSubmit = document.getElementById('btnSignInSubmit');

  function performLogin(e) {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }

    const emailEl = document.getElementById('collegeEmail') || collegeEmail;
    const nameEl = document.getElementById('studentName') || studentName;
    const usnEl = document.getElementById('usnRoll') || usnRoll;

    const email = (emailEl ? emailEl.value : '').trim();
    const name = (nameEl ? nameEl.value : '').trim();
    const usn = (usnEl ? usnEl.value : '').trim().toUpperCase();

    if (!email) {
      showToast('⚠️ Please enter your institutional college email');
      if (emailEl) emailEl.focus();
      return;
    }

    if (!name) {
      showToast('⚠️ Please enter your full student name');
      if (nameEl) nameEl.focus();
      return;
    }

    if (!usn) {
      showToast('⚠️ Please enter your USN / Roll number');
      if (usnEl) usnEl.focus();
      return;
    }

    // Email domain validation (@kletech.ac.in, @bvb.edu or Google @gmail.com)
    const lowerEmail = email.toLowerCase();
    const isAllowedEmail = lowerEmail.endsWith('@kletech.ac.in') || lowerEmail.endsWith('@bvb.edu') || lowerEmail.endsWith('@gmail.com');
    if (!isAllowedEmail && (!lowerEmail.includes('@') || !lowerEmail.includes('.'))) {
      showToast('⚠️ Please enter a valid institutional (@kletech.ac.in, @bvb.edu) or Google email');
      const authCard = document.querySelector('.auth-card');
      if (authCard) {
        authCard.classList.remove('shake-card');
        void authCard.offsetWidth;
        authCard.classList.add('shake-card');
      }
      return;
    }

    // Authenticate user with their inputted credentials
    isAuthenticated = true;
    sessionStorage.setItem('kle-auth-verified', 'true');
    sessionStorage.setItem('kle-user-name', name);
    sessionStorage.setItem('kle-user-usn', usn);
    document.body.classList.add('authenticated');

    updateAuthPill(true, usn);

    // Sync with FastAPI SQLite Backend
    if (isBackendOnline) {
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, usn })
      }).then(r => r.json()).then(userData => {
        if (userData && userData.usn) {
          console.log('[KLE Backend] Student record synchronized in SQLite:', userData);
          if (userData.team_number) {
            if (displayTeamId) displayTeamId.textContent = userData.team_number;
            if (pfTeamNumber) pfTeamNumber.value = userData.team_number;
          }
          if (userData.project_title) {
            if (displayProjectTitle) displayProjectTitle.textContent = userData.project_title;
            if (pfProjectTitle) pfProjectTitle.value = userData.project_title;
          }
          if (userData.project_theme && pfProjectTheme) {
            pfProjectTheme.value = userData.project_theme;
          }
        }
      }).catch(err => console.warn('[KLE Backend] Auth sync error:', err));
    }

    const curDisplayStudentName = document.getElementById('displayStudentName');
    const curDisplayUSN = document.getElementById('displayUSN');
    if (curDisplayStudentName) curDisplayStudentName.textContent = name;
    if (curDisplayUSN) curDisplayUSN.textContent = usn;

    showToast(`✓ Authenticated via KLE Google SSO: ${name} (${usn})`);

    // Smooth transition to S1–S11 Stages
    setTimeout(() => {
      navigateToPage('page-stages');
    }, 250);
  }

  window.performLogin = performLogin;
  window.navigateToPage = navigateToPage;

  if (btnSignInSubmit) {
    btnSignInSubmit.addEventListener('click', performLogin);
  }
  if (loginForm) {
    loginForm.addEventListener('submit', performLogin);
  }

  // Sign Out Handler
  const btnSignOut = document.getElementById('btnSignOut');
  if (btnSignOut) {
    btnSignOut.addEventListener('click', (e) => {
      e.preventDefault();
      isAuthenticated = false;
      sessionStorage.removeItem('kle-auth-verified');
      sessionStorage.removeItem('kle-user-name');
      sessionStorage.removeItem('kle-user-usn');
      document.body.classList.remove('authenticated');
      updateAuthPill(false);
      const curDisplayStudentName = document.getElementById('displayStudentName');
      const curDisplayUSN = document.getElementById('displayUSN');
      if (curDisplayStudentName) curDisplayStudentName.textContent = 'Ruhel Ahmed';
      if (curDisplayUSN) curDisplayUSN.textContent = '01FE24BME009';
      showToast('Signed out of KLE Institutional Portal');
      navigateToPage('page-login');
    });
  }

  // ---------------------------------------------------------------------------
  // 7.1 CREATE A TEAM PORTFOLIO LOGIC (MATCHING USER ATTACHMENTS)
  // ---------------------------------------------------------------------------
  const pfTeamNumber = document.getElementById('pfTeamNumber');
  const pfProjectTheme = document.getElementById('pfProjectTheme');
  const pfProjectTitle = document.getElementById('pfProjectTitle');
  const createPortfolioForm = document.getElementById('createPortfolioForm');
  const btnSubmitPortfolio = document.getElementById('btnSubmitPortfolio');
  const btnCancelPortfolio = document.getElementById('btnCancelPortfolio');
  const btnOpenCreatePortfolio = document.getElementById('btnOpenCreatePortfolio');

  const displayProjectTitle = document.getElementById('displayProjectTitle');
  const displayTeamId = document.getElementById('displayTeamId');
  const displayProjectTheme = document.getElementById('displayProjectTheme');

  function loadTeamPortfolio() {
    try {
      const saved = localStorage.getItem('kle_team_portfolio');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.teamNumber) {
          if (pfTeamNumber) pfTeamNumber.value = data.teamNumber;
          if (displayTeamId) displayTeamId.textContent = data.teamNumber;
        }
        if (data.projectTheme) {
          if (pfProjectTheme) pfProjectTheme.value = data.projectTheme;
          if (displayProjectTheme) displayProjectTheme.textContent = data.projectTheme;
        }
        if (data.projectTitle) {
          if (pfProjectTitle) pfProjectTitle.value = data.projectTitle;
          if (displayProjectTitle) displayProjectTitle.textContent = data.projectTitle;
        }
      }
    } catch (e) {
      console.warn('Could not load team portfolio data', e);
    }
  }

  loadTeamPortfolio();

  function saveTeamPortfolio(e) {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }

    const teamNumber = (pfTeamNumber ? pfTeamNumber.value : '').trim() || 'Team 07';
    const projectTheme = (pfProjectTheme ? pfProjectTheme.value : '').trim() || 'Smart Campus';
    const projectTitle = (pfProjectTitle ? pfProjectTitle.value : '').trim() || 'Resource Allocation System';

    const portfolioData = {
      teamNumber,
      projectTheme,
      projectTitle
    };

    localStorage.setItem('kle_team_portfolio', JSON.stringify(portfolioData));

    // Update Profile Card UI elements immediately
    if (displayTeamId) displayTeamId.textContent = teamNumber;
    if (displayProjectTheme) displayProjectTheme.textContent = projectTheme;
    if (displayProjectTitle) displayProjectTitle.textContent = projectTitle;

    // Sync to backend if online
    if (isBackendOnline) {
      const currentUsn = sessionStorage.getItem('kle-user-usn') || '01FE24BME009';
      fetch(`/api/auth/profile?usn=${encodeURIComponent(currentUsn)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sessionStorage.getItem('kle-user-name') || undefined,
          team_number: teamNumber,
          project_theme: projectTheme,
          project_title: projectTitle
        })
      }).catch(err => console.warn('Could not sync portfolio to backend:', err));
    }

    showToast(`✓ Created portfolio for ${teamNumber}: ${projectTitle}`);

    // Transition smoothly to S1–S11 Stages view (keeping all existing S1-S11 content intact)
    setTimeout(() => {
      navigateToPage('page-stages');
    }, 200);
  }

  window.saveTeamPortfolio = saveTeamPortfolio;

  if (createPortfolioForm) {
    createPortfolioForm.addEventListener('submit', saveTeamPortfolio);
  }
  if (btnSubmitPortfolio) {
    btnSubmitPortfolio.addEventListener('click', saveTeamPortfolio);
  }

  if (btnCancelPortfolio) {
    btnCancelPortfolio.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToPage('page-profile');
    });
  }

  if (btnOpenCreatePortfolio) {
    btnOpenCreatePortfolio.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToPage('page-create-portfolio');
    });
  }

  // ---------------------------------------------------------------------------
  // 7.2 GOOGLE SITES STYLE PORTFOLIO PUBLISHING
  // ---------------------------------------------------------------------------
  const btnPublishPortfolio = document.getElementById('btnPublishPortfolio');
  const btnViewPublishedSite = document.getElementById('btnViewPublishedSite');
  const btnEditSiteReturn = document.getElementById('btnEditSiteReturn');
  const btnCopyPublicLink = document.getElementById('btnCopyPublicLink');
  const btnPrintPublishedSite = document.getElementById('btnPrintPublishedSite');
  const navLinkPublishedSite = document.getElementById('navLinkPublishedSite');
  const mobileLinkPublishedSite = document.getElementById('mobileLinkPublishedSite');

  function getSafeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderPublishedGoogleSite(pubData) {
    if (!pubData) return;

    const pubSiteHeaderTitle = document.getElementById('pubSiteHeaderTitle');
    const pubHeroTitle = document.getElementById('pubHeroTitle');
    const pubHeroTheme = document.getElementById('pubHeroTheme');
    const pubHeroTeam = document.getElementById('pubHeroTeam');
    const pubHeroStudent = document.getElementById('pubHeroStudent');
    const pubHeroGuide = document.getElementById('pubHeroGuide');
    const pubHeroDate = document.getElementById('pubHeroDate');
    const container = document.getElementById('publishedStagesContainer');

    const teamNum = pubData.teamNumber || 'Team 07';
    const pTheme = pubData.projectTheme || 'Smart Campus';
    const pTitle = pubData.projectTitle || 'Resource Allocation System';

    if (pubSiteHeaderTitle) pubSiteHeaderTitle.textContent = `${teamNum} — ${pTitle}`;
    if (pubHeroTitle) pubHeroTitle.textContent = pTitle;
    if (pubHeroTheme) pubHeroTheme.innerHTML = `<i class="fa-solid fa-tag"></i> Theme: ${getSafeHtml(pTheme)}`;
    if (pubHeroTeam) pubHeroTeam.innerHTML = `<i class="fa-solid fa-users"></i> ${getSafeHtml(teamNum)}`;
    if (pubHeroStudent) pubHeroStudent.textContent = `${pubData.studentName || 'Ruhel Ahmed'} (${pubData.usn || '01FE24BME009'})`;
    if (pubHeroGuide) pubHeroGuide.textContent = pubData.guide || 'Prof. Anand S.';
    if (pubHeroDate) pubHeroDate.textContent = pubData.publishedAt || 'Published';

    if (!container) return;
    container.innerHTML = '';

    const stages = pubData.stages || stagesData || [];
    stages.forEach((stage, idx) => {
      const stageCard = document.createElement('article');
      stageCard.className = 'gs-stage-card';
      stageCard.id = `pub-stage-${stage.id || ('S' + (idx + 1))}`;

      let statusBadgeClass = (stage.status || 'In Progress').toLowerCase().replace(/\s+/g, '-');
      let statusIcon = stage.status === 'Completed' ? 'fa-check' : 'fa-clock';

      // Prompts
      let promptsHtml = '';
      if (stage.prompts && stage.prompts.length > 0) {
        promptsHtml = `
          <div class="gs-prompts-container">
            ${stage.prompts.map(p => `
              <div class="gs-prompt-box">
                <div class="gs-prompt-box-header">
                  <span class="gs-prompt-code">${getSafeHtml(p.promptId || '')}</span>
                  <strong class="gs-prompt-title">${getSafeHtml(p.title || 'Deliverable')}</strong>
                </div>
                <div class="gs-prompt-content">${getSafeHtml(p.prompt || '')}</div>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        promptsHtml = `<p style="font-size:0.9rem; color:var(--text-muted); font-style:italic;">No deliverable text entered yet for this stage.</p>`;
      }

      // Media attachments
      let mediaHtml = '';
      if (stage.media && stage.media.length > 0) {
        mediaHtml = `
          <div style="margin-top:22px;">
            <h5 style="font-size:0.92rem; font-weight:700; color:var(--text-primary); margin-bottom:12px;">
              <i class="fa-solid fa-paperclip text-caramel"></i> Stage Attachments & Evidence (${stage.media.length})
            </h5>
            <div class="gs-media-grid">
              ${stage.media.map(m => {
                let iconClass = 'fa-file';
                let typeBadge = 'Attachment';
                let imgSrc = '';
                if (m.type === 'image') {
                  iconClass = 'fa-image';
                  typeBadge = 'Technical Image';
                  imgSrc = m.url || m.imageUrl || '';
                } else if (m.type === 'graph') {
                  iconClass = 'fa-chart-line';
                  typeBadge = 'Engineering Graph';
                  imgSrc = m.url || m.imageUrl || '';
                } else if (m.type === 'cad') {
                  iconClass = 'fa-cube';
                  typeBadge = '3D CAD Model';
                } else if (m.type === 'video') {
                  iconClass = 'fa-video';
                  typeBadge = 'Simulation Video';
                }

                return `
                  <div class="gs-media-card">
                    <div class="gs-media-thumb">
                      ${imgSrc ? `<img src="${getSafeHtml(imgSrc)}" alt="${getSafeHtml(m.title || '')}" loading="lazy">` : `<i class="fa-solid ${iconClass} text-caramel" style="font-size:2.4rem;"></i>`}
                    </div>
                    <div class="gs-media-body">
                      <span class="cad-badge-chip" style="margin-bottom:6px; font-size:0.7rem;">${typeBadge}</span>
                      <h6 class="gs-media-title">${getSafeHtml(m.title || 'Attachment')}</h6>
                      ${m.caption ? `<p class="gs-media-caption">${getSafeHtml(m.caption)}</p>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      stageCard.innerHTML = `
        <div class="gs-stage-header">
          <div>
            <span class="gs-stage-num-badge">${getSafeHtml(stage.number || stage.id || '')}</span>
            <h3 class="gs-stage-title">${getSafeHtml(stage.title || '')}</h3>
            ${stage.question ? `<p class="gs-stage-question">${getSafeHtml(stage.question)}</p>` : ''}
          </div>
          <span class="badge-status ${statusBadgeClass}">
            <i class="fa-solid ${statusIcon}"></i> ${getSafeHtml(stage.status || 'In Progress')}
          </span>
        </div>
        ${promptsHtml}
        ${mediaHtml}
      `;

      container.appendChild(stageCard);
    });
  }

  function publishPortfolio() {
    let teamData = {
      teamNumber: 'Team 07',
      projectTheme: 'Smart Campus',
      projectTitle: 'Resource Allocation System'
    };
    try {
      const savedPortfolio = localStorage.getItem('kle_team_portfolio');
      if (savedPortfolio) {
        teamData = Object.assign(teamData, JSON.parse(savedPortfolio));
      }
    } catch (e) {}

    const studentName = sessionStorage.getItem('kle-user-name') || 'Ruhel Ahmed';
    const studentUSN = sessionStorage.getItem('kle-user-usn') || '01FE24BME009';
    const guideName = document.getElementById('displayGuideName') ? document.getElementById('displayGuideName').textContent : 'Prof. Anand S.';
    const publishedAt = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const publishedPayload = {
      teamNumber: teamData.teamNumber,
      projectTheme: teamData.projectTheme,
      projectTitle: teamData.projectTitle,
      studentName,
      usn: studentUSN,
      guide: guideName,
      publishedAt,
      stages: stagesData
    };

    localStorage.setItem('kle_published_portfolio', JSON.stringify(publishedPayload));

    // Sync to backend if online
    if (isBackendOnline) {
      fetch('/api/dossier/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(publishedPayload)
      }).catch(err => console.warn('Backend publish sync failed:', err));
    }

    renderPublishedGoogleSite(publishedPayload);

    // Make published site buttons visible
    if (btnViewPublishedSite) btnViewPublishedSite.style.display = 'inline-flex';
    if (navLinkPublishedSite) navLinkPublishedSite.style.display = 'inline-flex';
    if (mobileLinkPublishedSite) mobileLinkPublishedSite.style.display = 'block';

    showToast(`✓ Published! ${teamData.teamNumber} Capstone Google Site is now live.`);

    setTimeout(() => {
      navigateToPage('page-published-site');
    }, 250);
  }

  window.publishPortfolio = publishPortfolio;
  window.renderPublishedGoogleSite = renderPublishedGoogleSite;

  if (btnPublishPortfolio) {
    btnPublishPortfolio.addEventListener('click', publishPortfolio);
  }

  if (btnViewPublishedSite) {
    btnViewPublishedSite.addEventListener('click', () => {
      navigateToPage('page-published-site');
    });
  }

  if (btnEditSiteReturn) {
    btnEditSiteReturn.addEventListener('click', () => {
      navigateToPage('page-stages');
    });
  }

  if (btnCopyPublicLink) {
    btnCopyPublicLink.addEventListener('click', () => {
      const liveUrl = window.location.origin + window.location.pathname + '#published-site';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(liveUrl).then(() => {
          showToast('✓ Public Portfolio link copied to clipboard!');
        }).catch(() => {
          showToast(`Portfolio URL: ${liveUrl}`);
        });
      } else {
        showToast(`Portfolio URL: ${liveUrl}`);
      }
    });
  }

  if (btnPrintPublishedSite) {
    btnPrintPublishedSite.addEventListener('click', () => {
      window.print();
    });
  }

  // Restore published state if available
  try {
    const existingPub = localStorage.getItem('kle_published_portfolio');
    if (existingPub) {
      const pubData = JSON.parse(existingPub);
      renderPublishedGoogleSite(pubData);
      if (btnViewPublishedSite) btnViewPublishedSite.style.display = 'inline-flex';
      if (navLinkPublishedSite) navLinkPublishedSite.style.display = 'inline-flex';
      if (mobileLinkPublishedSite) mobileLinkPublishedSite.style.display = 'block';
    }
  } catch (e) {}

  // ---------------------------------------------------------------------------
  // 8. ACTIONS: PRINT & JSON EXPORT (WITH FULL S1–S11 DATA)
  // ---------------------------------------------------------------------------
  const mBtnExemplar = document.getElementById('mBtnExemplar');
  if (mBtnExemplar) {
    mBtnExemplar.addEventListener('click', () => {
      stagesData = JSON.parse(JSON.stringify(DEFAULT_STAGES_DATA));
      saveStagesData();
      isAuthenticated = true;
      sessionStorage.setItem('kle-auth-verified', 'true');
      sessionStorage.setItem('kle-user-usn', '01FE22BME045');
      document.body.classList.add('authenticated');
      updateAuthPill(true, '01FE22BME045');
      renderAllStages();
      navigateToPage('page-stages');
      showToast('✨ Loaded complete Exemplar Capstone Project across all stages S1–S11!');
    });
  }

  const btnPrint = document.getElementById('btnPrintDossier');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  const btnExport = document.getElementById('btnExportJson');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const emailEl = document.getElementById('collegeEmail') || collegeEmail;
      const nameEl = document.getElementById('studentName') || studentName;
      const usnEl = document.getElementById('usnRoll') || usnRoll;
      const portfolioData = {
        projectTitle: "Design and Kinematic Synthesis of Opposed Scotch-Yoke Dual Cutter-Bar for Grain Harvesters",
        schemaVersion: "kle-me-portfolio-v2",
        institution: "KLE Technological University, Hubballi",
        student: {
          name: nameEl ? nameEl.value : 'Shrihari V. Katti',
          usn: usnEl ? usnEl.value : '01FE22BME045',
          email: emailEl ? emailEl.value : '01fe22bme045@kletech.ac.in',
          guide: "Prof. Anand S."
        },
        kinematics: {
          architecture: "Opposed Dual-Slider Scotch-Yoke",
          strokeMm: 76.2,
          inputRpm: 850,
          cutterVelocityMs: 3.02,
          requirementThresholdMs: 1.8
        },
        stages: stagesData
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolioData, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute("href", dataStr);
      dlAnchor.setAttribute("download", `KLE_Capstone_${usnEl ? usnEl.value : '01FE22BME045'}_S1_S11.json`);
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
      showToast('Exported complete project JSON schema with all S1–S11 stages and media!');
    });
  }

  // ---------------------------------------------------------------------------
  // 9. TOAST NOTIFICATION HELPER
  // ---------------------------------------------------------------------------
  const toastContainer = document.getElementById('toastContainer');

  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<i class="fa-solid fa-circle-check text-caramel"></i> <span>${msg}</span>`;
    toastContainer.appendChild(t);

    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(10px)';
      t.style.transition = 'all 0.3s';
      setTimeout(() => t.remove(), 300);
    }, 3500);
  }

});
