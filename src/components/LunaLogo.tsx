"use client";

import React from 'react';

/**
 * LunaLogo Component
 * Flawlessly replicates the flat-vector, boolean-cutout isometric aesthetic.
 * Precisely calibrated translations reflect the true -X, -Y shadow vector offsets.
 */
export function LunaLogo({ size = 48, className = "", style = {} }: { size?: number | string, className?: string, style?: React.CSSProperties }) {
  const cssSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      style={{ 
        width: cssSize, 
        height: cssSize,
        /* Removing ambient glow to strictly match the requested flat-vector look */
        ...style
      }}
      overflow="visible"
    >
      <defs>
        {/* The boolean clipping mask guaranteeing the concentric ring gap */}
        <mask id="luna-boolean-mask">
          <rect x="-50" y="-50" width="200" height="200" fill="white" />
          <circle cx="72" cy="28" r="20" fill="black" />
        </mask>
      </defs>

      {/* Shadow Extrusion Layer (Strict -6, -6 Up/Left diagonal translation mapped directly from image) */}
      <g transform="translate(-6, -6)" fill="#8854FF">
        {/* Core Planet Body */}
        <circle cx="45" cy="55" r="35" mask="url(#luna-boolean-mask)" />
        {/* Orbiting Satellite */}
        <circle cx="72" cy="28" r="12" />
      </g>

      {/* Primary Light Top Layer */}
      <g fill="#E5D9FF">
        {/* Core Planet Body */}
        <circle cx="45" cy="55" r="35" mask="url(#luna-boolean-mask)" />
        {/* Orbiting Satellite */}
        <circle cx="72" cy="28" r="12" />
      </g>
    </svg>
  );
}
