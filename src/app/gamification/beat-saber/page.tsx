"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Play, RotateCcw, Volume2, VolumeX, Activity, Zap, Target } from "lucide-react";

const CATEGORIES: Record<string, string[]> = {
    "Web Development": ["React", "HTML", "CSS", "Next.js", "Vite", "Node.js", "Tailwind", "API"],
    "Neural Networks": ["Neuron", "Weights", "Bias", "Activation", "Layer", "Backprop", "Loss", "Epoch"],
    "Psychology": ["Behavior", "Cognition", "Memory", "Emotion", "Social", "Clinical", "Developmental", "Sensation"]
};

const DISTRACTORS = ["Cat", "Dog", "Blue", "Red", "Apple", "Banana", "Car", "Tree", "Mountain", "River"];

export default function BeatSaberGame() {
    const router = useRouter();
    const [gameState, setGameState] = useState("start"); // start, playing, finished
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [category, setCategory] = useState("Web Development");
    const [blocks, setBlocks] = useState<{id: number, text: string, isCorrect: boolean, left: number}[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [speed, setSpeed] = useState(3000); // Animation duration in ms
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const gameContainerRef = useRef(null);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"); // Replace with lo-fi beat
        audioRef.current.loop = true;
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Game loop
    useEffect(() => {
        if (gameState !== "playing") return;

        const interval = setInterval(() => {
            spawnBlock();
        }, 1500);

        return () => clearInterval(interval);
    }, [gameState, category]);

    const startGame = () => {
        setGameState("playing");
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setBlocks([]);
        setSpeed(3000);
        if (!isMuted && audioRef.current) audioRef.current.play();
        
        // Pick a random category
        const cats = Object.keys(CATEGORIES);
        setCategory(cats[Math.floor(Math.random() * cats.length)]);
    };

    const spawnBlock = () => {
        const isCorrect = Math.random() > 0.4;
        const text = isCorrect 
            ? CATEGORIES[category][Math.floor(Math.random() * CATEGORIES[category].length)]
            : DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)];
        
        const newBlock = {
            id: Date.now(),
            text,
            isCorrect,
            left: Math.random() * 80 + 10, // 10% to 90%
        };

        setBlocks(prev => [...prev, newBlock]);

        // Auto-remove block after speed duration
        setTimeout(() => {
            setBlocks(prev => prev.filter(b => b.id !== newBlock.id));
        }, speed);
    };

    const handleSlice = (block: {id: number, text: string, isCorrect: boolean, left: number}) => {
        if (block.isCorrect) {
            setScore(prev => prev + (10 * (combo + 1)));
            setCombo(prev => {
                const next = prev + 1;
                if (next > maxCombo) setMaxCombo(next);
                return next;
            });
            // Increase speed
            if (speed > 1500) setSpeed(prev => prev - 50);
        } else {
            setScore(prev => Math.max(0, prev - 20));
            setCombo(0);
            // Reset speed slightly
            setSpeed(prev => Math.min(3000, prev + 200));
        }
        setBlocks(prev => prev.filter(b => b.id !== block.id));
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f8f9fc] flex flex-col font-sans text-slate-800">
            {/* Header */}
            <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8">
                <button 
                    onClick={() => router.push('/gamification')}
                    className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 text-[#9b72ff]">
                        <Activity size={20} />
                        <span className="font-bold tracking-widest text-xs uppercase">Signal vs Noise</span>
                    </div>
                    <h2 className="text-sm font-bold text-slate-400">Target: {category}</h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-300 uppercase">Combo</span>
                        <span className="text-xl font-black text-[#9b72ff]">x{combo}</span>
                    </div>
                    <button onClick={toggleMute} className="text-slate-300">
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                </div>
            </header>

            <main className="flex-1 relative overflow-hidden bg-slate-50 flex items-center justify-center p-8">
                <div 
                    ref={gameContainerRef}
                    className="relative w-full max-w-4xl h-full bg-white rounded-[40px] shadow-2xl shadow-purple-500/5 border border-slate-100 overflow-hidden"
                >
                    {/* Game Grid Background */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                         style={{backgroundImage: 'radial-gradient(#9b72ff 1px, transparent 1px)', backgroundSize: '40px 40px'}} />

                    <AnimatePresence>
                        {gameState === "start" && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
                            >
                                <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center text-[#9b72ff] mb-6">
                                    <Activity size={40} />
                                </div>
                                <h1 className="text-4xl font-black mb-4">Signal vs Noise</h1>
                                <p className="text-slate-500 font-medium mb-8 text-center max-w-md">
                                    Slice the blocks that belong to the target category. Avoid the noise.
                                </p>
                                <button 
                                    onClick={startGame}
                                    className="bg-[#9b72ff] text-white px-12 py-4 rounded-full font-bold text-lg shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform"
                                >
                                    Start Session
                                </button>
                            </motion.div>
                        )}

                        {gameState === "playing" && (
                            <div className="absolute inset-0">
                                {/* Score Overlay */}
                                <div className="absolute top-8 left-8 z-10">
                                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Score</div>
                                    <div className="text-4xl font-black text-slate-800">{score}</div>
                                </div>

                                {/* Falling Blocks */}
                                <AnimatePresence>
                                    {blocks.map(block => (
                                        <motion.div
                                            key={block.id}
                                            initial={{ y: -100, x: `${block.left}%`, opacity: 0 }}
                                            animate={{ y: '110%', opacity: 1 }}
                                            transition={{ duration: speed / 1000, ease: "linear" }}
                                            onClick={() => handleSlice(block)}
                                            className={`absolute w-32 h-16 rounded-2xl flex items-center justify-center cursor-pointer shadow-lg transition-colors border-2 ${
                                                block.isCorrect 
                                                ? 'bg-purple-50 border-purple-200 text-[#9b72ff]' 
                                                : 'bg-white border-slate-100 text-slate-400'
                                            }`}
                                        >
                                            <span className="font-bold text-sm">{block.text}</span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}