"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type Range = "7d" | "30d" | "90d";
type Tab = "overview" | "focus" | "games" | "subjects";

// ─── Data Generation ──────────────────────────────────────────────────────────
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randF = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(1));

const DAYS_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function genStudyData(n: number) {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  // Generate n days backwards
  const list = Array.from({length: n}, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (n - 1 - i));
    
    // Deterministic sine-wave base
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
    const weekendModifier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.65 : 1.0;
    const daySeed = d.getDate() + d.getMonth() * 31;
    const randFactor = Math.sin(daySeed) * 20 + 40;
    
    return {
      day: i,
      timestamp: d.getTime(),
      minutes: 0,
      focus: 0,
      cards: 0,
      xp: 0,
    };
  });
  
  if (typeof window === "undefined") return list;

  try {
    // Fetch user logs
    const focusHist = JSON.parse(localStorage.getItem("lumiu-focus-history") || "[]");
    const quizHist = JSON.parse(localStorage.getItem("lumiu-quiz-history") || "[]");
    const gameHist = JSON.parse(localStorage.getItem("lumiu-game-history") || "[]");
    const cardHist = JSON.parse(localStorage.getItem("lumiu-flashcard-history") || "[]");

    // Map actual logs to the corresponding calendar days
    list.forEach(day => {
      const nextDayTime = day.timestamp + 86400000;
      
      // Actual focus minutes
      const dayFocus = focusHist.filter((x: any) => x.timestamp >= day.timestamp && x.timestamp < nextDayTime);
      if (dayFocus.length > 0) {
        day.minutes += dayFocus.reduce((a: number, c: any) => a + (c.duration || 0), 0);
        day.focus = Math.round(dayFocus.reduce((a: number, c: any) => a + (c.focusScore || 85), 0) / dayFocus.length);
        day.xp += dayFocus.reduce((a: number, c: any) => a + (c.xp || 0), 0);
      }
      
      // Actual flashcards reviewed
      const dayCards = cardHist.filter((x: any) => x.timestamp >= day.timestamp && x.timestamp < nextDayTime);
      if (dayCards.length > 0) {
        day.cards += dayCards.reduce((a: number, c: any) => a + (c.cardsReviewed || 0), 0);
        day.xp += dayCards.reduce((a: number, c: any) => a + (c.xp || 0), 0);
      }
      
      // Actual quizzes
      const dayQuizzes = quizHist.filter((x: any) => x.timestamp >= day.timestamp && x.timestamp < nextDayTime);
      if (dayQuizzes.length > 0) {
        day.xp += dayQuizzes.reduce((a: number, c: any) => a + (c.xp || 0), 0);
      }

      // Actual games
      const dayGames = gameHist.filter((x: any) => x.timestamp >= day.timestamp && x.timestamp < nextDayTime);
      if (dayGames.length > 0) {
        day.xp += dayGames.reduce((a: number, c: any) => a + (c.xp || 0), 0);
      }
    });
  } catch (e) {
    console.error("Error overlaying user logs:", e);
  }

  return list;
}

const SUBJECTS = [
  { name: "Astrophysics", icon: "🌌", mastery: 88, sessions: 24, color: "#9D79FF", trend: +6 },
  { name: "Biology",      icon: "🧬", mastery: 74, sessions: 18, color: "#34d399", trend: +3 },
  { name: "Chemistry",    icon: "⚗️", mastery: 61, sessions: 12, color: "#60a5fa", trend: -2 },
  { name: "Mathematics",  icon: "📐", mastery: 92, sessions: 31, color: "#fbbf24", trend: +8 },
  { name: "Physics",      icon: "⚡", mastery: 79, sessions: 22, color: "#f87171", trend: +1 },
];

const GAMES_DATA = [
  { name: "Lumosity",        icon: "🧠", plays: 0, avgScore: 0, bestChain: 0, xp: 0 },
  { name: "TypeRacer",       icon: "⌨️", plays: 0, avgScore: 0, bestWPM: 0,  xp: 0  },
  { name: "Concept Drop",    icon: "🎯", plays: 0, avgScore: 0, bestCombo: 0, xp: 0 },
  { name: "Semantic Sprint", icon: "⚡", plays: 0, avgScore: 0, avgBridge: 0, xp: 0  },
  { name: "Echo Chamber",    icon: "🔮", plays: 0, avgScore: 0, avgRecall: 0, xp: 0  },
];

const INSIGHTS = [
  "🧠 Your focus peaks on Thursday afternoons — schedule harder topics then.",
  "⚡ You're 40% faster at recall after a 10-minute break. Consider the Flowtime technique.",
  "🎯 Concept Drop combos improve significantly on days you studied the night before.",
  "📈 Mathematics mastery grew 8% this week — your strongest subject momentum.",
  "🌙 Your late-night sessions (after 10pm) show 22% lower retention — consider shifting earlier.",
  "🔥 7-day streak active — neuroscience shows you're in peak habit formation territory.",
];

const FOCUS_TIPS = [
  { tip: "Take a 5-min break", benefit: "+18% next session focus", icon: "☕" },
  { tip: "Hydrate before studying", benefit: "+12% working memory", icon: "💧" },
  { tip: "Background brown noise", benefit: "+9% concentration", icon: "🎵" },
];

// ─── Sparkline SVG ────────────────────────────────────────────────────────────
function Sparkline({ data, color, height = 40, width = 120, filled = false }: { data: number[]; color: string; height?: number; width?: number; filled?: boolean }) {
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const first = pts.split(" ")[0];
  const last = pts.split(" ").slice(-1)[0];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      {filled && (
        <polygon
          points={`0,${height} ${pts} ${width},${height}`}
          fill={color} opacity={0.15}
        />
      )}
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {last && <circle cx={last.split(",")[0]} cy={last.split(",")[1]} r={3} fill={color} />}
    </svg>
  );
}

// ─── Radial Progress ─────────────────────────────────────────────────────────
function RadialProgress({ value, size = 120, stroke = 10, color = "#9D79FF", bg = "rgba(157,121,255,0.12)", children }: any) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      <g transform={`rotate(90, ${size/2}, ${size/2})`}>{children}</g>
    </svg>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, color, maxVal, labels, height = 140 }: { data: number[]; color: string; maxVal: number; labels: string[]; height?: number }) {
  const barW = Math.floor(560 / data.length) - 4;
  return (
    <svg width="100%" height={height + 24} viewBox={`0 0 560 ${height + 24}`} preserveAspectRatio="xMidYMid meet">
      {[0,0.25,0.5,0.75,1].map((v,i) => (
        <g key={i}>
          <line x1={0} y1={height - v*height} x2={560} y2={height - v*height} stroke="rgba(157,121,255,0.08)" strokeWidth={1}/>
          <text x={-4} y={height - v*height + 4} fontSize={9} fill="rgba(157,121,255,0.5)" textAnchor="end">{Math.round(v*maxVal/60)}h</text>
        </g>
      ))}
      {data.map((v, i) => {
        const x = (i / data.length) * 560 + 2;
        const h = maxVal > 0 ? Math.max(2, (v / maxVal) * height) : 2;
        const isMax = maxVal > 0 && v === Math.max(...data);
        return (
          <g key={i}>
            <rect x={x} y={height - h} width={barW} height={h} rx={4}
              fill={isMax ? color : `${color}88`} style={{ transition: "height 0.8s ease, y 0.8s ease" }}>
              {isMax && <animate attributeName="opacity" values="0.85;1;0.85" dur="2s" repeatCount="indefinite"/>}
            </rect>
            {labels[i] && (
              <text x={x + barW/2} y={height + 16} fontSize={9} fill="rgba(157,121,255,0.55)" textAnchor="middle">{labels[i]}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Activity Heatmap ─────────────────────────────────────────────────────────
function Heatmap({ T, data }: { T: any; data: number[][] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const daysFull = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const getColor = (v: number) => {
    if (!v) return T.s2;
    const alpha = [0.2, 0.45, 0.7, 1][v - 1];
    return `rgba(157, 121, 255, ${alpha})`;
  };

  return (
    <div style={{ overflowX: "auto" }}>
      {/* Grid Header for Hours */}
      <div style={{ display: "grid", gridTemplateColumns: "30px repeat(24, 1fr)", gap: "3px", marginBottom: "6px", alignItems: "center" }}>
        <div /> {/* Spacer for weekday column */}
        {Array.from({ length: 24 }).map((_, h) => {
          const isLabelHour = h % 4 === 0;
          const labelText = h === 0 ? "12a" : h === 12 ? "12p" : `${h % 12}${h < 12 ? "a" : "p"}`;
          return (
            <div
              key={h}
              style={{
                fontSize: "8px",
                color: T.muted,
                textAlign: "center",
                whiteSpace: "nowrap",
                transform: "translateX(-20%)"
              }}
            >
              {isLabelHour ? labelText : ""}
            </div>
          );
        })}
      </div>

      {/* Grid Rows for Days */}
      {data.map((row, d) => (
        <div key={d} style={{ display: "grid", gridTemplateColumns: "30px repeat(24, 1fr)", gap: "3px", marginBottom: "3px", alignItems: "center" }}>
          <div style={{ fontSize: "10px", color: T.muted, fontWeight: 600 }}>{days[d]}</div>
          {row.map((v, h) => (
            <div
              key={h}
              style={{
                aspectRatio: "1",
                borderRadius: "2px",
                background: getColor(v),
                transition: "all 0.2s ease",
              }}
              title={`${daysFull[d]}, ${h === 0 ? "12 AM" : h === 12 ? "12 PM" : h % 12 + (h < 12 ? " AM" : " PM")} — ${v ? `${v * 15} mins of study` : "No activity"}`}
            />
          ))}
        </div>
      ))}

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, paddingLeft: 30 }}>
        <span style={{ fontSize: 10, color: T.muted }}>Less</span>
        {[0, 1, 2, 3, 4].map((v) => (
          <div
            key={v}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: getColor(v)
            }}
          />
        ))}
        <span style={{ fontSize: 10, color: T.muted }}>More</span>
      </div>
    </div>
  );
}

// ─── Streak Calendar ─────────────────────────────────────────────────────────
function StreakCalendar({ T, activeDays }: { T: any; activeDays: Set<number> }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const todayDate = today.getDate();

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Weekday Headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
          <div key={i} style={{ fontSize: 10, color: T.muted, textAlign: "center", fontWeight: 600 }}>{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          
          const isToday = d === todayDate;
          const isActive = activeDays.has(d);
          
          let bg = T.s2;
          let textColor = T.muted;
          let border = `1px solid ${T.border}`;
          let fontWeight = 400;

          if (isToday) {
            bg = "#9D79FF";
            textColor = "white";
            border = "1px solid #9D79FF";
            fontWeight = 700;
          } else if (isActive) {
            bg = "rgba(157, 121, 255, 0.22)";
            textColor = "#9D79FF";
            border = "1px solid rgba(157, 121, 255, 0.4)";
            fontWeight = 600;
          }

          return (
            <div
              key={i}
              className="calendar-day-cell"
              style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: 8,
                background: bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: fontWeight,
                color: textColor,
                border: border,
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
              }}
            >
              {d}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(157, 121, 255, 0.22)", border: "1px solid rgba(157, 121, 255, 0.4)" }} />
          <span style={{ fontSize: 10, color: T.muted }}>Active day</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: "#9D79FF", border: "1px solid #9D79FF" }} />
          <span style={{ fontSize: 10, color: T.muted }}>Today</span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LumIUAnalytics() {
  const [isDark, setIsDark] = useState(true);
  const [range, setRange] = useState<Range>("7d");
  const [tab, setTab] = useState<Tab>("overview");
  const [insightIdx, setInsightIdx] = useState(0);
  const [animIn, setAnimIn] = useState(false);
  const [studyView, setStudyView] = useState<"daily"|"weekly">("daily");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate data based on range
  const n = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const data = useMemo(() => genStudyData(n), [range]);

  const streakInfo = useMemo(() => {
    if (typeof window === "undefined" || !mounted) {
      return { currentStreak: 7, activeDaysSet: new Set<number>() };
    }
    
    try {
      const focusHist = JSON.parse(localStorage.getItem("lumiu-focus-history") || "[]");
      const cardHist = JSON.parse(localStorage.getItem("lumiu-flashcard-history") || "[]");
      const quizHist = JSON.parse(localStorage.getItem("lumiu-quiz-history") || "[]");
      const gameHist = JSON.parse(localStorage.getItem("lumiu-game-history") || "[]");

      const timestamps: number[] = [];
      focusHist.forEach((x: any) => timestamps.push(x.timestamp));
      cardHist.forEach((x: any) => timestamps.push(x.timestamp));
      quizHist.forEach((x: any) => timestamps.push(x.timestamp));
      gameHist.forEach((x: any) => timestamps.push(x.timestamp));

      // Unique YYYY-MM-DD local strings
      const uniqueDates = new Set<string>();
      const activeDaysThisMonth = new Set<number>();
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      timestamps.forEach(ts => {
        const d = new Date(ts);
        const yyyymmdd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        uniqueDates.add(yyyymmdd);

        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          activeDaysThisMonth.add(d.getDate());
        }
      });

      // Calculate streak walking back day by day
      let currentStreak = 0;
      const formatLocalDate = (d: Date) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };

      const todayStr = formatLocalDate(today);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = formatLocalDate(yesterday);

      const hasStudiedToday = uniqueDates.has(todayStr);
      const hasStudiedYesterday = uniqueDates.has(yesterdayStr);

      if (hasStudiedToday || hasStudiedYesterday) {
        currentStreak = 1;
        let checkDate = new Date(hasStudiedToday ? today : yesterday);
        
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const checkStr = formatLocalDate(checkDate);
          if (uniqueDates.has(checkStr)) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Beautiful fallback mockup if user has absolutely no history yet (keeps preview alive)
      if (timestamps.length === 0) {
        const todayDate = today.getDate();
        const mockActive = new Set<number>();
        // Mock 7-day streak ending today
        for (let i = 0; i < 7; i++) {
          const d = todayDate - i;
          if (d > 0) mockActive.add(d);
        }
        // Scattered active days earlier
        mockActive.add(Math.max(1, todayDate - 10));
        mockActive.add(Math.max(1, todayDate - 12));
        mockActive.add(Math.max(1, todayDate - 15));

        return { currentStreak: 7, activeDaysSet: mockActive };
      }

      return { currentStreak, activeDaysSet: activeDaysThisMonth };
    } catch (e) {
      console.error("Error calculating streak:", e);
      return { currentStreak: 7, activeDaysSet: new Set<number>() };
    }
  }, [mounted]);

  const heatmapData = useMemo(() => {
    if (typeof window === "undefined" || !mounted) {
      return Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    }

    try {
      const today = new Date();
      // Start of current week (Monday)
      const monday = new Date(today);
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);

      // Fetch actual logs
      let logs: { timestamp: number; value: number }[] = [];
      const focusHist = JSON.parse(localStorage.getItem("lumiu-focus-history") || "[]");
      const cardHist = JSON.parse(localStorage.getItem("lumiu-flashcard-history") || "[]");
      const quizHist = JSON.parse(localStorage.getItem("lumiu-quiz-history") || "[]");
      const gameHist = JSON.parse(localStorage.getItem("lumiu-game-history") || "[]");

      focusHist.forEach((x: any) => logs.push({ timestamp: x.timestamp, value: x.duration || 25 }));
      cardHist.forEach((x: any) => logs.push({ timestamp: x.timestamp, value: 10 }));
      quizHist.forEach((x: any) => logs.push({ timestamp: x.timestamp, value: 15 }));
      gameHist.forEach((x: any) => logs.push({ timestamp: x.timestamp, value: 10 }));

      // Check if we have any real logs in the current week
      const weekStartMs = monday.getTime();
      const weekEndMs = weekStartMs + 7 * 86400000;
      const hasRealLogs = logs.some(l => l.timestamp >= weekStartMs && l.timestamp < weekEndMs);

      // Build 7 rows x 24 columns
      return Array.from({ length: 7 }, (_, dIndex) => {
        const dayStart = new Date(monday);
        dayStart.setDate(monday.getDate() + dIndex);
        const dayStartMs = dayStart.getTime();

        return Array.from({ length: 24 }, (_, hIndex) => {
          const hourStartMs = dayStartMs + hIndex * 3600000;
          const hourEndMs = hourStartMs + 3600000;

          // Find actual logs in this hour
          const hourLogs = logs.filter(l => l.timestamp >= hourStartMs && l.timestamp < hourEndMs);
          if (hourLogs.length > 0) {
            const totalVal = hourLogs.reduce((a, c) => a + c.value, 0);
            if (totalVal > 30) return 4;
            if (totalVal > 15) return 3;
            if (totalVal > 5) return 2;
            return 1;
          }

          // Fallback beautiful mockup if there are NO real logs in the entire week
          if (!hasRealLogs) {
            const isWeekend = dIndex >= 5; // Sat, Sun
            const baseProb = isWeekend ? 0.15 : 0.35;
            
            // Peak hours: 9am-12pm (9-11), 2pm-5pm (14-17), 7pm-9pm (19-21)
            const isPeak = (hIndex >= 9 && hIndex <= 11) || (hIndex >= 14 && hIndex <= 17) || (hIndex >= 19 && hIndex <= 21);
            const prob = isPeak ? baseProb * 2.2 : baseProb * 0.4;
            
            const hash = Math.abs(Math.sin(dIndex * 31 + hIndex * 17));
            if (hash < prob) {
              return Math.floor(hash * 4) + 1; // 1 to 4
            }
          }

          return 0;
        });
      });
    } catch (e) {
      console.error(e);
      return Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    }
  }, [mounted]);

  const totalXP     = data.reduce((a,d) => a+d.xp, 0);
  const totalMins   = data.reduce((a,d) => a+d.minutes, 0);
  const totalCards  = data.reduce((a,d) => a+d.cards, 0);
  const focusDays = data.filter(d => d.focus > 0);
  const avgFocus = focusDays.length > 0 ? parseFloat((focusDays.reduce((a,d) => a+d.focus, 0) / focusDays.length).toFixed(1)) : 0;
  const activeDays = data.filter(d => d.minutes > 0 || d.cards > 0 || d.xp > 0);
  const totalSessions = activeDays.length;

  const prevXP    = Math.round(totalXP * 0.88);
  const prevMins  = Math.round(totalMins * 0.92);
  const prevCards = Math.round(totalCards * 0.85);

  const pctXP    = prevXP === 0 ? (totalXP > 0 ? 100 : 0) : Math.round(((totalXP - prevXP) / prevXP) * 100);
  const pctMins  = prevMins === 0 ? (totalMins > 0 ? 100 : 0) : Math.round(((totalMins - prevMins) / prevMins) * 100);
  const pctCards = prevCards === 0 ? (totalCards > 0 ? 100 : 0) : Math.round(((totalCards - prevCards) / prevCards) * 100);

  const hours = Math.floor(totalMins / 60);
  const mins  = totalMins % 60;

  useEffect(() => {
    setAnimIn(false);
    setTimeout(() => setAnimIn(true), 50);
  }, [range, tab]);

  useEffect(() => {
    const iv = setInterval(() => setInsightIdx(i => (i + 1) % INSIGHTS.length), 5000);
    return () => clearInterval(iv);
  }, []);

  // ─── Design tokens ──────────────────────────────────────────────────────────
  const T = {
    bg:      isDark ? "#0f0f23" : "#f5f3ff",
    surface: isDark ? "#1a1a38" : "#ffffff",
    s2:      isDark ? "#22223a" : "#ede9ff",
    s3:      isDark ? "#2a2a48" : "#e2dcff",
    border:  isDark ? "rgba(157,121,255,0.15)" : "rgba(157,121,255,0.18)",
    b2:      isDark ? "rgba(157,121,255,0.25)" : "rgba(157,121,255,0.32)",
    text:    isDark ? "#e8e4ff" : "#1a1040",
    muted:   isDark ? "rgba(200,192,240,0.55)" : "rgba(80,60,140,0.55)",
    accent:  "#9D79FF",
    glow:    "rgba(157,121,255,0.14)",
    green:   isDark ? "#34d399" : "#059669",
    amber:   isDark ? "#fbbf24" : "#d97706",
    red:     isDark ? "#f87171" : "#ef4444",
    blue:    isDark ? "#60a5fa" : "#3b82f6",
    pill:    isDark ? "#22223a" : "#ede9ff",
    shadow:  isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 16px rgba(157,121,255,0.1)",
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });

  const css = `
@import url('https://api.fontshare.com/v2/css?f[]=chillax@300,400,500,600,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
.lad-root{font-family:'Chillax',sans-serif;background:${T.bg};color:${T.text};min-height:100vh;transition:background 0.35s,color 0.35s;}
.lad-topbar{position:sticky;top:0;z-index:100;background:${T.surface};border-bottom:1px solid ${T.border};padding:0 28px;height:58px;display:flex;align-items:center;gap:16px;backdrop-filter:blur(12px);}
.lad-logo{font-weight:700;font-size:20px;color:${T.accent};letter-spacing:-0.4px;display:flex;align-items:center;gap:7px;}
.lad-logo-dot{width:8px;height:8px;border-radius:50%;background:${T.accent};box-shadow:0 0 10px ${T.accent};animation:lad-pulse 2s infinite;}
@keyframes lad-pulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(0.75);opacity:0.5;}}
.lad-badge{font-size:10px;padding:2px 9px;border-radius:20px;background:${T.glow};color:${T.accent};border:1px solid ${T.border};font-weight:700;letter-spacing:0.04em;text-transform:uppercase;}
.lad-tabs{display:flex;gap:2px;background:${T.s2};border-radius:12px;padding:3px;}
.lad-tab{padding:6px 14px;border-radius:9px;border:none;background:transparent;font-family:'Chillax';font-size:12px;font-weight:500;cursor:pointer;color:${T.muted};transition:all 0.18s;}
.lad-tab.active{background:${T.surface};color:${T.accent};font-weight:600;box-shadow:${T.shadow};}
.lad-tab:hover:not(.active){color:${T.text};}
.lad-topbar-right{margin-left:auto;display:flex;align-items:center;gap:10px;}
.range-group{display:flex;gap:2px;background:${T.s2};border-radius:10px;padding:3px;}
.range-btn{padding:5px 12px;border-radius:7px;border:none;font-family:'Chillax';font-size:12px;font-weight:500;cursor:pointer;background:transparent;color:${T.muted};transition:all 0.18s;}
.range-btn.active{background:${T.surface};color:${T.accent};font-weight:600;box-shadow:${T.shadow};}
.dark-toggle{display:flex;align-items:center;gap:7px;border:1px solid ${T.border};border-radius:20px;padding:5px 12px;cursor:pointer;background:${T.pill};color:${T.muted};font-size:12px;font-family:'Chillax';font-weight:500;transition:all 0.2s;}
.dark-toggle:hover{border-color:${T.accent};}
.tog-track{width:30px;height:16px;border-radius:8px;background:${isDark?T.accent:T.s3};position:relative;transition:background 0.25s;flex-shrink:0;}
.tog-thumb{position:absolute;width:12px;height:12px;border-radius:50%;background:white;top:2px;left:${isDark?"16px":"2px"};transition:left 0.25s;box-shadow:0 1px 3px rgba(0,0,0,0.3);}
/* Content */
.lad-body{padding:24px 28px 40px;max-width:1400px;margin:0 auto;}
/* Stat cards */
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;}
.stat-card{background:${T.surface};border-radius:18px;padding:20px;border:1px solid ${T.border};position:relative;overflow:hidden;transition:box-shadow 0.2s,transform 0.2s;cursor:default;}
.stat-card:hover{box-shadow:${T.shadow};transform:translateY(-2px);}
.stat-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:${T.muted};margin-bottom:8px;}
.stat-value{font-size:32px;font-weight:700;letter-spacing:-0.8px;line-height:1;}
.stat-delta{display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;margin-top:6px;}
.stat-sub{font-size:10px;color:${T.muted};margin-top:3px;}
.stat-sparkline{position:absolute;bottom:12px;right:12px;opacity:0.8;}
/* Main grid */
.main-grid{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px;}
.main-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;}
.main-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
/* Cards */
.card{background:${T.surface};border-radius:18px;padding:20px;border:1px solid ${T.border};box-shadow:${T.shadow};transition:box-shadow 0.2s;}
.card:hover{box-shadow:0 6px 32px rgba(157,121,255,0.14);}
.card-title{font-size:14px;font-weight:700;letter-spacing:-0.2px;margin-bottom:4px;}
.card-sub{font-size:11px;color:${T.muted};margin-bottom:14px;}
/* Focus score */
.focus-grid{display:flex;align-items:center;gap:20px;}
.focus-big{font-size:44px;font-weight:700;letter-spacing:-1px;color:${T.accent};}
/* Subject progress */
.subject-row{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.subject-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
.subject-name{font-size:13px;font-weight:500;flex:1;}
.subject-bar-bg{flex:2;height:5px;border-radius:3px;background:${T.s3};overflow:hidden;}
.subject-bar-fill{height:5px;border-radius:3px;transition:width 1s ease;}
.subject-pct{font-size:12px;font-weight:700;min-width:36px;text-align:right;}
.subject-trend{font-size:10px;font-weight:600;min-width:28px;text-align:right;}
/* Games table */
.game-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid ${T.border};transition:background 0.15s;}
.game-row:last-child{border-bottom:none;}
.game-row:hover{background:${T.glow};margin:0 -8px;padding:10px 8px;border-radius:10px;border-bottom-color:transparent;}
.game-icon-wrap{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;background:${T.s2};border:1px solid ${T.border};}
.game-name{font-size:13px;font-weight:600;flex:1;}
.game-stat{font-size:12px;color:${T.muted};text-align:right;}
.game-stat-val{font-size:13px;font-weight:700;color:${T.accent};text-align:right;min-width:48px;}
.game-xp{font-size:11px;font-weight:600;padding:2px 8px;border-radius:8px;background:${T.glow};color:${T.accent};border:1px solid ${T.border};}
/* Insight bar */
.insight-bar{background:${isDark?"linear-gradient(135deg,#1a1a38,#2a1a50)":"linear-gradient(135deg,#f0eeff,#ede9ff)"};border:1px solid ${T.b2};border-radius:16px;padding:14px 20px;display:flex;align-items:center;gap:14px;margin-bottom:16px;}
.insight-icon{width:36px;height:36px;border-radius:10px;background:${T.glow};border:1px solid ${T.border};display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
.insight-text{font-size:13px;font-weight:500;flex:1;line-height:1.5;}
.insight-dots{display:flex;gap:4px;}
.insight-dot{width:5px;height:5px;border-radius:50%;background:${T.accent};transition:opacity 0.3s;}
/* Download */
.dl-btn{padding:8px 18px;border-radius:10px;border:1px solid ${T.border};background:${T.surface};color:${T.text};font-family:'Chillax';font-size:12px;font-weight:500;cursor:pointer;transition:all 0.18s;display:flex;align-items:center;gap:6px;}
.dl-btn:hover{background:${T.accent};color:white;border-color:${T.accent};}
/* Focus tips */
.tip-row{display:flex;gap:10px;margin-top:6px;}
.tip-card{flex:1;background:${T.s2};border-radius:12px;padding:12px;border:1px solid ${T.border};}
.tip-emoji{font-size:20px;margin-bottom:6px;}
.tip-text{font-size:12px;font-weight:600;margin-bottom:3px;}
.tip-benefit{font-size:11px;color:${T.green};}
/* XP level progress */
.level-bar-bg{width:100%;height:8px;border-radius:4px;background:${T.s3};overflow:hidden;margin-top:6px;}
.level-bar-fill{height:8px;border-radius:4px;background:linear-gradient(90deg,${T.accent},#c4b0ff);transition:width 1s ease;}
/* Session timeline */
.timeline-item{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;position:relative;}
.timeline-dot{width:8px;height:8px;border-radius:50%;background:${T.accent};flex-shrink:0;margin-top:4px;}
.timeline-line{position:absolute;left:3.5px;top:12px;bottom:-8px;width:1px;background:${T.border};}
.timeline-content{flex:1;background:${T.s2};border-radius:10px;padding:9px 12px;border:1px solid ${T.border};}
.timeline-time{font-size:10px;color:${T.muted};font-family:'JetBrains Mono';margin-bottom:2px;}
.timeline-desc{font-size:12px;font-weight:500;}
/* Focus ring triple */
.focus-rings{position:relative;width:130px;height:130px;flex-shrink:0;}
/* Anim */
@keyframes fade-up{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
.anim-in{animation:fade-up 0.4s ease forwards;}
.anim-in-1{animation:fade-up 0.4s 0.05s ease both;}
.anim-in-2{animation:fade-up 0.4s 0.1s ease both;}
.anim-in-3{animation:fade-up 0.4s 0.15s ease both;}
.anim-in-4{animation:fade-up 0.4s 0.2s ease both;}
.anim-in-5{animation:fade-up 0.4s 0.25s ease both;}
scrollbar-width:thin;scrollbar-color:rgba(157,121,255,0.3) transparent;
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:rgba(157,121,255,0.3);border-radius:4px;}
.calendar-day-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(157, 121, 255, 0.15);
  border-color: rgba(157, 121, 255, 0.8) !important;
}
`;

  const dayLabels = data.map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    if (n <= 7) return DAYS_SHORT[d.getDay() === 0 ? 6 : d.getDay() - 1];
    if (n <= 30) return i % 5 === 0 ? d.getDate().toString() : "";
    return i % 14 === 0 ? `${MONTHS[d.getMonth()]} ${d.getDate()}` : "";
  });

  const recentSessions = useMemo(() => {
    if (typeof window === "undefined" || !mounted) {
      return [
        { time: "Today, 2:14 PM",     desc: "Astrophysics flashcards — 34 cards · 87% retention",   xp: 240 },
        { time: "Today, 10:08 AM",    desc: "Lumosity game — chain of 14 connections",              xp: 302 },
        { time: "Yesterday, 8:45 PM", desc: "Mathematics review — 28 cards · 92% accuracy",        xp: 186 },
        { time: "Yesterday, 4:22 PM", desc: "TypeRacer — 71 WPM, 94% accuracy",                    xp: 158 },
        { time: "May 14, 7:11 PM",    desc: "Echo Chamber — avg recall 78%",                       xp: 112 },
      ];
    }
    
    try {
      const list: any[] = [];
      
      // Load Focus History
      const focusHist = JSON.parse(localStorage.getItem("lumiu-focus-history") || "[]");
      focusHist.forEach((x: any) => {
        list.push({
          timestamp: x.timestamp,
          desc: `Focus session (${x.mode === "short" ? "Short Focus" : x.mode === "deep" ? "Deep Focus" : "Custom Focus"}) — ${x.duration} mins completed`,
          xp: x.xp || x.duration * 6
        });
      });

      // Load Quiz History
      const quizHist = JSON.parse(localStorage.getItem("lumiu-quiz-history") || "[]");
      quizHist.forEach((x: any) => {
        list.push({
          timestamp: x.timestamp,
          desc: `AI Quiz — "${x.topic}" · ${x.difficulty} difficulty (${x.score}/${x.total} correct)`,
          xp: x.xp
        });
      });

      // Load Game History
      const gameHist = JSON.parse(localStorage.getItem("lumiu-game-history") || "[]");
      gameHist.forEach((x: any) => {
        list.push({
          timestamp: x.timestamp,
          desc: `${x.gameName} neural game — ${x.detail || `scored ${x.score}`}`,
          xp: x.xp
        });
      });

      // Load Flashcard History
      const cardHist = JSON.parse(localStorage.getItem("lumiu-flashcard-history") || "[]");
      cardHist.forEach((x: any) => {
        list.push({
          timestamp: x.timestamp,
          desc: `Flashcards study — "${x.deckName}" deck (${x.cardsReviewed} cards reviewed)`,
          xp: x.xp
        });
      });

      // Sort by timestamp descending
      list.sort((a, b) => b.timestamp - a.timestamp);

      const formattedList = list.slice(0, 5).map(x => {
        const diffMs = Date.now() - x.timestamp;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMins / 60);
        
        let timeStr = "";
        if (diffMins < 1) {
          timeStr = "Just now";
        } else if (diffMins < 60) {
          timeStr = `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
        } else if (diffHrs < 24) {
          timeStr = `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
        } else {
          const d = new Date(x.timestamp);
          timeStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
        }

        return {
          time: timeStr,
          desc: x.desc,
          xp: x.xp
        };
      });

      return formattedList;
    } catch (e) {
      console.error("Error creating dynamic recent sessions:", e);
      return [];
    }
  }, [mounted]);

  const gamesData = useMemo(() => {
    if (typeof window === "undefined" || !mounted) return GAMES_DATA;
    try {
      const statsStr = localStorage.getItem("lumiu-game-stats");
      if (!statsStr) return GAMES_DATA;
      
      const stats = JSON.parse(statsStr);
      const result = GAMES_DATA.map(g => {
        // Map name to the internal key in stats
        const keyMap: Record<string, string> = {
          "Lumosity": "lumosity",
          "TypeRacer": "typeracer",
          "Concept Drop": "concept-drop",
          "Semantic Sprint": "semantic-sprint",
          "Echo Chamber": "echo-chamber"
        };
        
        const key = keyMap[g.name];
        if (key && stats[key]) {
          return {
            ...g,
            plays: stats[key].plays,
            avgScore: stats[key].avgScore,
            xp: stats[key].xp
          };
        }
        return g;
      });
      return result;
    } catch (e) {
      console.error("Error reading gamesData:", e);
      return GAMES_DATA;
    }
  }, [mounted]);

  const subjectsData = useMemo(() => {
    if (typeof window === "undefined" || !mounted) return SUBJECTS;
    try {
      const foldersStr = localStorage.getItem("lumiu-folders");
      const decksStr = localStorage.getItem("lumiu-decks");
      const histStr = localStorage.getItem("lumiu-flashcard-history");
      
      const folders = foldersStr ? JSON.parse(foldersStr) : [];
      const decks = decksStr ? JSON.parse(decksStr) : [];
      const hist = JSON.parse(histStr || "[]");
      
      if (folders.length === 0 && decks.length === 0) return SUBJECTS;
      
      const subjects: any[] = [];
      const colors = ["#9D79FF", "#34d399", "#60a5fa", "#fbbf24", "#f87171", "#e040fb", "#22d3ee", "#fb923c"];
      
      folders.forEach((f: any, i: number) => {
        const folderDecks = decks.filter((d: any) => d.folderId === f.id);
        const deckNames = folderDecks.map((d: any) => d.name);
        
        const subjectHist = hist.filter((h: any) => deckNames.includes(h.deckName));
        const sessions = subjectHist.length;
        const totalAccuracy = subjectHist.reduce((a: number, c: any) => a + (c.accuracy || 0), 0);
        const mastery = sessions > 0 ? Math.round(totalAccuracy / sessions) : 0;
        
        let trend = 0;
        if (sessions > 1) {
           const lastAcc = subjectHist[subjectHist.length - 1].accuracy || 0;
           trend = Math.round(lastAcc - mastery);
        }
        
        subjects.push({
          name: f.name,
          icon: f.emoji || "📁",
          mastery,
          sessions,
          color: f.color || colors[i % colors.length],
          trend,
          totalCardsReviewed: subjectHist.reduce((a: number, c: any) => a + (c.cardsReviewed || 0), 0)
        });
      });
      
      const unfiledDecks = decks.filter((d: any) => d.folderId === null || d.folderId === undefined);
      unfiledDecks.forEach((d: any, i: number) => {
        const subjectHist = hist.filter((h: any) => h.deckName === d.name);
        const sessions = subjectHist.length;
        const totalAccuracy = subjectHist.reduce((a: number, c: any) => a + (c.accuracy || 0), 0);
        const mastery = sessions > 0 ? Math.round(totalAccuracy / sessions) : 0;
        
        let trend = 0;
        if (sessions > 1) {
           const lastAcc = subjectHist[subjectHist.length - 1].accuracy || 0;
           trend = Math.round(lastAcc - mastery);
        }
        
        subjects.push({
          name: d.name,
          icon: d.emoji || "📚",
          mastery,
          sessions,
          color: colors[(folders.length + i) % colors.length],
          trend,
          totalCardsReviewed: subjectHist.reduce((a: number, c: any) => a + (c.cardsReviewed || 0), 0)
        });
      });
      
      if (subjects.length === 0) return SUBJECTS;
      
      subjects.sort((a, b) => b.sessions - a.sessions || b.totalCardsReviewed - a.totalCardsReviewed);
      
      // Pad to at least 3 for the radar chart to look good
      while (subjects.length > 0 && subjects.length < 3) {
         const dummy = SUBJECTS.find(s => !subjects.some(sub => sub.name === s.name));
         if (dummy) subjects.push({...dummy, mastery: 0, sessions: 0, totalCardsReviewed: 0});
      }
      
      return subjects.slice(0, 5);
    } catch(e) {
      return SUBJECTS;
    }
  }, [mounted]);

  const focusHourData = useMemo(() => {
    if (typeof window === "undefined" || !mounted) return Array.from({length:24}, (_,h) => ({hour:h, avg:0}));
    try {
      const hist = JSON.parse(localStorage.getItem("lumiu-focus-history") || "[]");
      return Array.from({length:24}, (_, h) => {
        const sessions = hist.filter((x: any) => new Date(x.timestamp).getHours() === h);
        const avg = sessions.length > 0 ? Math.round(sessions.reduce((a: number, c: any) => a + (c.focusScore || 0), 0) / sessions.length) : 0;
        return { hour: h, avg };
      });
    } catch {
      return Array.from({length:24}, (_,h) => ({hour:h, avg:0}));
    }
  }, [mounted]);
  const bestHour = focusHourData.reduce((a,b) => a.avg > b.avg ? a : b, {hour: 0, avg: 0});

  // ─── Overview Tab ───────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div key={`overview-${range}`}>
      {/* Stat cards */}
      <div className="stat-grid anim-in">
        {[
          { label:"Total XP", value: totalXP.toLocaleString(), pct: pctXP, sub:"vs prev period", color:"#9D79FF", sparkData: data.map(d=>d.xp) },
          { label:"Study Time", value:`${hours}h ${mins}m`, pct: pctMins, sub:"vs prev period", color:"#60a5fa", sparkData: data.map(d=>d.minutes) },
          { label:"Cards Reviewed", value: totalCards.toLocaleString(), pct: pctCards, sub:"vs prev period", color:"#34d399", sparkData: data.map(d=>d.cards) },
          { label:"Avg Focus Score", value:`${avgFocus}%`, pct: 6, sub:`across ${n} sessions`, color:"#fbbf24", sparkData: data.map(d=>d.focus) },
        ].map((s,i) => (
          <div key={i} className={`stat-card anim-in-${i+1}`}>
            <div style={{ position:"absolute", inset:0, borderRadius:18, background:`${s.color}08`, pointerEvents:"none" }}/>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-delta" style={{ color: s.pct >= 0 ? T.green : T.red }}>
              <span>{s.pct >= 0 ? "▲" : "▼"}</span>
              <span>{Math.abs(s.pct)}%</span>
              <span style={{ color: T.muted, fontWeight: 400, fontSize: 11 }}>{s.sub}</span>
            </div>
            <div className="stat-sparkline">
              <Sparkline data={s.sparkData} color={s.color} filled width={100} height={36}/>
            </div>
          </div>
        ))}
      </div>

      {/* Study time chart + Focus score */}
      <div className="main-grid anim-in-2">
        <div className="card">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
            <div>
              <div className="card-title">Study Time Over Time</div>
              <div className="card-sub">{range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "Last 90 days"}</div>
            </div>
            <div style={{ display:"flex", gap:4 }}>
              {(["daily","weekly"] as const).map(v => (
                <button key={v} onClick={() => setStudyView(v)} style={{
                  padding:"4px 10px", borderRadius:8, border:`1px solid ${T.border}`,
                  background: studyView===v ? T.accent : T.s2,
                  color: studyView===v ? "white" : T.muted,
                  fontFamily:"'Chillax'", fontSize:11, cursor:"pointer", fontWeight:500,
                }}>{v === "daily" ? "Daily" : "Weekly"}</button>
              ))}
            </div>
          </div>
          <BarChart
            data={studyView === "weekly" && n > 7 ? Array.from({length:Math.ceil(n/7)}, (_,i) => data.slice(i*7,(i+1)*7).reduce((a,d)=>a+d.minutes,0)/7) : data.map(d=>d.minutes)}
            color="#9D79FF"
            maxVal={Math.max(...data.map(d=>d.minutes))*1.1}
            labels={studyView === "weekly" && n > 7 ? Array.from({length:Math.ceil(n/7)},(_,i)=>`W${i+1}`) : dayLabels}
            height={140}
          />
        </div>

        <div className="card">
          <div className="card-title">Focus Score</div>
          <div className="card-sub">Average cognitive engagement per session</div>
          <div className="focus-grid">
            <div>
              <div className="focus-big">{avgFocus}%</div>
              <div className="stat-delta" style={{ color: T.green }}>
                <span>▲</span><span>6%</span>
                <span style={{ color:T.muted, fontWeight:400, fontSize:11 }}>vs last period</span>
              </div>
              <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:6 }}>
                {[
                  { label:"Peak focus", val:`${Math.max(...data.map(d=>d.focus))}%`, color:T.green },
                  { label:"Low focus", val:`${Math.min(...data.map(d=>d.focus))}%`, color:T.red },
                  { label:"Sessions", val:`${totalSessions}`, color:T.accent },
                ].map(r=>(
                  <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:11, color:T.muted }}>{r.label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:r.color, fontFamily:"'JetBrains Mono'" }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="focus-rings">
              <RadialProgress value={avgFocus} size={130} stroke={11} color="#9D79FF">
                <text x={65} y={58} textAnchor="middle" fill={T.text} fontSize={22} fontFamily="Chillax" fontWeight="700">{avgFocus}%</text>
                <text x={65} y={74} textAnchor="middle" fill={T.muted} fontSize={9} fontFamily="Chillax">FOCUS</text>
              </RadialProgress>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 3 cols */}
      <div className="main-grid-3 anim-in-3">
        {/* Subject mastery */}
        <div className="card">
          <div className="card-title">Subjects Mastery</div>
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:11, color:T.muted }}>Overall progress</div>
            <div style={{ fontSize:26, fontWeight:700, letterSpacing:"-0.5px", color:T.accent }}>{subjectsData.length > 0 ? Math.round(subjectsData.reduce((a: number, s: any) => a + s.mastery, 0) / subjectsData.length) : 0}%</div>
            <div className="level-bar-bg"><div className="level-bar-fill" style={{ width:`${subjectsData.length > 0 ? Math.round(subjectsData.reduce((a: number, s: any) => a + s.mastery, 0) / subjectsData.length) : 0}%` }}/></div>
          </div>
          {subjectsData.map((s: any) => (
            <div key={s.name} className="subject-row">
              <div className="subject-icon" style={{ background:`${s.color}18` }}>{s.icon}</div>
              <div className="subject-name" style={{ fontSize:12 }}>{s.name}</div>
              <div className="subject-bar-bg">
                <div className="subject-bar-fill" style={{ width:`${s.mastery}%`, background:s.color }}/>
              </div>
              <div className="subject-pct" style={{ color:T.text, fontFamily:"'JetBrains Mono'", fontSize:11 }}>{s.mastery}%</div>
              <div className="subject-trend" style={{ color:s.trend>=0?T.green:T.red, fontFamily:"'JetBrains Mono'" }}>{s.trend>=0?"+":""}{s.trend}%</div>
            </div>
          ))}
        </div>

        {/* Activity heatmap */}
        <div className="card">
          <div className="card-title">Activity Heatmap</div>
          <div className="card-sub">Hourly study intensity this week</div>
          <Heatmap T={T} data={heatmapData}/>
        </div>

        {/* Streak calendar */}
        <div className="card">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <div>
              <div className="card-title">Streak Calendar</div>
              <div className="card-sub">Keep it up! 🔥</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:26, fontWeight:700, color:T.amber, letterSpacing:"-0.5px" }}>{streakInfo.currentStreak}</div>
              <div style={{ fontSize:10, color:T.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Day streak</div>
            </div>
          </div>
          <StreakCalendar T={T} activeDays={streakInfo.activeDaysSet}/>
        </div>
      </div>

      {/* Recent sessions */}
      <div className="card anim-in-4">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div>
            <div className="card-title">Recent Sessions</div>
            <div className="card-sub">Your latest study activity</div>
          </div>
        </div>
        <div>
          {recentSessions.length === 0 ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: T.muted, fontSize: 13 }}>No recent activity found. Start a study session!</div>
          ) : recentSessions.map((s,i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-dot"/>
              {i < recentSessions.length-1 && <div className="timeline-line"/>}
              <div className="timeline-content">
                <div className="timeline-time">{s.time}</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div className="timeline-desc">{s.desc}</div>
                  <span style={{ fontSize:11, fontWeight:700, color:T.accent, fontFamily:"'JetBrains Mono'", marginLeft:12, flexShrink:0 }}>+{s.xp} XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── Focus Tab ──────────────────────────────────────────────────────────────
  const renderFocus = () => (
    <div key="focus">
      <div className="main-grid-2 anim-in">
        <div className="card">
          <div className="card-title">Focus Score Over Time</div>
          <div className="card-sub">How engaged you were across sessions</div>
          <svg width="100%" height="160" viewBox="0 0 560 160" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9D79FF" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#9D79FF" stopOpacity="0.02"/>
              </linearGradient>
            </defs>
            {[0,0.25,0.5,0.75,1].map((v,i)=>(
              <line key={i} x1={0} y1={140-v*130} x2={560} y2={140-v*130} stroke="rgba(157,121,255,0.08)" strokeWidth={1}/>
            ))}
            <polygon
              points={`0,140 ${data.map((d,i)=>`${(i/(n-1))*556+2},${140-((d.focus-50)/50)*130}`).join(" ")} 558,140`}
              fill="url(#focusGrad)"
            />
            <polyline
              points={data.map((d,i)=>`${(i/(n-1))*556+2},${140-((d.focus-50)/50)*130}`).join(" ")}
              fill="none" stroke="#9D79FF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
            />
            {data.filter((_,i)=>i===data.length-1).map((d,i)=>{
              const x=(1)*556+2, y=140-((d.focus-50)/50)*130;
              return <circle key={i} cx={x} cy={y} r={5} fill="#9D79FF"/>;
            })}
          </svg>
        </div>

        <div className="card">
          <div className="card-title">Hourly Focus Pattern</div>
          <div className="card-sub">When your brain performs best</div>
          <div style={{ display:"flex", gap:2, alignItems:"flex-end", height:130, marginBottom:8 }}>
            {focusHourData.map((h,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                <div style={{
                  width:"100%", borderRadius:"3px 3px 0 0",
                  height:`${(h.avg/100)*110}px`,
                  background: h.avg >= 85 ? "#9D79FF" : h.avg >= 70 ? "rgba(157,121,255,0.55)" : "rgba(157,121,255,0.2)",
                  transition:"height 1s ease",
                  position:"relative",
                }}>
                  {h.hour === bestHour.hour && (
                    <div style={{ position:"absolute", top:-18, left:"50%", transform:"translateX(-50%)", fontSize:8, color:T.accent, fontWeight:700, whiteSpace:"nowrap" }}>PEAK</div>
                  )}
                </div>
                {i % 6 === 0 && <div style={{ fontSize:8, color:T.muted }}>{h.hour}h</div>}
              </div>
            ))}
          </div>
          <div style={{ background:T.s2, borderRadius:10, padding:"10px 14px", border:`1px solid ${T.border}`, fontSize:12 }}>
            <span style={{ color:T.muted }}>Peak focus: </span>
            <strong style={{ color:T.accent }}>{bestHour.hour}:00 – {bestHour.hour+1}:00</strong>
            <span style={{ color:T.muted }}> · avg </span>
            <strong style={{ color:T.green }}>{bestHour.avg.toFixed(0)}%</strong>
          </div>
        </div>
      </div>

      {/* Focus tips */}
      <div className="card anim-in-2">
        <div className="card-title">ADHD-Optimised Focus Tips</div>
        <div className="card-sub">Personalised to your session patterns</div>
        <div className="tip-row">
          {FOCUS_TIPS.map((tip,i) => (
            <div key={i} className="tip-card">
              <div className="tip-emoji">{tip.icon}</div>
              <div className="tip-text">{tip.tip}</div>
              <div className="tip-benefit">{tip.benefit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Neuroscience panel */}
      <div className="card anim-in-3" style={{ marginTop:16 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:20 }}>
          <div style={{ flex:1 }}>
            <div className="card-title">Your Attention Profile</div>
            <div className="card-sub">Based on {totalSessions} sessions of adaptive data</div>
            {[
              { label:"Sustained Attention",   val:74, desc:"Ability to maintain focus over long tasks" },
              { label:"Selective Attention",   val:88, desc:"Blocking out irrelevant stimuli" },
              { label:"Working Memory Load",   val:61, desc:"Capacity for juggling multiple items" },
              { label:"Cognitive Flexibility", val:82, desc:"Switching between task types" },
            ].map(a=>(
              <div key={a.label} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <div>
                    <span style={{ fontSize:12, fontWeight:600 }}>{a.label}</span>
                    <span style={{ fontSize:10, color:T.muted, marginLeft:8 }}>{a.desc}</span>
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:T.accent, fontFamily:"'JetBrains Mono'" }}>{a.val}%</span>
                </div>
                <div className="level-bar-bg">
                  <div className="level-bar-fill" style={{ width:`${a.val}%`, background:a.val>=80?"#9D79FF":a.val>=60?"#60a5fa":"#f87171" }}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{ width:160, flexShrink:0 }}>
            {[
              { label:"Focus", val:avgFocus, color:"#9D79FF" },
              { label:"Memory", val:74, color:"#34d399" },
              { label:"Speed", val:81, color:"#60a5fa" },
            ].map((r,i) => (
              <div key={i} style={{ textAlign:"center", marginBottom:12 }}>
                <RadialProgress value={r.val} size={50} stroke={5} color={r.color} bg={`${r.color}18`}>
                  <text x={25} y={26} textAnchor="middle" fill={T.text} fontSize={10} fontFamily="Chillax" fontWeight="700">{r.val}%</text>
                </RadialProgress>
                <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Games Tab ──────────────────────────────────────────────────────────────
  const renderGames = () => (
    <div key="games">
      <div className="stat-grid anim-in">
        {[
          { label:"Total Games Played", value:"144", pct:+18, color:"#9D79FF", sparkData:data.map((_,i)=>rand(3,12)) },
          { label:"Best WPM (TypeRacer)", value:"72",  pct:+9,  color:"#60a5fa", sparkData:data.map(()=>rand(55,75)) },
          { label:"Best Combo (Drop)",    value:"14x", pct:+3,  color:"#34d399", sparkData:data.map(()=>rand(5,16)) },
          { label:"NEURAL XP Earned",    value:"5,300", pct:+22, color:"#fbbf24", sparkData:data.map(d=>d.xp) },
        ].map((s,i) => (
          <div key={i} className={`stat-card anim-in-${i+1}`}>
            <div style={{ position:"absolute", inset:0, borderRadius:18, background:`${s.color}08` }}/>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-delta" style={{ color:T.green }}>
              <span>▲</span><span>{s.pct}%</span>
              <span style={{ color:T.muted, fontWeight:400, fontSize:11 }}>vs last period</span>
            </div>
            <div className="stat-sparkline"><Sparkline data={s.sparkData} color={s.color} filled width={90} height={32}/></div>
          </div>
        ))}
      </div>

      <div className="main-grid anim-in-2">
        <div className="card">
          <div className="card-title">Game Performance</div>
          <div className="card-sub">Across all NEURAL mini-games</div>
          {gamesData.map((g,i) => (
            <div key={i} className="game-row">
              <div className="game-icon-wrap">{g.icon}</div>
              <div style={{ flex:1 }}>
                <div className="game-name">{g.name}</div>
                <div style={{ fontSize:10, color:T.muted, marginTop:1 }}>{g.plays} plays · avg score {g.avgScore}%</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <span className="game-xp">+{g.xp.toLocaleString()} XP</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="card">
            <div className="card-title">Game XP Distribution</div>
            <div className="card-sub">Total contribution per game</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:4 }}>
              {gamesData.map((g,i)=>{
                const totalXPGames = gamesData.reduce((a,b)=>a+b.xp,0);
                const pct = totalXPGames > 0 ? Math.round((g.xp/totalXPGames)*100) : 0;
                const cols = ["#9D79FF","#60a5fa","#34d399","#fbbf24","#f87171"];
                return (
                  <div key={i}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:3 }}>
                      <span style={{ fontWeight:500 }}>{g.icon} {g.name}</span>
                      <span style={{ fontFamily:"'JetBrains Mono'", color:cols[i] }}>{pct}%</span>
                    </div>
                    <div style={{ height:6, borderRadius:3, background:T.s3, overflow:"hidden" }}>
                      <div style={{ height:6, borderRadius:3, width:`${pct}%`, background:cols[i], transition:"width 1s ease" }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Play Frequency</div>
            <div className="card-sub">Sessions per game this {range}</div>
            <svg width="100%" height="100" viewBox="0 0 260 100" preserveAspectRatio="xMidYMid meet">
              {gamesData.map((g,i)=>{
                const barW=36, gap=14, maxPlays=Math.max(...gamesData.map(g=>g.plays)) || 1;
                const x=i*(barW+gap)+10, h=(g.plays/maxPlays)*80;
                const cols=["#9D79FF","#60a5fa","#34d399","#fbbf24","#f87171"];
                return (
                  <g key={i}>
                    <rect x={x} y={80-h} width={barW} height={h} rx={5} fill={cols[i]} opacity={0.85}/>
                    <text x={x+barW/2} y={96} textAnchor="middle" fontSize={8} fill={T.muted} fontFamily="Chillax">{g.icon}</text>
                    <text x={x+barW/2} y={78-h} textAnchor="middle" fontSize={8} fill={cols[i]} fontFamily="JetBrains Mono">{g.plays}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Subjects Tab ───────────────────────────────────────────────────────────
  const renderSubjects = () => (
    <div key="subjects">
      <div className="main-grid-3 anim-in">
        {subjectsData.map((s: any, i: number) => (
          <div key={i} className={`card anim-in-${i+1}`} style={{ borderTop:`3px solid ${s.color}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:`${s.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:700 }}>{s.name}</div>
                <div style={{ fontSize:11, color:T.muted }}>{s.sessions} sessions</div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"flex-end", gap:16, marginBottom:12 }}>
              <div>
                <div style={{ fontSize:11, color:T.muted, marginBottom:3 }}>Mastery</div>
                <div style={{ fontSize:32, fontWeight:700, letterSpacing:"-0.8px", color:s.color }}>{s.mastery}%</div>
              </div>
              <div style={{ marginBottom:6 }}>
                <Sparkline data={Array.from({length:14},()=>rand(s.mastery-15,s.mastery+5))} color={s.color} height={40} width={80}/>
              </div>
            </div>
            <div className="level-bar-bg"><div className="level-bar-fill" style={{ width:`${s.mastery}%`, background:s.color }}/></div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
              <span style={{ fontSize:11, color:T.muted }}>Cards reviewed</span>
              <span style={{ fontSize:12, fontWeight:700, fontFamily:"'JetBrains Mono'", color:s.color }}>{s.totalCardsReviewed || 0}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
              <span style={{ fontSize:11, color:T.muted }}>Trend</span>
              <span style={{ fontSize:12, fontWeight:700, color:s.trend>=0?T.green:T.red }}>{s.trend>=0?"+":""}{s.trend}%</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
              <span style={{ fontSize:11, color:T.muted }}>Avg focus</span>
              <span style={{ fontSize:12, fontWeight:700, fontFamily:"'JetBrains Mono'", color:T.accent }}>{s.mastery > 0 ? Math.min(100, s.mastery + 5) : 0}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card anim-in-2">
        <div className="card-title">Comparative Mastery Radar</div>
        <div className="card-sub">How subjects stack up against each other</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"16px 0" }}>
          <svg width="280" height="240" viewBox="0 0 280 240">
            {/* Pentagon grid */}
            {[0.2,0.4,0.6,0.8,1].map((r,ri)=>{
              const pts = subjectsData.map((_: any, i: number) => {
                const angle = (i/subjectsData.length)*Math.PI*2 - Math.PI/2;
                return `${140+r*100*Math.cos(angle)},${120+r*100*Math.sin(angle)}`;
              }).join(" ");
              return <polygon key={ri} points={pts} fill="none" stroke="rgba(157,121,255,0.12)" strokeWidth={1}/>;
            })}
            {/* Axes */}
            {subjectsData.map((_: any, i: number) => {
              const angle=(i/subjectsData.length)*Math.PI*2-Math.PI/2;
              return <line key={i} x1={140} y1={120} x2={140+100*Math.cos(angle)} y2={120+100*Math.sin(angle)} stroke="rgba(157,121,255,0.1)" strokeWidth={1}/>;
            })}
            {/* Data polygon */}
            <polygon
              points={subjectsData.map((s: any,i: number)=>{
                const angle=(i/subjectsData.length)*Math.PI*2-Math.PI/2;
                const r=(s.mastery/100)*100;
                return `${140+r*Math.cos(angle)},${120+r*Math.sin(angle)}`;
              }).join(" ")}
              fill="rgba(157,121,255,0.2)" stroke="#9D79FF" strokeWidth={2}
            />
            {/* Labels */}
            {subjectsData.map((s: any,i: number)=>{
              const angle=(i/subjectsData.length)*Math.PI*2-Math.PI/2;
              const lx=140+118*Math.cos(angle), ly=120+118*Math.sin(angle);
              return (
                <g key={i}>
                  <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill={T.text} fontFamily="Chillax" fontWeight="600">{s.icon}</text>
                  <text x={lx} y={ly+13} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill={T.muted} fontFamily="Chillax">{s.name.split(" ")[0]}</text>
                </g>
              );
            })}
            {/* Center dot */}
            <circle cx={140} cy={120} r={3} fill="#9D79FF"/>
          </svg>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return (
    <>
      <style>{css}</style>
      <div className="lad-root">
        {/* Topbar */}
        <div className="lad-topbar">
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div className="lad-logo" style={{ cursor: 'pointer' }}><div className="lad-logo-dot"/>lumiu</div>
          </Link>
          <span className="lad-badge">Analytics</span>

          <div className="lad-tabs">
            {([["overview","Overview"],["focus","Focus"],["games","Games"],["subjects","Subjects"]] as [Tab,string][]).map(([id,label])=>(
              <button key={id} className={`lad-tab ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{label}</button>
            ))}
          </div>

          <div className="lad-topbar-right">
            <div style={{ fontSize:12, color:T.muted, fontFamily:"'JetBrains Mono'" }}>{dateStr}</div>
            <div className="range-group">
              {(["7d","30d","90d"] as Range[]).map(r=>(
                <button key={r} className={`range-btn ${range===r?"active":""}`} onClick={()=>setRange(r)}>{r==="7d"?"7 days":r==="30d"?"30 days":"90 days"}</button>
              ))}
            </div>
            <button className="dl-btn" onClick={() => window.print()}>⬇ Export Report</button>
            <button className="dark-toggle" onClick={()=>setIsDark(!isDark)}>
              {isDark?"🌙":"☀️"}
              <div className="tog-track"><div className="tog-thumb"/></div>
              {isDark?"Dark":"Light"}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="lad-body">
          {/* Page header */}
          <div style={{ marginBottom:20 }}>
            <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:"-0.5px" }}>
              {tab==="overview"?"Analytics Dashboard":tab==="focus"?"Focus & Attention":tab==="games"?"NEURAL Games Analytics":"Subject Mastery"}
            </h1>
            <p style={{ fontSize:13, color:T.muted, marginTop:3 }}>
              {tab==="overview"?"Track your full learning journey across all Lumiu modules":tab==="focus"?"Understand your cognitive patterns and optimise your study sessions":tab==="games"?"Performance breakdown across all 5 NEURAL mini-games":"Deep dive into each subject's progress and retention"}
            </p>
          </div>

          {/* Insight bar (always visible) */}
          <div className="insight-bar">
            <div className="insight-icon">💡</div>
            <div className="insight-text" key={insightIdx} style={{ animation:"fade-up 0.4s ease" }}>{INSIGHTS[insightIdx]}</div>
            <div className="insight-dots">
              {INSIGHTS.map((_,i)=><div key={i} className="insight-dot" style={{ opacity:i===insightIdx?1:0.25 }}/>)}
            </div>
            <button className="dl-btn" style={{ flexShrink:0 }} onClick={() => window.print()}>⬇ Export</button>
          </div>

          {/* Tab content */}
          {tab === "overview"  && renderOverview()}
          {tab === "focus"     && renderFocus()}
          {tab === "games"     && renderGames()}
          {tab === "subjects"  && renderSubjects()}
        </div>
      </div>
    </>
  );
}
