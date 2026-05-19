"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
type Theme = "light" | "dark";
type NoteCategory = "all" | "pinned" | "recent" | "shared";
type NoteColor = "default" | "nebula" | "aurora" | "void" | "pulsar" | "comet";
type ViewMode = "grid" | "list";
type SortMode = "recent" | "name" | "created";

interface NoteFile {
  id: string;
  title: string;
  preview: string;
  emoji: string;
  color: NoteColor;
  notebook: string;
  pinned: boolean;
  starred: boolean;
  lastEdited: Date;
  createdAt: Date;
  wordCount: number;
  tags: string[];
  shared: boolean;
}

// ─── Note color themes ────────────────────────────────────────────────────────
const NOTE_COLORS: Record<NoteColor, { bg: string; bgDark: string; border: string; dot: string }> = {
  default:  { bg: "#ffffff",            bgDark: "#1a1a38",            border: "rgba(157,121,255,0.2)", dot: "#9D79FF" },
  nebula:   { bg: "linear-gradient(135deg,#f5f0ff,#ede6ff)", bgDark: "linear-gradient(135deg,#1a0a3d,#2d1b69)", border: "rgba(157,121,255,0.35)", dot: "#9D79FF" },
  aurora:   { bg: "linear-gradient(135deg,#f0fff8,#e0faf0)", bgDark: "linear-gradient(135deg,#001a10,#003d2b)", border: "rgba(52,211,153,0.3)",   dot: "#34d399" },
  void:     { bg: "linear-gradient(135deg,#f0f4ff,#e8eeff)", bgDark: "linear-gradient(135deg,#050810,#0d1117)", border: "rgba(96,165,250,0.3)",   dot: "#60a5fa" },
  pulsar:   { bg: "linear-gradient(135deg,#fff0ff,#fde8ff)", bgDark: "linear-gradient(135deg,#1a0020,#3d0050)", border: "rgba(224,64,251,0.3)",   dot: "#e040fb" },
  comet:    { bg: "linear-gradient(135deg,#fffbf0,#fff3e0)", bgDark: "linear-gradient(135deg,#1a0a00,#3d1a00)", border: "rgba(251,191,36,0.3)",   dot: "#fbbf24" },
};

// ─── Sample data ──────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

const NOTEBOOKS = ["Getting Started", "Phy", "Sciences", "Mathematics", "My Learning"];

function daysAgo(d: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt;
}

const SEED_NOTES: NoteFile[] = [
  { id: uid(), title: "Welcome to Lumiu!", preview: "This is your first note. Lumiu is designed to make studying feel calm, structured, and achievable — no matter how your brain works.", emoji: "🚀", color: "nebula", notebook: "Getting Started", pinned: true, starred: true, lastEdited: daysAgo(0), createdAt: daysAgo(14), wordCount: 312, tags: ["intro","lumiu"], shared: false },
  { id: uid(), title: "Ch1 — Mechanics", preview: "Newton's laws of motion. First law: an object at rest stays at rest. F = ma. Momentum p = mv. Kinetic energy Ek = ½mv².", emoji: "⚡", color: "comet", notebook: "Phy", pinned: true, starred: false, lastEdited: daysAgo(0), createdAt: daysAgo(7), wordCount: 548, tags: ["physics","mechanics"], shared: false },
  { id: uid(), title: "Surah 37 Notes", preview: "Veins of the Frostlands — contextual analysis of thematic elements. Cross-referencing with lecture slides.", emoji: "📖", color: "pulsar", notebook: "Getting Started", pinned: false, starred: true, lastEdited: daysAgo(1), createdAt: daysAgo(10), wordCount: 189, tags: ["literature"], shared: false },
  { id: uid(), title: "Organic Chemistry — SN2", preview: "Bimolecular nucleophilic substitution. Back-face attack. Walden inversion. Rate = k[nucleophile][substrate]. Favours primary substrates.", emoji: "⚗️", color: "aurora", notebook: "Sciences", pinned: false, starred: false, lastEdited: daysAgo(1), createdAt: daysAgo(5), wordCount: 724, tags: ["chemistry","reactions"], shared: true },
  { id: uid(), title: "Linear Algebra — Eigenvalues", preview: "Av = λv where v is the eigenvector and λ the eigenvalue. Characteristic equation det(A − λI) = 0. Application: principal component analysis.", emoji: "📐", color: "void", notebook: "Mathematics", pinned: false, starred: false, lastEdited: daysAgo(2), createdAt: daysAgo(12), wordCount: 401, tags: ["maths","linear-algebra"], shared: false },
  { id: uid(), title: "Astrophysics — Neutron Stars", preview: "Ultra-dense stellar remnants. Mass 1–3× Sun in ~20km radius. Composed almost entirely of neutrons. Source of pulsars and magnetars.", emoji: "🌌", color: "nebula", notebook: "Sciences", pinned: false, starred: true, lastEdited: daysAgo(2), createdAt: daysAgo(20), wordCount: 630, tags: ["astrophysics","stars"], shared: false },
  { id: uid(), title: "Biology — DNA Replication", preview: "Semi-conservative model. Helicase unwinds double helix. Primase lays RNA primer. DNA Polymerase III synthesises new strand 5'→3'.", emoji: "🧬", color: "aurora", notebook: "Sciences", pinned: false, starred: false, lastEdited: daysAgo(3), createdAt: daysAgo(8), wordCount: 280, tags: ["biology","genetics"], shared: false },
  { id: uid(), title: "Study Plan — Week 3", preview: "Monday: Mechanics review. Tuesday: Organic chem mechanisms. Wednesday: Linear Algebra problem sets. Thursday: Astrophysics reading.", emoji: "🗓️", color: "default", notebook: "My Learning", pinned: false, starred: false, lastEdited: daysAgo(4), createdAt: daysAgo(4), wordCount: 145, tags: ["planning"], shared: false },
  { id: uid(), title: "Audio Note — Lecture 4", preview: "Recorded during Thursday lecture. Key topics: thermodynamics second law, entropy, Carnot efficiency. Follow up: read Ch. 6 textbook.", emoji: "🎤", color: "default", notebook: "Phy", pinned: false, starred: false, lastEdited: daysAgo(5), createdAt: daysAgo(5), wordCount: 67, tags: ["audio","lecture"], shared: false },
  { id: uid(), title: "Ch2 — Waves & Optics", preview: "Transverse vs longitudinal waves. Wave equation v = fλ. Snell's law: n₁sinθ₁ = n₂sinθ₂. Total internal reflection. Diffraction grating.", emoji: "🌊", color: "comet", notebook: "Phy", pinned: false, starred: false, lastEdited: daysAgo(6), createdAt: daysAgo(6), wordCount: 492, tags: ["physics","waves"], shared: false },
  { id: uid(), title: "World History — French Revolution", preview: "1789–1799. Causes: fiscal crisis, Estates system inequality, Enlightenment ideas. Key events: storming of Bastille, Declaration of Rights.", emoji: "🌍", color: "default", notebook: "My Learning", pinned: false, starred: false, lastEdited: daysAgo(7), createdAt: daysAgo(9), wordCount: 834, tags: ["history"], shared: true },
  { id: uid(), title: "Calculus — Integration", preview: "Fundamental theorem of calculus. ∫f(x)dx = F(b) - F(a). Integration by parts: ∫u dv = uv - ∫v du. Substitution method.", emoji: "∫", color: "void", notebook: "Mathematics", pinned: false, starred: false, lastEdited: daysAgo(8), createdAt: daysAgo(11), wordCount: 356, tags: ["maths","calculus"], shared: false },
];

// ─── Welcome messages ─────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return { time: "late night", emoji: "🌙" };
  if (h < 12) return { time: "morning",    emoji: "🌤️" };
  if (h < 17) return { time: "afternoon",  emoji: "☀️" };
  if (h < 21) return { time: "evening",    emoji: "🌆" };
  return             { time: "night",      emoji: "🌙" };
};

const LUMIU_MSGS = [
  "Your galaxy of knowledge awaits.",
  "Every note is a star you're adding to your constellation.",
  "Small steps. Big orbits. Keep going.",
  "Your brain is building something remarkable.",
  "One concept at a time — the universe was made that way too.",
  "Focus isn't about perfection. It's about returning.",
];

// ─── Lumiu Mascot (Luna) ──────────────────────────────────────────────────────
function LunaMascot({ size = 120, isDark }: { size?: number; isDark: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Glow aura */}
      <circle cx="60" cy="64" r="44" fill={isDark ? "rgba(157,121,255,0.08)" : "rgba(157,121,255,0.12)"}/>

      {/* Body — rounded teardrop */}
      <ellipse cx="60" cy="72" rx="30" ry="34" fill={isDark ? "#2a1a50" : "#9D79FF"}/>
      <ellipse cx="60" cy="72" rx="28" ry="32" fill={isDark ? "#3d2669" : "#b49dff"}/>

      {/* Belly highlight */}
      <ellipse cx="60" cy="78" rx="16" ry="18" fill={isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.35)"}/>

      {/* Head */}
      <circle cx="60" cy="44" r="26" fill={isDark ? "#2a1a50" : "#9D79FF"}/>
      <circle cx="60" cy="44" r="24" fill={isDark ? "#3d2669" : "#b49dff"}/>

      {/* Ears */}
      <polygon points="38,28 32,10 46,22" fill={isDark ? "#2a1a50" : "#9D79FF"}/>
      <polygon points="82,28 88,10 74,22" fill={isDark ? "#2a1a50" : "#9D79FF"}/>
      <polygon points="40,26 35,14 47,23" fill={isDark ? "#9D79FF" : "#e8daff"}/>
      <polygon points="80,26 85,14 73,23" fill={isDark ? "#9D79FF" : "#e8daff"}/>

      {/* Face — left eye */}
      <circle cx="50" cy="44" r="8" fill={isDark ? "#0f0f23" : "#1a1040"}/>
      <circle cx="50" cy="44" r="6" fill={isDark ? "#1a1a38" : "white"}/>
      <circle cx="50" cy="44" r="4" fill={isDark ? "#9D79FF" : "#7c5cfc"}/>
      <circle cx="52" cy="42" r="1.5" fill="white" opacity="0.9"/>

      {/* Face — right eye */}
      <circle cx="70" cy="44" r="8" fill={isDark ? "#0f0f23" : "#1a1040"}/>
      <circle cx="70" cy="44" r="6" fill={isDark ? "#1a1a38" : "white"}/>
      <circle cx="70" cy="44" r="4" fill={isDark ? "#9D79FF" : "#7c5cfc"}/>
      <circle cx="72" cy="42" r="1.5" fill="white" opacity="0.9"/>

      {/* Nose */}
      <ellipse cx="60" cy="51" rx="3" ry="2" fill={isDark ? "#9D79FF" : "#7c5cfc"} opacity="0.7"/>

      {/* Smile */}
      <path d="M53 55 Q60 60 67 55" stroke={isDark ? "#c4b0ff" : "#7c5cfc"} strokeWidth="1.8" strokeLinecap="round" fill="none"/>

      {/* Star on forehead */}
      <path d="M60 20 L61.5 24 L66 24 L62.5 27 L64 31 L60 28.5 L56 31 L57.5 27 L54 24 L58.5 24 Z"
        fill={isDark ? "#fbbf24" : "#fbbf24"} opacity="0.9"/>

      {/* Wings / arms */}
      <ellipse cx="35" cy="75" rx="10" ry="6" fill={isDark ? "#2a1a50" : "#9D79FF"} transform="rotate(-20,35,75)"/>
      <ellipse cx="85" cy="75" rx="10" ry="6" fill={isDark ? "#2a1a50" : "#9D79FF"} transform="rotate(20,85,75)"/>

      {/* Feet */}
      <ellipse cx="50" cy="104" rx="10" ry="5" fill={isDark ? "#2a1a50" : "#9D79FF"}/>
      <ellipse cx="70" cy="104" rx="10" ry="5" fill={isDark ? "#2a1a50" : "#9D79FF"}/>

      {/* Sparkles */}
      <circle cx="96" cy="28" r="2" fill="#fbbf24" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="36" r="1.5" fill="#9D79FF" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.15;0.7" dur="3.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="100" cy="60" r="1.5" fill="#34d399" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.8s" begin="0.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="15" cy="70" r="1" fill="#60a5fa" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="4s" begin="1s" repeatCount="indefinite"/>
      </circle>

      {/* Floating animation wrapper — applied via CSS on the SVG element */}
    </svg>
  );
}

// ─── Time-formatted string ────────────────────────────────────────────────────
function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)   return "Just now";
  if (m < 60)  return `${m}m ago`;
  if (h < 24)  return `${h}h ago`;
  if (d === 1) return "Yesterday";
  if (d < 7)   return `${d} days ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ─── Note Card ────────────────────────────────────────────────────────────────
function NoteCard({
  note, T, isDark, viewMode, onOpen, onStar, onPin, onDelete,
}: {
  note: NoteFile; T: any; isDark: boolean; viewMode: ViewMode;
  onOpen: (id: string) => void; onStar: (id: string) => void;
  onPin: (id: string) => void; onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const col = NOTE_COLORS[note.color];
  const bg = isDark ? col.bgDark : col.bg;

  if (viewMode === "list") {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
        onClick={() => onOpen(note.id)}
        style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "11px 16px", borderRadius: 12,
          border: `1px solid ${hovered ? col.border : T.border}`,
          background: hovered ? (isDark ? T.s2 : T.s2) : T.surface,
          cursor: "pointer", transition: "all 0.18s", position: "relative",
        }}
      >
        {/* Color accent dot */}
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.dot, flexShrink: 0 }}/>
        <span style={{ fontSize: 18, flexShrink: 0 }}>{note.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: "-0.1px", marginBottom: 2 }}>
            {note.title}
          </div>
          <div style={{ fontSize: 11, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {note.preview}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: T.muted, fontFamily: "'JetBrains Mono'" }}>{note.notebook}</span>
          <span style={{ fontSize: 11, color: T.muted }}>{timeAgo(note.lastEdited)}</span>
          {note.starred && <span style={{ fontSize: 13 }}>⭐</span>}
          {note.pinned && <span style={{ fontSize: 13 }}>📌</span>}
          {note.shared && <span style={{ fontSize: 13, opacity: 0.6 }}>🔗</span>}
          <div style={{ position: "relative" }}>
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              style={{
                width: 28, height: 28, borderRadius: 8, border: `1px solid ${T.border}`,
                background: menuOpen ? T.glow : "transparent", color: T.muted,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, transition: "all 0.15s", opacity: hovered ? 1 : 0,
              }}
            >⋯</button>
            {menuOpen && <NoteMenu note={note} T={T} onStar={onStar} onPin={onPin} onDelete={onDelete} onClose={() => setMenuOpen(false)}/>}
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
      onClick={() => onOpen(note.id)}
      style={{
        borderRadius: 16, border: `1px solid ${hovered ? col.border : T.border}`,
        background: bg, cursor: "pointer",
        transition: "all 0.22s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? `0 12px 36px rgba(0,0,0,${isDark?0.4:0.1})` : "none",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column",
        minHeight: 180,
      }}
    >
      {/* Top bar */}
      <div style={{
        padding: "14px 14px 10px",
        display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <span style={{ fontSize: 22 }}>{note.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: isDark ? "#e8e4ff" : "#1a1040",
            letterSpacing: "-0.2px", lineHeight: 1.3,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {note.title}
          </div>
          <div style={{ fontSize: 10, color: isDark ? "rgba(200,192,240,0.5)" : "rgba(80,60,140,0.5)", marginTop: 2, fontWeight: 500 }}>
            {note.notebook}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {note.starred && <span style={{ fontSize: 13 }}>⭐</span>}
          {note.pinned && <span style={{ fontSize: 13 }}>📌</span>}
        </div>
      </div>

      {/* Preview */}
      <div style={{
        padding: "0 14px 14px", fontSize: 12,
        color: isDark ? "rgba(200,192,240,0.65)" : "rgba(80,60,140,0.7)",
        lineHeight: 1.55, flex: 1,
        display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {note.preview}
      </div>

      {/* Footer */}
      <div style={{
        padding: "10px 14px", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          {note.tags.slice(0, 2).map(tag => (
            <span key={tag} style={{
              fontSize: 9, padding: "2px 7px", borderRadius: 8,
              background: isDark ? "rgba(157,121,255,0.15)" : "rgba(157,121,255,0.1)",
              color: "#9D79FF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em",
            }}>{tag}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: isDark ? "rgba(200,192,240,0.45)" : "rgba(80,60,140,0.45)", fontFamily: "'JetBrains Mono'" }}>
            {timeAgo(note.lastEdited)}
          </span>
          <div style={{ position: "relative" }}>
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              style={{
                width: 24, height: 24, borderRadius: 7, border: `1px solid ${T.border}`,
                background: menuOpen ? T.glow : "transparent",
                color: isDark ? "rgba(200,192,240,0.5)" : "rgba(80,60,140,0.5)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, transition: "all 0.15s", opacity: hovered ? 1 : 0,
              }}
            >⋯</button>
            {menuOpen && <NoteMenu note={note} T={T} onStar={onStar} onPin={onPin} onDelete={onDelete} onClose={() => setMenuOpen(false)}/>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Note context menu ────────────────────────────────────────────────────────
function NoteMenu({ note, T, onStar, onPin, onDelete, onClose }: any) {
  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: "absolute", right: 0, top: "100%", marginTop: 4, zIndex: 300,
        background: T.surface, border: `1px solid ${T.b2}`, borderRadius: 13,
        padding: "4px", minWidth: 160,
        boxShadow: `0 12px 36px rgba(0,0,0,0.3)`,
      }}
    >
      {[
        { label: note.starred ? "Remove star" : "Star note", icon: "⭐", action: () => { onStar(note.id); onClose(); } },
        { label: note.pinned ? "Unpin" : "Pin to top", icon: "📌", action: () => { onPin(note.id); onClose(); } },
        { label: "Open note",     icon: "↗️", action: onClose },
        { label: "Duplicate",     icon: "⧉",  action: onClose },
        { label: "Move to folder",icon: "📁", action: onClose },
        { label: "Share",         icon: "🔗", action: onClose },
      ].map(item => (
        <button key={item.label} onClick={item.action} style={{
          display: "flex", alignItems: "center", gap: 9,
          padding: "8px 12px", borderRadius: 9, width: "100%", border: "none",
          background: "transparent", color: T.text, fontFamily: "'Chillax'",
          fontSize: 12, fontWeight: 500, cursor: "pointer", textAlign: "left",
          transition: "background 0.12s",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = T.s2)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <span style={{ fontSize: 14 }}>{item.icon}</span> {item.label}
        </button>
      ))}
      <div style={{ height: 1, background: T.border, margin: "4px 8px" }}/>
      <button onClick={() => { onDelete(note.id); onClose(); }} style={{
        display: "flex", alignItems: "center", gap: 9,
        padding: "8px 12px", borderRadius: 9, width: "100%", border: "none",
        background: "transparent", color: T.red, fontFamily: "'Chillax'",
        fontSize: 12, fontWeight: 500, cursor: "pointer", textAlign: "left",
        transition: "background 0.12s",
      }}
        onMouseEnter={e => (e.currentTarget.style.background = `${T.red}12`)}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <span style={{ fontSize: 14 }}>🗑</span> Move to Trash
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LumIUHome() {
  const router = useRouter();
  const [theme, setTheme]         = useState<Theme>("light");
  const [notes, setNotes]         = useState<NoteFile[]>(SEED_NOTES);

  // Load notes dynamically from the notes store
  useEffect(() => {
    async function loadNotes() {
      try {
        let store: any = null;
        if (typeof window !== "undefined") {
          const getDB = () => {
            return new Promise<IDBDatabase>((resolve, reject) => {
              const request = indexedDB.open('LumiuDB', 1);
              request.onupgradeneeded = () => {
                if (!request.result.objectStoreNames.contains('keyval')) {
                  request.result.createObjectStore('keyval');
                }
              };
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
            });
          };
          
          const idbGet = async (key: string) => {
            const db = await getDB();
            return new Promise((resolve, reject) => {
              const tx = db.transaction('keyval', 'readonly');
              const req = tx.objectStore('keyval').get(key);
              req.onsuccess = () => resolve(req.result);
              req.onerror = () => reject(req.error);
            });
          };

          const idbData = await idbGet('lumiu_notes_store');
          if (idbData) {
            store = idbData;
          } else {
            const raw = localStorage.getItem('lumiu_notes_store');
            if (raw) store = JSON.parse(raw);
          }
        }

        if (store && store.notes) {
          const mappedNotes: NoteFile[] = Object.values(store.notes).map((n: any) => {
            const section = store.sections[n.sectionId] || {};
            const notebook = store.notebooks[section.notebookId] || {};
            
            let mappedColor: NoteColor = "default";
            if (n.color === "purple") mappedColor = "nebula";
            else if (n.color === "blue") mappedColor = "void";
            else if (n.color === "cyan") mappedColor = "void";
            else if (n.color === "green") mappedColor = "aurora";
            else if (n.color === "yellow") mappedColor = "comet";
            else if (n.color === "orange") mappedColor = "comet";
            else if (n.color === "red") mappedColor = "pulsar";
            else if (n.color === "pink") mappedColor = "pulsar";
            else if (n.color === "gray") mappedColor = "default";

            return {
              id: n.id,
              title: n.title || "Untitled Note",
              preview: n.plainText || "Start writing your note here...",
              emoji: n.icon || "📄",
              color: mappedColor,
              notebook: notebook.name || "My Learning",
              pinned: n.isPinned || false,
              starred: n.isFavorite || false,
              lastEdited: new Date(n.updatedAt || n.createdAt),
              createdAt: new Date(n.createdAt),
              wordCount: n.wordCount || 0,
              tags: n.tags || [],
              shared: false,
            };
          });
          setNotes(mappedNotes);
        }
      } catch (err) {
        console.error("Failed to load dynamic notes for dashboard:", err);
      }
    }
    loadNotes();
  }, []);
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState<NoteCategory>("all");
  const [viewMode, setViewMode]   = useState<ViewMode>("grid");
  const [sortMode, setSortMode]   = useState<SortMode>("recent");
  const [msgIdx]                  = useState(() => Math.floor(Math.random() * LUMIU_MSGS.length));
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newNoteModal, setNewNoteModal] = useState(false);
  const [newTitle, setNewTitle]   = useState("");
  const [newEmoji, setNewEmoji]   = useState("📝");
  const [newColor, setNewColor]   = useState<NoteColor>("default");
  const [newNotebook, setNewNotebook] = useState("My Learning");
  const searchRef = useRef<HTMLInputElement>(null);

  const isDark = theme === "dark";
  const greeting = getGreeting();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" });

  // ─── Tokens ─────────────────────────────────────────────────────────────────
  const T = {
    bg:      isDark ? "#0f0f23" : "#f5f3ff",
    surface: isDark ? "#1a1a38" : "#ffffff",
    s2:      isDark ? "#22223a" : "#ede9ff",
    s3:      isDark ? "#2a2a48" : "#e2dcff",
    sidebar: isDark ? "#16162e" : "#9D79FF",
    sbText:  isDark ? "#e0d8ff" : "#ffffff",
    sbMuted: isDark ? "rgba(200,192,240,0.5)" : "rgba(255,255,255,0.65)",
    sbActive:isDark ? "rgba(157,121,255,0.22)" : "rgba(255,255,255,0.25)",
    border:  isDark ? "rgba(157,121,255,0.15)" : "rgba(157,121,255,0.2)",
    b2:      isDark ? "rgba(157,121,255,0.28)" : "rgba(157,121,255,0.35)",
    text:    isDark ? "#e8e4ff" : "#1a1040",
    muted:   isDark ? "rgba(200,192,240,0.55)" : "rgba(80,60,140,0.55)",
    accent:  "#9D79FF",
    accentD: "#7c5cfc",
    glow:    "rgba(157,121,255,0.15)",
    green:   isDark ? "#34d399" : "#059669",
    amber:   isDark ? "#fbbf24" : "#d97706",
    red:     isDark ? "#f87171" : "#ef4444",
    pill:    isDark ? "#22223a" : "#ede9ff",
  };

  // ─── Filtered notes ────────────────────────────────────────────────────────
  const filteredNotes = notes
    .filter(n => {
      if (search) {
        const q = search.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.preview.toLowerCase().includes(q) || n.tags.some(t => t.includes(q));
      }
      if (selectedNotebook) return n.notebook === selectedNotebook;
      if (category === "pinned") return n.pinned;
      if (category === "recent") {
        const d = (Date.now() - n.lastEdited.getTime()) / 86400000;
        return d < 3;
      }
      if (category === "shared") return n.shared;
      return true;
    })
    .sort((a, b) => {
      if (sortMode === "name")    return a.title.localeCompare(b.title);
      if (sortMode === "created") return b.createdAt.getTime() - a.createdAt.getTime();
      return b.lastEdited.getTime() - a.lastEdited.getTime();
    });

  const pinnedNotes = notes.filter(n => n.pinned);
  const recentNotes = notes.filter(n => {
    const d = (Date.now() - n.lastEdited.getTime()) / 86400000;
    return d < 2;
  }).slice(0, 6);

  const handleStar = (id: string) => setNotes(prev => prev.map(n => n.id === id ? { ...n, starred: !n.starred } : n));
  const handlePin  = (id: string) => setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  const handleDelete = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));

  const handleNewNote = () => {
    if (!newTitle.trim()) return;
    const n: NoteFile = {
      id: uid(), title: newTitle, preview: "Start writing your note here...",
      emoji: newEmoji, color: newColor, notebook: newNotebook,
      pinned: false, starred: false, lastEdited: new Date(), createdAt: new Date(),
      wordCount: 0, tags: [], shared: false,
    };
    setNotes(prev => [n, ...prev]);
    setNewTitle(""); setNewNoteModal(false);
  };

  const NOTEBOOK_COUNTS = NOTEBOOKS.reduce((acc, nb) => {
    acc[nb] = notes.filter(n => n.notebook === nb).length;
    return acc;
  }, {} as Record<string, number>);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ─── CSS ──────────────────────────────────────────────────────────────────
  const css = `
@import url('https://api.fontshare.com/v2/css?f[]=chillax@300,400,500,600,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}

.lh-root{
  font-family:'Chillax',sans-serif;
  background:${T.bg};color:${T.text};
  min-height:100vh;display:flex;flex-direction:column;
  transition:background 0.35s,color 0.35s;
  overflow:hidden;
}

/* ── Topbar ── */
.lh-top{
  height:54px;background:${T.surface};border-bottom:1px solid ${T.border};
  display:flex;align-items:center;padding:0 18px;gap:12px;
  flex-shrink:0;position:sticky;top:0;z-index:100;
  backdrop-filter:blur(12px);
}
.lh-logo{font-weight:700;font-size:18px;color:${T.accent};letter-spacing:-0.4px;display:flex;align-items:center;gap:6px;}
.lh-logo-dot{width:7px;height:7px;border-radius:50%;background:${T.accent};box-shadow:0 0 8px ${T.accent};animation:lhpulse 2s infinite;}
@keyframes lhpulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.75);}}

/* Search bar */
.lh-search-wrap{flex:1;max-width:560px;position:relative;}
.lh-search{
  width:100%;padding:8px 14px 8px 38px;
  background:${T.s2};border:1.5px solid ${T.border};
  border-radius:12px;color:${T.text};
  font-family:'Chillax';font-size:13px;font-weight:500;
  outline:none;transition:all 0.2s;
}
.lh-search:focus{border-color:${T.accent};background:${T.surface};box-shadow:0 0 0 3px rgba(157,121,255,0.12);}
.lh-search::placeholder{color:${T.muted};}
.lh-search-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:14px;color:${T.muted};pointer-events:none;}
.lh-search-kbd{position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:10px;color:${T.muted};font-family:'JetBrains Mono';background:${T.s3};padding:2px 6px;border-radius:5px;border:1px solid ${T.border};}

.lh-top-actions{margin-left:auto;display:flex;align-items:center;gap:8px;}
.lh-icon-btn{width:34px;height:34px;border-radius:10px;border:1px solid ${T.border};background:${T.pill};color:${T.muted};font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.18s;}
.lh-icon-btn:hover{border-color:${T.accent};color:${T.accent};}
.lh-icon-btn.active{border-color:${T.accent};background:${T.glow};color:${T.accent};}
.tog-wrap{display:flex;align-items:center;gap:7px;border:1px solid ${T.border};border-radius:20px;padding:5px 12px;cursor:pointer;background:${T.pill};color:${T.muted};font-size:12px;font-family:'Chillax';font-weight:500;transition:all 0.2s;}
.tog-wrap:hover{border-color:${T.accent};}
.tog-track{width:30px;height:16px;border-radius:8px;background:${isDark?T.accent:T.s3};position:relative;transition:background 0.25s;flex-shrink:0;}
.tog-thumb{position:absolute;width:12px;height:12px;border-radius:50%;background:white;top:2px;left:${isDark?"16px":"2px"};transition:left 0.25s;box-shadow:0 1px 3px rgba(0,0,0,0.3);}

/* New note button */
.lh-new-btn{
  display:flex;align-items:center;gap:7px;
  padding:7px 16px;border-radius:12px;border:none;
  background:${T.accent};color:white;
  font-family:'Chillax';font-size:13px;font-weight:600;
  cursor:pointer;transition:all 0.18s;letter-spacing:-0.1px;
  white-space:nowrap;
}
.lh-new-btn:hover{background:${T.accentD};transform:translateY(-1px);}

/* ── Body ── */
.lh-body{display:flex;flex:1;overflow:hidden;}

/* ── Sidebar ── */
.lh-sidebar{
  width:${sidebarOpen?"240px":"0"};
  background:${T.sidebar};
  display:flex;flex-direction:column;
  padding:${sidebarOpen?"20px 10px":"0"};
  gap:2px;flex-shrink:0;
  overflow:hidden;overflow-y:auto;
  transition:width 0.3s ease,padding 0.3s ease;
}
.sb-label{
  font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
  color:${T.sbMuted};padding:8px 12px 4px;margin-top:8px;
}
.sb-btn{
  display:flex;align-items:center;gap:9px;
  padding:8px 12px;border-radius:11px;
  border:none;background:transparent;
  color:${T.sbText};font-family:'Chillax';font-size:13px;font-weight:500;
  width:100%;text-align:left;cursor:pointer;transition:all 0.15s;
  white-space:nowrap;
}
.sb-btn:hover{background:${isDark?"rgba(157,121,255,0.15)":"rgba(255,255,255,0.2)"};}
.sb-btn.active{background:${T.sbActive};color:white;}
.sb-btn-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
.sb-count{margin-left:auto;font-size:11px;color:${T.sbMuted};font-family:'JetBrains Mono';background:rgba(255,255,255,0.12);padding:1px 7px;border-radius:10px;}
.sb-divider{height:1px;background:rgba(255,255,255,0.1);margin:8px 4px;}

/* ── Main content ── */
.lh-main{flex:1;overflow-y:auto;display:flex;flex-direction:column;}

/* Hero / welcome */
.lh-hero{
  padding:28px 28px 0;
  display:flex;align-items:center;gap:24px;
  flex-shrink:0;
}
.lh-hero-text{flex:1;}
.lh-greeting-line{
  font-size:11px;font-weight:600;color:${T.muted};
  text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;
}
.lh-welcome{
  font-size:28px;font-weight:700;letter-spacing:-0.6px;
  line-height:1.15;margin-bottom:8px;
  color:${T.text};
}
.lh-lumiu-msg{
  font-size:14px;color:${T.muted};line-height:1.5;
  max-width:500px;
}
.lh-mascot-wrap{
  flex-shrink:0;
  animation:luna-float 4s ease-in-out infinite;
}
@keyframes luna-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}

/* Quick stats row */
.lh-quick-stats{
  display:flex;gap:10px;padding:20px 28px 0;flex-shrink:0;
}
.lh-qs{
  background:${T.surface};border:1px solid ${T.border};border-radius:12px;
  padding:10px 16px;display:flex;align-items:center;gap:10px;
  transition:all 0.15s;cursor:default;
}
.lh-qs:hover{border-color:${T.b2};box-shadow:0 4px 16px rgba(157,121,255,0.1);}
.lh-qs-icon{font-size:16px;}
.lh-qs-val{font-size:16px;font-weight:700;color:${T.accent};font-family:'JetBrains Mono';letter-spacing:-0.3px;}
.lh-qs-label{font-size:11px;color:${T.muted};font-weight:500;}

/* Section headers */
.lh-section{padding:24px 28px 0;}
.lh-section-head{
  display:flex;align-items:center;gap:10px;margin-bottom:14px;
}
.lh-section-title{font-size:14px;font-weight:700;letter-spacing:-0.2px;}
.lh-section-count{font-size:11px;color:${T.muted};font-weight:500;}
.lh-section-actions{margin-left:auto;display:flex;gap:6px;align-items:center;}

/* Sort/filter row */
.lh-filter-row{display:flex;gap:6px;align-items:center;padding:12px 28px 0;flex-shrink:0;flex-wrap:wrap;}
.lh-cat-btn{
  padding:5px 14px;border-radius:20px;border:1px solid ${T.border};
  background:transparent;color:${T.muted};
  font-family:'Chillax';font-size:12px;font-weight:500;cursor:pointer;transition:all 0.15s;
}
.lh-cat-btn:hover{border-color:${T.accent};color:${T.accent};}
.lh-cat-btn.active{background:${T.accent};color:white;border-color:${T.accent};}
.lh-sort-select{
  padding:5px 10px;border-radius:10px;border:1px solid ${T.border};
  background:${T.pill};color:${T.muted};font-family:'Chillax';font-size:12px;
  outline:none;cursor:pointer;transition:all 0.15s;margin-left:auto;
}
.lh-sort-select:focus{border-color:${T.accent};}
.lh-view-btns{display:flex;gap:2px;background:${T.s2};border-radius:9px;padding:2px;}
.lh-view-btn{width:28px;height:26px;border:none;background:transparent;color:${T.muted};border-radius:7px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
.lh-view-btn.active{background:${T.surface};color:${T.accent};}

/* Notes grid */
.notes-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(240px,1fr));
  gap:12px;
  padding:0 28px 12px;
}
.notes-list{display:flex;flex-direction:column;gap:6px;padding:0 28px 12px;}

/* Empty state */
.lh-empty{
  display:flex;flex-direction:column;align-items:center;
  padding:48px 24px;color:${T.muted};text-align:center;gap:10px;
}

/* New note modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);z-index:400;display:flex;align-items:center;justify-content:center;padding:16px;}
.modal-box{background:${T.surface};border:1px solid ${T.b2};border-radius:22px;padding:28px;width:100%;max-width:480px;}
.modal-title{font-size:18px;font-weight:700;letter-spacing:-0.3px;margin-bottom:20px;}
.modal-input{width:100%;padding:10px 13px;background:${T.s2};border:1.5px solid ${T.border};border-radius:11px;color:${T.text};font-family:'Chillax';font-size:14px;outline:none;transition:border-color 0.18s;margin-bottom:12px;}
.modal-input:focus{border-color:${T.accent};}
.modal-label{font-size:11px;font-weight:600;color:${T.muted};text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px;display:block;}
.modal-color-row{display:flex;gap:8px;margin-bottom:14px;}
.modal-color-opt{width:28px;height:28px;border-radius:8px;cursor:pointer;border:2.5px solid transparent;transition:all 0.15s;flex-shrink:0;}
.modal-color-opt.sel{border-color:white;box-shadow:0 0 0 2px ${T.accent};}
.modal-emoji-row{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px;}
.modal-emoji-btn{width:34px;height:34px;border-radius:9px;border:1px solid ${T.border};background:${T.s2};cursor:pointer;font-size:16px;transition:all 0.15s;display:flex;align-items:center;justify-content:center;}
.modal-emoji-btn.sel{border-color:${T.accent};background:${T.glow};}
.modal-actions{display:flex;gap:10px;margin-top:20px;}
.btn-p{padding:9px 22px;border-radius:11px;border:none;background:${T.accent};color:white;font-family:'Chillax';font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;}
.btn-p:hover{background:${T.accentD};}
.btn-s{padding:9px 16px;border-radius:11px;border:1px solid ${T.border};background:${T.pill};color:${T.text};font-family:'Chillax';font-size:13px;cursor:pointer;transition:all 0.15s;}
.btn-s:hover{background:${T.s2};}

/* Search result highlight */
.lh-search-results-label{font-size:12px;color:${T.muted};padding:14px 28px 0;font-weight:500;}

/* Scrollbar */
scrollbar-width:thin;scrollbar-color:rgba(157,121,255,0.3) transparent;
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:rgba(157,121,255,0.3);border-radius:4px;}
`;

  const isSearching = search.trim().length > 0;

  const NOTEBOOK_ICONS: Record<string, string> = {
    "Getting Started": "🚀", "Phy": "⚡", "Sciences": "🔬",
    "Mathematics": "📐", "My Learning": "🌱",
  };

  const NOTE_EMOJIS = ["📝","📖","🔬","⚡","📐","🌌","🧬","⚗️","🎤","🌊","🌍","✨","💡","🎯","🧠"];
  const COLOR_OPTIONS: NoteColor[] = ["default","nebula","aurora","void","pulsar","comet"];
  const COLOR_DOTS: Record<NoteColor, string> = {
    default:"#9D79FF", nebula:"#9D79FF", aurora:"#34d399", void:"#60a5fa", pulsar:"#e040fb", comet:"#fbbf24",
  };

  return (
    <>
      <style>{css}</style>
      <div className="lh-root">

        {/* ── Topbar ── */}
        <div className="lh-top">
          <div className="lh-logo">
            <div className="lh-logo-dot"/>
            lumiu
          </div>
          <div style={{ width: 1, height: 22, background: T.border, margin: "0 4px" }}/>
          <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>Notes</span>

          {/* Search */}
          <div className="lh-search-wrap">
            <span className="lh-search-icon">🔍</span>
            <input
              ref={searchRef}
              className="lh-search"
              placeholder="Search notes, tags, content..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {!search && <span className="lh-search-kbd">⌘K</span>}
            {search && (
              <button onClick={() => setSearch("")} style={{
                position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",
                border:"none",background:"transparent",color:T.muted,cursor:"pointer",fontSize:14,
              }}>✕</button>
            )}
          </div>

          <div className="lh-top-actions">
            {/* View toggle */}
            <div className="lh-view-btns">
              <button className={`lh-view-btn ${viewMode==="grid"?"active":""}`} onClick={()=>setViewMode("grid")} title="Grid view">▦</button>
              <button className={`lh-view-btn ${viewMode==="list"?"active":""}`} onClick={()=>setViewMode("list")} title="List view">☰</button>
            </div>
            <button className="tog-wrap" onClick={() => setTheme(t => t==="dark"?"light":"dark")}>
              {isDark?"🌙":"☀️"}
              <div className="tog-track"><div className="tog-thumb"/></div>
              {isDark?"Dark":"Light"}
            </button>
            <button className="lh-new-btn" onClick={() => setNewNoteModal(true)}>
              ✦ New Note
            </button>
          </div>
        </div>

        <div className="lh-body">

          {/* ── Sidebar ── */}


          {/* ── Main content ── */}
          <div className="lh-main">

            {/* Hero — only show when not searching and showing all */}
            {!isSearching && !selectedNotebook && category === "all" && (
              <div style={{ display: 'contents' }}>
                <div className="lh-hero">
                  <div className="lh-hero-text">
                    <div className="lh-greeting-line">
                      {greeting.emoji} {dateStr}
                    </div>
                    <div className="lh-welcome">
                      Good {greeting.time}, Sania.
                    </div>
                    <div className="lh-lumiu-msg">
                      {LUMIU_MSGS[msgIdx]}
                    </div>
                  </div>
                </div>


                {/* Quick stats */}
                <div className="lh-quick-stats">
                  {[
                    { icon:"📚", val: notes.length, label:"Total notes" },
                    { icon:"📌", val: notes.filter(n=>n.pinned).length, label:"Pinned" },
                    { icon:"⭐", val: notes.filter(n=>n.starred).length, label:"Starred" },
                    { icon:"🔗", val: notes.filter(n=>n.shared).length, label:"Shared" },
                    { icon:"📓", val: NOTEBOOKS.length, label:"Notebooks" },
                  ].map(s => (
                    <div key={s.label} className="lh-qs">
                      <span className="lh-qs-icon">{s.icon}</span>
                      <div>
                        <div className="lh-qs-val">{s.val}</div>
                        <div className="lh-qs-label">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pinned */}
                {pinnedNotes.length > 0 && (
                  <div className="lh-section">
                    <div className="lh-section-head">
                      <span style={{ fontSize: 14 }}>📌</span>
                      <span className="lh-section-title">Pinned</span>
                      <span className="lh-section-count">{pinnedNotes.length}</span>
                    </div>
                    {viewMode === "grid"
                      ? <div className="notes-grid">
                          {pinnedNotes.map(n => <NoteCard key={n.id} note={n} T={T} isDark={isDark} viewMode="grid" onOpen={(id) => router.push(`/notes?noteId=${id}`)} onStar={handleStar} onPin={handlePin} onDelete={handleDelete}/>)}
                        </div>
                      : <div className="notes-list">
                          {pinnedNotes.map(n => <NoteCard key={n.id} note={n} T={T} isDark={isDark} viewMode="list" onOpen={(id) => router.push(`/notes?noteId=${id}`)} onStar={handleStar} onPin={handlePin} onDelete={handleDelete}/>)}
                        </div>
                    }
                  </div>
                )}

                {/* Recent */}
                {recentNotes.length > 0 && (
                  <div className="lh-section">
                    <div className="lh-section-head">
                      <span style={{ fontSize: 14 }}>🕐</span>
                      <span className="lh-section-title">Recent</span>
                      <span className="lh-section-count">edited in the last 48h</span>
                    </div>
                    {viewMode === "grid"
                      ? <div className="notes-grid">
                          {recentNotes.filter(n => !n.pinned).map(n => <NoteCard key={n.id} note={n} T={T} isDark={isDark} viewMode="grid" onOpen={(id) => router.push(`/notes?noteId=${id}`)} onStar={handleStar} onPin={handlePin} onDelete={handleDelete}/>)}
                        </div>
                      : <div className="notes-list">
                          {recentNotes.filter(n => !n.pinned).map(n => <NoteCard key={n.id} note={n} T={T} isDark={isDark} viewMode="list" onOpen={(id) => router.push(`/notes?noteId=${id}`)} onStar={handleStar} onPin={handlePin} onDelete={handleDelete}/>)}
                        </div>
                    }
                  </div>
                )}
              </div>
            )}

            {/* Filter / sort row */}
            <div className="lh-filter-row">
              {!isSearching && !selectedNotebook && (
                <>
                  {([
                    {id:"all",label:"All"},
                    {id:"pinned",label:"📌 Pinned"},
                    {id:"recent",label:"🕐 Recent"},
                    {id:"shared",label:"🔗 Shared"},
                  ] as {id:NoteCategory;label:string}[]).map(c => (
                    <button key={c.id} className={`lh-cat-btn ${category===c.id?"active":""}`}
                      onClick={() => { setCategory(c.id); setSelectedNotebook(null); }}>
                      {c.label}
                    </button>
                  ))}
                </>
              )}
              {isSearching && (
                <span style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>
                  {filteredNotes.length} result{filteredNotes.length !== 1 ? "s" : ""} for "{search}"
                </span>
              )}
              {selectedNotebook && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{NOTEBOOK_ICONS[selectedNotebook] || "📚"}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{selectedNotebook}</span>
                  <span style={{ fontSize: 12, color: T.muted }}>{filteredNotes.length} notes</span>
                </div>
              )}
              <select className="lh-sort-select" value={sortMode} onChange={e => setSortMode(e.target.value as SortMode)}>
                <option value="recent">Last edited</option>
                <option value="name">Name A–Z</option>
                <option value="created">Date created</option>
              </select>
            </div>

            {/* All notes section title */}
            {!isSearching && (
              <div className="lh-section" style={{ paddingBottom: 0 }}>
                <div className="lh-section-head">
                  <span style={{ fontSize: 14 }}>
                    {selectedNotebook ? (NOTEBOOK_ICONS[selectedNotebook] || "📚") : "📄"}
                  </span>
                  <span className="lh-section-title">
                    {selectedNotebook ? selectedNotebook : category === "all" ? "All Notes" : category === "pinned" ? "Pinned" : category === "recent" ? "Recent" : "Shared"}
                  </span>
                  <span className="lh-section-count">{filteredNotes.length}</span>
                </div>
              </div>
            )}

            {/* Notes output */}
            {filteredNotes.length === 0 ? (
              <div className="lh-empty">
                <span style={{ fontSize: 40 }}>🌌</span>
                <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>
                  {isSearching ? "No notes found" : "This space is empty"}
                </div>
                <div style={{ fontSize: 13 }}>
                  {isSearching ? `Nothing matched "${search}". Try a different term.` : "Create your first note to fill the galaxy."}
                </div>
                {!isSearching && (
                  <button className="btn-p" style={{ marginTop: 8 }} onClick={() => setNewNoteModal(true)}>
                    ✦ New Note
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="notes-grid" style={{ paddingTop: 14 }}>
                {filteredNotes.map(n => (
                  <NoteCard key={n.id} note={n} T={T} isDark={isDark} viewMode="grid"
                    onOpen={(id) => router.push(`/notes?noteId=${id}`)} onStar={handleStar} onPin={handlePin} onDelete={handleDelete}/>
                ))}
              </div>
            ) : (
              <div className="notes-list" style={{ paddingTop: 14 }}>
                {filteredNotes.map(n => (
                  <NoteCard key={n.id} note={n} T={T} isDark={isDark} viewMode="list"
                    onOpen={(id) => router.push(`/notes?noteId=${id}`)} onStar={handleStar} onPin={handlePin} onDelete={handleDelete}/>
                ))}
              </div>
            )}

            <div style={{ height: 40 }}/>
          </div>
        </div>

        {/* ── New Note Modal ── */}
        {newNoteModal && (
          <div className="modal-overlay" onClick={() => setNewNoteModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-title">✦ Create New Note</div>

              <label className="modal-label">Title</label>
              <input
                className="modal-input"
                placeholder="Give your note a name..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleNewNote()}
                autoFocus
              />

              <label className="modal-label">Emoji</label>
              <div className="modal-emoji-row">
                {NOTE_EMOJIS.map(em => (
                  <button key={em} className={`modal-emoji-btn ${newEmoji===em?"sel":""}`} onClick={() => setNewEmoji(em)}>
                    {em}
                  </button>
                ))}
              </div>

              <label className="modal-label">Colour theme</label>
              <div className="modal-color-row">
                {COLOR_OPTIONS.map(c => (
                  <div key={c} className={`modal-color-opt ${newColor===c?"sel":""}`}
                    style={{ background: COLOR_DOTS[c] }}
                    onClick={() => setNewColor(c)}
                    title={c}
                  />
                ))}
              </div>

              <label className="modal-label">Notebook</label>
              <select className="lh-sort-select" style={{ width: "100%", marginBottom: 0 }}
                value={newNotebook} onChange={e => setNewNotebook(e.target.value)}>
                {NOTEBOOKS.map(nb => <option key={nb} value={nb}>{nb}</option>)}
              </select>

              <div className="modal-actions">
                <button className="btn-p" onClick={handleNewNote}>Create Note</button>
                <button className="btn-s" onClick={() => setNewNoteModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}