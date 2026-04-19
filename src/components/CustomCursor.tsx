"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
            
            // Check if hovering over a clickable element
            const target = e.target as HTMLElement;
            if (target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener("mousemove", updateMousePosition);
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseenter", handleMouseEnter);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseenter", handleMouseEnter);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[99999]"
            animate={{
                x: mousePosition.x, // Arrow tip perfectly aligns with coordinates
                y: mousePosition.y,
                scale: isHovering ? 1.15 : 1,
                rotate: isHovering ? -10 : 0
            }}
            transition={{
                type: "spring",
                stiffness: 1500,
                damping: 40,
                mass: 0.1
            }}
        >
            <svg 
                width="36" 
                height="36" 
                viewBox="0 0 28 28" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ transformOrigin: "20% 20%" }}
            >
                <defs>
                    <linearGradient id="cursorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#333333" />     {/* Bright shiny grey */}
                        <stop offset="60%" stopColor="#000000" />     {/* Solid deep black */}
                        <stop offset="100%" stopColor="#1a1a1a" />    {/* Slight bounce light bottom */}
                    </linearGradient>

                </defs>
                
                {/* Tailless ADHD-Friendly Cursor Path */}
                <path 
                    d="M3.5 1.5 L3.5 24.5 L10.5 17.5 L22.5 15 Z" 
                    fill="url(#cursorGradient)" 
                    stroke="#FFFFFF" 
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </svg>
        </motion.div>
    );
}
