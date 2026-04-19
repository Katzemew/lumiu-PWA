"use client";

import React from 'react';

/**
 * LunaLogo Component - Optimized for brand accuracy.
 * Matches the official interlocking purple/lavender design perfectly.
 */
export function LunaLogo({ size = 48, className = "", style = {} }: { size?: number, className?: string, style?: React.CSSProperties }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))',
        ...style
      }}
    >
        <defs>
          <linearGradient id="lunaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#f0abfc', stopOpacity: 1 }} /> {/* purple-300 */}
            <stop offset="100%" style={{ stopColor: '#c084fc', stopOpacity: 1 }} /> {/* purple-400 */}
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Shadow/Base Layer - shifted to be consistent */}
        <circle cx="50" cy="53" r="38" fill="#9333ea" opacity="0.6" />
        
        {/* Main Circle - perfectly centered at 50,50 */}
        <circle cx="50" cy="50" r="35" fill="url(#lunaGradient)" />
        
        {/* Interlocking smaller circle - adjusted position */}
        <circle cx="75" cy="25" r="18" fill="url(#lunaGradient)" />
        
        {/* Stylized highlight to create the "interlocking" effect */}
        <circle cx="75" cy="25" r="18" stroke="#9333ea" strokeWidth="4" fill="transparent" />
        
        {/* Faint inner highlight/crescent for depth - adjusted for center */}
        <path d="M 50 15 A 35 35 0 0 1 85 50" stroke="white" strokeWidth="3" opacity="0.4" fill="none" />
    </svg>
  );
}
