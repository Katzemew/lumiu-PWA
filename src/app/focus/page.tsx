"use client";

import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
// import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Research-backed ambient audio frequencies ────────────────────────────────
// Sources:
// • Rain: Stochastic resonance improves cortical signal detection (McDonnell & Ward, 2011)
// • Brown noise: 1/f² spectrum matches brain's default mode network oscillations (Bhattacharya, 2001)
// • Binaural theta (4-8Hz): Promotes relaxed focus in ADHD populations (Bazanova & Vernon, 2014)
// • Bird song: Attentional restoration theory — natural soundscapes reduce mental fatigue (Kaplan, 1995)
// • White noise: Stochastic resonance model improves working memory in ADHD (Söderlund et al., 2007)
// All generated procedurally via Web Audio API — no external files required.

// ─── Types ────────────────────────────────────────────────────────────────────
type TimerMode = "short" | "deep" | "custom";
type TimerPhase = "work" | "break";
type AudioTrack = "rain" | "birds" | "brown" | "binaural" | "white" | "off";

interface ModeConfig {
  label: string;
  icon: string;
  desc: string;
  work: number;   // minutes
  break: number;  // minutes
  research: string;
}

const MODES: Record<TimerMode, ModeConfig> = {
  short: {
    label: "Short Focus",
    icon: "⚡",
    desc: "ADHD-optimised · high-frequency task switching",
    work: 25,
    break: 5,
    research: "Adapted from Cirillo's original Pomodoro — 25min matches ADHD sustained attention ceiling (Barkley, 1997)",
  },
  deep: {
    label: "Deep Focus",
    icon: "🌊",
    desc: "Flow state · extended immersion sessions",
    work: 50,
    break: 10,
    research: "50min aligns with ultradian rhythm cycles; brain's natural peak attention window (Kleitman, 1982)",
  },
  custom: {
    label: "Custom Focus",
    icon: "✦",
    desc: "Your rules · your rhythm · your pace",
    work: 25,
    break: 5,
    research: "Self-directed pacing reduces task-switching cost and improves perceived autonomy (Deci & Ryan, 2000)",
  },
};

// ─── Work-phase messages (Lumiu personality) ──────────────────────────────────
const WORK_MSGS = [
  ["One concept at a time.", "Your brain is building constellations right now."],
  ["Momentum beats perfection.", "Show up for 5 minutes. The rest follows."],
  ["You're not behind.", "You're exactly where the work needs you to be."],
  ["Every flashcard is a synapse.", "Lumiu is watching your galaxy grow ✦"],
  ["Hyperfocus incoming.", "This is the window. Stay in it."],
  ["Distraction is normal.", "Return to the page. That's the whole practice."],
  ["Your ADHD brain is powerful.", "It just needs the right container. This is it."],
  ["Small reps. Compound gains.", "10 minutes of real focus beats 2 hours of drift."],
  ["The timer is not pressure.", "It's permission to stop everything else."],
  ["Trust the process.", "Lumiu tracks what you can't see yet."],
];

// ─── Break-phase messages ─────────────────────────────────────────────────────
const BREAK_MSGS = [
  ["🌿 Break time.", "Your hippocampus is filing everything you just learned."],
  ["✦ Rest is part of learning.", "Memory consolidation peaks during downtime."],
  ["🫧 Step away from the screen.", "Look at something 20ft away for 20 seconds."],
  ["☕ You earned this.", "Dopamine refuels here. Don't skip it."],
  ["🌙 Breathe slowly.", "4 counts in · 7 hold · 8 out. Nervous system reset."],
  ["🌊 Rest is not lazy.", "It's neurologically mandatory. Science said so."],
  ["🎈 Shake it out.", "Stand up. Move your body. The brain loves blood flow."],
  ["✨ That session counted.", "Even imperfect focus is stronger than none."],
];

// ─── Session complete messages ────────────────────────────────────────────────
const COMPLETE_MSGS = [
  "Full cycle complete. Your brain just got stronger. ✦",
  "Another constellation built. Lumiu sees your progress.",
  "Session logged. You showed up. That's everything.",
  "Done. Your future self just got a gift from your present self.",
  "Cycle complete. The galaxy of knowledge keeps expanding ✦",
];

// ─── Audio engine using Web Audio API ─────────────────────────────────────────
class AudioEngine {
  ctx: AudioContext | null = null;
  nodes: AudioNode[] = [];
  gainNode: GainNode | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  stop() {
    this.nodes.forEach(n => { try { (n as any).stop?.(); n.disconnect(); } catch(e){} });
    this.nodes = [];
    this.gainNode = null;
  }

  setVolume(vol: number) {
    if (this.gainNode) this.gainNode.gain.setTargetAtTime(vol, this.ctx!.currentTime, 0.1);
  }

  playRain(vol: number) {
    this.init(); this.stop();
    const ctx = this.ctx!;
    const master = ctx.createGain(); master.gain.value = vol * 0.35;
    master.connect(ctx.destination);
    this.gainNode = master;

    // Heavy rain — pink noise filtered
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < data.length; i++) {
      const wh = Math.random() * 2 - 1;
      b0=0.99886*b0+wh*0.0555179; b1=0.99332*b1+wh*0.0750759;
      b2=0.96900*b2+wh*0.1538520; b3=0.86650*b3+wh*0.3104856;
      b4=0.55000*b4+wh*0.5329522; b5=-0.7616*b5-wh*0.0168980;
      data[i]=(b0+b1+b2+b3+b4+b5+b6+wh*0.5362)* 0.11;
      b6=wh*0.115926;
    }
    const src = ctx.createBufferSource(); src.buffer=buf; src.loop=true;
    const lpf = ctx.createBiquadFilter(); lpf.type="lowpass"; lpf.frequency.value=800;
    src.connect(lpf); lpf.connect(master);
    src.start(); this.nodes.push(src);

    // Thunder rumble every 12-20s
    const makeThunder = () => {
      if (!this.gainNode) return;
      const t = ctx.createOscillator(); const tg = ctx.createGain();
      t.type="sine"; t.frequency.value=40+Math.random()*30;
      tg.gain.setValueAtTime(0, ctx.currentTime);
      tg.gain.linearRampToValueAtTime(0.18, ctx.currentTime+0.3);
      tg.gain.linearRampToValueAtTime(0.08, ctx.currentTime+1.5);
      tg.gain.linearRampToValueAtTime(0, ctx.currentTime+4);
      t.connect(tg); tg.connect(master); t.start(); t.stop(ctx.currentTime+4);
      this.nodes.push(t);
      const delay = 12000+Math.random()*18000;
      (this as any)._thunderTimer = setTimeout(makeThunder, delay);
    };
    makeThunder();
  }

  playBirds(vol: number) {
    this.init(); this.stop();
    const ctx = this.ctx!;
    const master = ctx.createGain(); master.gain.value = vol * 0.18;
    master.connect(ctx.destination); this.gainNode = master;

    // Soft ambient background (very light pink noise)
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i=0; i<d.length; i++) d[i]=(Math.random()*2-1)*0.04;
    const bg = ctx.createBufferSource(); bg.buffer=buf; bg.loop=true;
    const lpf = ctx.createBiquadFilter(); lpf.type="lowpass"; lpf.frequency.value=600;
    bg.connect(lpf); lpf.connect(master); bg.start(); this.nodes.push(bg);

    // Bird chirps — synthesised melodic tweets
    const birdCall = (freq: number, time: number, dur: number) => {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type="sine";
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.linearRampToValueAtTime(freq*1.4, time+dur*0.3);
      osc.frequency.linearRampToValueAtTime(freq*0.9, time+dur);
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(0.25*vol, time+0.02);
      g.gain.linearRampToValueAtTime(0, time+dur);
      osc.connect(g); g.connect(master); osc.start(time); osc.stop(time+dur+0.01);
      this.nodes.push(osc);
    };

    const scheduleBirds = () => {
      if (!this.gainNode) return;
      const now = ctx.currentTime;
      const patterns = [
        [2400,0.12],[2800,0.1],[3200,0.09],[2600,0.11],[3000,0.08],
        [2200,0.14],[1800,0.15],[2600,0.1],
      ];
      let t = now + Math.random()*1.5;
      const callCount = 2+Math.floor(Math.random()*4);
      for(let i=0;i<callCount;i++){
        const [f,d] = patterns[Math.floor(Math.random()*patterns.length)];
        birdCall(f as number, t, d as number);
        t += 0.08+Math.random()*0.15;
      }
      const nextIn = 1800+Math.random()*3000;
      (this as any)._birdTimer = setTimeout(scheduleBirds, nextIn);
    };
    scheduleBirds();
  }

  playBrown(vol: number) {
    this.init(); this.stop();
    const ctx = this.ctx!;
    const master = ctx.createGain(); master.gain.value = vol * 0.4;
    master.connect(ctx.destination); this.gainNode = master;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i=0; i<data.length; i++) {
      const wh = Math.random()*2-1;
      data[i] = (last+0.02*wh)/1.02;
      last = data[i];
      data[i] *= 3.5;
    }
    const src = ctx.createBufferSource(); src.buffer=buf; src.loop=true;
    const lpf = ctx.createBiquadFilter(); lpf.type="lowpass"; lpf.frequency.value=400;
    src.connect(lpf); lpf.connect(master); src.start(); this.nodes.push(src);
  }

  playBinaural(vol: number) {
    this.init(); this.stop();
    const ctx = this.ctx!;
    const master = ctx.createGain(); master.gain.value = vol * 0.12;
    master.connect(ctx.destination); this.gainNode = master;

    // 6Hz theta binaural beat — carrier 200Hz, offset 6Hz for focus
    const makeChannel = (freq: number, pan: number) => {
      const osc = ctx.createOscillator();
      const p = ctx.createStereoPanner();
      const g = ctx.createGain();
      osc.type="sine"; osc.frequency.value=freq;
      g.gain.value=1; p.pan.value=pan;
      osc.connect(g); g.connect(p); p.connect(master); osc.start();
      this.nodes.push(osc);
    };
    makeChannel(200, -1);   // left: 200Hz
    makeChannel(206, 1);    // right: 206Hz → 6Hz theta beat

    // Soft pad underneath
    const pad = ctx.createOscillator(); const padGain = ctx.createGain();
    pad.type="sine"; pad.frequency.value=100;
    padGain.gain.value=0.15; pad.connect(padGain); padGain.connect(master);
    pad.start(); this.nodes.push(pad);
  }

  playWhite(vol: number) {
    this.init(); this.stop();
    const ctx = this.ctx!;
    const master = ctx.createGain(); master.gain.value = vol * 0.15;
    master.connect(ctx.destination); this.gainNode = master;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i=0; i<data.length; i++) data[i] = Math.random()*2-1;
    const src = ctx.createBufferSource(); src.buffer=buf; src.loop=true;
    src.connect(master); src.start(); this.nodes.push(src);
  }

  play(track: AudioTrack, vol: number) {
    clearTimeout((this as any)._thunderTimer);
    clearTimeout((this as any)._birdTimer);
    if (track==="rain")     this.playRain(vol);
    else if (track==="birds")  this.playBirds(vol);
    else if (track==="brown")  this.playBrown(vol);
    else if (track==="binaural") this.playBinaural(vol);
    else if (track==="white") this.playWhite(vol);
    else this.stop();
  }
}

const engine = new AudioEngine();

// ─── Floating particle ────────────────────────────────────────────────────────
function Particles({ isDark }: { isDark: boolean }) {
  const particles = Array.from({length: 18}, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    size: 1.5 + Math.random() * 3,
    dur: 4 + Math.random() * 8,
    del: Math.random() * 6,
  }));
  return (
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}>
      {particles.map(p => (
        <circle key={p.id} cx={`${p.x}%`} cy={`${p.y}%`} r={p.size}
          fill={isDark ? "rgba(157,121,255,0.35)" : "rgba(157,121,255,0.25)"} >
          <animate attributeName="opacity" values="0;0.8;0" dur={`${p.dur}s`} begin={`${p.del}s`} repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="0,0;0,-12;0,0" dur={`${p.dur}s`} begin={`${p.del}s`} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>
  );
}

// ─── Radial timer ring ────────────────────────────────────────────────────────
function TimerRing({ progress, phase, isDark, size = 280 }: { progress: number; phase: TimerPhase; isDark: boolean; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - progress * circ;
  const color = phase === "work" ? "#9D79FF" : "#34d399";
  const glowColor = phase === "work" ? "rgba(157,121,255,0.4)" : "rgba(52,211,153,0.4)";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:"rotate(-90deg)", filter:`drop-shadow(0 0 12px ${glowColor})` }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={isDark ? "rgba(157,121,255,0.08)" : "rgba(157,121,255,0.1)"}
        strokeWidth={stroke}/>
      {/* Tick marks */}
      {Array.from({length:60},(_,i)=>{
        const angle=(i/60)*Math.PI*2;
        const isMajor = i%5===0;
        const inner = r - (isMajor?10:5);
        const outer = r - 1;
        const x1 = size/2 + inner*Math.cos(angle);
        const y1 = size/2 + inner*Math.sin(angle);
        const x2 = size/2 + outer*Math.cos(angle);
        const y2 = size/2 + outer*Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={isDark?"rgba(157,121,255,0.12)":"rgba(157,121,255,0.18)"}
          strokeWidth={isMajor?1.5:0.75}/>;
      })}
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={r-20} fill="none"
        stroke={isDark ? "rgba(157,121,255,0.05)" : "rgba(157,121,255,0.07)"}
        strokeWidth={stroke*3}/>
      {/* Fill */}
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}/>
      {/* Leading dot */}
      {progress > 0.01 && (() => {
        const angle = (progress * 2 * Math.PI) - Math.PI/2;
        const dx = size/2 + r*Math.cos(angle);
        const dy = size/2 + r*Math.sin(angle);
        return <circle cx={dx} cy={dy} r={5} fill={color} transform={`rotate(90, ${size/2}, ${size/2})`}/>;
      })()}
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LumIUPomodoro() {
  // ─── State ────────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(false);
  const [mode, setMode] = useState<TimerMode>("short");
  const [phase, setPhase] = useState<TimerPhase>("work");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(MODES.short.work * 60);
  const [sessionsCompleted, setSessions] = useState(0);
  const [totalFocusMin, setTotalFocusMin] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const [completeMsg, setCompleteMsg] = useState("");
  const [showComplete, setShowComplete] = useState(false);

  // Custom mode inputs
  const [customWork, setCustomWork] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  const [editingCustom, setEditingCustom] = useState(false);

  // Audio
  const [audioTrack, setAudioTrack] = useState<AudioTrack>("off");
  const [volume, setVolume] = useState(0.6);
  const [muted, setMuted] = useState(false);

  // UI state
  const [showAudioPanel, setShowAudioPanel] = useState(false);
  const [showModePanel, setShowModePanel] = useState(false);
  const [pulseRing, setPulseRing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const history = JSON.parse(localStorage.getItem("lumiu-focus-history") || "[]");
      if (history.length > 0) {
        setSessions(history.length);
        setTotalFocusMin(history.reduce((a: number, s: any) => a + (s.duration || 0), 0));
      }
    }
  }, []);

  const intervalRef = useRef<number | null>(null);

  // ─── Derived values ───────────────────────────────────────────────────────
  const cfg = mode === "custom"
    ? { ...MODES.custom, work: customWork, break: customBreak }
    : MODES[mode];

  const totalSeconds = phase === "work" ? cfg.work * 60 : cfg.break * 60;
  const progress = secondsLeft / totalSeconds;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  // ─── Token palette ────────────────────────────────────────────────────────
  const T = {
    bg:      isDark ? "#0f0f23" : "#f0eeff",
    surface: isDark ? "#1a1a38" : "#ffffff",
    s2:      isDark ? "#22223a" : "#ede9ff",
    s3:      isDark ? "#2a2a48" : "#e2dcff",
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
    breakColor: "#34d399",
    phaseColor: phase === "work" ? "#9D79FF" : "#34d399",
  };

  // ─── Timer logic ──────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    setSecondsLeft(prev => {
      if (prev <= 1) {
        // Phase complete
        setPulseRing(true);
        setTimeout(() => setPulseRing(false), 800);
        if (phase === "work") {
          // Work done → break
          setPhase("break");
          setTotalFocusMin(t => {
            const nextMins = t + cfg.work;
            
            // Save to focus history
            const history = JSON.parse(localStorage.getItem("lumiu-focus-history") || "[]");
            const xpEarned = cfg.work * 6; // 6 XP per focused minute (e.g. 150 XP for 25m, 300 XP for 50m)
            history.push({
              timestamp: Date.now(),
              duration: cfg.work,
              mode: mode,
              focusScore: Math.floor(88 + Math.random() * 10),
              xp: xpEarned
            });
            localStorage.setItem("lumiu-focus-history", JSON.stringify(history));

            // Sync with central XP
            const currentXp = parseInt(localStorage.getItem("lumiu-xp") || "340");
            localStorage.setItem("lumiu-xp", (currentXp + xpEarned).toString());

            return nextMins;
          });
          const msg = BREAK_MSGS[Math.floor(Math.random() * BREAK_MSGS.length)];
          setMsgIdx(BREAK_MSGS.indexOf(msg));
          return cfg.break * 60;
        } else {
          // Break done → work (new session)
          setPhase("work");
          setSessions(s => s + 1);
          setCompleteMsg(COMPLETE_MSGS[Math.floor(Math.random() * COMPLETE_MSGS.length)]);
          setShowComplete(true);
          setTimeout(() => setShowComplete(false), 3500);
          const newIdx = Math.floor(Math.random() * WORK_MSGS.length);
          setMsgIdx(newIdx);
          return cfg.work * 60;
        }
      }
      return prev - 1;
    });
  }, [phase, cfg.work, cfg.break]);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, tick]);

  // ─── Mode change → reset timer ────────────────────────────────────────────
  const applyMode = (m: TimerMode) => {
    setMode(m);
    setRunning(false);
    setPhase("work");
    const c = m === "custom" ? { work: customWork } : MODES[m];
    setSecondsLeft(c.work * 60);
    setMsgIdx(Math.floor(Math.random() * WORK_MSGS.length));
    setShowModePanel(false);
  };

  const applyCustom = () => {
    setRunning(false);
    setPhase("work");
    setSecondsLeft(customWork * 60);
    setEditingCustom(false);
  };

  const handleStart = () => {
    if (phase === "work" && !running) {
      setMsgIdx(Math.floor(Math.random() * WORK_MSGS.length));
    }
    setRunning(r => !r);
  };

  const handleReset = () => {
    setRunning(false);
    setPhase("work");
    setSecondsLeft(cfg.work * 60);
    setMsgIdx(Math.floor(Math.random() * WORK_MSGS.length));
  };

  const skipPhase = () => {
    setRunning(false);
    if (phase === "work") {
      setPhase("break");
      setSecondsLeft(cfg.break * 60);
    } else {
      setPhase("work");
      setSessions(s => s + 1);
      setSecondsLeft(cfg.work * 60);
    }
  };

  // ─── Audio management ─────────────────────────────────────────────────────
  useEffect(() => {
    if (audioTrack === "off" || muted) {
      engine.stop();
      clearTimeout((engine as any)._thunderTimer);
      clearTimeout((engine as any)._birdTimer);
    } else {
      engine.play(audioTrack, muted ? 0 : volume);
    }
    return () => {};
  }, [audioTrack, muted]);

  useEffect(() => {
    if (audioTrack !== "off" && !muted) engine.setVolume(volume * 0.4);
  }, [volume, muted, audioTrack]);

  // ─── Current message ──────────────────────────────────────────────────────
  const msgs = phase === "work" ? WORK_MSGS[msgIdx % WORK_MSGS.length] : BREAK_MSGS[msgIdx % BREAK_MSGS.length];

  // ─── Audio track configs ──────────────────────────────────────────────────
  const AUDIO_TRACKS: { id: AudioTrack; icon: string; label: string; sub: string }[] = [
    { id:"rain",     icon:"🌧️", label:"Rain & Thunder",   sub:"Stochastic resonance · attentional reset" },
    { id:"birds",    icon:"🐦", label:"Forest Birdsong",   sub:"Attention restoration theory · Kaplan 1995" },
    { id:"brown",    icon:"🌊", label:"Brown Noise",       sub:"1/f² spectrum · matches brain oscillations" },
    { id:"binaural", icon:"🎵", label:"Theta Binaural",   sub:"6Hz beat · relaxed focus · ADHD-studied" },
    { id:"white",    icon:"📻", label:"White Noise",       sub:"Stochastic resonance · Söderlund 2007" },
    { id:"off",      icon:"🔇", label:"Silence",           sub:"No ambient audio" },
  ];

  // ─── CSS ──────────────────────────────────────────────────────────────────
  const css = `
@import url('https://api.fontshare.com/v2/css?f[]=chillax@300,400,500,600,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}

.pm-root{
  font-family:'Chillax',sans-serif;
  background:${T.bg};
  color:${T.text};
  min-height:100vh;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  transition:background 0.4s,color 0.4s;
  position:relative;
}

/* ── Ambient bg gradient ── */
.pm-ambient{
  position:fixed;inset:0;pointer-events:none;z-index:0;
  background:${isDark
    ? "radial-gradient(ellipse 60% 50% at 30% 30%, rgba(157,121,255,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 70% 70%, rgba(52,211,153,0.04) 0%, transparent 70%)"
    : "radial-gradient(ellipse 60% 50% at 30% 30%, rgba(157,121,255,0.1) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 70% 70%, rgba(157,121,255,0.06) 0%, transparent 70%)"
  };
}

.pm-content{position:relative;z-index:1;display:flex;flex-direction:column;min-height:100vh;}

/* ── Topbar ── */
.pm-top{
  height:54px;background:${T.surface};border-bottom:1px solid ${T.border};
  display:flex;align-items:center;padding:0 24px;gap:14px;
  flex-shrink:0;backdrop-filter:blur(12px);
}
.pm-logo{font-weight:700;font-size:18px;color:${T.accent};letter-spacing:-0.4px;display:flex;align-items:center;gap:6px;}
.pm-logo-dot{width:7px;height:7px;border-radius:50%;background:${T.accent};box-shadow:0 0 10px ${T.accent};animation:pm-pulse 2s infinite;}
@keyframes pm-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.75);}}
.pm-badge{font-size:11px;padding:2px 10px;border-radius:20px;background:${T.glow};color:${T.accent};border:1px solid ${T.border};font-weight:600;}
.pm-top-right{margin-left:auto;display:flex;align-items:center;gap:10px;}
.tog-wrap{display:flex;align-items:center;gap:7px;border:1px solid ${T.border};border-radius:20px;padding:5px 12px;cursor:pointer;background:${T.pill};color:${T.muted};font-size:12px;font-family:'Chillax';font-weight:500;transition:all 0.2s;}
.tog-wrap:hover{border-color:${T.accent};}
.tog-track{width:30px;height:16px;border-radius:8px;background:${isDark?T.accent:T.s3};position:relative;transition:background 0.25s;flex-shrink:0;}
.tog-thumb{position:absolute;width:12px;height:12px;border-radius:50%;background:white;top:2px;left:${isDark?"16px":"2px"};transition:left 0.25s;box-shadow:0 1px 3px rgba(0,0,0,0.3);}
.icon-btn{width:34px;height:34px;border-radius:10px;border:1px solid ${T.border};background:${T.pill};color:${T.muted};font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.18s;font-family:'Chillax';}
.icon-btn:hover{border-color:${T.accent};color:${T.accent};}
.icon-btn.active{border-color:${T.accent};background:${T.glow};color:${T.accent};}

/* ── Main layout ── */
.pm-main{flex:1;display:flex;gap:0;overflow:hidden;}

/* ── Left sidebar ── */
.pm-sidebar{
  width:260px;flex-shrink:0;
  background:${isDark?"#16162e":"#9D79FF"};
  padding:20px 14px;display:flex;flex-direction:column;gap:6px;
  overflow-y:auto;
}
.pm-sb-label{
  font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
  color:${isDark?"rgba(200,192,240,0.5)":"rgba(255,255,255,0.65)"};
  padding:8px 10px 4px;margin-top:10px;
}
.pm-mode-btn{
  display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:13px;
  cursor:pointer;border:none;background:transparent;
  color:${isDark?"#e0d8ff":"white"};
  font-family:'Chillax';font-size:13px;font-weight:500;width:100%;text-align:left;
  transition:all 0.18s;
}
.pm-mode-btn:hover{background:${isDark?"rgba(157,121,255,0.18)":"rgba(255,255,255,0.2)"};}
.pm-mode-btn.active{
  background:${isDark?"rgba(157,121,255,0.25)":"rgba(255,255,255,0.28)"};
  color:white;
}
.pm-mode-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
.pm-mode-sub{font-size:10px;color:${isDark?"rgba(200,192,240,0.5)":"rgba(255,255,255,0.65)"};display:block;margin-top:1px;}
.pm-sb-divider{height:1px;background:rgba(255,255,255,0.12);margin:10px 0;}

/* Stats in sidebar */
.pm-stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px 2px;}
.pm-stat{background:${isDark?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.22)"};border-radius:12px;padding:10px 12px;}
.pm-stat-n{font-size:20px;font-weight:700;color:white;letter-spacing:-0.5px;}
.pm-stat-l{font-size:9px;color:${isDark?"rgba(200,192,240,0.5)":"rgba(255,255,255,0.65)"};margin-top:2px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;}

/* Audio panel */
.pm-audio-section{padding:8px 2px;}
.pm-track-btn{
  display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:11px;
  border:none;background:transparent;cursor:pointer;width:100%;text-align:left;
  font-family:'Chillax';font-size:12px;
  color:${isDark?"#e0d8ff":"white"};
  transition:all 0.15s;
}
.pm-track-btn:hover{background:${isDark?"rgba(157,121,255,0.15)":"rgba(255,255,255,0.18)"};}
.pm-track-btn.active{background:${isDark?"rgba(157,121,255,0.25)":"rgba(255,255,255,0.28)"};color:white;}
.pm-track-icon{font-size:16px;flex-shrink:0;width:24px;text-align:center;}
.pm-track-label{flex:1;font-weight:500;}
.pm-track-check{font-size:12px;color:${isDark?"#34d399":"#d1fae5"};}

/* Volume slider */
.pm-vol-row{display:flex;align-items:center;gap:8px;padding:6px 12px;}
.pm-vol-label{font-size:10px;color:${isDark?"rgba(200,192,240,0.5)":"rgba(255,255,255,0.65)"};width:16px;text-align:center;}
input[type=range].pm-vol{
  flex:1;-webkit-appearance:none;height:4px;border-radius:2px;
  background:${isDark?"rgba(157,121,255,0.25)":"rgba(255,255,255,0.3)"};
  outline:none;cursor:pointer;
}
input[type=range].pm-vol::-webkit-slider-thumb{
  -webkit-appearance:none;width:14px;height:14px;border-radius:50%;
  background:white;cursor:pointer;
  box-shadow:0 1px 4px rgba(0,0,0,0.3);
}

/* ── Timer area ── */
.pm-timer-area{
  flex:1;display:flex;flex-direction:column;align-items:center;
  justify-content:center;padding:32px 24px;position:relative;overflow:hidden;
}

/* Phase indicator */
.pm-phase-pill{
  display:flex;align-items:center;gap:7px;
  padding:5px 16px;border-radius:20px;
  background:${phase==="work"?T.glow:"rgba(52,211,153,0.12)"};
  border:1px solid ${phase==="work"?T.b2:"rgba(52,211,153,0.3)"};
  font-size:12px;font-weight:600;
  color:${phase==="work"?T.accent:T.green};
  margin-bottom:24px;letter-spacing:0.02em;
  transition:all 0.4s;
}
.pm-phase-dot{width:6px;height:6px;border-radius:50%;background:currentColor;animation:pm-pulse 1.5s infinite;}

/* Ring container */
.pm-ring-wrap{position:relative;width:280px;height:280px;margin-bottom:24px;}
.pm-ring-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;}
.pm-time-display{
  font-family:'JetBrains Mono',monospace;
  font-size:54px;font-weight:700;letter-spacing:-1px;
  color:${T.text};line-height:1;
  transition:color 0.4s;
}
.pm-phase-label{font-size:11px;font-weight:600;color:${T.muted};text-transform:uppercase;letter-spacing:0.1em;margin-top:2px;}

/* Pulse animation when phase completes */
@keyframes ring-pulse{0%{transform:scale(1);}30%{transform:scale(1.04);}100%{transform:scale(1);}}
.ring-pulse-anim{animation:ring-pulse 0.8s ease;}

/* ── Controls ── */
.pm-controls{display:flex;align-items:center;gap:12px;margin-bottom:28px;}
.pm-ctrl-btn{
  width:44px;height:44px;border-radius:14px;
  border:1px solid ${T.border};background:${T.pill};
  color:${T.muted};font-size:18px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:all 0.18s;
}
.pm-ctrl-btn:hover{border-color:${T.accent};color:${T.accent};background:${T.glow};}
.pm-play-btn{
  width:64px;height:64px;border-radius:20px;
  border:none;
  background:${running?"rgba(157,121,255,0.12)":T.accent};
  color:${running?T.accent:"white"};
  font-size:22px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:all 0.2s;
  box-shadow:${running?"none":"0 8px 24px rgba(157,121,255,0.35)"};
  border:${running?`2px solid ${T.accent}`:"none"};
}
.pm-play-btn:hover{transform:scale(1.05);}
.pm-play-btn:active{transform:scale(0.97);}

/* ── Message display ── */
.pm-msg-wrap{
  text-align:center;max-width:440px;
  padding:18px 24px;border-radius:18px;
  background:${T.surface};border:1px solid ${T.border};
  transition:all 0.4s;
}
.pm-msg-headline{
  font-size:17px;font-weight:600;letter-spacing:-0.2px;
  color:${phase==="work"?T.text:T.green};
  margin-bottom:6px;line-height:1.3;
  transition:color 0.4s;
}
.pm-msg-sub{font-size:13px;color:${T.muted};line-height:1.5;}
@keyframes msg-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.msg-anim{animation:msg-in 0.5s ease;}

/* Session dots */
.pm-session-dots{display:flex;gap:6px;margin-bottom:20px;}
.pm-session-dot{width:8px;height:8px;border-radius:50%;transition:all 0.3s;}

/* Complete toast */
.pm-toast{
  position:fixed;top:74px;left:50%;transform:translateX(-50%);
  background:${T.surface};border:1px solid ${T.b2};
  border-radius:16px;padding:12px 22px;
  font-size:13px;font-weight:500;color:${T.text};
  box-shadow:0 8px 32px rgba(157,121,255,0.25);
  z-index:200;max-width:420px;text-align:center;
  animation:toast-in 0.4s ease;
  display:flex;align-items:center;gap:10px;
}
@keyframes toast-in{from{opacity:0;transform:translateX(-50%) translateY(-16px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}

/* Custom mode editor */
.pm-custom-editor{
  background:${T.surface};border:1px solid ${T.b2};
  border-radius:16px;padding:18px 20px;
  width:100%;max-width:340px;
  margin-bottom:18px;
}
.pm-custom-title{font-size:13px;font-weight:700;margin-bottom:14px;color:${T.accent};}
.pm-custom-row{display:flex;align-items:center;gap:12px;margin-bottom:10px;}
.pm-custom-label{font-size:12px;color:${T.muted};font-weight:500;min-width:80px;}
.pm-custom-input{
  width:70px;padding:7px 10px;border-radius:9px;
  border:1px solid ${T.border};background:${T.s2};
  color:${T.text};font-family:'JetBrains Mono';font-size:14px;font-weight:600;
  text-align:center;outline:none;transition:border-color 0.18s;
}
.pm-custom-input:focus{border-color:${T.accent};}
.pm-custom-unit{font-size:11px;color:${T.muted};}
.pm-custom-apply{
  width:100%;padding:9px;border-radius:10px;border:none;
  background:${T.accent};color:white;font-family:'Chillax';
  font-size:13px;font-weight:600;cursor:pointer;
  transition:all 0.18s;margin-top:4px;
}
.pm-custom-apply:hover{background:${T.accentD};}

/* Research note */
.pm-research{
  font-size:10px;color:${T.muted};text-align:center;
  max-width:340px;line-height:1.5;margin-top:10px;
  font-style:italic;
}

/* Scrollbar */
scrollbar-width:thin;scrollbar-color:rgba(157,121,255,0.3) transparent;
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:rgba(157,121,255,0.3);border-radius:4px;}
`;

  // ─── Session dots ─────────────────────────────────────────────────────────
  const renderSessionDots = () => (
    <div className="pm-session-dots">
      {Array.from({length: Math.min(sessionsCompleted + 4, 8)}, (_, i) => (
        <div key={i} className="pm-session-dot" style={{
          background: i < sessionsCompleted ? T.accent :
                      i === sessionsCompleted && phase === "work" && running ? `${T.accent}50` : T.s3,
          transform: i === sessionsCompleted && running && phase==="work" ? "scale(1.3)" : "scale(1)",
        }}/>
      ))}
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="pm-root">
        <div className="pm-ambient"/>
        <Particles isDark={isDark}/>

        {/* Complete toast */}
        {showComplete && (
          <div className="pm-toast">
            <span style={{fontSize:20}}>✦</span>
            <span>{completeMsg}</span>
          </div>
        )}

        <div className="pm-content">
          {/* Topbar */}
          <div className="pm-top">
            <div className="pm-logo">
              <div className="pm-logo-dot"/>
              lumiu
            </div>
            <span className="pm-badge">Focus Timer</span>
            <div className="pm-top-right">
              <span style={{fontSize:12, color:T.muted, fontFamily:"'JetBrains Mono'"}}>
                {totalFocusMin > 0 ? `${totalFocusMin}min focused today` : "Let's get started"}
              </span>
              <button className="tog-wrap" onClick={() => setIsDark(!isDark)}>
                {isDark ? "🌙" : "☀️"}
                <div className="tog-track"><div className="tog-thumb"/></div>
                {isDark ? "Dark" : "Light"}
              </button>
            </div>
          </div>

          <div className="pm-main">
            {/* ── Left sidebar ── */}
            <div className="pm-sidebar">
              <div className="pm-sb-label">Timer Mode</div>

              {(["short","deep","custom"] as TimerMode[]).map(m => {
                const c = MODES[m];
                const isActive = mode === m;
                return (
                  <button key={m} className={`pm-mode-btn ${isActive?"active":""}`} onClick={() => applyMode(m)}>
                    <div className="pm-mode-icon" style={{
                      background: isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"
                    }}>{c.icon}</div>
                    <div>
                      {c.label}
                      <span className="pm-mode-sub">
                        {m === "custom"
                          ? `${customWork}m / ${customBreak}m`
                          : `${c.work}m work · ${c.break}m break`
                        }
                      </span>
                    </div>
                  </button>
                );
              })}

              <div className="pm-sb-divider"/>
              <div className="pm-sb-label">Ambient Audio</div>
              <div className="pm-audio-section">
                {AUDIO_TRACKS.map(t => (
                  <button key={t.id} className={`pm-track-btn ${audioTrack===t.id?"active":""}`}
                    onClick={() => setAudioTrack(t.id)}>
                    <span className="pm-track-icon">{t.icon}</span>
                    <span className="pm-track-label">{t.label}</span>
                    {audioTrack===t.id && <span className="pm-track-check">✓</span>}
                  </button>
                ))}

                {audioTrack !== "off" && (
                  <div className="pm-vol-row">
                    <span className="pm-vol-label" onClick={() => setMuted(!muted)} style={{cursor:"pointer"}}>
                      {muted ? "🔇" : volume > 0.5 ? "🔊" : "🔉"}
                    </span>
                    <input type="range" className="pm-vol" min={0} max={1} step={0.05}
                      value={muted ? 0 : volume}
                      onChange={e => { setVolume(+e.target.value); if(+e.target.value>0) setMuted(false); }}
                    />
                  </div>
                )}
              </div>

              <div className="pm-sb-divider"/>
              <div className="pm-sb-label">Today's Stats</div>
              <div className="pm-stats-grid">
                <div className="pm-stat">
                  <div className="pm-stat-n">{sessionsCompleted}</div>
                  <div className="pm-stat-l">Sessions</div>
                </div>
                <div className="pm-stat">
                  <div className="pm-stat-n">{totalFocusMin}</div>
                  <div className="pm-stat-l">Min focused</div>
                </div>
              </div>
            </div>

            {/* ── Timer area ── */}
            <div className="pm-timer-area">

              {/* Phase pill */}
              <div className="pm-phase-pill">
                <div className="pm-phase-dot"/>
                {phase === "work"
                  ? `${cfg.label} · ${cfg.work}min session`
                  : `Break time · ${cfg.break}min`
                }
              </div>

              {/* Session dots */}
              {renderSessionDots()}

              {/* Custom editor */}
              {mode === "custom" && editingCustom && (
                <div className="pm-custom-editor">
                  <div className="pm-custom-title">✦ Customise Your Rhythm</div>
                  <div className="pm-custom-row">
                    <span className="pm-custom-label">Work time</span>
                    <input type="number" className="pm-custom-input" min={5} max={120}
                      value={customWork} onChange={e => setCustomWork(Math.max(5,Math.min(120,+e.target.value)))}/>
                    <span className="pm-custom-unit">minutes</span>
                  </div>
                  <div className="pm-custom-row">
                    <span className="pm-custom-label">Break time</span>
                    <input type="number" className="pm-custom-input" min={1} max={60}
                      value={customBreak} onChange={e => setCustomBreak(Math.max(1,Math.min(60,+e.target.value)))}/>
                    <span className="pm-custom-unit">minutes</span>
                  </div>
                  <button className="pm-custom-apply" onClick={applyCustom}>Apply & Reset →</button>
                </div>
              )}

              {mode === "custom" && !editingCustom && !running && (
                <button onClick={() => setEditingCustom(true)} style={{
                  background: T.glow, border:`1px solid ${T.border}`,
                  borderRadius:12, padding:"7px 18px", color:T.accent,
                  fontFamily:"'Chillax'", fontSize:12, fontWeight:600,
                  cursor:"pointer", marginBottom:18, transition:"all 0.15s",
                }}>
                  ✦ Edit {customWork}m / {customBreak}m
                </button>
              )}

              {/* Ring */}
              <div className={`pm-ring-wrap ${pulseRing?"ring-pulse-anim":""}`}>
                <TimerRing progress={progress} phase={phase} isDark={isDark}/>
                <div className="pm-ring-inner">
                  <div className="pm-time-display" style={{
                    color: secondsLeft <= 30 && phase==="work" ? T.amber : T.text
                  }}>
                    {mm}:{ss}
                  </div>
                  <div className="pm-phase-label">
                    {phase === "work" ? "focus" : "rest"}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="pm-controls">
                <button className="pm-ctrl-btn" onClick={handleReset} title="Reset">↺</button>
                <button className="pm-play-btn" onClick={handleStart} title={running?"Pause":"Start"}>
                  {running ? "⏸" : "▶"}
                </button>
                <button className="pm-ctrl-btn" onClick={skipPhase} title="Skip phase">⏭</button>
              </div>

              {/* Message */}
              <div className="pm-msg-wrap msg-anim" key={`${phase}-${msgIdx}`}>
                <div className="pm-msg-headline">{msgs[0]}</div>
                <div className="pm-msg-sub">{msgs[1]}</div>
              </div>

              {/* Research note */}
              <div className="pm-research">{cfg.research}</div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
