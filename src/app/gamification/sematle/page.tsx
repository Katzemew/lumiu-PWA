"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Target, Zap, Search, ArrowUpRight, Check } from "lucide-react";

export default function SemanticSprint() {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [attempts, setAttempts] = useState<{text: string, score: number}[]>([]);
    const [score, setScore] = useState(0);

    const handleGuess = () => {
        if (!input) return;
        const similarity = Math.floor(Math.random() * 100);
        setAttempts(prev => [{ text: input, score: similarity }, ...prev]);
        setScore(prev => prev + similarity);
        setInput("");
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
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 text-teal-500">
                        <Target size={20} />
                        <span className="font-bold tracking-widest text-xs uppercase">Semantic Sprint</span>
                    </div>
                </div>
                <div className="w-10" />
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-12">
                <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-100 mb-8">
                    <h1 className="text-3xl font-black mb-4">Target Concept: <span className="text-teal-500">Quantum Computing</span></h1>
                    <p className="text-slate-500 font-medium mb-12">
                        Find the most semantically related terms. AI will score your proximity.
                    </p>

                    <div className="flex gap-4 mb-12">
                        <div className="flex-1 relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                                placeholder="Enter a related concept..."
                                className="w-full h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl pl-16 pr-8 text-lg font-medium outline-none focus:border-teal-400 transition-all"
                            />
                        </div>
                        <button 
                            onClick={handleGuess}
                            className="bg-teal-500 text-white px-8 rounded-2xl font-bold flex items-center gap-2 hover:bg-teal-600 transition-colors"
                        >
                            Sprint <ArrowUpRight size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {attempts.map((attempt, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center">
                                            <Check size={16} />
                                        </div>
                                        <span className="font-bold text-lg">{attempt.text}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-teal-400" style={{ width: `${attempt.score}%` }} />
                                        </div>
                                        <span className="font-black text-teal-500">{attempt.score}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}