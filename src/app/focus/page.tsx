"use client";

import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function FocusPage() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [initialTime, setInitialTime] = useState(25 * 60);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(initialTime);
    };

    const progress = 1 - (timeLeft / initialTime);

    return (
        <div className={`min-h-screen bg-[#0c111d] text-white font-sans flex transition-all duration-1000 ${isFullscreen ? 'pl-0' : 'pl-32'} py-10 pr-10 overflow-hidden relative selection:bg-teal-500/30`}>
            
            {/* 🌌 Cinematic Deep Focus Background */}
            <div className="fixed inset-0 z-0 opacity-50 mix-blend-screen pointer-events-none transition-all duration-1000" style={{ filter: isActive ? 'hue-rotate(15deg) brightness(1.2)' : 'hue-rotate(0deg)' }}>
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-teal-600/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
                {isActive && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 blur-[120px] rounded-full transition-all duration-[3000ms]" />}
            </div>

            <AnimatePresence>
                {!isFullscreen && <div className="z-50 relative"><Navbar /></div>}
            </AnimatePresence>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
                
                <motion.div
                    layout
                    className={`bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-2xl flex flex-col items-center justify-center gap-12 transition-all duration-1000 relative ${isFullscreen ? 'w-full h-full max-w-none rounded-none border-none bg-transparent shadow-none' : 'w-[640px] h-[640px] rounded-[4rem]'}`}
                >
                    {/* Inner highlight */}
                    {!isFullscreen && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />}

                    <div className="text-center space-y-8 z-10 flex flex-col items-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center gap-4 text-teal-400 text-center"
                        >
                            <div className="flex items-center gap-2 uppercase tracking-[0.2em] text-xs font-black bg-teal-500/10 px-5 py-2.5 rounded-full border border-teal-500/20 shadow-[0_0_20px_rgba(45,212,191,0.1)] backdrop-blur-md">
                                <Sparkles size={14} className={isActive ? 'animate-pulse' : ''} />
                                <span>Pomodoro Focus Space</span>
                            </div>
                            {!isFullscreen && (
                                <p className="text-xs font-medium text-white/50 mt-2 max-w-[300px] leading-relaxed">
                                    Maximize learning and minimize burnout. Focus for 25 minutes, then take a short break.
                                </p>
                            )}
                        </motion.div>

                        <div className="relative">
                            <motion.h1
                                className={`font-black tabular-nums tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 transition-all duration-700 ${isFullscreen ? 'text-[18rem]' : 'text-9xl'}`}
                                style={{ filter: "drop-shadow(0 10px 40px rgba(45, 212, 191, 0.15))" }}
                            >
                                {formatTime(timeLeft)}
                            </motion.h1>
                            
                            {/* Glassmorphic Progress Bar */}
                            <div className={`mx-auto bg-white/5 border border-white/10 rounded-full overflow-hidden mt-6 transition-all duration-700 ${isFullscreen ? 'w-96 h-2' : 'w-64 h-1.5'}`}>
                                <div 
                                    className="h-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(45,212,191,0.5)]" 
                                    style={{ width: `${progress * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-10 z-10">
                        <button
                            onClick={resetTimer}
                            className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center text-white/40 hover:text-teal-400 hover:bg-white/10 transition-all hover:border-teal-500/30 group bg-white/5 backdrop-blur-md"
                        >
                            <RotateCcw size={24} className="group-hover:-rotate-90 transition-transform duration-500" />
                        </button>

                        <button
                            onClick={toggleTimer}
                            className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-[#0c111d] transform hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(45,212,191,0.3)] hover:shadow-[0_0_60px_rgba(45,212,191,0.5)] border border-teal-300"
                        >
                            {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} className="ml-2" fill="currentColor" />}
                        </button>

                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center text-white/40 hover:text-teal-400 hover:bg-white/10 transition-all hover:border-teal-500/30 group bg-white/5 backdrop-blur-md"
                        >
                            {isMuted ? <VolumeX size={24} className="group-hover:scale-110 transition-transform" /> : <Volume2 size={24} className="group-hover:scale-110 transition-transform" />}
                        </button>
                    </div>

                    {!isFullscreen && (
                        <div className="flex flex-wrap justify-center gap-4 z-10">
                            <TimerPreset label="Deep Focus" mins={25} active={initialTime === 25 * 60} onClick={() => { setTimeLeft(25 * 60); setIsActive(false); setInitialTime(25*60); }} />
                            <TimerPreset label="Short Break" mins={5} active={initialTime === 5 * 60} onClick={() => { setTimeLeft(5 * 60); setIsActive(false); setInitialTime(5*60); }} />
                            <TimerPreset label="Zen Session" mins={60} active={initialTime === 60 * 60} onClick={() => { setTimeLeft(60 * 60); setIsActive(false); setInitialTime(60*60); }} />
                        </div>
                    )}
                </motion.div>

                {/* Fullscreen Toggle Button */}
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="absolute bottom-10 right-10 p-5 bg-white/5 border border-white/10 text-white/50 hover:text-teal-400 hover:bg-white/10 rounded-2xl transition-all group z-50 backdrop-blur-xl"
                    title={isFullscreen ? "Exit Pomodoro Mode" : "Enter Pomodoro Mode"}
                >
                    {isFullscreen ? <Minimize2 size={28} className="group-hover:scale-90 transition-transform" /> : <Maximize2 size={28} className="group-hover:scale-110 transition-transform" />}
                </button>
            </div>

            <style jsx>{`
        .min-h-screen { display: flex; min-height: 100vh; }
        .flex-1 { flex: 1; }
        .text-9xl { font-size: 8rem; }
      `}</style>
        </div>
    );
}

function TimerPreset({ label, mins, active, onClick }: { label: string; mins: number; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-7 py-3.5 rounded-2xl text-sm font-bold transition-all relative overflow-hidden group ${active ? 'text-teal-300 bg-teal-500/10 border-teal-500/30 border shadow-[0_0_20px_rgba(45,212,191,0.1)]' : 'bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white/80 hover:border-white/20'}`}
        >
            {active && <div className="absolute inset-0 bg-teal-500/10 animate-pulse pointer-events-none" />}
            <span className="relative z-10">{label}</span>
        </button>
    );
}
