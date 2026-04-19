"use client";

import React from 'react';
import { LunaLogo } from './LunaLogo';

/**
 * LumiuWordmark Component
 * Finalized professional brand identity using the system's "Outfit" font 
 * for absolute visual consistency with the platform's high-end banner text.
 */
export function LumiuWordmark({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) {
  // Mapping sizes to tailwind text classes or pixel values
  const textClass = size === "sm" ? "text-2xl" : size === "lg" ? "text-7xl" : "text-5xl";
  const logoSize = size === "sm" ? 22 : size === "lg" ? 56 : 38;
  const stemWidth = size === "sm" ? "w-[6px]" : size === "lg" ? "w-[16px]" : "w-[12px]";
  const stemHeight = size === "sm" ? "h-[22px]" : size === "lg" ? "h-[64px]" : "h-[42px]";

  return (
    <div className={`flex items-center gap-1 ${className} select-none overflow-visible group`} style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
      <div className="flex items-center font-black tracking-tight text-white drop-shadow-2xl leading-none">
        <span className={textClass}>LUM</span>
        
        {/* Integrated Icon + Stem */}
        <div className="relative inline-flex flex-col items-center justify-center mx-[4px] pt-[0.2em]">
            <div className="absolute -top-[45%] left-1/2 -translate-x-1/2 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12">
                <LunaLogo size={logoSize} />
            </div>
            {/* Custom high-fidelity stem to ensure weight consistency with Outfit black weight */}
            <div className={`${stemWidth} ${stemHeight} bg-white rounded-full bg-gradient-to-b from-white to-white/90 shadow-[0_0_15px_rgba(255,255,255,0.3)]`} />
        </div>

        <span className={textClass}>U</span>
      </div>
    </div>
  );
}
