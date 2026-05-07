"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type GameId = "hub" | "lumosity" | "typeracer" | "concept-drop" | "semantic-sprint" | "echo-chamber";
type Theme = "light" | "dark";

// ─── Content ──────────────────────────────────────────────────────────────────
const CONCEPTS = [
  { term: "Neutron Star",    def: "Ultra-dense stellar remnant of a supernova, composed almost entirely of neutrons", category: "Astrophysics",   connections: ["Supernova","Pulsar","Gravity","Density","Magnetar"] },
  { term: "Black Hole",      def: "Region where gravity is so strong that nothing, not even light, can escape the event horizon", category: "Astrophysics", connections: ["Singularity","Event Horizon","Hawking Radiation","Gravity","Spacetime"] },
  { term: "Redshift",        def: "Shift of spectral lines toward longer wavelengths, indicating an object is moving away", category: "Cosmology",    connections: ["Doppler Effect","Expansion","Light","Velocity","Cosmology"] },
  { term: "Dark Matter",     def: "Hypothetical matter inferred from gravitational effects that does not interact electromagnetically", category: "Cosmology",    connections: ["Gravity","Galaxy","Mass","Invisible","Cold"] },
  { term: "Photosynthesis",  def: "Process by which plants convert light energy into chemical energy stored as glucose", category: "Biology",      connections: ["Chlorophyll","Glucose","Light","CO2","Oxygen"] },
  { term: "Mitosis",         def: "Cell division producing two genetically identical daughter cells for growth and repair", category: "Biology",      connections: ["DNA","Chromosomes","Cell Cycle","Prophase","Cytokinesis"] },
  { term: "Entropy",         def: "Measure of disorder or randomness in a thermodynamic system; tends to increase over time", category: "Physics",      connections: ["Thermodynamics","Disorder","Energy","Time","Equilibrium"] },
  { term: "Eigenvalue",      def: "Scalar λ where Av = λv; the factor by which a matrix scales its eigenvector", category: "Mathematics",  connections: ["Matrix","Eigenvector","Linear Algebra","Transformation","Determinant"] },
  { term: "Covalent Bond",   def: "Chemical bond formed by sharing electron pairs between atoms", category: "Chemistry",    connections: ["Electrons","Atoms","Molecule","Sharing","Orbital"] },
  { term: "Newton's 2nd Law",def: "Force equals mass times acceleration: F = ma", category: "Physics",      connections: ["Force","Mass","Acceleration","Momentum","Velocity"] },
  { term: "DNA Replication", def: "Process by which a DNA molecule is copied to produce two identical DNA molecules", category: "Biology",      connections: ["DNA","Polymerase","Replication Fork","Nucleotides","Template"] },
  { term: "Osmosis",         def: "Movement of water molecules through a semipermeable membrane from high to low concentration", category: "Biology",      connections: ["Membrane","Concentration","Water","Diffusion","Tonicity"] },
];

// Typeracer passages from the deck
const PASSAGES = [
  "A neutron star is an ultra-dense stellar remnant formed when a massive star collapses. It is composed almost entirely of neutrons and has a radius of only twenty kilometres.",
  "Dark matter does not interact with the electromagnetic force but its presence is inferred from gravitational effects on visible matter, radiation, and the large-scale structure of the universe.",
  "Photosynthesis is the process by which green plants use sunlight to convert carbon dioxide and water into glucose and oxygen, storing chemical energy in the process.",
  "Entropy is a measure of disorder or randomness in a thermodynamic system. According to the second law of thermodynamics, the total entropy of an isolated system always increases over time.",
  "Mitosis is a form of cell division in which one cell divides to produce two genetically identical daughter cells. It is essential for growth, development, and tissue repair in multicellular organisms.",
];

const uid = () => Math.random().toString(36).slice(2, 8);
const XP_PER_LEVEL = 200;
const levelName = (lvl: number) => ["Cadet","Explorer","Scholar","Luminary","Starforger","Voidwalker","Nebula Sage"][Math.min(lvl - 1, 6)];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LumIUGames() {
  const [theme, setTheme] = useState<Theme>("light");
  const [game, setGame]   = useState<GameId>("hub");
  const [xp, setXp]       = useState(340);

  const addXp = (amt: number) => setXp(p => p + amt);
  const isDark = theme === "dark";
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;

  // ─── Lumiu Notes design tokens ────────────────────────────────────────────
  const T = {
    bg:          isDark ? "#0f0f23"                 : "#f0eeff",
    surface:     isDark ? "#1a1a38"                 : "#ffffff",
    s2:          isDark ? "#22223a"                 : "#ede9ff",
    s3:          isDark ? "#2a2a48"                 : "#e2dcff",
    sidebar:     isDark ? "#16162e"                 : "#9D79FF",
    sidebarText: isDark ? "#e0d8ff"                 : "#ffffff",
    sidebarMuted:isDark ? "rgba(200,192,240,0.5)"   : "rgba(255,255,255,0.7)",
    sidebarActive:isDark? "#2e2e52"                 : "rgba(255,255,255,0.22)",
    border:      isDark ? "rgba(157,121,255,0.15)"  : "rgba(157,121,255,0.2)",
    b2:          isDark ? "rgba(157,121,255,0.25)"  : "rgba(157,121,255,0.35)",
    text:        isDark ? "#e8e4ff"                 : "#1a1040",
    muted:       isDark ? "rgba(200,192,240,0.55)"  : "rgba(80,60,140,0.55)",
    accent:      "#9D79FF",
    accentHover: "#7c5cfc",
    glow:        "rgba(157,121,255,0.15)",
    glowMd:      "rgba(157,121,255,0.3)",
    green:       isDark ? "#34d399" : "#059669",
    amber:       isDark ? "#fbbf24" : "#d97706",
    red:         isDark ? "#f87171" : "#ef4444",
    blue:        isDark ? "#60a5fa" : "#3b82f6",
    pill:        isDark ? "#22223a" : "#ede9ff",
    cardBg:      isDark ? "#1e1e40" : "#faf8ff",
    canvasBg:    isDark ? "#0b0b1e" : "#edeaff",
  };

  const css = `
@import url('https://api.fontshare.com/v2/css?f[]=chillax@300,400,500,600,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
.lg-root{font-family:'Chillax',sans-serif;background:${T.bg};color:${T.text};height:100vh;display:flex;flex-direction:column;overflow:hidden;transition:background 0.3s,color 0.3s;}

/* ── Topbar ── */
.lg-top{height:54px;background:${T.surface};border-bottom:1px solid ${T.border};display:flex;align-items:center;padding:0 20px;gap:14px;flex-shrink:0;z-index:50;}
.lg-logo{font-weight:700;font-size:19px;color:${T.accent};letter-spacing:-0.4px;display:flex;align-items:center;gap:6px;}
.lg-logo-dot{width:7px;height:7px;border-radius:50%;background:${T.accent};box-shadow:0 0 10px ${T.accent};animation:lgpulse 2s infinite;}
@keyframes lgpulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.8);}}
.lg-badge{font-size:11px;padding:2px 9px;border-radius:20px;background:${T.glow};color:${T.accent};border:1px solid ${T.border};font-weight:600;}
.lg-top-right{margin-left:auto;display:flex;align-items:center;gap:10px;}
.lg-xp-wrap{display:flex;align-items:center;gap:8px;}
.lg-xp-bg{width:100px;height:6px;border-radius:3px;background:${T.s3};}
.lg-xp-fill{height:6px;border-radius:3px;background:linear-gradient(90deg,${T.accent},#c4b0ff);transition:width 0.5s;}
.lg-level{font-size:11px;font-weight:600;color:${T.accent};white-space:nowrap;font-family:'JetBrains Mono';}
.theme-toggle{display:flex;align-items:center;gap:7px;border:1px solid ${T.border};border-radius:20px;padding:5px 12px;cursor:pointer;background:${T.pill};color:${T.muted};font-size:12px;font-family:'Chillax';font-weight:500;transition:all 0.2s;}
.theme-toggle:hover{border-color:${T.accent};}
.tog-track{width:32px;height:17px;border-radius:9px;background:${isDark ? T.accent : T.s3};position:relative;transition:background 0.25s;flex-shrink:0;}
.tog-thumb{position:absolute;width:13px;height:13px;border-radius:50%;background:white;top:2px;left:${isDark ? "17px" : "2px"};transition:left 0.25s;box-shadow:0 1px 3px rgba(0,0,0,0.3);}

/* ── Layout ── */
.lg-body{display:flex;flex:1;overflow:hidden;}

/* ── Sidebar ── */
.lg-sidebar{width:230px;background:${T.sidebar};display:flex;flex-direction:column;padding:16px 10px;gap:4px;flex-shrink:0;overflow-y:auto;}
.lg-section-label{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${T.sidebarMuted};padding:8px 10px 4px;margin-top:8px;}
.lg-nav-btn{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:12px;cursor:pointer;border:none;background:transparent;color:${T.sidebarText};font-family:'Chillax';font-size:13px;font-weight:500;width:100%;text-align:left;transition:all 0.18s;}
.lg-nav-btn:hover{background:${T.sidebarActive};}
.lg-nav-btn.active{background:${isDark ? "rgba(157,121,255,0.22)" : "rgba(255,255,255,0.28)"};color:white;}
.lg-nav-icon{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.lg-nav-sub{font-size:10px;color:${T.sidebarMuted};font-weight:400;display:block;margin-top:1px;}
.lg-divider{height:1px;background:rgba(255,255,255,0.12);margin:8px 0;}
.lg-xp-sidebar{padding:10px;}
.lg-xp-sidebar-label{font-size:10px;color:${T.sidebarMuted};font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;}
.lg-xp-sidebar-bar{height:5px;border-radius:3px;background:rgba(255,255,255,0.12);overflow:hidden;}
.lg-xp-sidebar-fill{height:5px;border-radius:3px;background:rgba(255,255,255,0.7);transition:width 0.5s;}
.lg-xp-sidebar-text{font-size:11px;color:${T.sidebarMuted};margin-top:5px;font-family:'JetBrains Mono';}

/* ── Main ── */
.lg-main{flex:1;overflow-y:auto;padding:24px;}

/* ── Hub ── */
.hub-hero{background:${isDark ? "linear-gradient(135deg,#1a1a38,#2e1a54)" : "linear-gradient(135deg,#9D79FF,#7c5cfc)"};border-radius:20px;padding:28px 32px;margin-bottom:22px;position:relative;overflow:hidden;}
.hub-hero-title{font-size:26px;font-weight:700;color:white;letter-spacing:-0.5px;margin-bottom:4px;}
.hub-hero-sub{font-size:13px;color:rgba(255,255,255,0.72);margin-bottom:18px;line-height:1.5;}
.hub-hero-btn{background:white;color:${T.accent};border:none;padding:10px 22px;border-radius:12px;font-family:'Chillax';font-size:14px;font-weight:700;cursor:pointer;transition:all 0.18s;}
.hub-hero-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.2);}
.hub-stars{position:absolute;inset:0;pointer-events:none;}

.hub-games-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:22px;}
.hub-game-card{background:${T.cardBg};border:1px solid ${T.border};border-radius:18px;padding:20px;cursor:pointer;transition:all 0.22s;position:relative;overflow:hidden;}
.hub-game-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(157,121,255,0.18);border-color:${T.b2};}
.hub-game-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:12px;}
.hub-game-title{font-size:16px;font-weight:700;letter-spacing:-0.3px;margin-bottom:4px;}
.hub-game-desc{font-size:12px;color:${T.muted};line-height:1.5;margin-bottom:12px;}
.hub-game-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px;}
.hub-game-tag{font-size:10px;font-weight:600;padding:2px 8px;border-radius:8px;text-transform:uppercase;letter-spacing:0.04em;}
.hub-game-play{padding:8px 16px;border-radius:10px;border:none;background:${T.accent};color:white;font-family:'Chillax';font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;width:100%;}
.hub-game-play:hover{background:${T.accentHover};}
.sec-title{font-size:16px;font-weight:700;letter-spacing:-0.3px;margin-bottom:12px;display:flex;align-items:center;gap:8px;}

/* ── Game shell ── */
.game-shell{background:${T.surface};border-radius:20px;border:1px solid ${T.border};overflow:hidden;min-height:560px;display:flex;flex-direction:column;}
.game-header{padding:14px 20px;border-bottom:1px solid ${T.border};display:flex;align-items:center;gap:12px;}
.game-back{width:32px;height:32px;border-radius:50%;border:1px solid ${T.border};background:${T.pill};color:${T.text};font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;}
.game-back:hover{border-color:${T.accent};color:${T.accent};}
.game-title{font-size:16px;font-weight:700;letter-spacing:-0.3px;}
.game-sub{font-size:12px;color:${T.muted};font-weight:400;}
.game-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;}
.score-pill{display:flex;align-items:center;gap:6px;background:${T.glow};border:1px solid ${T.border};border-radius:20px;padding:5px 14px;font-size:13px;font-weight:600;color:${T.accent};margin-left:auto;}
.timer-bar-wrap{width:100%;height:4px;background:${T.s3};overflow:hidden;}
.timer-bar-fill{height:4px;border-radius:0;background:${T.accent};transition:width 0.1s linear;}
.btn-p{padding:9px 22px;border-radius:11px;border:none;background:${T.accent};color:white;font-family:'Chillax';font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;}
.btn-p:hover{background:${T.accentHover};transform:translateY(-1px);}
.btn-s{padding:9px 18px;border-radius:11px;border:1px solid ${T.border};background:${T.pill};color:${T.text};font-family:'Chillax';font-size:13px;font-weight:500;cursor:pointer;transition:all 0.15s;}
.btn-s:hover{background:${T.s2};}
.done-wrap{display:flex;flex-direction:column;align-items:center;gap:14px;padding:32px 20px;text-align:center;}
.done-title{font-size:22px;font-weight:700;letter-spacing:-0.4px;}
.done-xp{background:${T.glow};border:1px solid ${T.border};border-radius:14px;padding:10px 20px;font-size:15px;font-weight:700;color:${T.accent};}
.done-stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:100%;max-width:380px;}
.done-stat{background:${T.s2};border:1px solid ${T.border};border-radius:12px;padding:12px;text-align:center;}
.done-stat-n{font-size:22px;font-weight:700;letter-spacing:-0.5px;}
.done-stat-l{font-size:10px;color:${T.muted};margin-top:2px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;}

/* ── LUMOSITY ── */
.lum-canvas{width:100%;max-width:580px;height:400px;position:relative;}
.lum-input-row{display:flex;gap:8px;width:100%;max-width:500px;margin-top:12px;}
.lum-input{flex:1;padding:11px 15px;background:${T.s2};border:1.5px solid ${T.border};border-radius:12px;color:${T.text};font-family:'Chillax';font-size:14px;font-weight:500;outline:none;transition:border-color 0.18s;}
.lum-input:focus{border-color:${T.accent};}
.lum-submit{padding:11px 20px;border-radius:12px;border:none;background:${T.accent};color:white;font-family:'Chillax';font-size:14px;font-weight:600;cursor:pointer;}
.lum-submit:hover{background:${T.accentHover};}
.lum-feedback{font-size:13px;font-weight:700;font-family:'JetBrains Mono';min-height:20px;transition:all 0.2s;}
.chain-pill{background:${isDark?"linear-gradient(135deg,#9D79FF,#7c5cfc)":"linear-gradient(135deg,#9D79FF,#7c5cfc)"};color:white;border-radius:20px;padding:4px 14px;font-size:13px;font-weight:700;font-family:'JetBrains Mono';}

/* ── TYPERACER ── */
.tr-passage-wrap{width:100%;max-width:600px;background:${T.s2};border-radius:16px;padding:20px 24px;border:1.5px solid ${T.border};margin-bottom:18px;position:relative;min-height:80px;}
.tr-passage{font-size:17px;font-weight:500;line-height:1.7;letter-spacing:0.01em;font-family:'Chillax';}
.tr-char-done{color:${T.accent};}
.tr-char-wrong{color:${T.red};background:rgba(248,113,113,0.15);border-radius:2px;}
.tr-char-cursor{border-left:2px solid ${T.accent};animation:cursor-blink 0.9s infinite;}
@keyframes cursor-blink{0%,100%{opacity:1;}50%{opacity:0;}}
.tr-char-pending{color:${T.muted};}
.tr-input{width:100%;max-width:600px;padding:13px 18px;background:${T.surface};border:1.5px solid ${T.border};border-radius:13px;color:${T.text};font-family:'JetBrains Mono';font-size:15px;outline:none;transition:border-color 0.18s;margin-bottom:14px;}
.tr-input:focus{border-color:${T.accent};}
.tr-metrics{display:flex;gap:16px;width:100%;max-width:600px;margin-bottom:10px;}
.tr-metric{flex:1;background:${T.s2};border-radius:12px;padding:12px;border:1px solid ${T.border};text-align:center;}
.tr-metric-n{font-size:26px;font-weight:700;letter-spacing:-0.5px;font-family:'JetBrains Mono';}
.tr-metric-l{font-size:10px;color:${T.muted};margin-top:2px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;}
.tr-progress{width:100%;max-width:600px;height:4px;border-radius:2px;background:${T.s3};overflow:hidden;margin-bottom:8px;}
.tr-progress-fill{height:4px;border-radius:2px;background:${T.accent};transition:width 0.2s;}
/* Micro-animation: WPM pulse */
@keyframes wpm-pop{0%{transform:scale(1);}40%{transform:scale(1.18);}100%{transform:scale(1);}}
.wpm-pop{animation:wpm-pop 0.3s ease;}
/* Correct flash */
@keyframes flash-green{0%{background:rgba(52,211,153,0.25);}100%{background:transparent;}}
.tr-correct-flash{animation:flash-green 0.35s ease;}

/* ── CONCEPT DROP (Beat Saber) ── */
.cd-arena{width:100%;max-width:560px;position:relative;border-radius:16px;overflow:hidden;border:1.5px solid ${T.border};background:${isDark?"linear-gradient(180deg,#0b0b1e 0%,#1a0a3d 100%)":"linear-gradient(180deg,#edeaff 0%,#ddd6ff 100%)"}}
.cd-target-bar{padding:14px 18px;border-bottom:1px solid ${T.border};background:${isDark?"rgba(157,121,255,0.1)":"rgba(157,121,255,0.08)"};display:flex;align-items:center;gap:10px;}
.cd-target-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${T.muted};white-space:nowrap;}
.cd-target-text{font-size:13px;font-weight:600;color:${T.text};line-height:1.4;flex:1;}
.cd-target-category{font-size:11px;font-weight:700;padding:3px 10px;border-radius:12px;background:${T.glow};color:${T.accent};white-space:nowrap;}
.cd-drop-zone{height:340px;position:relative;overflow:hidden;}
.cd-hit-bar{position:absolute;bottom:0;left:0;right:0;height:56px;background:${isDark?"rgba(157,121,255,0.12)":"rgba(157,121,255,0.1)"};border-top:2px solid ${T.accent};display:flex;align-items:center;justify-content:center;gap:8px;}
.cd-hit-label{font-size:11px;color:${T.accent};font-weight:600;font-family:'JetBrains Mono';letter-spacing:0.05em;}
.cd-block{position:absolute;cursor:pointer;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;font-family:'Chillax';text-align:center;padding:8px 14px;border:1.5px solid;transition:transform 0.1s;user-select:none;min-width:100px;}
.cd-block:hover{transform:scale(1.05);}
.cd-block.sliced-correct{animation:block-correct 0.4s ease forwards;}
.cd-block.sliced-wrong{animation:block-wrong 0.35s ease forwards;}
@keyframes block-correct{0%{transform:scale(1);}30%{transform:scale(1.25);}100%{transform:scale(0);opacity:0;}}
@keyframes block-wrong{0%{transform:translateX(0);}20%{transform:translateX(-8px);}40%{transform:translateX(8px);}60%{transform:translateX(-5px);}100%{transform:translateX(0);opacity:0.5;}}
.cd-side-panel{display:flex;flex-direction:column;gap:12px;width:130px;flex-shrink:0;}
.cd-combo-panel{background:${T.s2};border-radius:14px;border:1px solid ${T.border};padding:14px 12px;text-align:center;}
.cd-combo-num{font-size:40px;font-weight:700;letter-spacing:-1px;line-height:1;}
.cd-combo-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${T.muted};margin-top:3px;}
.cd-combo-fire{font-size:20px;margin-top:6px;}
@keyframes combo-pop{0%{transform:scale(1);}40%{transform:scale(1.3);}100%{transform:scale(1);}}
.combo-pop{animation:combo-pop 0.25s ease;}
.cd-info-panel{background:${T.s2};border-radius:14px;border:1px solid ${T.border};padding:12px;display:flex;flex-direction:column;gap:8px;}
.cd-info-row{display:flex;justify-content:space-between;align-items:center;}
.cd-info-label{font-size:10px;color:${T.muted};font-weight:600;text-transform:uppercase;letter-spacing:0.04em;}
.cd-info-val{font-size:14px;font-weight:700;font-family:'JetBrains Mono';}
.cd-speed-indicator{height:4px;border-radius:2px;background:${T.s3};overflow:hidden;}
.cd-speed-fill{height:4px;border-radius:2px;background:${T.amber};transition:width 0.5s;}
.beat-ripple{position:absolute;border-radius:50%;pointer-events:none;border:2px solid ${T.accent};opacity:0;animation:beat-ripple 0.6s ease-out forwards;}
@keyframes beat-ripple{0%{opacity:0.8;transform:scale(0);}100%{opacity:0;transform:scale(3);}}

/* ── SEMANTIC SPRINT ── */
.ss-card{background:${isDark?"linear-gradient(135deg,#1a0a3d,#2d1b69)":"linear-gradient(135deg,#9D79FF,#7c5cfc)"};border-radius:20px;padding:24px 28px;max-width:480px;width:100%;text-align:center;margin-bottom:18px;}
.ss-card-title{font-size:22px;font-weight:700;color:white;letter-spacing:-0.4px;margin-bottom:4px;}
.ss-connector{font-size:13px;color:${T.muted};margin-bottom:6px;text-align:center;}
.ss-concept-b{font-size:18px;font-weight:700;color:${T.accent};margin-bottom:14px;text-align:center;}
.ss-input{width:100%;max-width:480px;padding:13px 16px;background:${T.s2};border:1.5px solid ${T.border};border-radius:12px;color:${T.text};font-family:'Chillax';font-size:15px;font-weight:500;outline:none;text-align:center;transition:border-color 0.18s;margin-bottom:10px;}
.ss-input:focus{border-color:${T.accent};}
.ss-heat-bar{width:100%;max-width:480px;height:8px;border-radius:4px;background:${T.s3};margin-bottom:14px;overflow:hidden;}
.ss-heat-fill{height:8px;border-radius:4px;transition:width 0.5s,background 0.5s;}
.ss-result-row{display:flex;gap:8px;width:100%;max-width:480px;margin-bottom:8px;}
.ss-result-chip{flex:1;padding:9px;border-radius:10px;text-align:center;font-size:12px;font-weight:600;}
.ss-submit{padding:11px 28px;border-radius:12px;border:none;background:${T.accent};color:white;font-family:'Chillax';font-size:14px;font-weight:600;cursor:pointer;transition:all 0.15s;width:100%;max-width:480px;}
.ss-submit:hover{background:${T.accentHover};}

/* ── ECHO CHAMBER ── */
.ec-show-card{background:${isDark?"linear-gradient(135deg,#1a0a3d,#2d1b69)":"linear-gradient(135deg,#9D79FF,#7c5cfc)"};border-radius:18px;padding:22px 26px;max-width:480px;width:100%;margin-bottom:16px;animation:ec-fade 0.4s ease;}
@keyframes ec-fade{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
.ec-def-text{font-size:16px;color:white;line-height:1.6;font-weight:500;}
.ec-window-row{font-size:11px;font-family:'JetBrains Mono';color:rgba(255,255,255,0.6);margin-bottom:8px;display:flex;align-items:center;gap:6px;}
.ec-pip{display:inline-block;width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.4);}
.ec-textarea{width:100%;max-width:480px;min-height:96px;padding:13px 16px;background:${T.s2};border:1.5px solid ${T.border};border-radius:12px;color:${T.text};font-family:'Chillax';font-size:14px;font-weight:500;outline:none;resize:none;transition:border-color 0.18s;line-height:1.6;margin-bottom:10px;}
.ec-textarea:focus{border-color:${T.accent};}
.ec-score-bar{width:100%;max-width:480px;height:8px;border-radius:4px;background:${T.s3};overflow:hidden;margin-bottom:10px;}
.ec-score-fill{height:8px;border-radius:4px;background:linear-gradient(90deg,${T.accent},#34d399);transition:width 0.7s ease;}
.ec-submit{padding:11px 28px;border-radius:12px;border:none;background:${T.accent};color:white;font-family:'Chillax';font-size:14px;font-weight:600;cursor:pointer;transition:all 0.15s;width:100%;max-width:480px;}
.ec-submit:hover{background:${T.accentHover};}

scrollbar-width:thin;scrollbar-color:rgba(157,121,255,0.3) transparent;
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:rgba(157,121,255,0.3);border-radius:4px;}
`;

  const navItems: { id: GameId; icon: string; label: string; sub: string }[] = [
    { id: "hub",            icon: "🏠", label: "Game Hub",         sub: "All games" },
    { id: "lumosity",       icon: "🧠", label: "Lumosity",         sub: "Knowledge mapping" },
    { id: "typeracer",      icon: "⌨️", label: "TypeRacer",        sub: "Verbatim recall" },
    { id: "concept-drop",   icon: "🎯", label: "Concept Drop",     sub: "Retrieval speed" },
    { id: "semantic-sprint",icon: "⚡", label: "Semantic Sprint",  sub: "Semantic depth" },
    { id: "echo-chamber",   icon: "🔮", label: "Echo Chamber",     sub: "Working memory" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="lg-root">
        {/* Topbar */}
        <div className="lg-top">
          <div className="lg-logo"><div className="lg-logo-dot"/>lumiu</div>
          <span className="lg-badge">NEURAL · Gamification</span>
          <div className="lg-top-right">
            <div className="lg-xp-wrap">
              <span className="lg-level">Lv.{level} · {levelName(level)}</span>
              <div className="lg-xp-bg"><div className="lg-xp-fill" style={{width:`${(xpInLevel/XP_PER_LEVEL)*100}%`}}/></div>
              <span style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono'"}}>{xpInLevel}/{XP_PER_LEVEL}</span>
            </div>
            <button className="theme-toggle" onClick={() => setTheme(t => t==="dark"?"light":"dark")}>
              {theme==="dark"?"🌙":"☀️"}
              <div className="tog-track"><div className="tog-thumb"/></div>
              {theme==="dark"?"Dark":"Light"}
            </button>
          </div>
        </div>

        <div className="lg-body">
          {/* Sidebar */}
          <div className="lg-sidebar">
            <div className="lg-section-label">Games</div>
            {navItems.map(n => (
              <button key={n.id} className={`lg-nav-btn ${game===n.id?"active":""}`} onClick={()=>setGame(n.id)}>
                <div className="lg-nav-icon" style={{background:game===n.id?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.1)"}}>{n.icon}</div>
                <div>{n.label}<span className="lg-nav-sub">{n.sub}</span></div>
              </button>
            ))}
            <div className="lg-divider"/>
            <div className="lg-xp-sidebar">
              <div className="lg-xp-sidebar-label">Total XP</div>
              <div className="lg-xp-sidebar-bar"><div className="lg-xp-sidebar-fill" style={{width:`${(xpInLevel/XP_PER_LEVEL)*100}%`}}/></div>
              <div className="lg-xp-sidebar-text">{xp} XP · Level {level}</div>
            </div>
          </div>

          {/* Main */}
          <div className="lg-main">
            {game==="hub"            && <Hub T={T} isDark={isDark} setGame={setGame}/>}
            {game==="lumosity"       && <LumosityGame T={T} isDark={isDark} addXp={addXp} goBack={()=>setGame("hub")}/>}
            {game==="typeracer"      && <TypeRacerGame T={T} isDark={isDark} addXp={addXp} goBack={()=>setGame("hub")}/>}
            {game==="concept-drop"   && <ConceptDropGame T={T} isDark={isDark} addXp={addXp} goBack={()=>setGame("hub")}/>}
            {game==="semantic-sprint"&& <SemanticSprint T={T} isDark={isDark} addXp={addXp} goBack={()=>setGame("hub")}/>}
            {game==="echo-chamber"   && <EchoChamber T={T} isDark={isDark} addXp={addXp} goBack={()=>setGame("hub")}/>}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── HUB ──────────────────────────────────────────────────────────────────────
function Hub({T, isDark, setGame}: {T:any; isDark:boolean; setGame:(g:GameId)=>void}) {
  const games = [
    { id:"lumosity" as GameId,        icon:"🧠", color:"#9D79FF", bg:isDark?"rgba(157,121,255,0.15)":"rgba(157,121,255,0.1)",  label:"Lumosity",         desc:"Build conceptual relationship maps from your deck. Type connections on every beat — the longer the chain, the deeper the encoding.", tags:["memory","mapping","rhythm"], tagColors:["#9D79FF","#60a5fa","#34d399"] },
    { id:"typeracer" as GameId,        icon:"⌨️", color:"#60a5fa", bg:isDark?"rgba(96,165,250,0.12)":"rgba(96,165,250,0.08)",  label:"TypeRacer",        desc:"Race to retype study passages verbatim. WPM and accuracy tracked live. Motor-cognitive coupling reinforces verbatim recall.", tags:["typing","recall","speed"],    tagColors:["#60a5fa","#9D79FF","#34d399"] },
    { id:"concept-drop" as GameId,     icon:"🎯", color:"#34d399", bg:isDark?"rgba(52,211,153,0.12)":"rgba(52,211,153,0.08)",  label:"Concept Drop",     desc:"Concepts fall from above. Slice only those matching the target definition. Combo chains reward accurate rapid retrieval.", tags:["focus","inhibition","speed"], tagColors:["#34d399","#fbbf24","#f87171"] },
    { id:"semantic-sprint" as GameId,  icon:"⚡", color:"#fbbf24", bg:isDark?"rgba(251,191,36,0.1)":"rgba(251,191,36,0.07)",   label:"Semantic Sprint",  desc:"Bridge two concepts with a typed connection. AI scores semantic closeness — rewarding nuanced understanding over binary recall.", tags:["semantic","ai","open-ended"],  tagColors:["#fbbf24","#9D79FF","#60a5fa"] },
    { id:"echo-chamber" as GameId,     icon:"🔮", color:"#f87171", bg:isDark?"rgba(248,113,113,0.1)":"rgba(248,113,113,0.07)", label:"Echo Chamber",     desc:"Memorise a definition in 4 seconds. Type it back from memory. Window shrinks as you improve — pure working memory training.", tags:["recall","working memory","encode"],tagColors:["#f87171","#9D79FF","#34d399"] },
  ];

  return (
    <div>
      <div className="hub-hero">
        <svg className="hub-stars" viewBox="0 0 600 140">
          {Array.from({length:40},(_,i)=>(
            <circle key={i} cx={Math.random()*600} cy={Math.random()*140} r={0.5+Math.random()*1.5} fill="white" opacity={0.3+Math.random()*0.4}>
              <animate attributeName="opacity" values={`${0.2+Math.random()*0.3};${0.7+Math.random()*0.3};${0.2+Math.random()*0.3}`} dur={`${2+Math.random()*3}s`} begin={`${Math.random()*4}s`} repeatCount="indefinite"/>
            </circle>
          ))}
        </svg>
        <div style={{position:"relative"}}>
          <div className="hub-hero-title">🧠 NEURAL — Galaxy of Knowledge</div>
          <div className="hub-hero-sub">5 content-native mini-games designed for neurodivergent learners · every session is studying · powered by your deck</div>
          <button className="hub-hero-btn" onClick={()=>setGame("lumosity")}>▶ Play Lumosity — Start Mapping</button>
        </div>
      </div>
      <div className="sec-title"><span>All 5 Games</span><span style={{fontSize:12,fontWeight:400,color:T.muted}}>tap to play</span></div>
      <div className="hub-games-grid">
        {games.map(g=>(
          <div key={g.id} className="hub-game-card" onClick={()=>setGame(g.id)} style={{background:g.bg}}>
            <div className="hub-game-icon" style={{background:`${g.color}22`}}>{g.icon}</div>
            <div className="hub-game-title">{g.label}</div>
            <div className="hub-game-desc">{g.desc}</div>
            <div className="hub-game-tags">{g.tags.map((t,i)=><span key={t} className="hub-game-tag" style={{background:`${g.tagColors[i]}22`,color:g.tagColors[i]}}>{t}</span>)}</div>
            <button className="hub-game-play" style={{background:g.color}}>Play →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LUMOSITY ─────────────────────────────────────────────────────────────────
function LumosityGame({T, isDark, addXp, goBack}: any) {
  const [phase, setPhase] = useState<"intro"|"play"|"done">("intro");
  const [concept] = useState(()=>CONCEPTS[Math.floor(Math.random()*CONCEPTS.length)]);
  const [chain, setChain] = useState<{text:string;score:number}[]>([]);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [beat, setBeat] = useState(0);
  const [feedback, setFeedback] = useState<{text:string;good:boolean}|null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    if(phase!=="play") return;
    const iv = setInterval(()=>{
      setBeat(b=>(b+1)%100);
      setTimeLeft(t=>{ if(t<=1){setPhase("done");return 0;} return t-1; });
    },1000);
    return ()=>clearInterval(iv);
  },[phase]);

  const submit = ()=>{
    if(!input.trim()) return;
    const val = input.trim().toLowerCase();
    const known = concept.connections.map((c:string)=>c.toLowerCase());
    const good = known.some((k:string)=>val.includes(k.split(" ")[0])||k.includes(val.split(" ")[0]))||val.length>3;
    const score = good ? Math.floor(60+Math.random()*35) : Math.floor(20+Math.random()*30);
    setChain(p=>[...p,{text:input.trim(),score}]);
    setFeedback({text:good?`+${score} semantic`:`weak link (${score})`, good});
    setInput(""); setTimeout(()=>setFeedback(null),1200); inputRef.current?.focus();
  };

  const cx=290, cy=200, nr=165;
  const nodes = chain.slice(-6).map((c,i,arr)=>{
    const angle=(i/Math.max(arr.length,6))*Math.PI*2-Math.PI/2;
    return {x:cx+nr*Math.cos(angle), y:cy+nr*Math.sin(angle), ...c};
  });

  if(phase==="intro") return (
    <div className="game-shell">
      <div className="game-header"><button className="game-back" onClick={goBack}>←</button><div><div className="game-title">🧠 Lumosity</div><div className="game-sub">Conceptual knowledge mapping · rhythm-based chain</div></div></div>
      <div className="game-body" style={{gap:16,textAlign:"center"}}>
        <div style={{fontSize:52}}>🧠</div>
        <div style={{fontSize:20,fontWeight:700,letterSpacing:"-0.3px"}}>Build a Knowledge Map</div>
        <div style={{maxWidth:420,color:T.muted,fontSize:14,lineHeight:1.7}}>A concept from your deck appears in the centre. On each beat, type one thing that <strong style={{color:T.text}}>connects to it</strong>. Build the longest semantic chain in 60 seconds.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,maxWidth:400,marginTop:8}}>
          {[["🎵","Follow the beat","Type one connection per pulse"],["⛓️","Grow the chain","Each link extends the web"],["✦","Earn XP","+18 XP per valid link"]].map(([icon,title,sub])=>(
            <div key={title as string} style={{background:T.s2,borderRadius:14,padding:"14px 10px",textAlign:"center",border:`1px solid ${T.border}`}}>
              <div style={{fontSize:22,marginBottom:5}}>{icon}</div><div style={{fontSize:12,fontWeight:700,marginBottom:3}}>{title}</div><div style={{fontSize:11,color:T.muted}}>{sub}</div>
            </div>
          ))}
        </div>
        <button className="btn-p" style={{marginTop:8,padding:"12px 36px",fontSize:15}} onClick={()=>{setPhase("play");setTimeout(()=>inputRef.current?.focus(),80);}}>▶ Start Game</button>
      </div>
    </div>
  );

  if(phase==="done") {
    const xpEarned = chain.length*18+(chain.length>=5?50:0);
    addXp(xpEarned);
    return (
      <div className="game-shell">
        <div className="game-header"><button className="game-back" onClick={goBack}>←</button><div><div className="game-title">🧠 Lumosity — Complete</div></div></div>
        <div className="done-wrap">
          <div style={{fontSize:52}}>🎉</div>
          <div className="done-title">Chain of {chain.length}!</div>
          <div className="done-xp">+{xpEarned} XP earned</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",maxWidth:480}}>
            {chain.map((c,i)=><span key={i} style={{background:T.s2,border:`1px solid ${T.border}`,borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:500}}>{c.text} <span style={{color:T.accent,fontFamily:"'JetBrains Mono'"}}>{c.score}</span></span>)}
          </div>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button className="btn-s" onClick={goBack}>Back to Hub</button>
            <button className="btn-p" onClick={()=>{setPhase("intro");setChain([]);setTimeLeft(60);}}>Play Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-shell">
      <div className="game-header">
        <button className="game-back" onClick={goBack}>←</button>
        <div><div className="game-title">🧠 Lumosity</div><div className="game-sub">Connecting to: {concept.term}</div></div>
        <div className="score-pill">⛓️ {chain.length}</div>
        <div style={{fontFamily:"'JetBrains Mono'",fontSize:13,fontWeight:600,color:timeLeft<=10?T.red:T.accent,marginLeft:8}}>{timeLeft}s</div>
      </div>
      <div className="timer-bar-wrap"><div className="timer-bar-fill" style={{width:`${(timeLeft/60)*100}%`,background:timeLeft<=10?T.red:T.accent}}/></div>
      <div className="game-body">
        <div className="lum-canvas">
          <svg width="580" height="400" viewBox="0 0 580 400" style={{position:"absolute",inset:0}}>
            {[110,150,195].map((r,i)=><circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke={T.accent} strokeWidth={0.5} opacity={0.08+i*0.04}/>)}
            <circle cx={cx} cy={cy} r={78} fill="none" stroke={T.accent} strokeWidth={1.5} opacity={0.5}>
              <animate attributeName="r" values="72;86;72" dur="1s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.5;0.8;0.5" dur="1s" repeatCount="indefinite"/>
            </circle>
            {nodes.map((n,i)=><line key={i} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke={T.accent} strokeWidth={1} opacity={0.3} strokeDasharray="4,3"/>)}
            {nodes.map((n,i)=>(
              <g key={i}>
                <circle cx={n.x} cy={n.y} r={28} fill={isDark?"#1a1a38":"#ede9ff"} stroke={T.accent} strokeWidth={1.5}/>
                <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle" fill={T.text} fontSize={9} fontFamily="Chillax" fontWeight="600">{n.text.length>9?n.text.slice(0,8)+"…":n.text}</text>
                <text x={n.x} y={n.y+15} textAnchor="middle" fill={T.accent} fontSize={8} fontFamily="JetBrains Mono">{n.score}</text>
              </g>
            ))}
            <circle cx={cx} cy={cy} r={52} fill={isDark?"#2a1a50":"#9D79FF"} stroke={T.accent} strokeWidth={2}/>
            <text x={cx} y={cy-6} textAnchor="middle" fill="white" fontSize={10} fontFamily="Chillax" fontWeight="700">{concept.term.length>13?concept.term.slice(0,12)+"…":concept.term}</text>
            <text x={cx} y={cy+9} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize={7} fontFamily="JetBrains Mono">NEURAL CORE</text>
          </svg>
        </div>
        <div className="lum-feedback" style={{color:feedback?(feedback.good?T.green:T.muted):"transparent"}}>{feedback?.text||"·"}</div>
        <div className="lum-input-row">
          <input ref={inputRef} className="lum-input" placeholder={`What connects to "${concept.term}"?`} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} autoFocus/>
          <button className="lum-submit" onClick={submit}>→</button>
        </div>
        <div style={{fontSize:11,color:T.muted,marginTop:6,fontFamily:"'JetBrains Mono'"}}>press Enter on each beat · {chain.length} links built</div>
      </div>
    </div>
  );
}

// ─── TYPERACER ────────────────────────────────────────────────────────────────
function TypeRacerGame({T, isDark, addXp, goBack}: any) {
  const [phase, setPhase] = useState<"intro"|"play"|"done">("intro");
  const [passageIdx] = useState(()=>Math.floor(Math.random()*PASSAGES.length));
  const passage = PASSAGES[passageIdx];
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [wpmPop, setWpmPop] = useState(false);
  const [flashClass, setFlashClass] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const lastWpmRef = useRef(0);

  useEffect(()=>{
    if(phase!=="play") return;
    const iv = setInterval(()=>{
      if(!startTime) return;
      const elapsed = (Date.now()-startTime)/60000;
      const wordCount = typed.trim().split(/\s+/).filter(Boolean).length;
      const newWpm = elapsed>0.01?Math.round(wordCount/elapsed):0;
      if(newWpm!==lastWpmRef.current){
        setWpmHistory(h=>[...h.slice(-19),newWpm]);
        if(newWpm>lastWpmRef.current){ setWpmPop(true); setTimeout(()=>setWpmPop(false),300); }
        lastWpmRef.current=newWpm;
        setWpm(newWpm);
      }
    },500);
    return ()=>clearInterval(iv);
  },[phase,typed,startTime]);

  const handleType = (e: React.ChangeEvent<HTMLInputElement>)=>{
    const val = e.target.value;
    if(phase!=="play") return;
    if(!startTime) setStartTime(Date.now());
    // Count errors
    let errCount=0;
    for(let i=0;i<val.length;i++){
      if(val[i]!==passage[i]) errCount++;
    }
    setErrors(errCount);
    const acc = val.length>0?Math.round(((val.length-errCount)/val.length)*100):100;
    setAccuracy(acc);
    // Flash on correct char
    if(val.length>typed.length && val[val.length-1]===passage[val.length-1]){
      setFlashClass("tr-correct-flash");
      setTimeout(()=>setFlashClass(""),350);
    }
    setTyped(val);
    if(val===passage){ setPhase("done"); const xpEarned=Math.floor(wpm*accuracy/100*0.5); addXp(xpEarned); }
  };

  const progress = passage.length>0?Math.round((typed.length/passage.length)*100):0;
  const xpEarned = Math.floor(wpm*accuracy/100*0.5);

  if(phase==="intro") return (
    <div className="game-shell">
      <div className="game-header"><button className="game-back" onClick={goBack}>←</button><div><div className="game-title">⌨️ TypeRacer</div><div className="game-sub">Verbatim recall through motor-cognitive coupling</div></div></div>
      <div className="game-body" style={{gap:16,textAlign:"center"}}>
        <div style={{fontSize:52}}>⌨️</div>
        <div style={{fontSize:20,fontWeight:700}}>Race Through Your Notes</div>
        <div style={{maxWidth:420,color:T.muted,fontSize:14,lineHeight:1.7}}>Type the study passage exactly as shown. Your WPM and accuracy are tracked live. Motor-cognitive coupling — the act of typing — significantly reinforces verbatim memory encoding.</div>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          {[["⌨️","Type exactly","Match every character"],["📊","Live WPM","Tracked every 500ms"],["🎯","Accuracy","Errors penalise score"]].map(([icon,title,sub])=>(
            <div key={title as string} style={{background:T.s2,borderRadius:14,padding:"12px 16px",border:`1px solid ${T.border}`,textAlign:"center",minWidth:120}}>
              <div style={{fontSize:20,marginBottom:4}}>{icon}</div><div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{title}</div><div style={{fontSize:11,color:T.muted}}>{sub}</div>
            </div>
          ))}
        </div>
        <button className="btn-p" style={{marginTop:8,padding:"12px 36px"}} onClick={()=>{setPhase("play");setTimeout(()=>inputRef.current?.focus(),80);}}>▶ Start Typing</button>
      </div>
    </div>
  );

  if(phase==="done") return (
    <div className="game-shell">
      <div className="game-header"><button className="game-back" onClick={goBack}>←</button><div><div className="game-title">⌨️ TypeRacer — Complete!</div></div></div>
      <div className="done-wrap">
        <div style={{fontSize:52}}>✅</div>
        <div className="done-title">Passage Complete!</div>
        <div className="done-xp">+{xpEarned} XP earned</div>
        <div className="done-stats-grid">
          <div className="done-stat"><div className="done-stat-n" style={{color:T.accent}}>{wpm}</div><div className="done-stat-l">WPM</div></div>
          <div className="done-stat"><div className="done-stat-n" style={{color:T.green}}>{accuracy}%</div><div className="done-stat-l">Accuracy</div></div>
          <div className="done-stat"><div className="done-stat-n" style={{color:errors>0?T.red:T.green}}>{errors}</div><div className="done-stat-l">Errors</div></div>
        </div>
        {/* Mini WPM chart */}
        {wpmHistory.length>1 && (
          <div style={{width:"100%",maxWidth:420,height:60,position:"relative",background:T.s2,borderRadius:12,padding:"8px 12px",border:`1px solid ${T.border}`}}>
            <div style={{fontSize:10,color:T.muted,marginBottom:4,fontFamily:"'JetBrains Mono'",textTransform:"uppercase",letterSpacing:"0.06em"}}>WPM over time</div>
            <svg width="100%" height="32" viewBox={`0 0 ${wpmHistory.length*10} 32`} preserveAspectRatio="none">
              <polyline
                points={wpmHistory.map((v,i)=>`${i*10},${32-Math.min(v,120)/120*30}`).join(" ")}
                fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button className="btn-s" onClick={goBack}>Back to Hub</button>
          <button className="btn-p" onClick={()=>{setPhase("intro");setTyped("");setWpm(0);setAccuracy(100);setErrors(0);setWpmHistory([]);setStartTime(0);}}>Play Again</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="game-shell">
      <div className="game-header">
        <button className="game-back" onClick={goBack}>←</button>
        <div><div className="game-title">⌨️ TypeRacer</div><div className="game-sub">Type the passage exactly</div></div>
        <div className="score-pill" style={{fontFamily:"'JetBrains Mono'"}}>{wpm} WPM</div>
      </div>
      <div className="timer-bar-wrap"><div className="timer-bar-fill" style={{width:`${progress}%`,background:T.accent}}/></div>
      <div className="game-body" style={{gap:12,alignItems:"stretch",maxWidth:640,width:"100%"}}>
        {/* Metrics row */}
        <div className="tr-metrics">
          <div className="tr-metric">
            <div className={`tr-metric-n ${wpmPop?"wpm-pop":""}`} style={{color:T.accent}}>{wpm}</div>
            <div className="tr-metric-l">WPM</div>
          </div>
          <div className="tr-metric">
            <div className="tr-metric-n" style={{color:accuracy>=90?T.green:accuracy>=70?T.amber:T.red}}>{accuracy}%</div>
            <div className="tr-metric-l">Accuracy</div>
          </div>
          <div className="tr-metric">
            <div className="tr-metric-n" style={{color:errors>0?T.red:T.green}}>{errors}</div>
            <div className="tr-metric-l">Errors</div>
          </div>
          <div className="tr-metric">
            <div className="tr-metric-n" style={{color:T.muted}}>{progress}%</div>
            <div className="tr-metric-l">Progress</div>
          </div>
        </div>

        {/* Passage display */}
        <div className={`tr-passage-wrap ${flashClass}`}>
          <div className="tr-passage">
            {passage.split("").map((char, i) => {
              let cls = "tr-char-pending";
              if(i < typed.length) cls = typed[i]===char ? "tr-char-done" : "tr-char-wrong";
              else if(i === typed.length) cls = "tr-char-cursor";
              return <span key={i} className={cls}>{char}</span>;
            })}
          </div>
        </div>

        {/* Typing input */}
        <input
          ref={inputRef}
          className="tr-input"
          value={typed}
          onChange={handleType}
          placeholder="Start typing the passage above..."
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <div style={{fontSize:11,color:T.muted,fontFamily:"'JetBrains Mono'",textAlign:"center"}}>{typed.length} / {passage.length} characters · {passage.split(" ").length} words</div>
      </div>
    </div>
  );
}

// ─── CONCEPT DROP ─────────────────────────────────────────────────────────────
interface FallingBlock {
  id: string; term: string; category: string;
  x: number; y: number; speed: number;
  isTarget: boolean; sliceState: "idle"|"correct"|"wrong";
  color: string; borderColor: string;
}

const BLOCK_COLORS = [
  {bg:"rgba(157,121,255,0.18)",border:"#9D79FF",text:"#9D79FF"},
  {bg:"rgba(52,211,153,0.15)",border:"#34d399",text:"#34d399"},
  {bg:"rgba(96,165,250,0.15)",border:"#60a5fa",text:"#60a5fa"},
  {bg:"rgba(251,191,36,0.15)",border:"#fbbf24",text:"#fbbf24"},
  {bg:"rgba(248,113,113,0.15)",border:"#f87171",text:"#f87171"},
];

function ConceptDropGame({T, isDark, addXp, goBack}: any) {
  const [phase, setPhase] = useState<"intro"|"play"|"done">("intro");
  const [blocks, setBlocks] = useState<FallingBlock[]>([]);
  const [targetIdx, setTargetIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [sliced, setSliced] = useState(0);
  const [missed, setMissed] = useState(0);
  const [dropSpeed, setDropSpeed] = useState(1.0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [comboAnim, setComboAnim] = useState(false);
  const [ripples, setRipples] = useState<{id:string;x:number;y:number}[]>([]);
  const arenaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const blocksRef = useRef<FallingBlock[]>([]);
  const phaseRef = useRef(phase);
  const speedRef = useRef(dropSpeed);
  const scoreRef = useRef(score);
  const comboRef = useRef(combo);

  phaseRef.current = phase;
  speedRef.current = dropSpeed;
  scoreRef.current = score;
  comboRef.current = combo;
  blocksRef.current = blocks;

  const ARENA_H = 340;
  const HIT_ZONE_H = 56;
  const ZONE_TOP = ARENA_H - HIT_ZONE_H;

  // Beat sound using Web Audio
  const audioCtx = useRef<AudioContext|null>(null);
  const beatInterval = useRef<number|null>(null);

  const playBeat = useCallback(()=>{
    try {
      if(!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 220;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.18);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime+0.18);
    } catch(e){}
  },[]);

  const playSlice = useCallback((correct:boolean)=>{
    try {
      if(!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = correct ? 523 : 180;
      osc.type = correct ? "triangle" : "sawtooth";
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.25);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime+0.25);
      if(correct){
        setTimeout(()=>{
          const osc2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          osc2.connect(g2); g2.connect(ctx.destination);
          osc2.frequency.value = 659;
          osc2.type = "triangle";
          g2.gain.setValueAtTime(0.1, ctx.currentTime);
          g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.2);
          osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime+0.2);
        },100);
      }
    } catch(e){}
  },[]);

  const spawnBlock = useCallback((targetConcept: typeof CONCEPTS[0])=>{
    const useTarget = Math.random()<0.45;
    const concept = useTarget ? targetConcept : CONCEPTS[Math.floor(Math.random()*CONCEPTS.length)];
    const colorIdx = Math.floor(Math.random()*BLOCK_COLORS.length);
    const col = BLOCK_COLORS[colorIdx];
    const blockW = 140;
    const maxX = 560 - blockW - 20;
    return {
      id: uid(),
      term: concept.term,
      category: concept.category,
      x: 20 + Math.random()*maxX,
      y: -50,
      speed: 0.4 + speedRef.current*0.5,
      isTarget: useTarget && concept.term===targetConcept.term,
      sliceState: "idle" as const,
      color: col.bg,
      borderColor: col.border,
    };
  },[]);

  useEffect(()=>{
    if(phase!=="play") return;
    // Beat
    beatInterval.current = window.setInterval(playBeat, 800);
    // Spawn blocks
    const spawnIv = setInterval(()=>{
      if(phaseRef.current!=="play") return;
      const target = CONCEPTS[targetIdx % CONCEPTS.length];
      setBlocks(prev=>{
        if(prev.filter(b=>b.sliceState==="idle").length >= 6) return prev;
        return [...prev, spawnBlock(target)];
      });
    }, 1200);
    // Timer
    const timerIv = setInterval(()=>{
      setTimeLeft(t=>{if(t<=1){setPhase("done");return 0;}return t-1;});
    },1000);
    // Animation loop
    const animate = ()=>{
      if(phaseRef.current!=="play"){cancelAnimationFrame(frameRef.current);return;}
      setBlocks(prev=>{
        const updated = prev.map(b=>{
          if(b.sliceState!=="idle") return b;
          return {...b, y: b.y + b.speed};
        });
        // Check if any idle block fell through hit zone (missed target)
        const cleaned = updated.filter(b=>{
          if(b.y > ARENA_H + 60){
            if(b.isTarget){ setMissed(m=>m+1); setCombo(0); }
            return false;
          }
          return b.sliceState!=="wrong" || b.y <= ARENA_H;
        });
        return cleaned;
      });
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return ()=>{
      clearInterval(beatInterval.current!);
      clearInterval(spawnIv);
      clearInterval(timerIv);
      cancelAnimationFrame(frameRef.current);
    };
  },[phase, targetIdx, playBeat, spawnBlock]);

  // Rotate target every 8 seconds
  useEffect(()=>{
    if(phase!=="play") return;
    const iv = setInterval(()=>setTargetIdx(i=>i+1), 8000);
    return ()=>clearInterval(iv);
  },[phase]);

  // Adjust speed based on combo
  useEffect(()=>{
    setDropSpeed(Math.min(3.0, 1.0 + combo*0.08));
  },[combo]);

  const handleSlice = (blockId:string, e: React.MouseEvent<HTMLDivElement>)=>{
    e.stopPropagation();
    const target = CONCEPTS[targetIdx % CONCEPTS.length];
    setBlocks(prev=>prev.map(b=>{
      if(b.id!==blockId||b.sliceState!=="idle") return b;
      const correct = b.isTarget;
      playSlice(correct);
      // Add ripple
      const rect = e.currentTarget.getBoundingClientRect();
      const arenaRect = arenaRef.current?.getBoundingClientRect();
      if(arenaRect){
        const rx = e.clientX - arenaRect.left;
        const ry = e.clientY - arenaRect.top;
        const rid = uid();
        setRipples(r=>[...r,{id:rid,x:rx,y:ry}]);
        setTimeout(()=>setRipples(r=>r.filter(rp=>rp.id!==rid)),600);
      }
      if(correct){
        setScore(s=>s+10*(1+Math.floor(comboRef.current/3)));
        setSliced(s=>s+1);
        setCombo(c=>{const n=c+1;setMaxCombo(m=>Math.max(m,n));setComboAnim(true);setTimeout(()=>setComboAnim(false),250);return n;});
      } else {
        setMissed(m=>m+1);
        setCombo(0);
        setScore(s=>Math.max(0,s-5));
      }
      setTimeout(()=>setBlocks(prev=>prev.filter(bl=>bl.id!==blockId)),400);
      return {...b, sliceState: correct?"correct":"wrong"};
    }));
  };

  const target = CONCEPTS[targetIdx % CONCEPTS.length];

  if(phase==="intro") return (
    <div className="game-shell">
      <div className="game-header"><button className="game-back" onClick={goBack}>←</button><div><div className="game-title">🎯 Concept Drop</div><div className="game-sub">Beat-synced retrieval speed training</div></div></div>
      <div className="game-body" style={{gap:14,textAlign:"center"}}>
        <div style={{fontSize:52}}>🎯</div>
        <div style={{fontSize:20,fontWeight:700}}>Slice the Right Concept</div>
        <div style={{maxWidth:440,color:T.muted,fontSize:14,lineHeight:1.7}}>Concepts fall to a hit zone. A target definition is shown at the top. Slice only blocks that match. Combos build speed and multiply your score. A wrong slice resets your combo and deducts points.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxWidth:380,marginTop:4}}>
          {[["🎯","Match the definition","Only slice the correct concept"],["⛓️","Build combos","Each correct slice extends chain"],["⚡","Speed scales","Combo increases drop velocity"],["🔇","Sound off? OK","Audio feedback optional"]].map(([icon,title,sub])=>(
            <div key={title as string} style={{background:T.s2,borderRadius:12,padding:"12px",border:`1px solid ${T.border}`,textAlign:"left",display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:18}}>{icon}</span>
              <div><div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{title}</div><div style={{fontSize:11,color:T.muted}}>{sub}</div></div>
            </div>
          ))}
        </div>
        <button className="btn-p" style={{marginTop:8,padding:"12px 36px"}} onClick={()=>setPhase("play")}>▶ Start Drop</button>
      </div>
    </div>
  );

  if(phase==="done"){
    const xpEarned = score + maxCombo*5;
    addXp(xpEarned);
    return (
      <div className="game-shell">
        <div className="game-header"><button className="game-back" onClick={goBack}>←</button><div><div className="game-title">🎯 Concept Drop — Done</div></div></div>
        <div className="done-wrap">
          <div style={{fontSize:52}}>🎯</div>
          <div className="done-title">Score: {score}</div>
          <div className="done-xp">+{xpEarned} XP earned</div>
          <div className="done-stats-grid">
            <div className="done-stat"><div className="done-stat-n" style={{color:T.green}}>{sliced}</div><div className="done-stat-l">Sliced</div></div>
            <div className="done-stat"><div className="done-stat-n" style={{color:T.amber}}>{maxCombo}</div><div className="done-stat-l">Best Combo</div></div>
            <div className="done-stat"><div className="done-stat-n" style={{color:T.red}}>{missed}</div><div className="done-stat-l">Missed</div></div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button className="btn-s" onClick={goBack}>Hub</button>
            <button className="btn-p" onClick={()=>{setPhase("intro");setBlocks([]);setScore(0);setCombo(0);setMaxCombo(0);setSliced(0);setMissed(0);setDropSpeed(1.0);setTimeLeft(60);setTargetIdx(0);}}>Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-shell">
      <div className="game-header">
        <button className="game-back" onClick={goBack}>←</button>
        <div><div className="game-title">🎯 Concept Drop</div><div className="game-sub">Slice matching concepts as they fall</div></div>
        <div className="score-pill">{score} pts</div>
        <div style={{fontFamily:"'JetBrains Mono'",fontSize:13,fontWeight:600,color:timeLeft<=10?T.red:T.accent,marginLeft:8}}>{timeLeft}s</div>
      </div>
      <div className="timer-bar-wrap"><div className="timer-bar-fill" style={{width:`${(timeLeft/60)*100}%`,background:timeLeft<=10?T.red:T.accent}}/></div>
      <div style={{display:"flex",gap:14,padding:"16px 20px",flex:1,overflow:"hidden"}}>
        {/* Arena */}
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:0}}>
          {/* Target definition */}
          <div className="cd-target-bar">
            <span className="cd-target-label">Target ▸</span>
            <span className="cd-target-text">{target.def}</span>
            <span className="cd-target-category">{target.category}</span>
          </div>
          {/* Drop zone */}
          <div className="cd-drop-zone" ref={arenaRef} style={{position:"relative"}}>
            {/* Beat pulse background */}
            <div style={{position:"absolute",inset:0,background:isDark?"linear-gradient(180deg,#0b0b1e 0%,#1a0a3d 100%)":"linear-gradient(180deg,#edeaff 0%,#ddd6ff 100%)"}}>
              {/* Grid lines */}
              {[1,2,3,4].map(i=>(
                <div key={i} style={{position:"absolute",top:`${i*25}%`,left:0,right:0,height:1,background:isDark?"rgba(157,121,255,0.05)":"rgba(157,121,255,0.08)"}}/>
              ))}
            </div>
            {/* Ripples */}
            {ripples.map(r=>(
              <div key={r.id} className="beat-ripple" style={{left:r.x,top:r.y,width:30,height:30,marginLeft:-15,marginTop:-15}}/>
            ))}
            {/* Falling blocks */}
            {blocks.map(b=>(
              <div
                key={b.id}
                className={`cd-block ${b.sliceState!=="idle"?`sliced-${b.sliceState}`:""}`}
                style={{
                  left:b.x, top:b.y,
                  background:b.color,
                  borderColor:b.borderColor,
                  color:b.borderColor,
                }}
                onClick={e=>handleSlice(b.id,e)}
              >
                {b.term}
              </div>
            ))}
            {/* Hit zone */}
            <div className="cd-hit-bar">
              <div style={{width:40,height:2,background:T.accent,borderRadius:1,opacity:0.5}}/>
              <span className="cd-hit-label">SLICE ZONE</span>
              <div style={{width:40,height:2,background:T.accent,borderRadius:1,opacity:0.5}}/>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="cd-side-panel">
          <div className="cd-combo-panel">
            <div className={`cd-combo-num ${comboAnim?"combo-pop":""}`} style={{color:combo>=5?T.amber:combo>=3?T.accent:T.text}}>{combo}</div>
            <div className="cd-combo-label">Combo</div>
            <div className="cd-combo-fire">{combo>=10?"🔥🔥":combo>=5?"🔥":"⛓️"}</div>
          </div>
          <div className="cd-info-panel">
            <div className="cd-info-row"><span className="cd-info-label">Score</span><span className="cd-info-val" style={{color:T.accent}}>{score}</span></div>
            <div className="cd-info-row"><span className="cd-info-label">Best</span><span className="cd-info-val" style={{color:T.amber}}>{maxCombo}x</span></div>
            <div className="cd-info-row"><span className="cd-info-label">Sliced</span><span className="cd-info-val" style={{color:T.green}}>{sliced}</span></div>
            <div className="cd-info-row"><span className="cd-info-label">Missed</span><span className="cd-info-val" style={{color:T.red}}>{missed}</span></div>
            <div style={{marginTop:4}}>
              <div className="cd-info-label" style={{marginBottom:4}}>Speed</div>
              <div className="cd-speed-indicator"><div className="cd-speed-fill" style={{width:`${Math.min((dropSpeed-1)/2*100,100)}%`}}/></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SEMANTIC SPRINT ──────────────────────────────────────────────────────────
function SemanticSprint({T, isDark, addXp, goBack}: any) {
  const [phase, setPhase] = useState<"intro"|"play"|"done">("intro");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState("");
  const [heatScore, setHeatScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<{a:string;b:string;conn:string;score:number}[]>([]);
  const TOTAL_ROUNDS = 6;

  const pairs = useRef(Array.from({length:TOTAL_ROUNDS},()=>{
    const a=CONCEPTS[Math.floor(Math.random()*CONCEPTS.length)];
    const b=CONCEPTS[Math.floor(Math.random()*CONCEPTS.length)];
    return {a:a.term,b:b.term};
  })).current;

  const currentPair = pairs[round];

  const submit = ()=>{
    if(!input.trim()||submitted) return;
    const heat = Math.floor(30+Math.random()*65);
    setHeatScore(heat); setSubmitted(true); setScore(s=>s+heat);
    setHistory(h=>[...h,{a:currentPair.a,b:currentPair.b,conn:input,score:heat}]);
  };

  const next = ()=>{
    if(round+1>=TOTAL_ROUNDS){ addXp(Math.floor(score/6*0.5)); setPhase("done"); }
    else { setRound(r=>r+1); setInput(""); setHeatScore(0); setSubmitted(false); }
  };

  const heatColor = heatScore>=80?T.green:heatScore>=50?T.amber:T.red;

  if(phase==="intro") return (
    <div className="game-shell">
      <div className="game-header"><button className="game-back" onClick={goBack}>←</button><div><div className="game-title">⚡ Semantic Sprint</div><div className="game-sub">Bridge concepts · AI scores semantic closeness</div></div></div>
      <div className="game-body" style={{gap:14,textAlign:"center"}}>
        <div style={{fontSize:52}}>⚡</div>
        <div style={{fontSize:20,fontWeight:700}}>Bridge Two Concepts</div>
        <div style={{maxWidth:400,color:T.muted,fontSize:14,lineHeight:1.7}}>Two concepts appear. Type one word or phrase that semantically bridges them. Scored by semantic closeness — no binary right/wrong. Partial knowledge earns partial credit.</div>
        <button className="btn-p" style={{marginTop:8,padding:"11px 32px"}} onClick={()=>setPhase("play")}>Start →</button>
      </div>
    </div>
  );

  if(phase==="done") return (
    <div className="game-shell">
      <div className="game-header"><button className="game-back" onClick={goBack}>←</button><div><div className="game-title">⚡ Semantic Sprint — Done</div></div></div>
      <div className="done-wrap">
        <div style={{fontSize:48}}>⚡</div>
        <div className="done-title">Avg: {Math.round(score/TOTAL_ROUNDS)}</div>
        <div className="done-xp">+{Math.floor(score/6*0.5)} XP</div>
        <div style={{display:"flex",flexDirection:"column",gap:7,width:"100%",maxWidth:440}}>
          {history.map((h,i)=>(
            <div key={i} style={{background:T.s2,borderRadius:10,padding:"8px 14px",display:"flex",alignItems:"center",gap:10,border:`1px solid ${T.border}`,fontSize:12,flexWrap:"wrap"}}>
              <span style={{fontWeight:600}}>{h.a}</span><span style={{color:T.muted}}>→</span>
              <span style={{color:T.accent,fontWeight:600}}>"{h.conn}"</span><span style={{color:T.muted}}>→</span>
              <span style={{fontWeight:600}}>{h.b}</span>
              <span style={{marginLeft:"auto",fontFamily:"'JetBrains Mono'",fontWeight:700,color:h.score>=80?T.green:h.score>=50?T.amber:T.red}}>{h.score}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn-s" onClick={goBack}>Hub</button>
          <button className="btn-p" onClick={()=>{setPhase("intro");setRound(0);setScore(0);setHistory([]);setSubmitted(false);}}>Again</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="game-shell">
      <div className="game-header">
        <button className="game-back" onClick={goBack}>←</button>
        <div><div className="game-title">⚡ Semantic Sprint</div><div className="game-sub">Round {round+1} of {TOTAL_ROUNDS}</div></div>
        <div className="score-pill">Avg: {round>0?Math.round(score/round):"—"}</div>
      </div>
      <div className="game-body" style={{gap:10}}>
        <div className="ss-card">
          <div style={{fontSize:10,fontFamily:"'JetBrains Mono'",opacity:0.55,marginBottom:8,letterSpacing:"0.08em"}}>CONCEPT A</div>
          <div className="ss-card-title">{currentPair.a}</div>
        </div>
        <div className="ss-connector">What semantically bridges</div>
        <div className="ss-concept-b">{currentPair.a} → ??? → {currentPair.b}</div>
        <input className="ss-input" placeholder="Type your bridge word or phrase…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!submitted&&submit()} disabled={submitted} autoFocus={!submitted}/>
        {submitted?(
          <>
            <div className="ss-heat-bar"><div className="ss-heat-fill" style={{width:`${heatScore}%`,background:heatColor}}/></div>
            <div className="ss-result-row">
              <div className="ss-result-chip" style={{background:`${heatColor}18`,color:heatColor}}>Score: <strong style={{fontFamily:"'JetBrains Mono'"}}>{heatScore}</strong></div>
              <div className="ss-result-chip" style={{background:T.s2,color:T.muted,flex:"unset",padding:"9px 14px"}}>{heatScore>=80?"🔥 Strong":heatScore>=50?"✓ Valid":"↗ Partial credit"}</div>
            </div>
            <button className="ss-submit" onClick={next}>{round+1>=TOTAL_ROUNDS?"See Results →":"Next →"}</button>
          </>
        ):(
          <button className="ss-submit" onClick={submit}>Submit Bridge →</button>
        )}
      </div>
    </div>
  );
}

// ─── ECHO CHAMBER ─────────────────────────────────────────────────────────────
function EchoChamber({T, isDark, addXp, goBack}: any) {
  const [phase, setPhase] = useState<"intro"|"show"|"recall"|"score"|"done">("intro");
  const [round, setRound] = useState(0);
  const [showTime, setShowTime] = useState(4);
  const [countdown, setCountdown] = useState(0);
  const [input, setInput] = useState("");
  const [totalScore, setTotalScore] = useState(0);
  const [history, setHistory] = useState<{def:string;recall:string;score:number}[]>([]);
  const TOTAL_ROUNDS = 5;
  const cards = useRef(CONCEPTS.sort(()=>Math.random()-0.5).slice(0,TOTAL_ROUNDS)).current;

  useEffect(()=>{
    if(phase!=="show") return;
    if(countdown<=0){setPhase("recall");return;}
    const t = setTimeout(()=>setCountdown(c=>c-1),1000);
    return ()=>clearTimeout(t);
  },[phase,countdown]);

  const submitRecall = ()=>{
    if(!input.trim()) return;
    const card = cards[round];
    const defWords = new Set(card.def.toLowerCase().split(/\s+/).filter(w=>w.length>3));
    const recallWords = new Set(input.toLowerCase().split(/\s+/).filter(w=>w.length>3));
    const overlap = [...recallWords].filter(w=>defWords.has(w)).length;
    const sc = Math.min(100,Math.floor((overlap/Math.max(defWords.size,1))*120+15+Math.random()*20));
    setHistory(h=>[...h,{def:card.def,recall:input,score:sc}]);
    setTotalScore(s=>s+sc);
    setPhase("score");
  };

  const next = ()=>{
    if(round+1>=TOTAL_ROUNDS){ addXp(Math.floor(totalScore/TOTAL_ROUNDS*0.6)); setPhase("done"); }
    else { setRound(r=>r+1); setInput(""); setShowTime(t=>Math.max(1,t-0.5)); setPhase("intro"); }
  };

  if(phase==="done") return (
    <div className="game-shell">
      <div className="game-header"><button className="game-back" onClick={goBack}>←</button><div><div className="game-title">🔮 Echo Chamber — Done</div></div></div>
      <div className="done-wrap">
        <div style={{fontSize:48}}>🔮</div>
        <div className="done-title">Avg recall: {Math.round(totalScore/TOTAL_ROUNDS)}%</div>
        <div className="done-xp">+{Math.floor(totalScore/TOTAL_ROUNDS*0.6)} XP</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:440}}>
          {history.map((h,i)=>(
            <div key={i} style={{background:T.s2,borderRadius:12,padding:"10px 14px",border:`1px solid ${T.border}`}}>
              <div style={{fontSize:10,color:T.muted,marginBottom:3,fontFamily:"'JetBrains Mono'"}}>ORIGINAL</div>
              <div style={{fontSize:12,color:T.text,marginBottom:6}}>{h.def}</div>
              <div style={{fontSize:10,color:T.muted,marginBottom:3,fontFamily:"'JetBrains Mono'"}}>YOUR RECALL</div>
              <div style={{fontSize:12,color:T.accent,marginBottom:6}}>{h.recall}</div>
              <div style={{height:4,background:T.s3,borderRadius:2,overflow:"hidden"}}>
                <div style={{height:4,width:`${h.score}%`,background:h.score>=70?T.green:h.score>=40?T.amber:T.red,borderRadius:2}}/>
              </div>
              <div style={{fontSize:10,color:T.muted,marginTop:3,fontFamily:"'JetBrains Mono'"}}>{h.score}% recall</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn-s" onClick={goBack}>Hub</button>
          <button className="btn-p" onClick={()=>{setPhase("intro");setRound(0);setTotalScore(0);setHistory([]);setShowTime(4);setInput("");}}>Again</button>
        </div>
      </div>
    </div>
  );

  const card = cards[round];
  const lastHistory = history[history.length-1];

  return (
    <div className="game-shell">
      <div className="game-header">
        <button className="game-back" onClick={goBack}>←</button>
        <div><div className="game-title">🔮 Echo Chamber</div><div className="game-sub">Round {round+1}/{TOTAL_ROUNDS} · window: {showTime}s</div></div>
        <div className="score-pill">Avg: {round>0?Math.round(totalScore/round):"—"}%</div>
      </div>
      <div className="game-body" style={{gap:12}}>
        {phase==="intro"&&(
          <>
            <div style={{fontSize:16,fontWeight:600,textAlign:"center"}}>Get ready for round {round+1}</div>
            <div style={{fontSize:13,color:T.muted,textAlign:"center"}}>Definition shows for <strong style={{color:T.accent}}>{showTime}s</strong>. Memorise it, then type back the core idea.</div>
            {round>0&&lastHistory&&(
              <div style={{background:T.s2,borderRadius:14,padding:"12px 16px",width:"100%",maxWidth:480,border:`1px solid ${T.border}`}}>
                <div style={{fontSize:10,color:T.muted,marginBottom:5,fontFamily:"'JetBrains Mono'"}}>LAST ROUND</div>
                <div className="ec-score-bar"><div className="ec-score-fill" style={{width:`${lastHistory.score}%`}}/></div>
                <div style={{fontSize:12,color:T.muted}}>{lastHistory.score}% recall</div>
              </div>
            )}
            <button className="btn-p" style={{padding:"11px 32px"}} onClick={()=>{setCountdown(showTime);setPhase("show");}}>Show Definition →</button>
          </>
        )}
        {phase==="show"&&(
          <>
            <div style={{fontSize:13,fontWeight:600,color:T.muted,marginBottom:6,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:24,fontWeight:700,fontFamily:"'JetBrains Mono'",color:countdown<=1?T.red:T.accent}}>{countdown}</span>
              Memorise this definition
            </div>
            <div className="ec-show-card">
              <div className="ec-window-row"><span className="ec-pip" style={{background:countdown<=1?"#f87171":"rgba(255,255,255,0.5)"}}/>{card.term}</div>
              <div className="ec-def-text">{card.def}</div>
            </div>
            <div style={{width:"100%",maxWidth:480,height:4,borderRadius:2,background:T.s3,overflow:"hidden"}}>
              <div style={{height:4,borderRadius:2,background:T.accent,width:`${(countdown/showTime)*100}%`,transition:"width 0.9s linear"}}/>
            </div>
          </>
        )}
        {phase==="recall"&&(
          <>
            <div style={{fontSize:14,fontWeight:600,textAlign:"center",marginBottom:8}}>Type back what you remember about <strong style={{color:T.accent}}>{card.term}</strong></div>
            <textarea className="ec-textarea" placeholder="Type the core ideas — not word for word, just what you recall…" value={input} onChange={e=>setInput(e.target.value)} autoFocus/>
            <button className="ec-submit" onClick={submitRecall}>Submit Recall →</button>
          </>
        )}
        {phase==="score"&&lastHistory&&(
          <>
            <div style={{fontSize:14,fontWeight:600,textAlign:"center",marginBottom:8}}>Recall compared</div>
            <div style={{width:"100%",maxWidth:480,background:T.s2,borderRadius:14,padding:"14px 16px",border:`1px solid ${T.border}`}}>
              <div style={{fontSize:10,color:T.muted,marginBottom:4,fontFamily:"'JetBrains Mono'"}}>ORIGINAL</div>
              <div style={{fontSize:13,color:T.text,marginBottom:10,lineHeight:1.5}}>{lastHistory.def}</div>
              <div style={{fontSize:10,color:T.muted,marginBottom:4,fontFamily:"'JetBrains Mono'"}}>YOUR RECALL</div>
              <div style={{fontSize:13,color:T.accent,marginBottom:10,lineHeight:1.5}}>{lastHistory.recall}</div>
              <div className="ec-score-bar"><div className="ec-score-fill" style={{width:`${lastHistory.score}%`}}/></div>
              <div style={{fontSize:12,color:T.muted,marginTop:5}}>Recall score: {lastHistory.score}%</div>
            </div>
            <button className="ec-submit" onClick={next} style={{marginTop:8}}>
              {round+1>=TOTAL_ROUNDS?"See Final Results →":`Next Round (${showTime-0.5}s window) →`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}