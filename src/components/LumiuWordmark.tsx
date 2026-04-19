"use client";

import React from 'react';

export function LumiuWordmark({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) {
  // Mapping sizes to perfect vector width constraints
  const widthClass = size === "sm" ? "w-[100px]" : size === "lg" ? "w-[280px]" : "w-[160px]";

  return (
    <div className={`flex items-center gap-1 ${className} select-none overflow-visible group`}>
      <svg 
         viewBox="0 -15 400 135" 
         xmlns="http://www.w3.org/2000/svg" 
         className={`${widthClass} drop-shadow-[0_10px_20px_rgba(139,92,246,0.2)] transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_15px_30px_rgba(168,85,247,0.4)]`}
      >
        <defs>
          <mask id="shadowMask">
            <rect x="-50" y="-50" width="500" height="250" fill="white" />
            <circle cx="312" cy="6" r="10" fill="black" />
          </mask>
          
          <mask id="dotMask">
            <rect x="-50" y="-50" width="500" height="250" fill="white" />
            <circle cx="302" cy="-2" r="10" fill="black" />
          </mask>
        </defs>

        {/* Isometric Deep Shadow Extrusion Layer (Shift: +10x, +8y) */}
        <g transform="translate(10, 8)" stroke="#8B5CF6" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* l - J-hook stroke matching 'u' proportions */}
          <path d="M 30 15 L 30 75 A 20 20 0 0 0 50 95" />
          {/* u1 - Grid centered at 90 and 130 */}
          <path d="M 90 40 L 90 75 A 20 20 0 0 0 130 75 L 130 40" />
          {/* m - Flawless tangential overlap stems at 170, 210, 250 */}
          <path d="M 170 95 L 170 60 A 20 20 0 0 1 210 60 L 210 95 M 210 95 L 210 60 A 20 20 0 0 1 250 60 L 250 95" />
          {/* i - Stem at 290 */}
          <path d="M 290 40 L 290 95" />
          {/* u2 - Grid centered at 330 and 370 */}
          <path d="M 330 40 L 330 75 A 20 20 0 0 0 370 75 L 370 40" />
        </g>
        
        {/* Deep drop-shadow for interlocking 'i' Luna dots */}
        <circle cx="300" cy="18" r="16" fill="#8B5CF6" mask="url(#shadowMask)" />
        <circle cx="312" cy="6" r="7" fill="#8B5CF6" />

        {/* Top High-Contrast Foreground Layer */}
        <g stroke="#E6D8FF" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* l */}
          <path d="M 30 15 L 30 75 A 20 20 0 0 0 50 95" />
          {/* u1 */}
          <path d="M 90 40 L 90 75 A 20 20 0 0 0 130 75 L 130 40" />
          {/* m */}
          <path d="M 170 95 L 170 60 A 20 20 0 0 1 210 60 L 210 95 M 210 95 L 210 60 A 20 20 0 0 1 250 60 L 250 95" />
          {/* i */}
          <path d="M 290 40 L 290 95" />
          {/* u2 */}
          <path d="M 330 40 L 330 75 A 20 20 0 0 0 370 75 L 370 40" />
        </g>
        
        {/* Foreground interlocking 'i' dots using custom cutout mask */}
        <circle cx="290" cy="10" r="16" fill="#E6D8FF" mask="url(#dotMask)" />
        <circle cx="302" cy="-2" r="7" fill="#E6D8FF" />
      </svg>
    </div>
  );
}
