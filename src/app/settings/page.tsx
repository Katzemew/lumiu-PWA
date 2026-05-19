"use client";
import React, { useState, useCallback } from "react";
import { useSettings } from "@/context/SettingsContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type Theme = "light" | "dark";
type SettingsSection =
  | "appearance"
  | "accessibility"
  | "focus"
  | "notifications"
  | "learning"
  | "privacy"
  | "account";

// ─── Toggle component ─────────────────────────────────────────────────────────
function Toggle({
  value,
  onChange,
  accent,
  s3,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  accent: string;
  s3: string;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 42,
        height: 22,
        borderRadius: 11,
        border: "none",
        background: value ? accent : s3,
        position: "relative",
        cursor: "pointer",
        transition: "background 0.25s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "white",
          top: 3,
          left: value ? 23 : 3,
          transition: "left 0.22s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
        }}
      />
    </button>
  );
}

// ─── Slider component ─────────────────────────────────────────────────────────
function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  accent,
  s3,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  accent: string;
  s3: string;
  label?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{
          flex: 1,
          WebkitAppearance: "none",
          height: 4,
          borderRadius: 2,
          background: `linear-gradient(to right, ${accent} ${pct}%, ${s3} ${pct}%)`,
          outline: "none",
          cursor: "pointer",
        }}
      />
      {label && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "'JetBrains Mono'",
            minWidth: 36,
            textAlign: "right",
            color: accent,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

// ─── SettingRow ───────────────────────────────────────────────────────────────
function SettingRow({
  label,
  sub,
  children,
  warn,
  T,
}: {
  label: string;
  sub?: string;
  children: React.ReactNode;
  warn?: boolean;
  T: any;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 0",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: warn ? T.red : T.text,
            letterSpacing: "-0.1px",
          }}
        >
          {label}
        </div>
        {sub && (
          <div
            style={{
              fontSize: 11,
              color: T.muted,
              marginTop: 2,
              lineHeight: 1.4,
            }}
          >
            {sub}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({
  title,
  sub,
  children,
  T,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
  T: any;
}) {
  return (
    <div
      style={{
        background: T.surface,
        borderRadius: 16,
        border: `1px solid ${T.border}`,
        padding: "20px 22px",
        marginBottom: 14,
      }}
    >
      <div style={{ marginBottom: sub ? 2 : 14 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "-0.2px",
            color: T.text,
          }}
        >
          {title}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 14, marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

// ─── Chip selector ────────────────────────────────────────────────────────────
function ChipSelector({
  options,
  value,
  onChange,
  T,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  T: any;
}) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            padding: "5px 13px",
            borderRadius: 20,
            border: `1px solid ${value === o.value ? T.accent : T.border}`,
            background: value === o.value ? T.glow : "transparent",
            color: value === o.value ? T.accent : T.muted,
            fontFamily: "'Chillax'",
            fontSize: 12,
            fontWeight: value === o.value ? 600 : 400,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Color Picker Row ─────────────────────────────────────────────────────────
const ACCENT_PRESETS = [
  { color: "#9D79FF", name: "Lumiu Purple" },
  { color: "#60a5fa", name: "Nebula Blue" },
  { color: "#34d399", name: "Aurora Green" },
  { color: "#f87171", name: "Supernova Red" },
  { color: "#fbbf24", name: "Stardust Gold" },
  { color: "#e040fb", name: "Pulsar Pink" },
  { color: "#22d3ee", name: "Quasar Teal" },
  { color: "#fb923c", name: "Comet Orange" },
];

// ─── Nav section config ────────────────────────────────────────────────────────
const SECTIONS: {
  id: SettingsSection;
  icon: string;
  label: string;
  sub: string;
}[] = [
  { id: "appearance",    icon: "🎨", label: "Appearance",     sub: "Theme, fonts, colours" },
  { id: "accessibility", icon: "♿", label: "Accessibility",   sub: "Motion, contrast, text" },
  { id: "focus",         icon: "⏱️", label: "Focus & Timer",   sub: "Pomodoro, breaks, alerts" },
  { id: "notifications", icon: "🔔", label: "Notifications",   sub: "Reminders, nudges" },
  { id: "learning",      icon: "🧠", label: "Learning",        sub: "Spaced rep, AI, decks" },
  { id: "privacy",       icon: "🔒", label: "Privacy & Data",  sub: "Sync, analytics, export" },
  { id: "account",       icon: "👤", label: "Account",         sub: "Name, email, password" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LumIUSettings() {
  const {
    theme, accentColor, fontScale, fontFamily, borderRadius, sidebarCollapsed, compactMode, backgroundPattern,
    displayName, email, updateSettings
  } = useSettings();

  const setTheme = (v: any) => updateSettings({ theme: v });
  const setAccentColor = (v: any) => updateSettings({ accentColor: v });
  const setFontScale = (v: any) => updateSettings({ fontScale: v });
  const setFontFamily = (v: any) => updateSettings({ fontFamily: v });
  const setBorderRadius = (v: any) => updateSettings({ borderRadius: v });
  const setSidebarCollapsed = (v: any) => updateSettings({ sidebarCollapsed: v });
  const setCompactMode = (v: any) => updateSettings({ compactMode: v });
  const setBackgroundPattern = (v: any) => updateSettings({ backgroundPattern: v });
  
  const setDisplayName = (v: any) => updateSettings({ displayName: v });
  const setEmail = (v: any) => updateSettings({ email: v });

  const [activeSection, setActiveSection] = useState<SettingsSection>("appearance");
  const [saved, setSaved] = useState(false);

  const showSaved = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  // ── Appearance (connected to global store) ───────────────────────────────

  // ── Accessibility ────────────────────────────────────────────────────────
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [focusBorder, setFocusBorder] = useState(true);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [colorBlindMode, setColorBlindMode] = useState("none");
  const [cursorSize, setCursorSize] = useState("default");
  const [screenReaderOptimised, setScreenReaderOptimised] = useState(false);

  // ── Focus & Timer ────────────────────────────────────────────────────────
  const [defaultTimerMode, setDefaultTimerMode] = useState("short");
  const [autoStartBreak, setAutoStartBreak] = useState(true);
  const [autoStartWork, setAutoStartWork] = useState(false);
  const [breakReminder, setBreakReminder] = useState(true);
  const [soundOnComplete, setSoundOnComplete] = useState(true);
  const [ambientDefault, setAmbientDefault] = useState("rain");
  const [ambientVolume, setAmbientVolume] = useState(0.6);
  const [showEncouragement, setShowEncouragement] = useState(true);
  const [pomodoroGoal, setPomodoroGoal] = useState(4);
  const [strictMode, setStrictMode] = useState(false);

  // ── Notifications ────────────────────────────────────────────────────────
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState("18:00");
  const [streakAlert, setStreakAlert] = useState(true);
  const [reviewDueAlert, setReviewDueAlert] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [gentleNudges, setGentleNudges] = useState(true);
  const [nudgeFrequency, setNudgeFrequency] = useState("moderate");

  // ── Learning ─────────────────────────────────────────────────────────────
  const [spacedRepAlgo, setSpacedRepAlgo] = useState("sm2");
  const [dailyCardGoal, setDailyCardGoal] = useState(20);
  const [maxNewCards, setMaxNewCards] = useState(10);
  const [showHints, setShowHints] = useState(true);
  const [aiAssist, setAiAssist] = useState(true);
  const [aiDifficulty, setAiDifficulty] = useState("adaptive");
  const [autoGenerateCards, setAutoGenerateCards] = useState(false);
  const [lunaPersonality, setLunaPersonality] = useState("warm");
  const [microTaskSize, setMicroTaskSize] = useState(5);

  // ── Privacy & Data ────────────────────────────────────────────────────────
  const [cloudSync, setCloudSync] = useState(true);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(true);
  const [localFirst, setLocalFirst] = useState(false);
  const [shareProgress, setShareProgress] = useState(false);
  const [crashReports, setCrashReports] = useState(true);

  // ── Account (connected to global store) ───────────────────────────────
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [emailInput, setEmailInput] = useState(email);

  const isDark = theme === "dark";

  // ─── Tokens ─────────────────────────────────────────────────────────────────
  const T = {
    bg:      isDark ? "#0f0f23" : "#f5f3ff",
    surface: isDark ? "#1a1a38" : "#ffffff",
    s2:      isDark ? "#22223a" : "#ede9ff",
    s3:      isDark ? "#2a2a48" : "#e2dcff",
    sidebar: isDark ? "#16162e" : "#9D79FF",
    sbText:  isDark ? "#e0d8ff" : "#ffffff",
    sbMuted: isDark ? "rgba(200,192,240,0.5)" : "rgba(255,255,255,0.65)",
    sbActive:isDark ? "rgba(157,121,255,0.22)" : "rgba(255,255,255,0.22)",
    border:  isDark ? "rgba(157,121,255,0.15)" : "rgba(157,121,255,0.18)",
    b2:      isDark ? "rgba(157,121,255,0.28)" : "rgba(157,121,255,0.35)",
    text:    isDark ? "#e8e4ff" : "#1a1040",
    muted:   isDark ? "rgba(200,192,240,0.55)" : "rgba(80,60,140,0.55)",
    accent:  accentColor,
    accentD: "#7c5cfc",
    glow:    `${accentColor}22`,
    green:   isDark ? "#34d399" : "#059669",
    amber:   isDark ? "#fbbf24" : "#d97706",
    red:     isDark ? "#f87171" : "#ef4444",
    pill:    isDark ? "#22223a" : "#ede9ff",
    shadow:  isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 16px rgba(157,121,255,0.08)",
  };

  // ─── CSS ──────────────────────────────────────────────────────────────────
  const css = `
@import url('https://api.fontshare.com/v2/css?f[]=chillax@300,400,500,600,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}

.st-root{
  font-family:'Chillax',sans-serif;
  background:${T.bg};
  color:${T.text};
  min-height:100vh;
  display:flex;
  flex-direction:column;
  transition:background 0.3s,color 0.3s;
}

/* ── Topbar ── */
.st-top{
  height:54px;background:${T.surface};border-bottom:1px solid ${T.border};
  display:flex;align-items:center;padding:0 22px;gap:14px;flex-shrink:0;
  position:sticky;top:0;z-index:100;backdrop-filter:blur(12px);
}
.st-logo{font-weight:700;font-size:18px;color:${T.accent};letter-spacing:-0.4px;display:flex;align-items:center;gap:6px;}
.st-logo-dot{width:7px;height:7px;border-radius:50%;background:${T.accent};box-shadow:0 0 8px ${T.accent};animation:stpulse 2s infinite;}
@keyframes stpulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.75);}}
.st-badge{font-size:11px;padding:2px 10px;border-radius:20px;background:${T.glow};color:${T.accent};border:1px solid ${T.border};font-weight:600;}
.st-top-right{margin-left:auto;display:flex;align-items:center;gap:10px;}

/* saved toast */
.st-saved-pill{
  display:flex;align-items:center;gap:6px;
  padding:4px 12px;border-radius:20px;
  background:${T.green}22;border:1px solid ${T.green}44;
  color:${T.green};font-size:12px;font-weight:600;
  animation:pill-in 0.3s ease;
}
@keyframes pill-in{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}

/* theme toggle */
.tog-wrap{display:flex;align-items:center;gap:7px;border:1px solid ${T.border};border-radius:20px;padding:5px 12px;cursor:pointer;background:${T.pill};color:${T.muted};font-size:12px;font-family:'Chillax';font-weight:500;transition:all 0.2s;}
.tog-wrap:hover{border-color:${T.accent};}
.tog-track{width:30px;height:16px;border-radius:8px;background:${isDark?T.accent:T.s3};position:relative;transition:background 0.25s;flex-shrink:0;}
.tog-thumb{position:absolute;width:12px;height:12px;border-radius:50%;background:white;top:2px;left:${isDark?"16px":"2px"};transition:left 0.25s;box-shadow:0 1px 3px rgba(0,0,0,0.3);}

/* ── Body ── */
.st-body{display:flex;flex:1;overflow:hidden;}

/* ── Sidebar ── */
.st-sidebar{
  width:248px;background:${T.sidebar};flex-shrink:0;
  padding:18px 10px;display:flex;flex-direction:column;gap:3px;overflow-y:auto;
}
.st-sb-label{
  font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
  color:${T.sbMuted};padding:8px 12px 4px;margin-top:8px;
}
.st-nav-btn{
  display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:12px;
  cursor:pointer;border:none;background:transparent;
  color:${T.sbText};font-family:'Chillax';font-size:13px;font-weight:500;
  width:100%;text-align:left;transition:all 0.18s;
}
.st-nav-btn:hover{background:${isDark?"rgba(157,121,255,0.15)":"rgba(255,255,255,0.18)"};}
.st-nav-btn.active{background:${T.sbActive};color:white;}
.st-nav-icon{width:32px;height:32px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.st-nav-sub{font-size:10px;color:${T.sbMuted};display:block;margin-top:1px;font-weight:400;}
.st-sb-divider{height:1px;background:rgba(255,255,255,0.1);margin:8px 4px;}

/* ── Main ── */
.st-main{flex:1;overflow-y:auto;padding:28px 28px 48px;}
.st-page-title{font-size:22px;font-weight:700;letter-spacing:-0.4px;margin-bottom:4px;}
.st-page-sub{font-size:13px;color:${T.muted};margin-bottom:24px;}

/* Section heading tag */
.section-tag{
  display:inline-flex;align-items:center;gap:6px;
  font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
  color:${T.accent};background:${T.glow};border:1px solid ${T.border};
  border-radius:8px;padding:3px 10px;margin-bottom:14px;
}

/* Info banner */
.info-banner{
  background:${isDark?"rgba(157,121,255,0.08)":"rgba(157,121,255,0.06)"};
  border:1px solid ${T.border};border-radius:12px;
  padding:11px 14px;font-size:12px;color:${T.muted};
  line-height:1.5;margin-bottom:14px;
  display:flex;gap:8px;align-items:flex-start;
}

/* Danger zone */
.danger-section{
  background:${isDark?"rgba(248,113,113,0.05)":"rgba(248,113,113,0.04)"};
  border:1px solid ${isDark?"rgba(248,113,113,0.2)":"rgba(248,113,113,0.15)"};
  border-radius:16px;padding:20px 22px;margin-top:6px;
}
.danger-title{font-size:13px;font-weight:700;color:${T.red};margin-bottom:3px;}
.danger-sub{font-size:11px;color:${T.muted};margin-bottom:14px;line-height:1.4;}

/* Buttons */
.btn-primary{padding:8px 20px;border-radius:10px;border:none;background:${T.accent};color:white;font-family:'Chillax';font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;}
.btn-primary:hover{background:${T.accentD};transform:translateY(-1px);}
.btn-secondary{padding:8px 16px;border-radius:10px;border:1px solid ${T.border};background:${T.pill};color:${T.text};font-family:'Chillax';font-size:13px;cursor:pointer;transition:all 0.15s;}
.btn-secondary:hover{background:${T.s2};}
.btn-danger{padding:8px 16px;border-radius:10px;border:1px solid ${T.red}44;background:transparent;color:${T.red};font-family:'Chillax';font-size:13px;cursor:pointer;transition:all 0.15s;}
.btn-danger:hover{background:${T.red}11;}

/* Text inputs */
.st-input{
  padding:8px 12px;border-radius:10px;
  border:1.5px solid ${T.border};background:${T.s2};
  color:${T.text};font-family:'Chillax';font-size:13px;
  outline:none;transition:border-color 0.18s;width:100%;
}
.st-input:focus{border-color:${T.accent};}
.st-input-sm{width:80px;}
.st-input-time{width:120px;}

/* Select */
.st-select{
  padding:7px 10px;border-radius:10px;
  border:1px solid ${T.border};background:${T.s2};
  color:${T.text};font-family:'Chillax';font-size:12px;
  outline:none;cursor:pointer;transition:border-color 0.18s;
}
.st-select:focus{border-color:${T.accent};}

/* Accent swatches */
.swatch{
  width:28px;height:28px;border-radius:8px;cursor:pointer;
  border:3px solid transparent;transition:all 0.15s;flex-shrink:0;
}
.swatch:hover{transform:scale(1.12);}
.swatch.active{border-color:white;box-shadow:0 0 0 2px ${accentColor};}

/* Range thumb */
input[type=range]{-webkit-appearance:none;height:4px;border-radius:2px;outline:none;cursor:pointer;}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${T.accent};cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.2);}

/* Restore defaults row */
.restore-row{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:6px;padding-top:14px;border-top:1px solid ${T.border};}

/* Font preview */
.font-preview{
  background:${T.s2};border-radius:10px;padding:10px 14px;
  font-size:14px;color:${T.text};border:1px solid ${T.border};
  line-height:1.5;margin-top:8px;
}

/* Anim */
@keyframes fade-up{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
.fade-up{animation:fade-up 0.3s ease;}

scrollbar-width:thin;scrollbar-color:rgba(157,121,255,0.3) transparent;
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:rgba(157,121,255,0.3);border-radius:4px;}
`;

  // ─── Section renderers ─────────────────────────────────────────────────────

  // ── 1. APPEARANCE ─────────────────────────────────────────────────────────
  const renderAppearance = () => (
    <div className="fade-up">
      <div className="section-tag">🎨 Appearance</div>

      <SectionCard title="Theme" T={T}>
        <SettingRow label="App theme" sub="Light theme recommended for reducing eye fatigue during long sessions" T={T}>
          <div style={{ display: "flex", gap: 8 }}>
            {(["light","dark"] as Theme[]).map(t => (
              <button key={t} onClick={() => setTheme(t)} style={{
                padding: "6px 14px", borderRadius: 10,
                border: `1.5px solid ${theme===t ? T.accent : T.border}`,
                background: theme===t ? T.glow : "transparent",
                color: theme===t ? T.accent : T.muted,
                fontFamily: "'Chillax'", fontSize: 12, fontWeight: theme===t?600:400,
                cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                {t==="light" ? "☀️ Light" : "🌙 Dark"}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow label="Background pattern" sub="Subtle texture behind the main app surface" T={T}>
          <ChipSelector
            options={[
              {value:"stars",label:"✦ Stars"},
              {value:"dots",label:"· Dots"},
              {value:"grid",label:"⊞ Grid"},
              {value:"none",label:"None"},
            ]}
            value={backgroundPattern}
            onChange={setBackgroundPattern}
            T={T}
          />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Accent Colour" sub="Applied across buttons, highlights, and interactive elements" T={T}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {ACCENT_PRESETS.map(p => (
            <div key={p.color} title={p.name}>
              <div
                className={`swatch ${accentColor===p.color?"active":""}`}
                style={{ background: p.color }}
                onClick={() => { setAccentColor(p.color); showSaved(); }}
              />
            </div>
          ))}
          <input
            type="color"
            value={accentColor}
            onChange={e => setAccentColor(e.target.value)}
            style={{
              width: 28, height: 28, borderRadius: 8, border: `1px solid ${T.border}`,
              cursor: "pointer", padding: 2, background: T.s2,
            }}
            title="Custom colour"
          />
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 12px", borderRadius: 10, background: T.s2,
          border: `1px solid ${T.border}`,
        }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, background: accentColor }}/>
          <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono'", color: T.muted }}>{accentColor}</span>
        </div>
      </SectionCard>

      <SectionCard title="Typography" T={T}>
        <SettingRow
          label="Font family"
          sub="Chillax is Lumiu's default — warm and easy to scan for ADHD readers"
          T={T}
        >
          <select className="st-select" value={fontFamily} onChange={e => setFontFamily(e.target.value)}>
            <option value="chillax">Chillax (Default)</option>
            <option value="lexend">Lexend (Dyslexia-friendly)</option>
            <option value="dm-sans">DM Sans (Clean)</option>
            <option value="mono">JetBrains Mono</option>
          </select>
        </SettingRow>

        <SettingRow label="Font scale" sub={`${Math.round(fontScale * 100)}% — affects all text sizes globally`} T={T}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, width: 200 }}>
            <Slider value={fontScale} onChange={setFontScale} min={0.8} max={1.4} step={0.05} accent={T.accent} s3={T.s3} label={`${Math.round(fontScale*100)}%`}/>
          </div>
        </SettingRow>

        <div className="font-preview" style={{ fontFamily: fontFamily==="mono"?"'JetBrains Mono'":fontFamily==="lexend"?"Lexend":fontFamily==="dm-sans"?"'DM Sans'":"'Chillax'", fontSize: `${14*fontScale}px` }}>
          The quick brown fox learns about neutron stars. lumiu adapts to you.
        </div>
      </SectionCard>

      <SectionCard title="Layout" T={T}>
        <SettingRow label="Compact mode" sub="Reduce padding and spacing for more content on screen" T={T}>
          <Toggle value={compactMode} onChange={v=>{setCompactMode(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        <SettingRow label="Border radius" sub="Controls the roundness of cards and buttons" T={T}>
          <ChipSelector
            options={[{value:"sharp",label:"Sharp"},{value:"rounded",label:"Rounded"},{value:"pill",label:"Pill"}]}
            value={borderRadius}
            onChange={v=>{setBorderRadius(v);showSaved();}}
            T={T}
          />
        </SettingRow>
        <SettingRow label="Collapse sidebar by default" sub="Start with sidebar minimised on load" T={T}>
          <Toggle value={sidebarCollapsed} onChange={v=>{setSidebarCollapsed(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
      </SectionCard>
    </div>
  );

  // ── 2. ACCESSIBILITY ──────────────────────────────────────────────────────
  const renderAccessibility = () => (
    <div className="fade-up">
      <div className="section-tag">♿ Accessibility</div>

      <div className="info-banner">
        <span>💜</span>
        <span>Lumiu is built for <strong>all kinds of minds</strong>. These settings are not "special modes" — they are tools every user deserves access to.</span>
      </div>

      <SectionCard title="Motion & Animation" T={T}>
        <SettingRow label="Reduce motion" sub="Disables slide-in animations, transitions, and particle effects — helpful for vestibular disorders and ADHD focus" T={T}>
          <Toggle value={reduceMotion} onChange={v=>{setReduceMotion(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Vision & Contrast" T={T}>
        <SettingRow label="High contrast mode" sub="Strengthens border and text contrast ratios beyond WCAG AA → AAA" T={T}>
          <Toggle value={highContrast} onChange={v=>{setHighContrast(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        <SettingRow label="Colour-blind support" sub="Adjusts the colour palette to avoid problematic hue combinations" T={T}>
          <select className="st-select" value={colorBlindMode} onChange={e=>{setColorBlindMode(e.target.value);showSaved();}}>
            <option value="none">None (Default)</option>
            <option value="deuteranopia">Deuteranopia (Red-Green)</option>
            <option value="protanopia">Protanopia (Red-Green)</option>
            <option value="tritanopia">Tritanopia (Blue-Yellow)</option>
            <option value="monochromacy">Monochromacy</option>
          </select>
        </SettingRow>
        <SettingRow label="Cursor size" sub="Enlarges the mouse cursor for easier tracking" T={T}>
          <ChipSelector
            options={[{value:"default",label:"Default"},{value:"large",label:"Large"},{value:"xl",label:"XL"}]}
            value={cursorSize}
            onChange={v=>{setCursorSize(v);showSaved();}}
            T={T}
          />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Reading & Text" T={T}>
        <SettingRow label="Dyslexia-friendly font" sub="Switches to Lexend — designed to reduce visual crowding and improve reading speed for dyslexic readers" T={T}>
          <Toggle value={dyslexiaFont} onChange={v=>{setDyslexiaFont(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        <SettingRow label="Line height" sub={`${lineHeight.toFixed(1)}× — more space between lines reduces visual crowding`} T={T}>
          <div style={{ width: 180 }}>
            <Slider value={lineHeight} onChange={v=>{setLineHeight(v);showSaved();}} min={1.2} max={2.4} step={0.1} accent={T.accent} s3={T.s3} label={lineHeight.toFixed(1)}/>
          </div>
        </SettingRow>
        <SettingRow label="Letter spacing" sub={`${letterSpacing}px — increases space between characters`} T={T}>
          <div style={{ width: 180 }}>
            <Slider value={letterSpacing} onChange={v=>{setLetterSpacing(v);showSaved();}} min={0} max={4} step={0.5} accent={T.accent} s3={T.s3} label={`${letterSpacing}px`}/>
          </div>
        </SettingRow>
        <SettingRow label="Keyboard focus indicators" sub="Shows clear outlines when navigating by keyboard — important for motor-impaired users" T={T}>
          <Toggle value={focusBorder} onChange={v=>{setFocusBorder(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        <SettingRow label="Screen reader optimised" sub="Adds extra ARIA labels and skip-nav links — optimises for VoiceOver, NVDA, JAWS" T={T}>
          <Toggle value={screenReaderOptimised} onChange={v=>{setScreenReaderOptimised(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
      </SectionCard>
    </div>
  );

  // ── 3. FOCUS & TIMER ──────────────────────────────────────────────────────
  const renderFocus = () => (
    <div className="fade-up">
      <div className="section-tag">⏱️ Focus & Timer</div>

      <SectionCard title="Default Timer Mode" sub="Used when you open the Focus Timer without selecting a mode" T={T}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          {[
            { id:"short", label:"⚡ Short Focus (ADHD)", desc:"25 min work · 5 min break — high-frequency switching" },
            { id:"deep",  label:"🌊 Deep Focus",          desc:"50 min work · 10 min break — flow state sessions" },
            { id:"custom",label:"✦ Custom Focus",          desc:"Your own work / break duration" },
          ].map(m => (
            <div
              key={m.id}
              onClick={() => { setDefaultTimerMode(m.id); showSaved(); }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 14px", borderRadius: 12, cursor: "pointer",
                border: `1.5px solid ${defaultTimerMode===m.id?T.accent:T.border}`,
                background: defaultTimerMode===m.id?T.glow:"transparent",
                transition: "all 0.18s",
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                border: `2px solid ${defaultTimerMode===m.id?T.accent:T.muted}`,
                background: defaultTimerMode===m.id?T.accent:"transparent",
                flexShrink: 0, transition: "all 0.18s",
              }}/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: defaultTimerMode===m.id?T.accent:T.text }}>{m.label}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Session Automation" T={T}>
        <SettingRow label="Auto-start break" sub="Timer moves to break phase automatically when work session ends" T={T}>
          <Toggle value={autoStartBreak} onChange={v=>{setAutoStartBreak(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        <SettingRow label="Auto-start next work session" sub="Continues to the next pomodoro without requiring a tap — use carefully for ADHD impulsivity" T={T}>
          <Toggle value={autoStartWork} onChange={v=>{setAutoStartWork(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        <SettingRow label="Strict mode" sub="Locks you out of other Lumiu modules during a work session — maximum focus" T={T}>
          <Toggle value={strictMode} onChange={v=>{setStrictMode(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        <SettingRow label="Daily pomodoro goal" sub="How many cycles you aim to complete each day" T={T}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <input type="number" className="st-input st-input-sm" min={1} max={16}
              value={pomodoroGoal}
              onChange={e=>setPomodoroGoal(Math.max(1,Math.min(16,+e.target.value)))}
              onBlur={showSaved}
            />
            <span style={{fontSize:11,color:T.muted}}>sessions</span>
          </div>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Sound & Encouragement" T={T}>
        <SettingRow label="Sound on session complete" sub="Plays a gentle chime when a work or break phase ends" T={T}>
          <Toggle value={soundOnComplete} onChange={v=>{setSoundOnComplete(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        <SettingRow label="Default ambient audio" sub="Research-backed ambient sounds that aid ADHD focus" T={T}>
          <select className="st-select" value={ambientDefault} onChange={e=>{setAmbientDefault(e.target.value);showSaved();}}>
            <option value="off">Off</option>
            <option value="rain">🌧️ Rain & Thunder</option>
            <option value="birds">🐦 Forest Birdsong</option>
            <option value="brown">🌊 Brown Noise</option>
            <option value="binaural">🎵 Theta Binaural (6Hz)</option>
            <option value="white">📻 White Noise</option>
          </select>
        </SettingRow>
        <SettingRow label="Default ambient volume" sub={`${Math.round(ambientVolume*100)}%`} T={T}>
          <div style={{width:160}}>
            <Slider value={ambientVolume} onChange={v=>{setAmbientVolume(v);showSaved();}} min={0} max={1} step={0.05} accent={T.accent} s3={T.s3} label={`${Math.round(ambientVolume*100)}%`}/>
          </div>
        </SettingRow>
        <SettingRow label="Encouraging messages" sub="Shows Lumiu's personality messages on the timer screen during sessions" T={T}>
          <Toggle value={showEncouragement} onChange={v=>{setShowEncouragement(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        <SettingRow label="Break reminder" sub="Visual nudge to take breaks — important for ADHD hyperfocus management" T={T}>
          <Toggle value={breakReminder} onChange={v=>{setBreakReminder(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
      </SectionCard>
    </div>
  );

  // ── 4. NOTIFICATIONS ──────────────────────────────────────────────────────
  const renderNotifications = () => (
    <div className="fade-up">
      <div className="section-tag">🔔 Notifications</div>

      <div className="info-banner">
        <span>🧠</span>
        <span>Lumiu keeps notifications <strong>minimal by default</strong>. Notifications are designed to support — not interrupt — your focus.</span>
      </div>

      <SectionCard title="Daily Study Reminder" T={T}>
        <SettingRow label="Daily reminder" sub="One gentle notification each day to start studying" T={T}>
          <Toggle value={dailyReminder} onChange={v=>{setDailyReminder(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        {dailyReminder && (
          <SettingRow label="Reminder time" sub="When you'd like to receive the daily nudge" T={T}>
            <input
              type="time"
              className="st-input st-input-time"
              value={reminderTime}
              onChange={e=>{setReminderTime(e.target.value);showSaved();}}
            />
          </SettingRow>
        )}
      </SectionCard>

      <SectionCard title="Study Alerts" T={T}>
        <SettingRow label="Streak at risk alert" sub="Notifies you if your streak is about to break — sent 2 hours before midnight" T={T}>
          <Toggle value={streakAlert} onChange={v=>{setStreakAlert(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        <SettingRow label="Cards due for review" sub="Nudge when flashcards are scheduled for spaced repetition" T={T}>
          <Toggle value={reviewDueAlert} onChange={v=>{setReviewDueAlert(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        <SettingRow label="Weekly progress digest" sub="A brief summary of your week sent every Sunday — no extra noise" T={T}>
          <Toggle value={weeklyDigest} onChange={v=>{setWeeklyDigest(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Gentle Nudges" sub="Soft in-app prompts designed for ADHD task re-engagement" T={T}>
        <SettingRow label="Enable gentle nudges" sub="Friendly prompts that appear if you've been inactive — never harsh or urgent" T={T}>
          <Toggle value={gentleNudges} onChange={v=>{setGentleNudges(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        {gentleNudges && (
          <SettingRow label="Nudge frequency" sub="How often in-app prompts appear during inactivity" T={T}>
            <ChipSelector
              options={[
                {value:"light",label:"Light"},
                {value:"moderate",label:"Moderate"},
                {value:"firm",label:"Firm"},
              ]}
              value={nudgeFrequency}
              onChange={v=>{setNudgeFrequency(v);showSaved();}}
              T={T}
            />
          </SettingRow>
        )}
      </SectionCard>
    </div>
  );

  // ── 5. LEARNING ───────────────────────────────────────────────────────────
  const renderLearning = () => (
    <div className="fade-up">
      <div className="section-tag">🧠 Learning</div>

      <SectionCard title="Spaced Repetition" sub="Controls how Lumiu schedules flashcard reviews" T={T}>
        <SettingRow label="Algorithm" sub="SM-2 is the research gold standard. Leitner is simpler and box-based." T={T}>
          <ChipSelector
            options={[
              {value:"sm2",label:"SM-2 (Default)"},
              {value:"sm2plus",label:"SM-2+"},
              {value:"leitner",label:"Leitner Box"},
            ]}
            value={spacedRepAlgo}
            onChange={v=>{setSpacedRepAlgo(v);showSaved();}}
            T={T}
          />
        </SettingRow>
        <SettingRow label="Daily card goal" sub="Target number of cards to review each day" T={T}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <input type="number" className="st-input st-input-sm" min={5} max={200}
              value={dailyCardGoal}
              onChange={e=>setDailyCardGoal(Math.max(5,Math.min(200,+e.target.value)))}
              onBlur={showSaved}
            />
            <span style={{fontSize:11,color:T.muted}}>cards/day</span>
          </div>
        </SettingRow>
        <SettingRow label="Max new cards per day" sub="Limits new cards to prevent cognitive overload — ADHD-friendly default is 10" T={T}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <input type="number" className="st-input st-input-sm" min={1} max={50}
              value={maxNewCards}
              onChange={e=>setMaxNewCards(Math.max(1,Math.min(50,+e.target.value)))}
              onBlur={showSaved}
            />
            <span style={{fontSize:11,color:T.muted}}>new/day</span>
          </div>
        </SettingRow>
        <SettingRow label="Show hints" sub="Display hint text on flashcards before revealing the answer" T={T}>
          <Toggle value={showHints} onChange={v=>{setShowHints(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
      </SectionCard>

      <SectionCard title="AI & Luna Assistant" T={T}>
        <SettingRow label="AI assistance" sub="Enables Luna AI for summaries, card generation, and explanations" T={T}>
          <Toggle value={aiAssist} onChange={v=>{setAiAssist(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        {aiAssist && (
          <>
            <SettingRow label="AI difficulty adaptation" sub="How Luna adjusts content complexity to your performance" T={T}>
              <ChipSelector
                options={[
                  {value:"fixed",label:"Fixed"},
                  {value:"adaptive",label:"Adaptive"},
                  {value:"aggressive",label:"Aggressive"},
                ]}
                value={aiDifficulty}
                onChange={v=>{setAiDifficulty(v);showSaved();}}
                T={T}
              />
            </SettingRow>
            <SettingRow label="Luna's personality" sub="How Luna communicates with you during sessions" T={T}>
              <ChipSelector
                options={[
                  {value:"warm",label:"Warm 🌱"},
                  {value:"concise",label:"Concise ⚡"},
                  {value:"playful",label:"Playful 🎈"},
                  {value:"formal",label:"Formal 📋"},
                ]}
                value={lunaPersonality}
                onChange={v=>{setLunaPersonality(v);showSaved();}}
                T={T}
              />
            </SettingRow>
            <SettingRow label="Auto-generate cards from notes" sub="Luna creates flashcards automatically when you save a note — review before adding" T={T}>
              <Toggle value={autoGenerateCards} onChange={v=>{setAutoGenerateCards(v);showSaved();}} accent={T.accent} s3={T.s3}/>
            </SettingRow>
          </>
        )}
      </SectionCard>

      <SectionCard title="Micro-tasking" sub="Controls how tasks are broken down — core to Lumiu's ADHD-first philosophy" T={T}>
        <SettingRow label="Micro-task size" sub={`Break study sessions into chunks of ${microTaskSize} items — smaller = less overwhelm`} T={T}>
          <div style={{width:180}}>
            <Slider value={microTaskSize} onChange={v=>{setMicroTaskSize(v);showSaved();}} min={3} max={15} step={1} accent={T.accent} s3={T.s3} label={`${microTaskSize}`}/>
          </div>
        </SettingRow>
      </SectionCard>
    </div>
  );

  // ── 6. PRIVACY & DATA ────────────────────────────────────────────────────
  const renderPrivacy = () => (
    <div className="fade-up">
      <div className="section-tag">🔒 Privacy & Data</div>

      <div className="info-banner">
        <span>🛡️</span>
        <span>Lumiu follows a <strong>privacy-first, local-first</strong> architecture. Your learning data is yours. We collect only what's needed to personalise your experience, and you can delete it anytime.</span>
      </div>

      <SectionCard title="Data & Sync" T={T}>
        <SettingRow label="Cloud sync" sub="Backs up your decks, notes, and progress to Lumiu's encrypted cloud" T={T}>
          <Toggle value={cloudSync} onChange={v=>{setCloudSync(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        <SettingRow label="Local-first mode" sub="Stores everything on your device only — no data leaves your browser (disables sync)" T={T}>
          <Toggle value={localFirst} onChange={v=>{setLocalFirst(v);if(v)setCloudSync(false);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        <SettingRow label="Share progress publicly" sub="Makes your learning streak and subject mastery visible to others on Lumiu community" T={T}>
          <Toggle value={shareProgress} onChange={v=>{setShareProgress(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Analytics & Diagnostics" T={T}>
        <SettingRow label="Usage analytics" sub="Anonymous, aggregated data about how you use Lumiu — helps improve the platform for neurodivergent learners" T={T}>
          <Toggle value={analyticsOptIn} onChange={v=>{setAnalyticsOptIn(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
        <SettingRow label="Crash reports" sub="Automatically sends error reports when Lumiu encounters a bug — no personal data included" T={T}>
          <Toggle value={crashReports} onChange={v=>{setCrashReports(v);showSaved();}} accent={T.accent} s3={T.s3}/>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Your Data" T={T}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",paddingTop:4}}>
          <button className="btn-secondary" style={{fontSize:12}}>⬇ Export all data</button>
          <button className="btn-secondary" style={{fontSize:12}}>📋 View data summary</button>
          <button className="btn-secondary" style={{fontSize:12}}>🔑 Request data copy (GDPR)</button>
        </div>
        <div style={{fontSize:11,color:T.muted,marginTop:12,lineHeight:1.5}}>
          Lumiu complies with GDPR and PDPA. Your data export includes all decks, notes, analytics, and settings in JSON format. Processing takes up to 48 hours.
        </div>
      </SectionCard>

      <div className="danger-section">
        <div className="danger-title">Danger Zone</div>
        <div className="danger-sub">These actions are permanent and cannot be undone.</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button className="btn-danger" style={{fontSize:12}}>🗑 Clear all local data</button>
          <button className="btn-danger" style={{fontSize:12}}>⚠️ Delete account permanently</button>
        </div>
      </div>
    </div>
  );

  // ── 7. ACCOUNT ────────────────────────────────────────────────────────────
  const renderAccount = () => (
    <div className="fade-up">
      <div className="section-tag">👤 Account</div>

      <SectionCard title="Profile Information" T={T}>
        <SettingRow label="Display name" sub="Shown on your profile and in Lumiu sessions" T={T}>
          {editingName ? (
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <input className="st-input" style={{width:160}} value={nameInput}
                onChange={e=>setNameInput(e.target.value)} autoFocus
                onKeyDown={e=>{if(e.key==="Enter"){setDisplayName(nameInput);setEditingName(false);showSaved();}}}
              />
              <button className="btn-primary" style={{fontSize:11,padding:"6px 12px"}}
                onClick={()=>{setDisplayName(nameInput);setEditingName(false);showSaved();}}>Save</button>
              <button className="btn-secondary" style={{fontSize:11,padding:"6px 10px"}}
                onClick={()=>setEditingName(false)}>Cancel</button>
            </div>
          ) : (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:13,fontWeight:600}}>{displayName}</span>
              <button className="btn-secondary" style={{fontSize:11,padding:"4px 10px"}}
                onClick={()=>{setNameInput(displayName);setEditingName(true);}}>Edit</button>
            </div>
          )}
        </SettingRow>
        <SettingRow label="Email address" sub="Used for account recovery and weekly digest (if enabled)" T={T}>
          {editingEmail ? (
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <input className="st-input" style={{width:200}} type="email" value={emailInput}
                onChange={e=>setEmailInput(e.target.value)} autoFocus
                onKeyDown={e=>{if(e.key==="Enter"){setEmail(emailInput);setEditingEmail(false);showSaved();}}}
              />
              <button className="btn-primary" style={{fontSize:11,padding:"6px 12px"}}
                onClick={()=>{setEmail(emailInput);setEditingEmail(false);showSaved();}}>Save</button>
              <button className="btn-secondary" style={{fontSize:11,padding:"6px 10px"}}
                onClick={()=>setEditingEmail(false)}>Cancel</button>
            </div>
          ) : (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:13,fontFamily:"'JetBrains Mono'",color:T.muted}}>{email}</span>
              <button className="btn-secondary" style={{fontSize:11,padding:"4px 10px"}}
                onClick={()=>{setEmailInput(email);setEditingEmail(true);}}>Edit</button>
            </div>
          )}
        </SettingRow>
        <SettingRow label="Student ID" sub="Auto-assigned — cannot be changed" T={T}>
          <span style={{fontSize:12,fontFamily:"'JetBrains Mono'",color:T.muted}}>1604-22-747-001</span>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Security" T={T}>
        <SettingRow label="Password" sub="Last changed 3 months ago" T={T}>
          <button className="btn-secondary" style={{fontSize:12}}>Change password</button>
        </SettingRow>
        <SettingRow label="Two-factor authentication" sub="Add an extra layer of security to your account" T={T}>
          <button className="btn-secondary" style={{fontSize:12}}>Set up 2FA</button>
        </SettingRow>
        <SettingRow label="Active sessions" sub="Manage devices where you're logged in" T={T}>
          <button className="btn-secondary" style={{fontSize:12}}>View sessions</button>
        </SettingRow>
      </SectionCard>

      <SectionCard title="Linked Services" T={T}>
        {[
          {name:"Google",icon:"🔵",status:"Connected",email:"sania@gmail.com"},
          {name:"Microsoft",icon:"🟦",status:"Not connected",email:""},
        ].map(svc=>(
          <SettingRow key={svc.name} label={svc.name} sub={svc.status==="Connected"?svc.email:"Link your Microsoft account"} T={T}>
            <button className={svc.status==="Connected"?"btn-secondary":"btn-primary"} style={{fontSize:12}}>
              {svc.status==="Connected"?"Disconnect":"Connect"}
            </button>
          </SettingRow>
        ))}
      </SectionCard>

      <SectionCard title="Subscription" T={T}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0"}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:T.accent}}>Lumiu Free ✦</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>All core features · unlimited decks · NEURAL games</div>
          </div>
          <button className="btn-primary" style={{fontSize:12}}>Upgrade to Pro</button>
        </div>
      </SectionCard>

      <SectionCard title="Session" T={T}>
        <div style={{display:"flex",gap:10,paddingTop:4}}>
          <button className="btn-secondary" style={{fontSize:12}}>Log out of this device</button>
          <button className="btn-danger" style={{fontSize:12}}>Log out of all devices</button>
        </div>
      </SectionCard>
    </div>
  );

  const RENDERERS: Record<SettingsSection, () => React.JSX.Element> = {
    appearance: renderAppearance,
    accessibility: renderAccessibility,
    focus: renderFocus,
    notifications: renderNotifications,
    learning: renderLearning,
    privacy: renderPrivacy,
    account: renderAccount,
  };

  const activeConfig = SECTIONS.find(s => s.id === activeSection)!;

  return (
    <>
      <style>{css}</style>
      <div className="st-root">
        {/* Topbar */}
        <div className="st-top">
          <div className="st-logo">
            <div className="st-logo-dot"/>
            lumiu
          </div>
          <span className="st-badge">Settings</span>
          <div className="st-top-right">
            {saved && (
              <div className="st-saved-pill">
                <span>✓</span> Saved
              </div>
            )}
            <button className="tog-wrap" onClick={() => setTheme(theme==="dark"?"light":"dark")}>
              {theme==="dark" ? "🌙" : "☀️"}
              <div className="tog-track"><div className="tog-thumb"/></div>
              {theme==="dark" ? "Dark" : "Light"}
            </button>
          </div>
        </div>

        <div className="st-body">
          {/* Sidebar */}
          <div className="st-sidebar">
            <div className="st-sb-label">Preferences</div>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                className={`st-nav-btn ${activeSection===s.id?"active":""}`}
                onClick={() => setActiveSection(s.id)}
              >
                <div
                  className="st-nav-icon"
                  style={{
                    background: activeSection===s.id
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.1)",
                  }}
                >
                  {s.icon}
                </div>
                <div>
                  {s.label}
                  <span className="st-nav-sub">{s.sub}</span>
                </div>
              </button>
            ))}

            <div className="st-sb-divider"/>

            {/* Version info */}
            <div style={{padding:"8px 12px"}}>
              <div style={{fontSize:10,color:T.sbMuted,fontFamily:"'JetBrains Mono'"}}>lumiu v0.1.0</div>
              <div style={{fontSize:10,color:T.sbMuted,marginTop:2}}>© 2025 Lumiu · All minds welcome</div>
            </div>
          </div>

          {/* Main content */}
          <div className="st-main">
            <div className="st-page-title">
              {activeConfig.icon} {activeConfig.label}
            </div>
            <div className="st-page-sub">{activeConfig.sub}</div>

            {RENDERERS[activeSection]()}

            {/* Bottom restore defaults */}
            <div className="restore-row">
              <span style={{fontSize:11,color:T.muted}}>
                Changes are saved automatically
              </span>
              <button
                className="btn-secondary"
                style={{fontSize:11,padding:"5px 12px"}}
                onClick={showSaved}
              >
                ↺ Restore section defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
