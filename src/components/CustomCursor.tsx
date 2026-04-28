"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    
    const springConfig = { damping: 40, stiffness: 1500, mass: 0.1 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target && target.closest) {
                if (target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer')) {
                    setIsHovering(true);
                } else {
                    setIsHovering(false);
                }
            }
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener("mousemove", updateMousePosition, { passive: true });
        window.addEventListener("mouseover", handleMouseOver, { passive: true });
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseenter", handleMouseEnter);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            window.removeEventListener("mouseover", handleMouseOver);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseenter", handleMouseEnter);
        };
    }, [isVisible, cursorX, cursorY]);

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[99999]"
            style={{
                x: cursorXSpring,
                y: cursorYSpring,
            }}
            animate={{
                scale: isHovering ? 1.15 : 1,
                rotate: isHovering ? -10 : 0
            }}
            transition={{
                scale: { type: "spring", stiffness: 300, damping: 20 },
                rotate: { type: "spring", stiffness: 300, damping: 20 }
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
                        <stop offset="0%" stopColor="#333333" />
                        <stop offset="60%" stopColor="#000000" />
                        <stop offset="100%" stopColor="#1a1a1a" />
                    </linearGradient>
                </defs>
                
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
