"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Brain, Zap, Target, Timer, RotateCcw } from "lucide-react";

const NODES = [
    { id: 1, label: "galaxy", score: 68, angle: -60 },
    { id: 2, label: "stardust", score: 84, angle: 30 },
    { id: 3, label: "black hole", score: 69, angle: 150 },
    { id: 4, label: "darkness", score: 74, angle: 220 },
    { id: 5, label: "gravity", score: 34, angle: 280 },
];

export default function NeuralGame() {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [score, setScore] = useState(198);
    const [combo, setCombo] = useState(5);
    const [timeLeft, setTimeLeft] = useState(8);
    const [gameState, setGameState] = useState("playing");

    useEffect(() => {
        if (gameState !== "playing") return;
        if (timeLeft <= 0) {
            setGameState("finished");
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, gameState]);

    const handleKeyDown = (e: any) => {
        if (e.key === "Enter") {
            // Mock logic for connection
            setScore(prev => prev + 10);
            setCombo(prev => prev + 1);
            setTimeLeft(8);
            setInput("");
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f8f9fc] flex flex-col font-sans text-slate-800">
            {/* Header */}
            <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 relative z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/gamification')}
                        className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-pink-500">
                            <Brain size={20} fill="currentColor" />
                            <span className="font-bold tracking-widest text-xs uppercase">NEURAL</span>
                        </div>
                        <h2 className="text-xs font-bold text-slate-400">Type connections to Dark Matter</h2>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-purple-50 text-[#9b72ff] px-4 py-2 rounded-full">
                        <Zap size={18} fill="currentColor" />
                        <span className="font-black text-lg">{combo}</span>
                    </div>
                    <div className="text-xl font-black text-red-500">{timeLeft}s</div>
                </div>

                {/* Progress bar line */}
                <div className="absolute bottom-0 left-0 h-1 bg-red-100 w-full overflow-hidden">
                    <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 8, ease: "linear" }}
                        className="h-full bg-red-500"
                    />
                </div>
            </header>

            <main className="flex-1 relative flex items-center justify-center p-12 overflow-hidden">
                {/* Radial Background Lines */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <div className="w-[300px] h-[300px] border border-slate-800 rounded-full" />
                    <div className="absolute w-[500px] h-[500px] border border-slate-800 rounded-full" />
                    <div className="absolute w-[700px] h-[700px] border border-slate-800 rounded-full" />
                </div>

                {/* Central Node */}
                <div className="relative z-10 flex flex-col items-center">
                    <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-40 h-40 bg-gradient-to-br from-[#9b72ff] to-[#8155ba] rounded-full flex flex-col items-center justify-center text-white shadow-2xl shadow-purple-500/40"
                    >
                        <div className="text-lg font-black uppercase tracking-widest">Dark Matter</div>
                        <div className="text-[10px] font-bold text-white/60 uppercase">NEURAL CORE</div>
                    </motion.div>

                    {/* Nodes orbiting */}
                    {NODES.map((node) => {
                        const radius = 220;
                        const x = Math.cos(node.angle * (Math.PI / 180)) * radius;
                        const y = Math.sin(node.angle * (Math.PI / 180)) * radius;
                        return (
                            <div 
                                key={node.id}
                                className="absolute"
                                style={{ transform: `translate(${x}px, ${y}px)` }}
                            >
                                <div className="absolute -inset-10 flex items-center justify-center">
                                    <div className="w-px h-px bg-slate-300 border-l border-dashed border-slate-300 transform origin-left" 
                                         style={{ width: `${radius}px`, transform: `rotate(${node.angle + 180}deg)` }} />
                                </div>
                                <div className="w-24 h-24 bg-white border border-slate-100 rounded-full flex flex-col items-center justify-center shadow-sm relative z-20">
                                    <div className="text-sm font-bold text-slate-800">{node.label}</div>
                                    <div className="text-[10px] font-bold text-slate-400">{node.score}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input Area */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-xl flex gap-4 px-8">
                    <div className="flex-1 relative">
                        {/* Suggestions mock */}
                        <div className="absolute -top-12 left-0 flex gap-2">
                            {["sure", "so", "us"].map(s => (
                                <span key={s} className="bg-slate-800 text-white px-4 py-1 rounded-lg text-sm font-medium">{s}</span>
                            ))}
                        </div>
                        <input 
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type connection..."
                            className="w-full h-16 bg-purple-50 border-2 border-purple-100 rounded-[20px] px-8 text-lg font-medium text-[#9b72ff] outline-none focus:border-[#9b72ff] transition-all placeholder-purple-200"
                            autoFocus
                        />
                    </div>
                    <button 
                        onClick={() => handleKeyDown({ key: "Enter" })}
                        className="w-16 h-16 bg-[#9b72ff] text-white rounded-[20px] flex items-center justify-center shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform"
                    >
                        <Target size={24} />
                    </button>
                </div>
            </main>
        </div>
    );
}