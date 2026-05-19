"use client";
import React, { useState, useRef, useEffect } from "react";
import type { Deck } from "@/app/flashcards/cards";
import { useSettings } from "@/context/SettingsContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type Theme = "light" | "dark";
type AvatarId = string;

// ─── Avatar Definitions — Pixel + Constellation/Galaxy themed ─────────────────
interface Avatar {
  id: AvatarId;
  name: string;
  category: "pixel" | "constellation" | "galaxy";
  render: (size: number, accent: string, isDark: boolean) => React.JSX.Element;
}

const AVATARS: Avatar[] = [
  // ── Pixel avatars ──────────────────────────────────────────────────────────
  {
    id: "pixel-astronaut", name: "Astronaut", category: "pixel",
    render: (sz, accent, dark) => {
      const c = sz / 16;
      const grid: [number, number, string][] = [
        [3,1,"#c4b0ff"],[4,1,"#c4b0ff"],[5,1,"#c4b0ff"],[6,1,"#c4b0ff"],[7,1,"#c4b0ff"],[8,1,"#c4b0ff"],[9,1,"#c4b0ff"],[10,1,"#c4b0ff"],
        [2,2,"#c4b0ff"],[3,2,"white"],[4,2,"white"],[5,2,"white"],[6,2,"white"],[7,2,"white"],[8,2,"white"],[9,2,"white"],[10,2,"white"],[11,2,"#c4b0ff"],
        [2,3,"#c4b0ff"],[3,3,"white"],[4,3,accent],[5,3,accent],[6,3,"#60a5fa"],[7,3,"#60a5fa"],[8,3,accent],[9,3,accent],[10,3,"white"],[11,3,"#c4b0ff"],
        [2,4,"#c4b0ff"],[3,4,"white"],[4,4,"white"],[5,4,"white"],[6,4,"white"],[7,4,"white"],[8,4,"white"],[9,4,"white"],[10,4,"white"],[11,4,"#c4b0ff"],
        [3,5,"#9D79FF"],[4,5,"#9D79FF"],[5,5,"#9D79FF"],[6,5,"#9D79FF"],[7,5,"#9D79FF"],[8,5,"#9D79FF"],[9,5,"#9D79FF"],[10,5,"#9D79FF"],
        [2,6,"#9D79FF"],[3,6,"#7c5cfc"],[4,6,"#9D79FF"],[5,6,"#9D79FF"],[6,6,"#9D79FF"],[7,6,"#9D79FF"],[8,6,"#9D79FF"],[9,6,"#9D79FF"],[10,6,"#7c5cfc"],[11,6,"#9D79FF"],
        [2,7,"#9D79FF"],[3,7,"#9D79FF"],[4,7,"#9D79FF"],[5,7,"#9D79FF"],[6,7,"#9D79FF"],[7,7,"#9D79FF"],[8,7,"#9D79FF"],[9,7,"#9D79FF"],[10,7,"#9D79FF"],[11,7,"#9D79FF"],
        [3,8,"#7c5cfc"],[4,8,"#9D79FF"],[5,8,"#9D79FF"],[6,8,"#9D79FF"],[7,8,"#9D79FF"],[8,8,"#9D79FF"],[9,8,"#9D79FF"],[10,8,"#7c5cfc"],
        [3,9,"#9D79FF"],[4,9,"#9D79FF"],[5,9,"white"],[6,9,"white"],[7,9,"white"],[8,9,"white"],[9,9,"#9D79FF"],[10,9,"#9D79FF"],
        [3,10,"#7c5cfc"],[4,10,"#7c5cfc"],[5,10,"#c4b0ff"],[6,10,"#c4b0ff"],[7,10,"#c4b0ff"],[8,10,"#c4b0ff"],[9,10,"#7c5cfc"],[10,10,"#7c5cfc"],
        [3,11,"#7c5cfc"],[10,11,"#7c5cfc"],
        [2,12,"#7c5cfc"],[3,12,"#7c5cfc"],[10,12,"#7c5cfc"],[11,12,"#7c5cfc"],
      ];
      return (
        <svg width={sz} height={sz} viewBox="0 0 16 16" style={{imageRendering:"pixelated"}}>
          <rect width={16} height={16} fill={dark?"#0f0f23":"#ede9ff"} rx={2}/>
          {grid.map(([x,y,color],i) => <rect key={i} x={x} y={y} width={1} height={1} fill={color}/>)}
        </svg>
      );
    }
  },
  {
    id: "pixel-galaxy", name: "Galaxy Cat", category: "pixel",
    render: (sz, accent, dark) => {
      const grid: [number, number, string][] = [
        [4,1,"#c4b0ff"],[5,1,"#c4b0ff"],[8,1,"#c4b0ff"],[9,1,"#c4b0ff"],
        [3,2,"#c4b0ff"],[4,2,"#9D79FF"],[5,2,"#9D79FF"],[6,2,"#c4b0ff"],[7,2,"#c4b0ff"],[8,2,"#9D79FF"],[9,2,"#9D79FF"],[10,2,"#c4b0ff"],
        [3,3,"#9D79FF"],[4,3,"#7c5cfc"],[5,3,"#9D79FF"],[6,3,"#9D79FF"],[7,3,"#9D79FF"],[8,3,"#9D79FF"],[9,3,"#7c5cfc"],[10,3,"#9D79FF"],
        [2,4,"#9D79FF"],[3,4,"#9D79FF"],[4,4,"#9D79FF"],[5,4,"#9D79FF"],[6,4,"#9D79FF"],[7,4,"#9D79FF"],[8,4,"#9D79FF"],[9,4,"#9D79FF"],[10,4,"#9D79FF"],[11,4,"#9D79FF"],
        [2,5,"#9D79FF"],[3,5,"#60a5fa"],[4,5,"#9D79FF"],[5,5,"#60a5fa"],[6,5,"#9D79FF"],[7,5,"#9D79FF"],[8,5,"#60a5fa"],[9,5,"#9D79FF"],[10,5,"#60a5fa"],[11,5,"#9D79FF"],
        [2,6,"#9D79FF"],[3,6,"#9D79FF"],[4,6,"#9D79FF"],[5,6,"#9D79FF"],[6,6,"white"],[7,6,"white"],[8,6,"#9D79FF"],[9,6,"#9D79FF"],[10,6,"#9D79FF"],[11,6,"#9D79FF"],
        [2,7,"#7c5cfc"],[3,7,"#9D79FF"],[4,7,"#fbbf24"],[5,7,"#9D79FF"],[6,7,"#9D79FF"],[7,7,"#9D79FF"],[8,7,"#9D79FF"],[9,7,"#fbbf24"],[10,7,"#9D79FF"],[11,7,"#7c5cfc"],
        [3,8,"#9D79FF"],[4,8,"#9D79FF"],[5,8,"#9D79FF"],[6,8,"#9D79FF"],[7,8,"#9D79FF"],[8,8,"#9D79FF"],[9,8,"#9D79FF"],[10,8,"#9D79FF"],
        [4,9,"#7c5cfc"],[5,9,"#9D79FF"],[6,9,"#c4b0ff"],[7,9,"#c4b0ff"],[8,9,"#9D79FF"],[9,9,"#7c5cfc"],
        [4,10,"#7c5cfc"],[5,10,"#7c5cfc"],[6,10,"#7c5cfc"],[7,10,"#7c5cfc"],[8,10,"#7c5cfc"],[9,10,"#7c5cfc"],
        [4,11,"#7c5cfc"],[9,11,"#7c5cfc"],
        [3,11,"#7c5cfc"],[10,11,"#7c5cfc"],
      ];
      return (
        <svg width={sz} height={sz} viewBox="0 0 16 16" style={{imageRendering:"pixelated"}}>
          <rect width={16} height={16} fill={dark?"#0f0f23":"#ede9ff"} rx={2}/>
          {/* Stars */}
          {[[1,1],[13,2],[2,8],[14,6],[1,12],[13,11]].map(([x,y],i)=><rect key={`s${i}`} x={x} y={y} width={1} height={1} fill="rgba(255,255,255,0.5)"/>)}
          {grid.map(([x,y,color],i) => <rect key={i} x={x} y={y} width={1} height={1} fill={color}/>)}
        </svg>
      );
    }
  },
  {
    id: "pixel-robot", name: "Neuro Bot", category: "pixel",
    render: (sz, accent, dark) => {
      const grid: [number, number, string][] = [
        [6,1,"#9D79FF"],[7,1,"#9D79FF"],[8,1,"#9D79FF"],
        [5,2,"#c4b0ff"],[6,2,"#9D79FF"],[7,2,"#60a5fa"],[8,2,"#9D79FF"],[9,2,"#c4b0ff"],
        [4,3,"#c4b0ff"],[5,3,"#c4b0ff"],[6,3,"#c4b0ff"],[7,3,"#c4b0ff"],[8,3,"#c4b0ff"],[9,3,"#c4b0ff"],[10,3,"#c4b0ff"],
        [3,4,"#c4b0ff"],[4,4,"white"],[5,4,"#60a5fa"],[6,4,"white"],[7,4,"#60a5fa"],[8,4,"white"],[9,4,"#60a5fa"],[10,4,"white"],[11,4,"#c4b0ff"],
        [3,5,"#c4b0ff"],[4,5,"#60a5fa"],[5,5,"#1e3a8a"],[6,5,"#60a5fa"],[7,5,"#60a5fa"],[8,5,"#1e3a8a"],[9,5,"#60a5fa"],[10,5,"#60a5fa"],[11,5,"#c4b0ff"],
        [3,6,"#c4b0ff"],[4,6,"white"],[5,6,"#60a5fa"],[6,6,"white"],[7,6,"#60a5fa"],[8,6,"white"],[9,6,"#60a5fa"],[10,6,"white"],[11,6,"#c4b0ff"],
        [4,7,"#c4b0ff"],[5,7,"#c4b0ff"],[6,7,"#c4b0ff"],[7,7,"#c4b0ff"],[8,7,"#c4b0ff"],[9,7,"#c4b0ff"],[10,7,"#c4b0ff"],
        [4,8,"#9D79FF"],[5,8,"#34d399"],[6,8,"#34d399"],[7,8,"#34d399"],[8,8,"#34d399"],[9,8,"#34d399"],[10,8,"#9D79FF"],
        [3,9,"#9D79FF"],[4,9,"#9D79FF"],[5,9,"#9D79FF"],[6,9,"#9D79FF"],[7,9,"#9D79FF"],[8,9,"#9D79FF"],[9,9,"#9D79FF"],[10,9,"#9D79FF"],[11,9,"#9D79FF"],
        [3,10,"#7c5cfc"],[4,10,"#9D79FF"],[5,10,"#9D79FF"],[6,10,"#9D79FF"],[7,10,"#9D79FF"],[8,10,"#9D79FF"],[9,10,"#9D79FF"],[10,10,"#9D79FF"],[11,10,"#7c5cfc"],
        [4,11,"#7c5cfc"],[5,11,"#7c5cfc"],[8,11,"#7c5cfc"],[9,11,"#7c5cfc"],
        [4,12,"#c4b0ff"],[5,12,"#c4b0ff"],[8,12,"#c4b0ff"],[9,12,"#c4b0ff"],
      ];
      return (
        <svg width={sz} height={sz} viewBox="0 0 16 16" style={{imageRendering:"pixelated"}}>
          <rect width={16} height={16} fill={dark?"#0f0f23":"#ede9ff"} rx={2}/>
          {grid.map(([x,y,color],i)=><rect key={i} x={x} y={y} width={1} height={1} fill={color}/>)}
        </svg>
      );
    }
  },
  {
    id: "pixel-planet", name: "Lumiu Planet", category: "pixel",
    render: (sz, accent, dark) => {
      const grid: [number, number, string][] = [
        [5,1,"#9D79FF"],[6,1,"#c4b0ff"],[7,1,"#9D79FF"],[8,1,"#9D79FF"],[9,1,"#c4b0ff"],
        [3,2,"#7c5cfc"],[4,2,"#9D79FF"],[5,2,"#c4b0ff"],[6,2,"#9D79FF"],[7,2,"#9D79FF"],[8,2,"#c4b0ff"],[9,2,"#9D79FF"],[10,2,"#9D79FF"],[11,2,"#7c5cfc"],
        [2,3,"#7c5cfc"],[3,3,"#9D79FF"],[4,3,"#c4b0ff"],[5,3,"#9D79FF"],[6,3,"#60a5fa"],[7,3,"#60a5fa"],[8,3,"#9D79FF"],[9,3,"#c4b0ff"],[10,3,"#9D79FF"],[11,3,"#9D79FF"],[12,3,"#7c5cfc"],
        [2,4,"#c4b0ff"],[3,4,"#9D79FF"],[4,4,"#60a5fa"],[5,4,"#60a5fa"],[6,4,"#9D79FF"],[7,4,"#9D79FF"],[8,4,"#60a5fa"],[9,4,"#60a5fa"],[10,4,"#9D79FF"],[11,4,"#9D79FF"],[12,4,"#c4b0ff"],
        [2,5,"#9D79FF"],[3,5,"#9D79FF"],[4,5,"#9D79FF"],[5,5,"#9D79FF"],[6,5,"#c4b0ff"],[7,5,"#c4b0ff"],[8,5,"#9D79FF"],[9,5,"#9D79FF"],[10,5,"#9D79FF"],[11,5,"#9D79FF"],[12,5,"#9D79FF"],
        [2,6,"#9D79FF"],[3,6,"#c4b0ff"],[4,6,"#9D79FF"],[5,6,"#fbbf24"],[6,6,"#fbbf24"],[7,6,"#fbbf24"],[8,6,"#fbbf24"],[9,6,"#9D79FF"],[10,6,"#c4b0ff"],[11,6,"#9D79FF"],[12,6,"#9D79FF"],
        [2,7,"#7c5cfc"],[3,7,"#9D79FF"],[4,7,"#fbbf24"],[5,7,"#fbbf24"],[6,7,"#9D79FF"],[7,7,"#9D79FF"],[8,7,"#fbbf24"],[9,7,"#fbbf24"],[10,7,"#9D79FF"],[11,7,"#9D79FF"],[12,7,"#7c5cfc"],
        [2,8,"#c4b0ff"],[3,8,"#9D79FF"],[4,8,"#9D79FF"],[5,8,"#9D79FF"],[6,8,"#c4b0ff"],[7,8,"#c4b0ff"],[8,8,"#9D79FF"],[9,8,"#9D79FF"],[10,8,"#9D79FF"],[11,8,"#9D79FF"],[12,8,"#c4b0ff"],
        [3,9,"#7c5cfc"],[4,9,"#9D79FF"],[5,9,"#60a5fa"],[6,9,"#9D79FF"],[7,9,"#9D79FF"],[8,9,"#60a5fa"],[9,9,"#9D79FF"],[10,9,"#9D79FF"],[11,9,"#7c5cfc"],
        [4,10,"#9D79FF"],[5,10,"#9D79FF"],[6,10,"#9D79FF"],[7,10,"#9D79FF"],[8,10,"#9D79FF"],[9,10,"#9D79FF"],[10,10,"#9D79FF"],
        [5,11,"#c4b0ff"],[6,11,"#9D79FF"],[7,11,"#9D79FF"],[8,11,"#c4b0ff"],[9,11,"#9D79FF"],
      ];
      return (
        <svg width={sz} height={sz} viewBox="0 0 16 16" style={{imageRendering:"pixelated"}}>
          <rect width={16} height={16} fill={dark?"#080815":"#ddd6ff"} rx={2}/>
          {[[0,0],[15,1],[1,6],[14,8],[0,13],[15,14],[7,0],[3,13]].map(([x,y],i)=><rect key={`s${i}`} x={x} y={y} width={1} height={1} fill="rgba(255,255,255,0.6)"/>)}
          {grid.map(([x,y,color],i)=><rect key={i} x={x} y={y} width={1} height={1} fill={color}/>)}
        </svg>
      );
    }
  },
  // ── Constellation avatars ───────────────────────────────────────────────────
  {
    id: "const-orion", name: "Orion", category: "constellation",
    render: (sz, accent, dark) => (
      <svg width={sz} height={sz} viewBox="0 0 80 80">
        <rect width={80} height={80} fill={dark?"#080815":"#ede9ff"} rx={8}/>
        {/* Faint stars bg */}
        {[[5,8],[72,12],[15,70],[68,65],[40,5],[8,40],[75,40],[50,72],[20,25],[60,30],[12,55],[70,22]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={0.7} fill={dark?"rgba(255,255,255,0.3)":"rgba(157,121,255,0.3)"}/>
        ))}
        {/* Constellation lines */}
        {[[30,18,35,30],[35,30,25,42],[35,30,45,42],[25,42,20,56],[45,42,50,56],[20,56,28,64],[50,56,44,64],[28,64,36,70],[44,64,36,70]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth={0.8} strokeOpacity={0.5} strokeDasharray="2,1"/>
        ))}
        {/* Stars */}
        {[[30,18,2.5],[35,30,2],[25,42,1.8],[45,42,1.8],[20,56,2.2],[50,56,2],[28,64,1.6],[44,64,1.6],[36,70,2]].map(([cx,cy,r],i)=>(
          <g key={i}>
            <circle cx={cx} cy={cy} r={r as number+1} fill={accent} opacity={0.15}/>
            <circle cx={cx} cy={cy} r={r as number} fill={accent}/>
          </g>
        ))}
        {/* Brightest star glow */}
        <circle cx={30} cy={18} r={4} fill={accent} opacity={0.2}/>
        <circle cx={30} cy={18} r={2.5} fill="white"/>
      </svg>
    )
  },
  {
    id: "const-cassiopeia", name: "Cassiopeia", category: "constellation",
    render: (sz, accent, dark) => (
      <svg width={sz} height={sz} viewBox="0 0 80 80">
        <rect width={80} height={80} fill={dark?"#080815":"#ede9ff"} rx={8}/>
        {[[8,5],[70,8],[25,72],[65,68],[40,4],[5,40],[74,38],[48,75],[15,20],[62,25],[10,58],[72,55]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={0.7} fill={dark?"rgba(255,255,255,0.25)":"rgba(157,121,255,0.3)"}/>
        ))}
        {/* W shape */}
        {[[15,45,28,30],[28,30,40,45],[40,45,52,30],[52,30,65,45]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth={0.9} strokeOpacity={0.55} strokeDasharray="3,1.5"/>
        ))}
        {[[15,45,2.2],[28,30,2.8],[40,45,2],[52,30,2.4],[65,45,2.2]].map(([cx,cy,r],i)=>(
          <g key={i}>
            <circle cx={cx} cy={cy} r={r as number+1.5} fill={accent} opacity={0.12}/>
            <circle cx={cx} cy={cy} r={r as number} fill={i===1?"white":accent}/>
          </g>
        ))}
        {/* Milky band suggestion */}
        <ellipse cx={40} cy={62} rx={28} ry={6} fill={accent} opacity={0.05}/>
        <text x={40} y={74} textAnchor="middle" fill={accent} fontSize={7} opacity={0.5} fontFamily="sans-serif">CASSIOPEIA</text>
      </svg>
    )
  },
  {
    id: "const-ursa", name: "Ursa Major", category: "constellation",
    render: (sz, accent, dark) => (
      <svg width={sz} height={sz} viewBox="0 0 80 80">
        <rect width={80} height={80} fill={dark?"#080815":"#ede9ff"} rx={8}/>
        {[[5,5],[74,9],[3,74],[72,70],[40,3],[4,42],[75,35],[50,74]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={0.7} fill={dark?"rgba(255,255,255,0.25)":"rgba(157,121,255,0.3)"}/>
        ))}
        {/* Big Dipper */}
        {[[20,50,28,44],[28,44,36,46],[36,46,44,40],[44,40,55,35],[55,35,60,42],[60,42,56,52],[56,52,50,58]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth={0.9} strokeOpacity={0.55} strokeDasharray="3,1.5"/>
        ))}
        {[[20,50,2],[28,44,2.4],[36,46,2],[44,40,2.6],[55,35,2.2],[60,42,2],[56,52,2],[50,58,2.2]].map(([cx,cy,r],i)=>(
          <g key={i}>
            <circle cx={cx} cy={cy} r={r as number+1.5} fill={accent} opacity={0.12}/>
            <circle cx={cx} cy={cy} r={r as number} fill={i===3?"white":accent}/>
          </g>
        ))}
        <text x={40} y={74} textAnchor="middle" fill={accent} fontSize={7} opacity={0.5} fontFamily="sans-serif">URSA MAJOR</text>
      </svg>
    )
  },
  // ── Galaxy avatars ──────────────────────────────────────────────────────────
  {
    id: "galaxy-spiral", name: "Spiral Galaxy", category: "galaxy",
    render: (sz, accent, dark) => (
      <svg width={sz} height={sz} viewBox="0 0 80 80">
        <defs>
          <radialGradient id="gal1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity={0.9}/>
            <stop offset="30%" stopColor={accent} stopOpacity={0.7}/>
            <stop offset="70%" stopColor="#7c5cfc" stopOpacity={0.4}/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
        </defs>
        <rect width={80} height={80} fill={dark?"#080815":"#ddd6ff"} rx={8}/>
        {/* Background stars */}
        {Array.from({length:20},(_,i)=>({x:Math.sin(i*37)*38+40, y:Math.cos(i*23)*36+40, r:0.4+Math.random()*0.8})).map((s,i)=>(
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={0.3}/>
        ))}
        {/* Spiral arms */}
        {[0,Math.PI].map((offset,si)=>(
          <path key={si} d={Array.from({length:20},(_,i)=>{
            const t = (i/19)*Math.PI*2;
            const r = 2+t*9;
            const x = 40+r*Math.cos(t+offset);
            const y = 40+r*Math.sin(t+offset)*0.6;
            return `${i===0?"M":"L"}${x},${y}`;
          }).join(" ")} fill="none" stroke={accent} strokeWidth={3} strokeOpacity={0.4} strokeLinecap="round"/>
        ))}
        <ellipse cx={40} cy={40} rx={38} ry={22} fill="transparent" stroke={accent} strokeWidth={0.5} strokeOpacity={0.2}/>
        <circle cx={40} cy={40} r={5} fill="url(#gal1)"/>
        <circle cx={40} cy={40} r={2} fill="white"/>
      </svg>
    )
  },
  {
    id: "galaxy-nebula", name: "Nebula", category: "galaxy",
    render: (sz, accent, dark) => (
      <svg width={sz} height={sz} viewBox="0 0 80 80">
        <defs>
          <radialGradient id="neb1" cx="35%" cy="40%" r="60%">
            <stop offset="0%" stopColor={accent} stopOpacity={0.5}/>
            <stop offset="50%" stopColor="#60a5fa" stopOpacity={0.25}/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
          <radialGradient id="neb2" cx="65%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.3}/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
        </defs>
        <rect width={80} height={80} fill={dark?"#080815":"#ddd6ff"} rx={8}/>
        <circle cx={32} cy={38} r={28} fill="url(#neb1)"/>
        <circle cx={52} cy={48} r={22} fill="url(#neb2)"/>
        {[[10,15],[65,12],[8,60],[70,65],[40,8],[42,72],[15,40],[68,38]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={0.8+Math.random()} fill="white" opacity={0.6}/>
        ))}
        {/* Bright stars within nebula */}
        {[[25,32,1.5],[48,42,2],[38,55,1.2],[55,28,1.8]].map(([cx,cy,r],i)=>(
          <g key={i}>
            <circle cx={cx} cy={cy} r={r as number*2} fill="white" opacity={0.15}/>
            <circle cx={cx} cy={cy} r={r as number} fill="white"/>
          </g>
        ))}
      </svg>
    )
  },
  {
    id: "galaxy-void", name: "The Void", category: "galaxy",
    render: (sz, accent, dark) => (
      <svg width={sz} height={sz} viewBox="0 0 80 80">
        <defs>
          <radialGradient id="void1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" stopOpacity={0.95}/>
            <stop offset="60%" stopColor="#0f0f23" stopOpacity={0.7}/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
        </defs>
        <rect width={80} height={80} fill={dark?"#080815":"#ddd6ff"} rx={8}/>
        {Array.from({length:30},(_,i)=>({
          x: Math.sin(i*41)*38+40, y: Math.cos(i*17)*36+40, r: 0.5+Math.sin(i*7)*0.7,
        })).map((s,i)=>(
          <circle key={i} cx={s.x} cy={s.y} r={Math.max(0.3,s.r)} fill="white" opacity={0.4+Math.sin(i)*0.3}/>
        ))}
        {/* Event horizon ring */}
        <circle cx={40} cy={40} r={16} fill="url(#void1)" stroke={accent} strokeWidth={1} strokeOpacity={0.6}/>
        <circle cx={40} cy={40} r={12} fill="#000" opacity={0.95}/>
        {/* Accretion disk */}
        <ellipse cx={40} cy={40} rx={22} ry={5} fill="none" stroke={accent} strokeWidth={1.5} strokeOpacity={0.7}/>
        <ellipse cx={40} cy={40} rx={18} ry={4} fill="none" stroke="#fbbf24" strokeWidth={0.8} strokeOpacity={0.4}/>
        <circle cx={40} cy={40} r={3} fill={accent} opacity={0.6}/>
      </svg>
    )
  },
];

// ─── Badge definitions ────────────────────────────────────────────────────────
const BADGES = [
  { id:"first_session", icon:"🌱", label:"First Session", desc:"Completed your first study session" },
  { id:"streak_7",     icon:"🔥", label:"7-Day Streak",  desc:"7 consecutive days of studying" },
  { id:"chain_10",     icon:"⛓️", label:"Chain Master",  desc:"Built a chain of 10+ in Lumosity" },
  { id:"night_owl",    icon:"🦉", label:"Night Owl",     desc:"Studied past midnight 3 times" },
  { id:"flashcard_50", icon:"🃏", label:"Card Warrior",  desc:"Reviewed 50 flashcards in one day" },
  { id:"early_bird",   icon:"🐦", label:"Early Bird",    desc:"Started a session before 7am" },
];

const EARNED_BADGES = ["first_session","streak_7","chain_10","flashcard_50"];

// ─── Learner type labels ──────────────────────────────────────────────────────
const LEARNER_TYPES = ["Visual Thinker","Systemic Learner","Pattern Seeker","Deep Diver","Sprinter","Rhythm Learner","Conceptual Builder"];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LumIUProfile() {
  const { theme, updateSettings, avatarId: selectedAvatar, bio, displayName, learnerType, accentColor } = useSettings();
  
  const setTheme = (t: Theme) => updateSettings({ theme: t });
  const setSelected = (a: string) => updateSettings({ avatarId: a });
  const setBio = (b: string) => updateSettings({ bio: b });
  const setDisplayName = (n: string) => updateSettings({ displayName: n });
  const setLearnerType = (l: string) => updateSettings({ learnerType: l });

  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [filterCat, setFilterCat] = useState<"all"|"pixel"|"constellation"|"galaxy">("all");
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput]   = useState(bio);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [editingLearner, setEditingLearner] = useState(false);
  const [currentTab, setCurrentTab] = useState<"overview"|"badges"|"deck">("overview");
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
    border:  isDark ? "rgba(157,121,255,0.15)" : "rgba(157,121,255,0.2)",
    b2:      isDark ? "rgba(157,121,255,0.28)" : "rgba(157,121,255,0.35)",
    text:    isDark ? "#e8e4ff" : "#1a1040",
    muted:   isDark ? "rgba(200,192,240,0.55)" : "rgba(80,60,140,0.55)",
    accent:  accentColor,
    accentD: accentColor,
    glow:    "rgba(157,121,255,0.15)",
    green:   isDark ? "#34d399" : "#059669",
    amber:   isDark ? "#fbbf24" : "#d97706",
    red:     isDark ? "#f87171" : "#ef4444",
    pill:    isDark ? "#22223a" : "#ede9ff",
  };

  const currentAvatar = AVATARS.find(a => a.id === selectedAvatar) || AVATARS[0];
  const filteredAvatars = filterCat === "all" ? AVATARS : AVATARS.filter(a => a.category === filterCat);

  // ─── Deck preview data ────────────────────────────────────────────────────
// ─── Deck preview data (now loaded dynamically) ────────────────────────────────────────
  const [profileDecks, setProfileDecks] = useState<Deck[]>([]);

  // Load decks from localStorage on mount and whenever storage changes
  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem("lumiu-decks");
      if (stored) {
        const parsed: Deck[] = JSON.parse(stored);
        setProfileDecks(parsed);
      }
    };
    load();
    const handler = (e: StorageEvent) => {
      if (e.key === "lumiu-decks") load();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Compute deck preview data with mastery percentages
  const DECK_PREVIEW = profileDecks.map(d => {
    const total = d.cards.length;
    const mastered = d.cards.filter(c => c.status === "mastered").length;
    const mastery = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return {
      name: d.name,
      emoji: d.emoji,
      cards: total,
      mastery,
      theme: d.theme,
    };
  });

  const css = `
@import url('https://api.fontshare.com/v2/css?f[]=chillax@300,400,500,600,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
.pr-root{font-family:'Chillax',sans-serif;background:${T.bg};color:${T.text};min-height:100vh;display:flex;flex-direction:column;transition:background 0.3s,color 0.3s;}
.pr-top{height:54px;background:${T.surface};border-bottom:1px solid ${T.border};display:flex;align-items:center;padding:0 22px;gap:14px;flex-shrink:0;}
.pr-logo{font-weight:700;font-size:18px;color:${T.accent};letter-spacing:-0.4px;display:flex;align-items:center;gap:6px;}
.pr-logo-dot{width:7px;height:7px;border-radius:50%;background:${T.accent};box-shadow:0 0 8px ${T.accent};animation:pdot 2s infinite;}
@keyframes pdot{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.75);}}
.pr-badge{font-size:11px;padding:2px 10px;border-radius:20px;background:${T.glow};color:${T.accent};border:1px solid ${T.border};font-weight:600;}
.pr-top-right{margin-left:auto;display:flex;align-items:center;gap:10px;}
.tog-wrap{display:flex;align-items:center;gap:7px;border:1px solid ${T.border};border-radius:20px;padding:5px 12px;cursor:pointer;background:${T.pill};color:${T.muted};font-size:12px;font-family:'Chillax';font-weight:500;transition:all 0.2s;}
.tog-wrap:hover{border-color:${T.accent};}
.tog-track{width:30px;height:16px;border-radius:8px;background:${isDark?T.accent:T.s3};position:relative;transition:background 0.25s;flex-shrink:0;}
.tog-thumb{position:absolute;width:12px;height:12px;border-radius:50%;background:white;top:2px;left:${isDark?"16px":"2px"};transition:left 0.25s;box-shadow:0 1px 3px rgba(0,0,0,0.3);}

.pr-body{display:flex;flex:1;overflow:hidden;}

/* Sidebar */
.pr-sidebar{width:260px;background:${T.sidebar};padding:24px 14px;display:flex;flex-direction:column;align-items:center;gap:0;flex-shrink:0;overflow-y:auto;}
.pr-av-wrap{position:relative;cursor:pointer;margin-bottom:14px;}
.pr-av-ring{width:96px;height:96px;border-radius:20px;overflow:hidden;border:3px solid rgba(255,255,255,0.35);transition:all 0.2s;box-shadow:0 8px 24px rgba(0,0,0,0.3);}
.pr-av-ring:hover{border-color:white;transform:scale(1.04);}
.pr-av-edit{position:absolute;bottom:-6px;right:-6px;width:26px;height:26px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid ${T.sidebar};}
.pr-name{font-size:18px;font-weight:700;color:white;letter-spacing:-0.3px;margin-bottom:3px;text-align:center;}
.pr-sub{font-size:11px;color:${T.sbMuted};text-align:center;margin-bottom:16px;}
.pr-learner-type{display:flex;align-items:center;gap:5px;background:rgba(255,255,255,0.14);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:600;color:white;cursor:pointer;margin-bottom:20px;transition:all 0.18s;}
.pr-learner-type:hover{background:rgba(255,255,255,0.22);}
.pr-sb-divider{width:100%;height:1px;background:rgba(255,255,255,0.12);margin:14px 0;}
.pr-sb-stat{width:100%;display:flex;justify-content:space-between;align-items:center;padding:7px 4px;}
.pr-sb-stat-label{font-size:11px;color:${T.sbMuted};font-weight:500;}
.pr-sb-stat-val{font-size:13px;font-weight:700;color:white;font-family:'JetBrains Mono';}
.pr-level-wrap{width:100%;margin-top:6px;}
.pr-level-label{font-size:10px;color:${T.sbMuted};font-weight:600;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:5px;}
.pr-level-bar{height:5px;border-radius:3px;background:rgba(255,255,255,0.12);}
.pr-level-fill{height:5px;border-radius:3px;background:rgba(255,255,255,0.7);transition:width 0.8s ease;}
.pr-level-txt{font-size:10px;color:${T.sbMuted};margin-top:4px;font-family:'JetBrains Mono';}

/* Main */
.pr-main{flex:1;overflow-y:auto;padding:28px 28px 40px;}
.pr-section-head{display:flex;align-items:center;gap:10px;margin-bottom:18px;}
.pr-page-title{font-size:22px;font-weight:700;letter-spacing:-0.4px;}
.pr-tabs{display:flex;gap:2px;background:${T.s2};border-radius:12px;padding:3px;margin-bottom:24px;align-self:flex-start;}
.pr-tab{padding:6px 16px;border-radius:9px;border:none;background:transparent;font-family:'Chillax';font-size:12px;font-weight:500;cursor:pointer;color:${T.muted};transition:all 0.18s;}
.pr-tab.active{background:${T.surface};color:${T.accent};font-weight:600;box-shadow:0 2px 8px rgba(157,121,255,0.1);}
.pr-tab:hover:not(.active){color:${T.text};}

/* Cards */
.card{background:${T.surface};border-radius:16px;padding:20px;border:1px solid ${T.border};margin-bottom:14px;transition:box-shadow 0.2s;}
.card:hover{box-shadow:0 4px 20px rgba(157,121,255,0.1);}
.card-title{font-size:13px;font-weight:700;letter-spacing:-0.1px;margin-bottom:4px;color:${T.muted};text-transform:uppercase;letter-spacing:0.06em;font-size:10px;}
.card-content{font-size:14px;line-height:1.6;color:${T.text};}

/* Bio card */
.bio-text{font-size:14px;line-height:1.65;color:${T.text};}
.bio-input{width:100%;padding:10px 12px;background:${T.s2};border:1.5px solid ${T.border};border-radius:10px;color:${T.text};font-family:'Chillax';font-size:14px;line-height:1.6;outline:none;resize:none;transition:border-color 0.18s;}
.bio-input:focus{border-color:${T.accent};}
.edit-btn{padding:5px 12px;border-radius:8px;border:1px solid ${T.border};background:${T.pill};color:${T.muted};font-family:'Chillax';font-size:11px;font-weight:500;cursor:pointer;transition:all 0.15s;margin-left:auto;}
.edit-btn:hover{border-color:${T.accent};color:${T.accent};}
.save-btn{padding:5px 12px;border-radius:8px;border:none;background:${T.accent};color:white;font-family:'Chillax';font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s;}
.save-btn:hover{background:${T.accentD};}

/* Subjects */
.subject-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.subject-card{background:${T.s2};border-radius:12px;padding:12px 14px;border:1px solid ${T.border};}
.subject-top{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
.subject-bar-bg{height:4px;border-radius:2px;background:${T.s3};overflow:hidden;}
.subject-bar-fill{height:4px;border-radius:2px;transition:width 0.8s ease;}

/* Badges */
.badge-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.badge-card{background:${T.s2};border-radius:14px;padding:14px;border:1px solid ${T.border};text-align:center;transition:all 0.2s;}
.badge-card.earned{border-color:${T.b2};background:${T.glow};}
.badge-card.locked{opacity:0.38;filter:grayscale(1);}
.badge-card:hover.earned{transform:translateY(-2px);box-shadow:0 6px 20px rgba(157,121,255,0.15);}
.badge-icon{font-size:28px;margin-bottom:8px;}
.badge-label{font-size:12px;font-weight:600;margin-bottom:3px;}
.badge-desc{font-size:10px;color:${T.muted};line-height:1.4;}
.badge-status{font-size:10px;font-weight:600;padding:2px 8px;border-radius:8px;display:inline-block;margin-top:6px;}

/* Deck */
.deck-list{display:flex;flex-direction:column;gap:10px;}
.deck-row{display:flex;align-items:center;gap:12px;background:${T.s2};border-radius:12px;padding:12px 14px;border:1px solid ${T.border};}
.deck-emoji{font-size:22px;}
.deck-info{flex:1;}
.deck-name{font-size:13px;font-weight:600;margin-bottom:3px;}
.deck-meta{font-size:11px;color:${T.muted};}
.deck-bar-bg{width:80px;height:4px;border-radius:2px;background:${T.s3};overflow:hidden;}
.deck-bar-fill{height:4px;border-radius:2px;background:${T.accent};transition:width 0.8s ease;}
.deck-pct{font-size:11px;font-weight:700;color:${T.accent};font-family:'JetBrains Mono';min-width:30px;text-align:right;}

/* Avatar picker modal */
.av-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;}
.av-modal{background:${T.surface};border:1px solid ${T.b2};border-radius:22px;padding:24px;width:100%;max-width:560px;max-height:85vh;display:flex;flex-direction:column;}
.av-modal-title{font-size:17px;font-weight:700;letter-spacing:-0.3px;margin-bottom:4px;}
.av-modal-sub{font-size:12px;color:${T.muted};margin-bottom:18px;}
.av-filter-row{display:flex;gap:6px;margin-bottom:16px;}
.av-filter-btn{padding:5px 13px;border-radius:20px;border:1px solid ${T.border};background:transparent;color:${T.muted};font-family:'Chillax';font-size:11px;font-weight:500;cursor:pointer;transition:all 0.15s;}
.av-filter-btn.active{background:${T.accent};color:white;border-color:${T.accent};}
.av-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;overflow-y:auto;flex:1;}
.av-item{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;padding:8px;border-radius:14px;border:2px solid transparent;transition:all 0.18s;}
.av-item:hover{background:${T.s2};}
.av-item.selected{border-color:${T.accent};background:${T.glow};}
.av-item-name{font-size:10px;color:${T.muted};font-weight:500;text-align:center;}
.av-item-cat{font-size:9px;color:${T.muted};opacity:0.6;text-align:center;}
.av-actions{display:flex;gap:8px;margin-top:16px;justify-content:flex-end;}
.btn-primary{padding:8px 20px;border-radius:10px;border:none;background:${T.accent};color:white;font-family:'Chillax';font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;}
.btn-primary:hover{background:${T.accentD};}
.btn-secondary{padding:8px 16px;border-radius:10px;border:1px solid ${T.border};background:${T.pill};color:${T.text};font-family:'Chillax';font-size:13px;cursor:pointer;transition:all 0.15s;}
.btn-secondary:hover{background:${T.s2};}

/* Learner type picker */
.lt-dropdown{position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:6px;background:${T.surface};border:1px solid ${T.b2};border-radius:14px;padding:6px;min-width:180px;z-index:100;box-shadow:0 8px 32px rgba(0,0,0,0.25);}
.lt-item{padding:8px 12px;border-radius:9px;font-size:12px;font-weight:500;cursor:pointer;color:${T.text};transition:background 0.12s;}
.lt-item:hover{background:${T.s2};}
.lt-item.active{color:${T.accent};background:${T.glow};}

/* Name edit */
.name-input{background:transparent;border:none;border-bottom:1.5px solid ${T.accent};color:white;font-family:'Chillax';font-size:18px;font-weight:700;text-align:center;outline:none;width:140px;padding-bottom:2px;}

@keyframes fade-in{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.fade-in{animation:fade-in 0.35s ease;}
scrollbar-width:thin;scrollbar-color:rgba(157,121,255,0.3) transparent;
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:rgba(157,121,255,0.3);border-radius:4px;}
`;

  const SUBJECT_COLORS: Record<string, string> = { "Astrophysics 101":"#9D79FF","Linear Algebra":"#22d3ee","Organic Chem":"#e040fb","World History":"#fbbf24" };

  const [pendingAvatar, setPendingAvatar] = useState<AvatarId>(selectedAvatar);
  const ltRef = useRef<HTMLDivElement>(null);

  const renderOverview = () => (
    <div className="fade-in">
      {/* Bio card */}
      <div className="card">
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <div className="card-title" style={{margin:0}}>About</div>
          {editingBio
            ? <>
                <button className="save-btn" onClick={()=>{setBio(bioInput);setEditingBio(false);}}>Save</button>
                <button className="btn-secondary" style={{padding:"5px 10px",fontSize:11}} onClick={()=>{setBioInput(bio);setEditingBio(false);}}>Cancel</button>
              </>
            : <button className="edit-btn" onClick={()=>{setBioInput(bio);setEditingBio(true);}}>Edit</button>
          }
        </div>
        {editingBio
          ? <textarea className="bio-input" rows={3} value={bioInput} onChange={e=>setBioInput(e.target.value)} autoFocus/>
          : <div className="bio-text">{bio || <span style={{color:T.muted,fontStyle:"italic"}}>No bio yet. Tell the galaxy who you are.</span>}</div>
        }
      </div>

      {/* Subjects in progress */}
      <div className="card">
        <div className="card-title" style={{marginBottom:14}}>Subjects in Progress</div>
        <div className="subject-grid">
          {DECK_PREVIEW.map(d=>(
            <div key={d.name} className="subject-card">
              <div className="subject-top">
                <span style={{fontSize:18}}>{d.emoji}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:600}}>{d.name}</div>
                  <div style={{fontSize:10,color:T.muted}}>{d.cards} cards</div>
                </div>
              </div>
              <div className="subject-bar-bg">
                <div className="subject-bar-fill" style={{width:`${d.mastery}%`,background:SUBJECT_COLORS[d.name]||T.accent}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                <span style={{fontSize:10,color:T.muted}}>Mastery</span>
                <span style={{fontSize:10,fontWeight:700,color:SUBJECT_COLORS[d.name]||T.accent,fontFamily:"'JetBrains Mono'"}}>{d.mastery}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick info row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        {[
          {label:"Member since",val:"Jan 2025",icon:"📅"},
          {label:"Learner type",val:learnerType,icon:"🧠"},
          {label:"Total XP",val:"4,820",icon:"✦"},
        ].map(item=>(
          <div key={item.label} className="card" style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",marginBottom:0}}>
            <span style={{fontSize:20}}>{item.icon}</span>
            <div>
              <div style={{fontSize:10,color:T.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{item.label}</div>
              <div style={{fontSize:13,fontWeight:600,marginTop:2}}>{item.val}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBadges = () => (
    <div className="fade-in">
      <div style={{fontSize:13,color:T.muted,marginBottom:16}}>
        {EARNED_BADGES.length} of {BADGES.length} unlocked · Keep studying to earn more
      </div>
      <div className="badge-grid">
        {BADGES.map(b=>{
          const earned = EARNED_BADGES.includes(b.id);
          return (
            <div key={b.id} className={`badge-card ${earned?"earned":"locked"}`}>
              <div className="badge-icon">{b.icon}</div>
              <div className="badge-label">{b.label}</div>
              <div className="badge-desc">{b.desc}</div>
              <span className="badge-status" style={{
                background: earned?T.glow:"transparent",
                color: earned?T.accent:T.muted,
                border: earned?`1px solid ${T.border}`:"none",
              }}>{earned?"Earned":"Locked"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDecks = () => (
    <div className="fade-in">
      <div style={{fontSize:13,color:T.muted,marginBottom:16}}>
        {DECK_PREVIEW.length} active decks · {DECK_PREVIEW.reduce((a,d)=>a+d.cards,0)} total cards
      </div>
      <div className="deck-list">
        {DECK_PREVIEW.map(d=>(
          <div key={d.name} className="deck-row">
            <span className="deck-emoji">{d.emoji}</span>
            <div className="deck-info">
              <div className="deck-name">{d.name}</div>
              <div className="deck-meta">{d.cards} cards</div>
            </div>
            <div className="deck-bar-bg">
              <div className="deck-bar-fill" style={{width:`${d.mastery}%`,background:SUBJECT_COLORS[d.name]||T.accent}}/>
            </div>
            <div className="deck-pct">{d.mastery}%</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="pr-root">
        {/* Topbar */}
        <div className="pr-top">
          <div className="pr-logo"><div className="pr-logo-dot"/>lumiu</div>
          <span className="pr-badge">Profile</span>
          <div className="pr-top-right">
            <button className="tog-wrap" onClick={()=>setTheme(theme==="dark"?"light":"dark")}>
              {theme==="dark"?"🌙":"☀️"}
              <div className="tog-track"><div className="tog-thumb"/></div>
              {theme==="dark"?"Dark":"Light"}
            </button>
          </div>
        </div>

        <div className="pr-body">
          {/* Sidebar */}
          <div className="pr-sidebar">
            {/* Avatar */}
            <div className="pr-av-wrap" onClick={()=>{setPendingAvatar(selectedAvatar);setAvatarPickerOpen(true);}}>
              <div className="pr-av-ring">
                {currentAvatar.render(96, T.accent, isDark)}
              </div>
              <div className="pr-av-edit">✏️</div>
            </div>

            {/* Name */}
            {editingName
              ? <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,marginBottom:3}}>
                  <input className="name-input" value={nameInput} onChange={e=>setNameInput(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==="Enter"){setDisplayName(nameInput);setEditingName(false);}}}/>
                  <div style={{display:"flex",gap:6}}>
                    <button style={{padding:"3px 10px",borderRadius:8,border:"none",background:"rgba(255,255,255,0.2)",color:"white",fontFamily:"'Chillax'",fontSize:11,cursor:"pointer"}} onClick={()=>{setDisplayName(nameInput);setEditingName(false);}}>Save</button>
                    <button style={{padding:"3px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"rgba(255,255,255,0.7)",fontFamily:"'Chillax'",fontSize:11,cursor:"pointer"}} onClick={()=>setEditingName(false)}>Cancel</button>
                  </div>
                </div>
              : <div className="pr-name" onClick={()=>{setNameInput(displayName);setEditingName(true);}} style={{cursor:"pointer"}}>{displayName} ✏️</div>
            }
            <div className="pr-sub">1604-22-747-001 · Year 4</div>

            {/* Learner type */}
            <div style={{position:"relative"}}>
              <div className="pr-learner-type" onClick={()=>setEditingLearner(!editingLearner)}>
                🧠 {learnerType} ▾
              </div>
              {editingLearner && (
                <div className="lt-dropdown">
                  {LEARNER_TYPES.map(lt=>(
                    <div key={lt} className={`lt-item ${lt===learnerType?"active":""}`}
                      onClick={()=>{setLearnerType(lt);setEditingLearner(false);}}>
                      {lt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pr-sb-divider"/>

            {/* Sidebar stats */}
            {[
              {label:"Current Streak",val:"7 days 🔥"},
              {label:"Level",val:"4 · Luminary"},
              {label:"Decks",val:"4 active"},
              {label:"Sessions today",val:"2"},
            ].map(s=>(
              <div key={s.label} className="pr-sb-stat">
                <span className="pr-sb-stat-label">{s.label}</span>
                <span className="pr-sb-stat-val">{s.val}</span>
              </div>
            ))}

            <div className="pr-sb-divider"/>

            {/* Level progress */}
            <div className="pr-level-wrap">
              <div className="pr-level-label">Level Progress</div>
              <div className="pr-level-bar">
                <div className="pr-level-fill" style={{width:"72%"}}/>
              </div>
              <div className="pr-level-txt">720 / 1000 XP to Level 5</div>
            </div>
          </div>

          {/* Main */}
          <div className="pr-main">
            <div className="pr-section-head">
              <h1 className="pr-page-title">My Profile</h1>
            </div>
            <div className="pr-tabs">
              {(["overview","badges","deck"] as const).map(t=>(
                <button key={t} className={`pr-tab ${currentTab===t?"active":""}`} onClick={()=>setCurrentTab(t)}>
                  {t==="overview"?"Overview":t==="badges"?"Badges & Achievements":"My Decks"}
                </button>
              ))}
            </div>

            {currentTab==="overview" && renderOverview()}
            {currentTab==="badges"   && renderBadges()}
            {currentTab==="deck"     && renderDecks()}
          </div>
        </div>

        {/* Avatar picker modal */}
        {avatarPickerOpen && (
          <div className="av-overlay" onClick={()=>setAvatarPickerOpen(false)}>
            <div className="av-modal" onClick={e=>e.stopPropagation()}>
              <div className="av-modal-title">Choose Your Avatar</div>
              <div className="av-modal-sub">Pixel art · Constellations · Galaxy — all made for lumiu</div>
              <div className="av-filter-row">
                {(["all","pixel","constellation","galaxy"] as const).map(cat=>(
                  <button key={cat} className={`av-filter-btn ${filterCat===cat?"active":""}`}
                    onClick={()=>setFilterCat(cat)}>
                    {cat==="all"?"All":cat==="pixel"?"Pixel ✦":cat==="constellation"?"Constellations":"Galaxy"}
                  </button>
                ))}
              </div>
              <div className="av-grid">
                {filteredAvatars.map(av=>(
                  <div key={av.id} className={`av-item ${pendingAvatar===av.id?"selected":""}`}
                    onClick={()=>setPendingAvatar(av.id)}>
                    {av.render(64, T.accent, isDark)}
                    <span className="av-item-name">{av.name}</span>
                    <span className="av-item-cat">{av.category}</span>
                  </div>
                ))}
              </div>
              <div className="av-actions">
                <button className="btn-secondary" onClick={()=>setAvatarPickerOpen(false)}>Cancel</button>
                <button className="btn-primary" onClick={()=>{setSelected(pendingAvatar);setAvatarPickerOpen(false);}}>Apply Avatar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
