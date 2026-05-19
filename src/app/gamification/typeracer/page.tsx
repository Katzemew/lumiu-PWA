"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Timer, RotateCcw, Zap, Award } from "lucide-react";

const SAMPLE_TEXT = "The mitochondria is the powerhouse of the cell. It generates most of the chemical energy needed to power the cell's biochemical reactions. Chemical energy produced by the mitochondria is stored in a small molecule called adenosine triphosphate (ATP).";

export default function TypeRacerGame() {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [startTime, setStartTime] = useState<number | null>(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (startTime && !isFinished) {
            const interval = setInterval(() => {
                const now = Date.now();
                const seconds = (now - startTime) / 1000;
                const words = input.trim().split(/\s+/).length;
                setWpm(Math.round((words / seconds) * 60));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [startTime, isFinished, input]);

    const handleInput = (e: any) => {
        const value = e.target.value;
        if (!startTime) setStartTime(Date.now());
        
        setInput(value);

        // Check accuracy
        let correct = 0;
        for (let i = 0; i < value.length; i++) {
            if (value[i] === SAMPLE_TEXT[i]) correct++;
        }
        setAccuracy(Math.round((correct / value.length) * 100) || 100);

        if (value === SAMPLE_TEXT) {
            setIsFinished(true);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f8f9fc] flex flex-col font-sans text-slate-800">
            <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8">
                <button 
                    onClick={() => router.push('/gamification')}
                    className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2 text-orange-500">
                    <Timer size={20} />
                    <span className="font-bold tracking-widest text-xs uppercase">Pressure Cooker</span>
                </div>
                <div className="w-10" />
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-12">
                <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-100">
                    <div className="flex gap-12 mb-12">
                        <div className="flex-1">
                            <div className="text-[10px] font-bold text-slate-300 uppercase mb-1">Speed</div>
                            <div className="text-4xl font-black text-[#9b72ff]">{wpm} <span className="text-sm">WPM</span></div>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="text-[10px] font-bold text-slate-300 uppercase mb-1">Accuracy</div>
                            <div className="text-4xl font-black text-slate-800">{accuracy}%</div>
                        </div>
                        <div className="flex-1 text-right">
                            <div className="text-[10px] font-bold text-slate-300 uppercase mb-1">Status</div>
                            <div className="flex items-center justify-end gap-2 text-green-500">
                                <Zap size={20} fill="currentColor" />
                                <span className="font-bold">Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-2xl leading-relaxed font-medium text-slate-300 mb-12 relative">
                        <span className="text-slate-800">{SAMPLE_TEXT.substring(0, input.length)}</span>
                        {SAMPLE_TEXT.substring(input.length)}
                    </div>

                    <textarea 
                        value={input}
                        onChange={handleInput}
                        disabled={isFinished}
                        placeholder="Start typing to begin..."
                        className="w-full h-40 bg-slate-50 border-2 border-slate-100 rounded-3xl p-8 text-xl font-medium outline-none focus:border-orange-400 transition-all resize-none"
                    />

                    {isFinished && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 p-8 bg-green-50 border border-green-100 rounded-3xl flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-green-800">Challenge Complete!</div>
                                    <div className="text-sm text-green-600">You typed at {wpm} WPM with {accuracy}% accuracy.</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => window.location.reload()}
                                className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center gap-2"
                            >
                                <RotateCcw size={18} /> Retry
                            </button>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}