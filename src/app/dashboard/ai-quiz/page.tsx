"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Sparkles, CheckCircle2, ChevronRight, RefreshCw, Book, BookOpen, Settings, LayoutGrid, Activity } from "lucide-react";

export default function AIQuizGeneratorPage() {
    const [topic, setTopic] = useState("");
    const [context, setContext] = useState("");
    const [difficulty, setDifficulty] = useState<"Gentle" | "Normal" | "Challenge">("Gentle");
    const [quizState, setQuizState] = useState<"idle" | "generating" | "ready" | "completed">("idle");
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [quizData, setQuizData] = useState<any[]>([]);
    const [recommendedDifficulty, setRecommendedDifficulty] = useState<"Gentle" | "Normal" | "Challenge">("Gentle");
    const [isAnalyzingFocus, setIsAnalyzingFocus] = useState(false);
    const [performanceMetrics, setPerformanceMetrics] = useState<{focus: number, organization: number, aiTrainedInsight?: string} | null>(null);
    const [showInsight, setShowInsight] = useState(false);

    const handleAnalyzeFocus = async () => {
        setIsAnalyzingFocus(true);
        try {
            // Get user's local performance
            const stats = JSON.parse(localStorage.getItem("lumiu-performance") || '{"avgScore": 0, "totalQuizzes": 0, "lastDifficulty": "Gentle", "totalScore": 0}');
            // Normalize score assuming 5 questions per quiz.
            const currentAvgScore = stats.totalQuizzes > 0 ? (stats.totalScore / (stats.totalQuizzes * 5)) : 0.6;
            
            // Connect strictly to the backend Adaptability Engine which queries the Kaggle dataset
            const response = await fetch("/api/adaptability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentAvgScore })
            });

            if (!response.ok) throw new Error("Adaptability Engine backend connection failed.");

            const data = await response.json();
            
            setPerformanceMetrics({ focus: data.focus, organization: data.organization, aiTrainedInsight: data.aiTrainedInsight });
            setDifficulty(data.recommendedDifficulty);
            setRecommendedDifficulty(data.recommendedDifficulty);
            setShowInsight(true);
        } catch (error) {
            console.error("Adaptability Error:", error);
            // Safe fallback if server is unreachable
            setRecommendedDifficulty("Gentle");
            setDifficulty("Gentle");
        } finally {
            setIsAnalyzingFocus(false);
        }
    };

    // Replace component mount auto-fetch with manual scan if desired, but for now we define both.
    useEffect(() => {
        // We can either fetch on mount, or wait for user to click the button.
        // Assuming we want the user to trigger the scan manually via `handleAnalyzeFocus`:
        // If we want it on mount, we can call handleAnalyzeFocus(). Let's just leave it empty if we want the button to appear.
    }, []);

    const updatePerformance = (finalScore: number) => {
        const stats = JSON.parse(localStorage.getItem("lumiu-performance") || '{"avgScore": 0, "totalQuizzes": 0, "lastDifficulty": "Gentle", "totalScore": 0}');
        stats.totalQuizzes += 1;
        stats.totalScore += finalScore;
        stats.lastDifficulty = difficulty;
        // Approximation: normalize to 0-1 range based on quiz length
        stats.avgScore = stats.totalScore / (stats.totalQuizzes * (quizData.length || 5));
        localStorage.setItem("lumiu-performance", JSON.stringify(stats));
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setQuizState("generating");

        try {
            const response = await fetch("/api/quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic, difficulty, context, performanceMetrics })
            });

            if (!response.ok) throw new Error("Failed to generate quiz");

            const data = await response.json();
            setQuizData(data);
            setQuizState("ready");
            setCurrentQuestion(0);
            setScore(0);
            setSelectedAnswer(null);
        } catch (error) {
            console.error("Quiz Error:", error);
            alert("Oops! The universe is a bit cloudy. Try again in a moment.");
            setQuizState("idle");
        }
    };

    const handleAnswerSelect = (index: number) => {
        if (selectedAnswer !== null) return; // Prevent changing answer
        setSelectedAnswer(index);

        if (index === quizData[currentQuestion].correctIndex) {
            setScore((s) => s + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestion < quizData.length - 1) {
            setCurrentQuestion((c) => c + 1);
            setSelectedAnswer(null);
        } else {
            setQuizState("completed");
            updatePerformance(score);

            // Offline Sync: Save progress to local storage
            const savedCrystals = parseInt(localStorage.getItem("lumiu-crystals") || "0");
            localStorage.setItem("lumiu-crystals", (savedCrystals + score + 1).toString()); // give crystals based on score + participation
        }
    };

    const difficultyColors = {
        "Gentle": "bg-emerald-100 text-emerald-700 border-emerald-200",
        "Normal": "bg-blue-100 text-blue-700 border-blue-200",
        "Challenge": "bg-purple-100 text-purple-700 border-purple-200",
    };

    return (
        <div className="min-h-screen bg-[#0c111d] text-white font-sans selection:bg-purple-500/30 relative overflow-hidden">
            {/* 🌌 Cinematic Background Background */}
            <div className="fixed inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
            </div>

            <nav className="relative z-50 max-w-6xl mx-auto flex items-center justify-between px-8 py-10">
                <div className="flex items-center gap-6">
                    <Link
                        href="/dashboard"
                        className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all text-white/80"
                    >
                        <ArrowLeft size={22} />
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-purple-400 uppercase tracking-[0.2em]">Universe of Learning</span>
                        <h1 className="text-3xl font-black tracking-tighter">AI Quiz <span className="text-[#a855f7]">Master</span></h1>
                    </div>
                </div>

                {/* Adaptability Engine Status Badge */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden md:flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md"
                >
                    <div className="relative">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
                        <div className="w-3 h-3 bg-emerald-500 rounded-full relative" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Adaptability Engine</span>
                        <span className="text-sm font-bold text-emerald-400">Personalizing for you</span>
                    </div>
                </motion.div>
            </nav>

            <main className="relative z-10 max-w-5xl mx-auto px-8 pb-20">
                <AnimatePresence mode="wait">

                    {/* STATE 1: IDLE / CONFIG */}
                    {quizState === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.4 } }}
                            className="bg-white/[0.03] backdrop-blur-3xl p-10 sm:p-14 rounded-[48px] border border-white/10 shadow-2xl space-y-12"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                <div className="lg:col-span-7 space-y-10">
                                    <div className="space-y-4">
                                        <h2 className="text-4xl font-black leading-tight">What shall we <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">discover today?</span></h2>
                                        <p className="text-white/50 text-lg leading-relaxed max-w-md font-medium">
                                            Enter a topic or paste your study notes. Our AI will curate a perfectly paced session just for you.
                                        </p>
                                    </div>

                                    <form onSubmit={handleGenerate} className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-sm font-bold text-white/40 uppercase tracking-widest px-1">
                                                <Sparkles size={14} className="text-purple-400" />
                                                Study Topic
                                            </div>
                                            <input
                                                type="text"
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                placeholder="The Solar System, Photosynthesis, or your own topic..."
                                                className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-xl font-medium focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/50 outline-none transition-all placeholder:text-white/20"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-1">
                                                <div className="flex items-center gap-2 text-sm font-bold text-white/40 uppercase tracking-widest">
                                                    <Book size={14} className="text-blue-400" />
                                                    Knowledge Source (Optional)
                                                </div>
                                                <span className="text-[10px] text-white/30 font-bold border border-white/10 px-2 py-0.5 rounded-md">Smart Parsing</span>
                                            </div>
                                            <textarea
                                                value={context}
                                                onChange={(e) => setContext(e.target.value)}
                                                placeholder="Paste your notes or uploaded data here to ground the quiz in your specific material."
                                                rows={5}
                                                className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-base font-medium focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500/50 outline-none transition-all placeholder:text-white/20 resize-none leading-relaxed"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!topic.trim()}
                                            className="w-full relative group mt-4 overflow-hidden rounded-3xl"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#a855f7] to-[#6366f1] transition-transform duration-500 group-hover:scale-105" />
                                            <div className="relative py-6 px-10 flex items-center justify-center gap-4 text-white font-black text-xl">
                                                <Sparkles size={24} className="group-hover:animate-pulse" />
                                                <span>Initialize Learning Simulation</span>
                                            </div>
                                        </button>
                                    </form>
                                </div>

                                <div className="lg:col-span-5 flex flex-col gap-6">
                                    <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] flex-1 flex flex-col">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-xl font-black">Simulation Parameters</h3>
                                            <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
                                                <Settings size={20} />
                                            </div>
                                        </div>

                                        {/* Performance-Based Logic Button */}
                                        {!performanceMetrics && !isAnalyzingFocus ? (
                                            <button 
                                                onClick={handleAnalyzeFocus}
                                                className="mb-8 p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-3xl group/focus hover:bg-indigo-500/20 transition-all text-left"
                                            >
                                                <div className="flex items-center gap-4 mb-2">
                                                    <Activity size={20} className="text-indigo-400 group-hover/focus:animate-pulse" />
                                                    <span className="text-sm font-black uppercase tracking-widest text-indigo-300">New: Performance Scan</span>
                                                </div>
                                                <p className="text-xs text-white/50 leading-relaxed">
                                                    Analyze your current <strong>Focus Score</strong> and <strong>Organizing Difficulty</strong> (based on 4-Classes dataset logic) to optimize simulation difficulty.
                                                </p>
                                            </button>
                                        ) : isAnalyzingFocus ? (
                                            <div className="mb-8 p-6 bg-indigo-500/5 border border-dashed border-indigo-500/30 rounded-3xl flex flex-col items-center text-center">
                                                <RefreshCw size={24} className="animate-spin text-indigo-400 mb-4" />
                                                <span className="text-xs font-black uppercase tracking-widest text-indigo-300">Scanning Cognition...</span>
                                            </div>
                                        ) : (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Performance Metrics</span>
                                                    <button onClick={() => setPerformanceMetrics(null)} className="text-[10px] text-white/20 hover:text-white/50 uppercase font-black">Reset</button>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="flex-1 space-y-1">
                                                        <div className="text-[10px] text-white/40 uppercase font-bold text-center">Focus</div>
                                                        <div className="text-2xl font-black text-center text-white">{performanceMetrics!.focus}<span className="text-[10px] opacity-40">/10</span></div>
                                                    </div>
                                                    <div className="w-px h-10 bg-white/10 mt-2" />
                                                    <div className="flex-1 space-y-1">
                                                        <div className="text-[10px] text-white/40 uppercase font-bold text-center">Org. Difficulty</div>
                                                        <div className="text-2xl font-black text-center text-white">{performanceMetrics!.organization}</div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-white/5 text-[10px] italic text-emerald-400/60 text-center font-bold">
                                                    Difficulty auto-calibrated to {difficulty}
                                                </div>
                                                {performanceMetrics!.aiTrainedInsight && (
                                                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">AI Model Training Insight</span>
                                                        <p className="text-xs text-white/70 italic">&quot;{performanceMetrics!.aiTrainedInsight}&quot;</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        <div className="space-y-4 flex-1">
                                            <label className="text-sm font-bold text-white/40 uppercase tracking-widest block px-1">Pace & Intensity</label>
                                            <div className="grid grid-cols-1 gap-4">
                                                {(["Gentle", "Normal", "Challenge"] as const).map((level) => {
                                                    const isRecommended = level === recommendedDifficulty;
                                                    return (
                                                        <button
                                                            key={level}
                                                            type="button"
                                                            onClick={() => setDifficulty(level)}
                                                            className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                                                                difficulty === level 
                                                                ? "bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10" 
                                                                : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10"
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-lg font-black">{level}</span>
                                                                {isRecommended && (
                                                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-black px-2 py-1 rounded-lg uppercase tracking-tight">Recommended</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs opacity-60 mt-1 font-medium">
                                                                {level === 'Gentle' ? 'Calm, foundational basics.' : level === 'Normal' ? 'Balanced conceptual growth.' : 'Extreme cognitive test.'}
                                                            </p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-8 pt-8 border-t border-white/5 flex items-start gap-4">
                                            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 flex-shrink-0">
                                                <LayoutGrid size={18} />
                                            </div>
                                            <p className="text-xs text-white/50 leading-relaxed italic">
                                                The <span className="text-white font-bold">Adaptability Engine</span> has adjusted the current recommendation based on your recent mastery trends.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STATE 2: GENERATING (Cinematic Loading) */}
                    {quizState === "generating" && (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-[60vh] text-center"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{
                                        rotate: 360,
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 8,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    className="w-56 h-56 rounded-full border border-purple-500/30 border-t-purple-500 absolute -inset-4"
                                />
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.3, 0.8, 0.3],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="w-48 h-48 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-3xl"
                                >
                                    <Sparkles size={64} className="text-[#a855f7]" />
                                </motion.div>
                            </div>
                            <h2 className="text-4xl font-black mt-16 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Synthesizing Your Curriculum</h2>
                            <p className="text-white/40 font-medium text-lg max-w-sm leading-relaxed">
                                Curating high-fidelity questions tailored precisely to your cognitive pace.
                            </p>
                        </motion.div>
                    )}

                    {/* STATE 3: READY / QUIZ IN PROGRESS */}
                    {quizState === "ready" && (
                        <motion.div
                            key="ready"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white/5 backdrop-blur-3xl p-10 sm:p-16 rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden"
                        >
                            {/* Decorative background for question */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] pointer-events-none" />

                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                                        <BookOpen size={24} />
                                    </div>
                                    <span className="text-sm font-bold text-white/40 uppercase tracking-widest leading-none">Simulation in Progress</span>
                                </div>
                                <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-black text-white/80">
                                    {currentQuestion + 1} / {quizData.length}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-white/5 h-2 rounded-full mb-14 overflow-hidden border border-white/5 p-[1px]">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentQuestion) / quizData.length) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                                />
                            </div>

                            <h2 className="text-4xl font-black text-white mb-12 leading-tight">
                                {quizData[currentQuestion].question}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {quizData[currentQuestion].options.map((option: string, index: number) => {
                                    const isSelected = selectedAnswer === index;
                                    const isCorrect = index === quizData[currentQuestion].correctIndex;
                                    const showResult = selectedAnswer !== null;

                                    let containerClass = "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20";
                                    let textClass = "text-white/80";

                                    if (showResult) {
                                        if (isCorrect) {
                                            containerClass = "bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]";
                                            textClass = "text-emerald-300";
                                        }
                                        else if (isSelected && !isCorrect) {
                                            containerClass = "bg-rose-500/20 border-rose-500/50 opacity-100";
                                            textClass = "text-rose-300";
                                        }
                                        else {
                                            containerClass = "bg-white/2 border-white/2 opacity-30";
                                            textClass = "text-white/40";
                                        }
                                    }

                                    return (
                                        <button
                                            key={index}
                                            disabled={showResult}
                                            onClick={() => handleAnswerSelect(index)}
                                            className={`group relative p-8 rounded-3xl border-2 text-left transition-all duration-300 ${containerClass}`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-sm transition-colors ${
                                                    showResult && isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 
                                                    showResult && isSelected && !isCorrect ? 'bg-rose-500 border-rose-500 text-white' :
                                                    'bg-white/5 border-white/10 text-white/40'
                                                }`}>
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <span className={`text-xl font-bold flex-1 ${textClass}`}>{option}</span>
                                                {showResult && isCorrect && <CheckCircle2 size={24} className="text-emerald-500 flex-shrink-0" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Explanation & Next Box */}
                            <AnimatePresence>
                                {selectedAnswer !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-12 group/nav"
                                    >
                                        <div className={`p-10 rounded-[32px] border flex flex-col md:flex-row gap-10 items-start md:items-center justify-between relative overflow-hidden ${
                                            selectedAnswer === quizData[currentQuestion].correctIndex 
                                            ? 'bg-emerald-500/5 border-emerald-500/20' 
                                            : 'bg-rose-500/5 border-rose-500/20'
                                        }`}>
                                            <div className="flex-1 space-y-3">
                                                <div className={`text-lg font-black uppercase tracking-widest ${
                                                    selectedAnswer === quizData[currentQuestion].correctIndex ? 'text-emerald-400' : 'text-rose-400'
                                                }`}>
                                                    {selectedAnswer === quizData[currentQuestion].correctIndex ? "Synthesis Optimized" : "Correction Required"}
                                                </div>
                                                <p className="text-white/80 text-lg leading-relaxed font-medium">
                                                    {quizData[currentQuestion].explanation}
                                                </p>
                                            </div>

                                            <button
                                                onClick={handleNextQuestion}
                                                className="flex-shrink-0 relative py-5 px-10 rounded-2xl overflow-hidden group/btn w-full md:w-auto"
                                            >
                                                <div className="absolute inset-0 bg-white/10 group-hover/btn:bg-white/20 transition-colors" />
                                                <div className="relative flex items-center justify-center gap-3 font-black text-white">
                                                    <span>{currentQuestion < quizData.length - 1 ? "Next Chapter" : "Finalize Simulation"}</span>
                                                    <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </div>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* STATE 4: COMPLETED */}
                    {quizState === "completed" && (
                        <motion.div
                            key="completed"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 backdrop-blur-3xl p-16 rounded-[48px] border border-white/10 shadow-2xl text-center flex flex-col items-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                            
                            <motion.div 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-40 h-40 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-10 border-8 border-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
                            >
                                <CheckCircle2 size={80} />
                            </motion.div>
                            
                            <h1 className="text-5xl font-black text-white mb-6 tracking-tight">Mastery Confirmed</h1>
                            <p className="text-2xl text-white/50 font-medium mb-12 max-w-lg leading-relaxed">
                                You’ve successfully navigated the simulation of <span className="text-white font-bold">{topic}</span>. 
                                Performance score: <strong className="text-purple-400">{score} / {quizData.length}</strong>.
                            </p>

                            <div className="bg-white/5 border border-white/10 p-10 rounded-[32px] flex flex-col items-center gap-6 mb-12 w-full max-w-md relative">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-500 rounded-full text-[10px] font-black uppercase tracking-widest text-white ring-8 ring-[#0c111d]">Network Reward</div>
                                <div className="text-6xl filter drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">💎</div>
                                <div className="space-y-1">
                                    <div className="text-[#1e1b4b] font-black text-3xl text-white">+{score + 2} Knowledge Crystals</div>
                                    <div className="text-emerald-400 text-sm font-black uppercase tracking-widest">Synergy bonus active</div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
                                <button
                                    onClick={() => setQuizState("idle")}
                                    className="flex-1 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-white/10 transition-all uppercase tracking-widest text-sm"
                                >
                                    <RefreshCw size={18} />
                                    New Simulation
                                </button>
                                <Link
                                    href="/dashboard"
                                    className="flex-1 relative group overflow-hidden rounded-2xl"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600" />
                                    <div className="relative py-5 px-8 text-white font-black uppercase tracking-widest text-sm text-center">
                                        Command Center
                                    </div>
                                </Link>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
}
