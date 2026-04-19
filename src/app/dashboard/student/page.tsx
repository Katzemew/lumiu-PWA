"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, TrendingUp, Users, Clock, Award, Activity, MousePointerClick, Calendar } from "lucide-react";

export default function StudentAnalyticsPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Dummy data for analytics
    const engagementData = [45, 55, 40, 65, 75, 60, 85, 70, 90, 80];

    return (
        <div className="min-h-screen bg-[#0d0614] text-white p-8 font-sans overflow-hidden relative">
            {/* Background effects */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#8155ba] blur-[150px] rounded-full opacity-30 animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#a882fc] blur-[160px] rounded-full opacity-20" />
            </div>

            <main className="max-w-7xl mx-auto relative z-10">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[#d8b4fe] font-bold mb-8 hover:translate-x-[-4px] transition-transform"
                >
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                        User{" "}
                        <motion.span 
                            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            style={{ backgroundSize: "200% auto" }}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] via-[#38bdf8] to-[#a855f7]"
                        >
                            Analytics
                        </motion.span>
                    </h1>
                    <p className="text-[#a78bfa] max-w-2xl text-lg font-medium">
                        Monitor learning progress, video engagement, and task organization in real-time.
                    </p>
                </motion.div>

                {/* Top Section: Main Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <StatCard delay={0.2} title="Overall Engagement" value="87%" icon={<Activity />} trend="+12%" />
                    <StatCard delay={0.3} title="Total Focus Time" value="14.2h" icon={<Clock />} trend="+2.4h" />
                    <StatCard delay={0.4} title="Active Sessions" value="1,204" icon={<Users />} trend="+48" />
                </div>

                {/* Bottom Section: Analytics charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Chart 1: Engagement Wave */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 80 }}
                        whileHover={{ y: -5 }}
                        className="bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-md hover:border-white/20 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                    >
                        <h3 className="text-xl font-bold mb-6 text-white/90">Engagement Timeline</h3>
                        <div className="h-48 flex items-end justify-between gap-2">
                            {engagementData.map((val, i) => (
                                <div key={i} className="w-full relative group">
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${val}%` }}
                                        transition={{ delay: 0.5 + i * 0.05, type: "spring", stiffness: 100 }}
                                        whileHover={{ scaleY: 1.05, transformOrigin: "bottom", filter: "brightness(1.5)" }}
                                        className="w-full bg-gradient-to-t from-[#6366f1] to-[#c084fc] rounded-t-lg relative overflow-hidden shadow-[0_0_15px_rgba(192,132,252,0.3)] cursor-none"
                                    >
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#2e1065] text-[#d8b4fe] text-xs py-1 px-2 rounded font-bold transition-all whitespace-nowrap z-20">
                                        {val}%
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-xs font-bold text-white/40 uppercase tracking-widest">
                            <span>Week 1</span>
                            <span>Week 2</span>
                            <span>Week 3</span>
                        </div>
                    </motion.div>

                    {/* Chart 2: Organization Mastery */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 80 }}
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-br from-[#2e1065] to-[#170533] border border-white/10 p-8 rounded-[32px] overflow-hidden relative hover:border-[#a855f7]/40 transition-all duration-300 hover:shadow-[0_10px_50px_rgba(168,85,247,0.15)]"
                    >
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-0 right-0 w-32 h-32 bg-[#c084fc] blur-[80px] rounded-full" 
                        />
                        
                        <h3 className="text-xl font-bold mb-8 text-white/90 relative z-10">Cognitive Focus Score</h3>
                        
                        <div className="flex items-center justify-center relative p-4 group cursor-none">
                            <svg className="w-40 h-40 transform -rotate-90">
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#a855f7" />
                                        <stop offset="100%" stopColor="#38bdf8" />
                                    </linearGradient>
                                    <filter id="scoreGlow">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                        <feMerge>
                                            <feMergeNode in="coloredBlur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                <circle 
                                    cx="80" cy="80" r="70" 
                                    className="stroke-white/5" strokeWidth="12" fill="none"
                                />
                                <motion.circle 
                                    cx="80" cy="80" r="70" 
                                    stroke="url(#scoreGradient)" strokeWidth="14" fill="none" strokeLinecap="round"
                                    filter="url(#scoreGlow)"
                                    initial={{ strokeDasharray: "440", strokeDashoffset: "440" }}
                                    animate={{ strokeDashoffset: "88" }}
                                    transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                                />
                            </svg>
                            <motion.div 
                                className="absolute inset-0 flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-300"
                            >
                                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-[#c084fc] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                    <AnimatedCounter from={0} to={80} />%
                                </span>
                                <span className="text-xs text-[#d8b4fe] font-medium">Optimal</span>
                            </motion.div>
                        </div>

                        <div className="mt-8 flex items-center justify-between px-4">
                            <div className="text-center group cursor-none">
                                <p className="text-xs text-[#a78bfa] mb-1 font-bold uppercase tracking-wider group-hover:text-white transition-colors">Attention</p>
                                <p className="text-2xl font-black text-white group-hover:drop-shadow-[0_0_10px_#a855f7] transition-all">
                                    <AnimatedCounter from={0} to={85} />%
                                </p>
                            </div>
                            <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                            <div className="text-center group cursor-none">
                                <p className="text-xs text-[#a78bfa] mb-1 font-bold uppercase tracking-wider group-hover:text-white transition-colors">Memory</p>
                                <p className="text-2xl font-black text-white group-hover:drop-shadow-[0_0_10px_#38bdf8] transition-all">
                                    <AnimatedCounter from={0} to={75} />%
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, trend, delay }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: "spring", stiffness: 90 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="flex-1 bg-white/5 border border-white/10 p-6 rounded-[28px] backdrop-blur-md relative overflow-hidden group hover:border-[#38bdf8]/30 hover:bg-white/10 hover:shadow-[0_15px_40px_rgba(56,189,248,0.1)] transition-all duration-300 cursor-none"
        >
            <motion.div 
                className="absolute top-0 right-0 w-32 h-32 bg-[#a855f7] blur-[60px] rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500" 
            />
            
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7e22ce] to-[#581c87] flex items-center justify-center shadow-lg">
                    <div className="text-white">
                        {icon}
                    </div>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {trend}
                </div>
            </div>
            
            <div className="relative z-10">
                <h4 className="text-sm font-bold text-white/50 mb-1">{title}</h4>
                <div className="text-3xl font-black text-white tracking-tight">{value}</div>
            </div>
        </motion.div>
    );
}

function AnimatedCounter({ from, to }: { from: number; to: number }) {
    const nodeRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;

        // Initialize with 'from' to ensure it displays 0 immediately
        node.textContent = from.toString();

        const controls = animate(from, to, {
            duration: 1.5,
            delay: 0.5,
            ease: "easeOut",
            onUpdate(value) {
                node.textContent = Math.round(value).toString();
            }
        });

        return () => controls.stop();
    }, [from, to]);

    return <span ref={nodeRef}>{from}</span>;
}
