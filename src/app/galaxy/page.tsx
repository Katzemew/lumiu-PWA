"use client";

import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Line, Sphere } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import * as THREE from "three";
import {
    ArrowLeft,
    Sparkles,
    CheckCircle2,
    Lock,
    Zap,
    Compass,
    Play,
    Info,
    Flame,
    RefreshCw,
    Settings,
    ChevronRight,
    Award
} from "lucide-react";

// Web Audio API Synthesizer for high-fidelity audio feedback
const playSound = (type: "chime" | "hover" | "success" | "click") => {
    if (typeof window === "undefined") return;
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const now = ctx.currentTime;

        if (type === "chime") {
            const playNote = (freq: number, delay: number, dur: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now + delay);
                gain.gain.setValueAtTime(0.0001, now + delay);
                gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + delay);
                osc.stop(now + delay + dur);
            };
            playNote(523.25, 0, 0.4); // C5
            playNote(659.25, 0.08, 0.5); // E5
            playNote(783.99, 0.16, 0.6); // G5
            playNote(1046.50, 0.24, 0.8); // C6
        } else if (type === "hover") {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(260, now);
            osc.frequency.exponentialRampToValueAtTime(392, now + 0.06);
            gain.gain.setValueAtTime(0.015, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(now + 0.08);
        } else if (type === "click") {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(330, now + 0.04);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(now + 0.1);
        } else if (type === "success") {
            const osc = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(392, now);
            osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25);
            
            osc2.type = "triangle";
            osc2.frequency.setValueAtTime(196, now);
            osc2.frequency.exponentialRampToValueAtTime(392, now + 0.25);
            
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.1, now + 0.06);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
            
            osc.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc2.start();
            osc.stop(now + 0.4);
            osc2.stop(now + 0.4);
        }
    } catch (e) {
        // Safe fallback
    }
};

// Base data template
const constellationsRaw = [
    {
        id: "aquila",
        name: "01 Aquila",
        description: "The Eagle of Focus",
        lore: "Master of focus stamina. Modeled after the cosmic eagle, its stars activate as you align with deep work blocks and maintain long-term focus streaks.",
        x: -9, y: 5, z: -5,
        status: "current",
        moduleName: "Focus Mode",
        moduleUrl: "/focus",
        stars: [
            { id: "aq1", dx: -0.5, dy: 1, dz: 0, name: "Altair (Alpha Aquilae)", requirement: "Start a focus session", completed: false },
            { id: "aq2", dx: 0, dy: -0.5, dz: 1, name: "Tarazed", requirement: "Accumulate 25 mins focus time", completed: false },
            { id: "aq3", dx: 0.4, dy: 0.6, dz: -0.5, name: "Alshain", requirement: "Accumulate 60 mins focus time", completed: false },
            { id: "aq4", dx: 0.8, dy: 1.2, dz: 0, name: "Theta Aquilae", requirement: "Accumulate 180 mins focus time", completed: false },
            { id: "aq5", dx: 1.4, dy: 1.8, dz: 0.5, name: "Eta Aquilae", requirement: "Complete 5 focus sessions", completed: false },
        ],
        connections: [[0, 1], [1, 2], [0, 2], [2, 3], [3, 4]]
    },
    {
        id: "scutum",
        name: "02 Scutum",
        description: "The Shield of Recall",
        lore: "Represents active study protection and flashcard retention. Strengthens your cognitive memory banks through folder building and active recall deck building.",
        x: -6, y: 1, z: 2,
        status: "current",
        moduleName: "Flashcards",
        moduleUrl: "/flashcards",
        stars: [
            { id: "scu1", dx: 0, dy: -0.4, dz: 0, name: "Alpha Scuti", requirement: "Create at least 1 study deck", completed: false },
            { id: "scu2", dx: -0.3, dy: 0.2, dz: 0.5, name: "Beta Scuti", requirement: "Organize decks in a folder", completed: false },
            { id: "scu3", dx: 0.4, dy: 0.3, dz: -0.5, name: "Delta Scuti", requirement: "Build a deck with 10+ cards", completed: false },
            { id: "scu4", dx: 0.1, dy: 0.8, dz: 0, name: "Gamma Scuti", requirement: "Review 5+ cards total", completed: false },
        ],
        connections: [[0, 1], [0, 2], [1, 3], [2, 3]]
    },
    {
        id: "libra",
        name: "03 Libra",
        description: "The Scales of Thought",
        lore: "Balances creative intuition with architectured note structures. Stars light up as notebooks, sections, and structural ideas are systematically curated.",
        x: 1, y: 6, z: -4,
        status: "current",
        moduleName: "Notes",
        moduleUrl: "/notes",
        stars: [
            { id: "lb1", dx: 0, dy: -0.5, dz: 0, name: "Zubeneschamali", requirement: "Draft your first structured note", completed: false },
            { id: "lb2", dx: -0.6, dy: 0.4, dz: 1, name: "Zubenelgenubi", requirement: "Create notebooks or 3+ notes", completed: false },
            { id: "lb3", dx: 0.8, dy: 0.6, dz: -0.5, name: "Brachium", requirement: "Write 500+ characters total in notes", completed: false },
            { id: "lb4", dx: -0.6, dy: 1.6, dz: 0, name: "Sigma Librae", requirement: "Create 5+ study notes in total", completed: false },
        ],
        connections: [[0, 1], [0, 2], [1, 2], [1, 3]]
    },
    {
        id: "ophiuchus",
        name: "04 Ophiuchus",
        description: "The Serpent of Gaming",
        lore: "Empowers gaming reflexes and gamified brain loop optimization. The neural serpent bearer, fueled by mini-game plays and total system XP.",
        x: 5, y: 2, z: 5,
        status: "current",
        moduleName: "Neural Games",
        moduleUrl: "/gamification",
        stars: [
            { id: "op1", dx: 0, dy: -1.0, dz: 0, name: "Rasalhague", requirement: "Play any neural mini-game", completed: false },
            { id: "op2", dx: -0.8, dy: 0, dz: 0.5, name: "Cebalrai", requirement: "Reach 500+ system XP points", completed: false },
            { id: "op3", dx: 0.8, dy: 0.2, dz: -0.5, name: "Yed Prior", requirement: "Play 2+ neural games", completed: false },
            { id: "op4", dx: -1.2, dy: 1.2, dz: 0, name: "Sabik", requirement: "Play 3+ neural games", completed: false },
            { id: "op5", dx: 1.2, dy: 1.4, dz: 1, name: "Zeta Ophiuchi", requirement: "Play 5+ neural games", completed: false },
            { id: "op6", dx: 0, dy: 1.8, dz: -0.5, name: "Eta Ophiuchi", requirement: "Reach 1200+ system XP points", completed: false },
        ],
        connections: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5]]
    },
    {
        id: "sagittarius",
        name: "05 Sagittarius",
        description: "The Archer of Insights",
        lore: "Targets precision thinking and analytical self-reflection. Harnesses performance statistics and quiz evaluations to hit peak cognitive scores.",
        x: -3, y: -3, z: -8,
        status: "current",
        moduleName: "AI Quiz & Analytics",
        moduleUrl: "/dashboard/student",
        stars: [
            { id: "sg1", dx: -0.6, dy: 0, dz: 0, name: "Kaus Media", requirement: "Complete an AI generated quiz", completed: false },
            { id: "sg2", dx: -0.2, dy: -0.5, dz: 0.5, name: "Kaus Borealis", requirement: "Maintain a 60%+ average score", completed: false },
            { id: "sg3", dx: 0.4, dy: -0.2, dz: -0.5, name: "Nunki", requirement: "Complete 3+ AI generated quizzes", completed: false },
            { id: "sg4", dx: 0.8, dy: 0.8, dz: 0, name: "Ascella", requirement: "Explore analytics statistics", completed: false },
            { id: "sg5", dx: 0, dy: 1.0, dz: 1, name: "Kaus Australis", requirement: "Maintain a 80%+ average score", completed: false },
        ],
        connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2]]
    },
    {
        id: "serpens",
        name: "06 Serpens",
        description: "The Serpent of Adaptability",
        lore: "Unlocked at 500 XP. Reflects your cognitive elasticity, and fluid learning capabilities as you navigate different task domains.",
        x: 9, y: 6, z: 2,
        status: "locked",
        moduleName: "General Progress",
        moduleUrl: "/gamification",
        stars: [
            { id: "sr1", dx: 0, dy: 0, dz: 0, name: "Unukalhai", requirement: "Reach 600+ XP points", completed: false },
            { id: "sr2", dx: -0.4, dy: 0.8, dz: 0.5, name: "Alya", requirement: "Reach 700+ XP points", completed: false },
            { id: "sr3", dx: 0.4, dy: -0.6, dz: -0.5, name: "Mu Serpentis", requirement: "Reach 800+ XP points", completed: false },
        ],
        connections: [[0, 1], [0, 2]]
    },
    {
        id: "scorpius",
        name: "07 Scorpius",
        description: "The Scorpion of Mastery",
        lore: "Unlocked at 800 XP. Represents deep focus resilience, intense critical thinking challenges, and high complexity module syncs.",
        x: 4, y: -7, z: -2,
        status: "locked",
        moduleName: "General Progress",
        moduleUrl: "/gamification",
        stars: [
            { id: "sc1", dx: 0, dy: -0.8, dz: 0, name: "Antares", requirement: "Reach 900+ XP points", completed: false },
            { id: "sc2", dx: -0.4, dy: -1.2, dz: 0.5, name: "Graffias", requirement: "Reach 1000+ XP points", completed: false },
            { id: "sc3", dx: -0.1, dy: -0.3, dz: -0.5, name: "Al Niyat", requirement: "Reach 1100+ XP points", completed: false },
            { id: "sc4", dx: 0.4, dy: 0.2, dz: 0, name: "Wei", requirement: "Reach 1150+ XP points", completed: false },
            { id: "sc5", dx: -0.1, dy: 0.8, dz: 0.5, name: "Sargas", requirement: "Reach 1180+ XP points", completed: false },
            { id: "sc6", dx: -0.8, dy: 1.0, dz: -0.5, name: "Shaula", requirement: "Reach 1200+ XP points", completed: false },
        ],
        connections: [[0, 2], [2, 3], [3, 4], [4, 5], [0, 1]]
    },
    {
        id: "capricorn",
        name: "08 Capricorn",
        description: "The Sea-Goat of Memory",
        lore: "Unlocked at 1200 XP. Connects deep long-term memory integration and represents complete structural alignment in all base subjects.",
        x: -9, y: -6, z: 6,
        status: "locked",
        moduleName: "General Progress",
        moduleUrl: "/gamification",
        stars: [
            { id: "cp1", dx: -0.5, dy: 0, dz: 0, name: "Algedi", requirement: "Reach 1300+ XP points", completed: false },
            { id: "cp2", dx: 0.8, dy: -0.4, dz: 0.5, name: "Dabih", requirement: "Reach 1400+ XP points", completed: false },
            { id: "cp3", dx: 0.6, dy: 0.6, dz: -0.5, name: "Nashira", requirement: "Reach 1500+ XP points", completed: false },
            { id: "cp4", dx: -0.8, dy: 0.8, dz: 0, name: "Deneb Algedi", requirement: "Reach 1550+ XP points", completed: false },
        ],
        connections: [[0, 1], [1, 2], [2, 3], [3, 0]]
    },
    {
        id: "lupus",
        name: "09 Lupus",
        description: "The Wolf of Cosmic Synch",
        lore: "Unlocked at 1600 XP. The ultimate cosmic cognitive sync index, achieved when note-taking, retention, games and focus align.",
        x: 10, y: -3, z: -6,
        status: "locked",
        moduleName: "General Progress",
        moduleUrl: "/gamification",
        stars: [
            { id: "lp1", dx: 0, dy: 0, dz: 0, name: "Alpha Lupi", requirement: "Reach 1700+ XP points", completed: false },
            { id: "lp2", dx: -0.4, dy: 0.4, dz: 0.5, name: "Beta Lupi", requirement: "Reach 1800+ XP points", completed: false },
            { id: "lp3", dx: 0.4, dy: 0.6, dz: -0.5, name: "Gamma Lupi", requirement: "Reach 1900+ XP points", completed: false },
        ],
        connections: [[0, 1], [0, 2]]
    }
];

// Helper to compute user progress dynamically from localStorage
const loadRealProgress = () => {
    if (typeof window === "undefined") return constellationsRaw;

    // 1. Focus Mode Data
    let focusDuration = 0;
    let focusSessions = 0;
    try {
        const focusHistory = JSON.parse(localStorage.getItem("lumiu-focus-history") || "[]");
        focusSessions = focusHistory.length;
        focusDuration = focusHistory.reduce((acc: number, cur: any) => acc + (cur.duration || 0), 0);
    } catch (e) {
        console.error("Failed to parse focus history:", e);
    }

    // 2. Flashcards Data
    let decksCount = 0;
    let foldersCount = 0;
    let cardReviews = 0;
    let totalCardsCount = 0;
    try {
        const decks = JSON.parse(localStorage.getItem("lumiu-decks") || "[]");
        decksCount = decks.length;
        totalCardsCount = decks.reduce((acc: number, cur: any) => acc + (cur.cards?.length || 0), 0);
        
        const folders = JSON.parse(localStorage.getItem("lumiu-folders") || "[]");
        foldersCount = folders.length;
        
        const cardHistory = JSON.parse(localStorage.getItem("lumiu-flashcard-history") || "[]");
        cardReviews = cardHistory.length;
    } catch (e) {
        console.error("Failed to parse flashcards details:", e);
    }

    // 3. Notes Data
    let notesCount = 0;
    let foldersNotesCount = 0;
    let totalNoteCharacters = 0;
    try {
        const notesStoreRaw = localStorage.getItem("lumiu_notes_store");
        if (notesStoreRaw) {
            const store = JSON.parse(notesStoreRaw);
            notesCount = Object.keys(store.notes || {}).length;
            foldersNotesCount = Object.keys(store.folders || {}).length;
            totalNoteCharacters = Object.values(store.notes || {}).reduce((acc: number, note: any) => {
                return acc + (note.characterCount || note.plainText?.length || 0);
            }, 0);
        } else {
            notesCount = 3;
            totalNoteCharacters = 450;
        }
    } catch (e) {
        console.error("Failed to parse notes store:", e);
    }

    // 4. Gamification / Neural Data
    let totalXp = 340;
    let gamesPlayed = 0;
    try {
        totalXp = parseInt(localStorage.getItem("lumiu-xp") || "340");
        const gameHistory = JSON.parse(localStorage.getItem("lumiu-game-history") || "[]");
        gamesPlayed = gameHistory.length;
    } catch (e) {
        console.error("Failed to parse gamification details:", e);
    }

    // 5. AI Quiz / Analytics Data
    let quizzesCompleted = 0;
    let avgQuizScore = 0;
    try {
        const perf = JSON.parse(localStorage.getItem("lumiu-performance") || '{"avgScore": 0, "totalQuizzes": 0}');
        quizzesCompleted = perf.totalQuizzes || 0;
        avgQuizScore = perf.avgScore || 0;
    } catch (e) {
        console.error("Failed to parse performance details:", e);
    }

    // Compute star activations
    return constellationsRaw.map((constellation) => {
        let stars = [...constellation.stars];
        let status = "locked";

        if (constellation.id === "aquila") {
            stars[0].completed = focusSessions >= 1; // Altair
            stars[1].completed = focusDuration >= 25; // Tarazed
            stars[2].completed = focusDuration >= 60; // Alshain
            stars[3].completed = focusDuration >= 180; // Theta Aquilae
            stars[4].completed = focusSessions >= 5; // Eta Aquilae
            const completedStars = stars.filter(s => s.completed).length;
            status = completedStars === stars.length ? "completed" : "current";
        } 
        else if (constellation.id === "scutum") {
            stars[0].completed = decksCount >= 1; // Alpha Scuti
            stars[1].completed = foldersCount >= 1; // Beta Scuti
            stars[2].completed = totalCardsCount >= 10 || decksCount >= 2; // Delta Scuti
            stars[3].completed = cardReviews >= 5 || totalCardsCount >= 5; // Gamma Scuti
            const completedStars = stars.filter(s => s.completed).length;
            status = completedStars === stars.length ? "completed" : "current";
        } 
        else if (constellation.id === "libra") {
            stars[0].completed = notesCount >= 1; // Zubeneschamali
            stars[1].completed = foldersNotesCount >= 1 || notesCount >= 3; // Zubenelgenubi
            stars[2].completed = totalNoteCharacters >= 500; // Brachium
            stars[3].completed = notesCount >= 5; // Sigma Librae
            const completedStars = stars.filter(s => s.completed).length;
            status = completedStars === stars.length ? "completed" : "current";
        } 
        else if (constellation.id === "ophiuchus") {
            stars[0].completed = gamesPlayed >= 1 || totalXp >= 400; // Rasalhague
            stars[1].completed = totalXp >= 500; // Cebalrai
            stars[2].completed = gamesPlayed >= 2 || totalXp >= 600; // Yed Prior
            stars[3].completed = gamesPlayed >= 3 || totalXp >= 800; // Sabik
            stars[4].completed = gamesPlayed >= 5 || totalXp >= 1000; // Zeta Ophiuchi
            stars[5].completed = totalXp >= 1200; // Eta Ophiuchi
            const completedStars = stars.filter(s => s.completed).length;
            status = completedStars === stars.length ? "completed" : "current";
        } 
        else if (constellation.id === "sagittarius") {
            stars[0].completed = quizzesCompleted >= 1; // Kaus Media
            stars[1].completed = avgQuizScore >= 60 || quizzesCompleted >= 2; // Kaus Borealis
            stars[2].completed = quizzesCompleted >= 3; // Nunki
            stars[3].completed = totalXp >= 450; // Ascella (Analytics)
            stars[4].completed = avgQuizScore >= 80 || quizzesCompleted >= 5; // Kaus Australis
            const completedStars = stars.filter(s => s.completed).length;
            status = completedStars === stars.length ? "completed" : "current";
        }
        else {
            // Level locked progressive constellations
            const progressScore = totalXp;
            if (constellation.id === "serpens") {
                status = progressScore >= 500 ? "current" : "locked";
            } else if (constellation.id === "scorpius") {
                status = progressScore >= 800 ? "current" : "locked";
            } else if (constellation.id === "capricorn") {
                status = progressScore >= 1200 ? "current" : "locked";
            } else if (constellation.id === "lupus") {
                status = progressScore >= 1600 ? "current" : "locked";
            }

            if (status === "current") {
                if (constellation.id === "serpens") {
                    stars[0].completed = progressScore >= 600;
                    stars[1].completed = progressScore >= 700;
                    stars[2].completed = progressScore >= 800;
                } else if (constellation.id === "scorpius") {
                    stars[0].completed = progressScore >= 900;
                    stars[1].completed = progressScore >= 1000;
                    stars[2].completed = progressScore >= 1100;
                    stars[3].completed = progressScore >= 1150;
                    stars[4].completed = progressScore >= 1180;
                    stars[5].completed = progressScore >= 1200;
                } else if (constellation.id === "capricorn") {
                    stars[0].completed = progressScore >= 1300;
                    stars[1].completed = progressScore >= 1400;
                    stars[2].completed = progressScore >= 1500;
                    stars[3].completed = progressScore >= 1550;
                } else if (constellation.id === "lupus") {
                    stars[0].completed = progressScore >= 1700;
                    stars[1].completed = progressScore >= 1800;
                    stars[2].completed = progressScore >= 1900;
                }
            }

            const completedStars = stars.filter(s => s.completed).length;
            if (completedStars === stars.length && status !== "locked") {
                status = "completed";
            }
        }

        return {
            ...constellation,
            stars,
            status
        };
    });
};

// Cinematic camera controller for R3F Canvas with free user OrbitControls handoff
function CameraController({ 
    selectedConstellation,
    controlsRef
}: { 
    selectedConstellation: any;
    controlsRef: React.RefObject<any>;
}) {
    const { camera } = useThree();
    const [prevSelectedId, setPrevSelectedId] = useState<string | null>(null);
    const targetCamPos = useRef<THREE.Vector3 | null>(null);
    const targetLookAt = useRef<THREE.Vector3 | null>(null);
    const isTransitioning = useRef(false);

    useEffect(() => {
        const selectedId = selectedConstellation ? selectedConstellation.id : "none";
        if (selectedId !== prevSelectedId) {
            setPrevSelectedId(selectedId);
            
            if (selectedConstellation) {
                const tx = selectedConstellation.x * 4;
                const ty = selectedConstellation.y * 4;
                const tz = selectedConstellation.z * 4;
                
                targetCamPos.current = new THREE.Vector3(tx, ty - 1.2, tz + 8.5);
                targetLookAt.current = new THREE.Vector3(tx, ty, tz);
                isTransitioning.current = true;
            } else {
                targetCamPos.current = new THREE.Vector3(0, 0, 20);
                targetLookAt.current = new THREE.Vector3(0, 0, 0);
                isTransitioning.current = true;
            }
        }
    }, [selectedConstellation, prevSelectedId]);

    useFrame(() => {
        if (isTransitioning.current && targetCamPos.current && targetLookAt.current) {
            // Lerp camera position
            camera.position.lerp(targetCamPos.current, 0.05);
            
            // Lerp controls target smoothly without re-rendering parent React component
            if (controlsRef.current) {
                const controls = controlsRef.current;
                controls.target.lerp(targetLookAt.current, 0.05);
                controls.update(); // tell controls to update itself
            }
            
            // Stop transitioning once camera arrived close enough to targetCamPos
            if (camera.position.distanceTo(targetCamPos.current) < 0.15) {
                isTransitioning.current = false;
            }
        }
    });
    
    return null;
}

// 3D Star Map Component
interface StarMapProps {
    constellations: any[];
    hoveredConstellation: string | null;
    setHoveredConstellation: (id: string | null) => void;
    selectedConstellation: any;
    onSelectConstellation: (c: any) => void;
}

function StarMap({
    constellations,
    hoveredConstellation,
    setHoveredConstellation,
    selectedConstellation,
    onSelectConstellation
}: StarMapProps) {
    return (
        <group>
            {constellations.map((constellation) => {
                const isSelected = selectedConstellation && selectedConstellation.id === constellation.id;
                const isHovered = hoveredConstellation === constellation.id;
                
                return (
                    <group 
                        key={constellation.id} 
                        position={[constellation.x * 4, constellation.y * 4, constellation.z * 4]}
                        scale={isSelected ? [2.6, 2.6, 2.6] : (isHovered ? [2.55, 2.55, 2.55] : [2.5, 2.5, 2.5])}
                        onClick={(e) => {
                            e.stopPropagation();
                            playSound("click");
                            onSelectConstellation(constellation);
                        }}
                        onPointerEnter={(e) => {
                            e.stopPropagation();
                            if (hoveredConstellation !== constellation.id) {
                                playSound("hover");
                                setHoveredConstellation(constellation.id);
                            }
                        }}
                        onPointerLeave={(e) => {
                            e.stopPropagation();
                            setHoveredConstellation(null);
                        }}
                    >
                        {/* Render Connections */}
                        {constellation.connections.map(([a, b]: number[], idx: number) => {
                            const starA = constellation.stars[a];
                            const starB = constellation.stars[b];
                            if (!starA || !starB) return null;
                            
                            const isLocked = constellation.status === "locked";
                            const isCompleted = starA.completed && starB.completed;
                            
                            const color = isLocked ? "#ffffff" : 
                                          isHovered ? "#22d3ee" : 
                                          isSelected ? "#a855f7" :
                                          isCompleted ? "#a855f7" : 
                                          "#a855f7";
                                          
                            const opacity = isLocked ? 0.05 : 
                                            isHovered ? 0.85 : 
                                            isSelected ? 0.9 :
                                            isCompleted ? 0.75 : 
                                            0.25;
                                          
                            const lineWidth = isSelected ? 3.0 : (isHovered ? 2.5 : (isCompleted ? 1.8 : 0.7));
                            
                            return (
                                <Line
                                    key={`line-${idx}`}
                                    points={[
                                        [starA.dx, starA.dy, starA.dz],
                                        [starB.dx, starB.dy, starB.dz]
                                    ]}
                                    color={color}
                                    lineWidth={lineWidth}
                                    transparent
                                    opacity={opacity}
                                />
                            );
                        })}

                        {/* Render Stars */}
                        {constellation.stars.map((star: any) => {
                            const isLocked = constellation.status === "locked";
                            const isCompleted = star.completed;
                            
                            // Deterministic pseudo-random size based on name length
                            const rand = (star.name.charCodeAt(0) + star.name.charCodeAt(star.name.length - 1)) % 10;
                            const starSize = 0.085 + (rand * 0.008);
                            
                            const color = isLocked ? "#333333" : (isCompleted ? "#ffffff" : "#a1a1aa");
                            
                            // Emissive colors based on node random seed
                            const glowColor = rand % 3 === 0 ? "#22d3ee" : (rand % 3 === 1 ? "#ec4899" : "#a855f7"); 
                            const glow = isCompleted ? glowColor : (isLocked ? "#111111" : "rgba(168, 85, 247, 0.35)");
                            
                            // Animate glow dynamically on hover/selection
                            const glowIntensity = isSelected ? 4.5 : (isHovered ? 3.8 : (isCompleted ? 2.2 + (rand * 0.4) : 0.7));

                            return (
                                <group key={star.id} position={[star.dx, star.dy, star.dz]}>
                                    {/* Core Brightness */}
                                    <Sphere args={[starSize * 0.45, 16, 16]}>
                                        <meshBasicMaterial color={isLocked ? "#222222" : "#ffffff"} />
                                    </Sphere>
                                    
                                    {/* Glowing Aura picked up by Postprocessing Bloom */}
                                    <Sphere args={[starSize * (isCompleted ? 1.3 : 1.0), 16, 16]}>
                                        <meshStandardMaterial 
                                            color={color} 
                                            emissive={glow} 
                                            emissiveIntensity={glowIntensity} 
                                            transparent 
                                            opacity={isLocked ? 0.3 : (isCompleted ? 0.75 : 0.5)} 
                                        />
                                    </Sphere>

                                    {/* Faint pulsation ring for activated stars */}
                                    {isCompleted && (
                                        <Sphere args={[starSize * 1.8, 16, 16]}>
                                            <meshBasicMaterial 
                                                color={glowColor} 
                                                transparent 
                                                opacity={0.12} 
                                                wireframe
                                            />
                                        </Sphere>
                                    )}

                                    {/* Hidden large interaction area */}
                                    <Sphere args={[0.25, 8, 8]} visible={false} />
                                    
                                    {/* Labels on hover */}
                                    {(isHovered || isSelected) && !isLocked && (
                                        <Html center position={[0, -0.22, 0]} style={{ pointerEvents: 'none' }}>
                                            <div className="text-[10px] text-white/95 font-medium px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm whitespace-nowrap shadow-lg border border-white/10 tracking-wide select-none">
                                                {star.name} {isCompleted ? "✦" : ""}
                                            </div>
                                        </Html>
                                    )}
                                </group>
                            );
                        })}

                        {/* Constellation Name Tag */}
                        <Html center position={[0, -1.8, 0]} style={{ pointerEvents: 'none' }}>
                            <div className={`transition-all duration-300 font-semibold select-none text-[10px] tracking-[4px] uppercase text-center whitespace-nowrap px-3 py-1 rounded-full border ${
                                isSelected 
                                    ? "bg-purple-950/60 text-purple-200 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]" 
                                    : (isHovered 
                                        ? "bg-cyan-950/40 text-cyan-200 border-cyan-500/40" 
                                        : "bg-black/40 text-white/35 border-transparent")
                            }`}>
                                {constellation.name}
                            </div>
                        </Html>
                    </group>
                );
            })}
        </group>
    );
}

// Main Page Component
export default function GalaxyTrackerPage() {
    const [constellations, setConstellations] = useState<any[]>(constellationsRaw);
    const [selectedConstellation, setSelectedConstellation] = useState<any>(null);
    const [hoveredConstellation, setHoveredConstellation] = useState<string | null>(null);
    const controlsRef = useRef<any>(null);
    const [showIntro, setShowIntro] = useState(true);
    const [userName, setUserName] = useState("Lauv");
    const [systemXp, setSystemXp] = useState(340);
    const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);
    const [showDevPanel, setShowDevPanel] = useState(false);

    // Trigger toast notification
    const triggerToast = (message: string, type: "success" | "info" | "error" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Load progress and names on mount
    const syncWithLocalStorage = () => {
        if (typeof window === "undefined") return;
        const name = localStorage.getItem("user-name") || "Lauv";
        const xp = parseInt(localStorage.getItem("lumiu-xp") || "340");
        setUserName(name);
        setSystemXp(xp);
        
        const updated = loadRealProgress();
        setConstellations(updated);

        // If a constellation was selected, update its reference in the side drawer as well
        if (selectedConstellation) {
            const found = updated.find(c => c.id === selectedConstellation.id);
            if (found) setSelectedConstellation(found);
        }
    };

    useEffect(() => {
        syncWithLocalStorage();
        const introTimer = setTimeout(() => setShowIntro(false), 3000);
        return () => clearTimeout(introTimer);
    }, []);

    // Listen for storage events (e.g. from other pages in other tabs)
    useEffect(() => {
        window.addEventListener("storage", syncWithLocalStorage);
        return () => window.removeEventListener("storage", syncWithLocalStorage);
    }, [selectedConstellation]);


    // Compute progress percentages
    const totalStars = constellations.reduce((acc, c) => acc + c.stars.length, 0);
    const activeStars = constellations.reduce((acc, c) => acc + c.stars.filter((s: any) => s.completed).length, 0);
    const syncPercentage = totalStars > 0 ? Math.round((activeStars / totalStars) * 100) : 0;

    // Simulation helpers (modifies actual localStorage keys to enable real-world deployability)
    const simulateFocusSession = () => {
        playSound("success");
        const history = JSON.parse(localStorage.getItem("lumiu-focus-history") || "[]");
        history.push({
            id: `sim-${Date.now()}`,
            duration: 25,
            timestamp: new Date().toISOString(),
            subject: "Cosmic Synchronization"
        });
        localStorage.setItem("lumiu-focus-history", JSON.stringify(history));

        const newXp = systemXp + 100;
        localStorage.setItem("lumiu-xp", newXp.toString());
        
        syncWithLocalStorage();
        triggerToast("Simulated Focus block completed! +100 XP", "success");
    };

    const simulateFlashcardStudy = () => {
        playSound("success");
        // Create a mock deck
        const decks = JSON.parse(localStorage.getItem("lumiu-decks") || "[]");
        if (decks.length === 0) {
            decks.push({
                id: "deck-cosmic",
                name: "Cosmic Calibrations",
                description: "Astronomical coordinates & lore",
                cards: Array(10).fill({ front: "Question", back: "Answer" })
            });
        } else {
            // Just double size
            decks[0].cards = Array(12).fill({ front: "Front", back: "Back" });
        }
        localStorage.setItem("lumiu-decks", JSON.stringify(decks));

        // Create folders
        const folders = JSON.parse(localStorage.getItem("lumiu-folders") || "[]");
        if (folders.length === 0) {
            folders.push({ id: "f-1", name: "Astronomy Core", deckIds: ["deck-cosmic"] });
            localStorage.setItem("lumiu-folders", JSON.stringify(folders));
        }

        // Add history reviews
        const history = JSON.parse(localStorage.getItem("lumiu-flashcard-history") || "[]");
        history.push({ id: `h-${Date.now()}`, timestamp: new Date().toISOString(), cardsCount: 5 });
        localStorage.setItem("lumiu-flashcard-history", JSON.stringify(history));

        const newXp = systemXp + 80;
        localStorage.setItem("lumiu-xp", newXp.toString());

        syncWithLocalStorage();
        triggerToast("Simulated Flashcard Deck study! +80 XP", "success");
    };

    const simulateNoteWriting = () => {
        playSound("success");
        const defaultStore = {
            notebookOrder: ["nb-sim"],
            notebooks: {
                "nb-sim": { id: "nb-sim", name: "Simulated Notebook", color: "purple", icon: "🧠", folderIds: [], standaloneSectionIds: ["sec-sim"] }
            },
            folders: {},
            sections: {
                "sec-sim": { id: "sec-sim", name: "Cosmology", notebookId: "nb-sim", noteIds: ["note-sim"] }
            },
            notes: {
                "note-sim": {
                    id: "note-sim",
                    title: "Galaxy Tracker Specs",
                    plainText: "A majestic three.js webgl scene representing our real-time cognitive sync indexes.",
                    characterCount: 650,
                    sectionId: "sec-sim",
                    createdAt: new Date().toISOString()
                }
            }
        };

        let currentStore = defaultStore;
        const raw = localStorage.getItem("lumiu_notes_store");
        if (raw) {
            try {
                const store = JSON.parse(raw);
                store.notes = store.notes || {};
                const noteId = `note-${Date.now()}`;
                store.notes[noteId] = {
                    id: noteId,
                    title: "Stellar Calibration Core",
                    plainText: "This note simulates a deep knowledge alignment that sparks individual stars in Aquila and Libra constellations.",
                    characterCount: 750,
                    sectionId: Object.keys(store.sections || {})[0] || "general",
                    createdAt: new Date().toISOString()
                };
                currentStore = store;
            } catch (e) {
                // ignore
            }
        }
        localStorage.setItem("lumiu_notes_store", JSON.stringify(currentStore));

        const newXp = systemXp + 60;
        localStorage.setItem("lumiu-xp", newXp.toString());

        syncWithLocalStorage();
        triggerToast("Simulated rich-text study note saved! +60 XP", "success");
    };

    const simulateNeuralGame = () => {
        playSound("success");
        const history = JSON.parse(localStorage.getItem("lumiu-game-history") || "[]");
        history.push({
            id: `game-${Date.now()}`,
            gameName: "TypeRacer",
            score: 72,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem("lumiu-game-history", JSON.stringify(history));

        const newXp = systemXp + 150;
        localStorage.setItem("lumiu-xp", newXp.toString());

        syncWithLocalStorage();
        triggerToast("Simulated game victory in TypeRacer! +150 XP", "success");
    };

    const simulateAIQuiz = () => {
        playSound("success");
        const perf = JSON.parse(localStorage.getItem("lumiu-performance") || '{"avgScore": 0, "totalQuizzes": 0}');
        const newQuizzes = (perf.totalQuizzes || 0) + 1;
        localStorage.setItem("lumiu-performance", JSON.stringify({
            avgScore: 90,
            totalQuizzes: newQuizzes
        }));

        const newXp = systemXp + 120;
        localStorage.setItem("lumiu-xp", newXp.toString());

        syncWithLocalStorage();
        triggerToast("Simulated AI Quiz finished (90% Score)! +120 XP", "success");
    };

    const resetAllSimulatedData = () => {
        playSound("click");
        localStorage.removeItem("lumiu-focus-history");
        localStorage.removeItem("lumiu-decks");
        localStorage.removeItem("lumiu-folders");
        localStorage.removeItem("lumiu-flashcard-history");
        localStorage.removeItem("lumiu_notes_store");
        localStorage.removeItem("lumiu-game-history");
        localStorage.removeItem("lumiu-performance");
        localStorage.setItem("lumiu-xp", "340");
        
        syncWithLocalStorage();
        setSelectedConstellation(null);
        triggerToast("Galaxy calibration variables reset to default.", "info");
    };

    // Instant star override calibration
    const toggleStarCalibration = (constellationId: string, starId: string) => {
        playSound("success");
        if (constellationId === "aquila") {
            const history = JSON.parse(localStorage.getItem("lumiu-focus-history") || "[]");
            // Add entries to satisfy this star's requirements
            if (starId === "aq1") history.push({ duration: 5 });
            else if (starId === "aq2") history.push({ duration: 30 });
            else if (starId === "aq3") history.push({ duration: 70 });
            else if (starId === "aq4") history.push({ duration: 200 });
            else if (starId === "aq5") { for(let i=0; i<6; i++) history.push({ duration: 10 }); }
            localStorage.setItem("lumiu-focus-history", JSON.stringify(history));
        }
        else if (constellationId === "scutum") {
            const decks = JSON.parse(localStorage.getItem("lumiu-decks") || "[]");
            if (starId === "scu1") decks.push({ id: "d-1", cards: [] });
            else if (starId === "scu2") {
                decks.push({ id: "d-1", cards: [] });
                localStorage.setItem("lumiu-folders", JSON.stringify([{ id: "f-1", deckIds: ["d-1"] }]));
            }
            else if (starId === "scu3") decks.push({ id: "d-1", cards: Array(12).fill({}) });
            else if (starId === "scu4") {
                decks.push({ id: "d-1", cards: Array(5).fill({}) });
                localStorage.setItem("lumiu-flashcard-history", JSON.stringify(Array(6).fill({})));
            }
            localStorage.setItem("lumiu-decks", JSON.stringify(decks));
        }
        else if (constellationId === "libra") {
            const raw = localStorage.getItem("lumiu_notes_store") || "{}";
            let store = { notes: {} as any, folders: {}, notebooks: {}, sections: {} };
            try { store = JSON.parse(raw); } catch(e){}
            store.notes = store.notes || {};
            
            if (starId === "lb1") store.notes["n1"] = { plainText: "Short Content", characterCount: 50 };
            else if (starId === "lb2") {
                store.notes["n1"] = {}; store.notes["n2"] = {}; store.notes["n3"] = {};
            }
            else if (starId === "lb3") store.notes["n1"] = { plainText: "Very long note text...", characterCount: 650 };
            else if (starId === "lb4") {
                store.notes["n1"] = {}; store.notes["n2"] = {}; store.notes["n3"] = {}; store.notes["n4"] = {}; store.notes["n5"] = {};
            }
            localStorage.setItem("lumiu_notes_store", JSON.stringify(store));
        }
        else if (constellationId === "ophiuchus") {
            const history = JSON.parse(localStorage.getItem("lumiu-game-history") || "[]");
            let xp = parseInt(localStorage.getItem("lumiu-xp") || "340");
            
            if (starId === "op1") history.push({});
            else if (starId === "op2") xp = Math.max(xp, 550);
            else if (starId === "op3") { history.push({}); history.push({}); }
            else if (starId === "op4") { history.push({}); history.push({}); history.push({}); }
            else if (starId === "op5") { for(let i=0; i<6; i++) history.push({}); }
            else if (starId === "op6") xp = Math.max(xp, 1250);
            
            localStorage.setItem("lumiu-game-history", JSON.stringify(history));
            localStorage.setItem("lumiu-xp", xp.toString());
        }
        else if (constellationId === "sagittarius") {
            const perf = JSON.parse(localStorage.getItem("lumiu-performance") || '{"avgScore": 0, "totalQuizzes": 0}');
            let xp = parseInt(localStorage.getItem("lumiu-xp") || "340");
            
            if (starId === "sg1") perf.totalQuizzes = Math.max(perf.totalQuizzes, 1);
            else if (starId === "sg2") { perf.avgScore = 70; perf.totalQuizzes = Math.max(perf.totalQuizzes, 1); }
            else if (starId === "sg3") perf.totalQuizzes = Math.max(perf.totalQuizzes, 3);
            else if (starId === "sg4") xp = Math.max(xp, 470);
            else if (starId === "sg5") { perf.avgScore = 85; perf.totalQuizzes = Math.max(perf.totalQuizzes, 1); }
            
            localStorage.setItem("lumiu-performance", JSON.stringify(perf));
            localStorage.setItem("lumiu-xp", xp.toString());
        }
        else {
            // General level based constellations
            let xp = parseInt(localStorage.getItem("lumiu-xp") || "340");
            if (starId === "sr1") xp = Math.max(xp, 650);
            else if (starId === "sr2") xp = Math.max(xp, 750);
            else if (starId === "sr3") xp = Math.max(xp, 850);
            else if (starId === "sc1") xp = Math.max(xp, 950);
            else if (starId === "sc2") xp = Math.max(xp, 1050);
            else if (starId === "sc3") xp = Math.max(xp, 1120);
            else if (starId === "sc4") xp = Math.max(xp, 1160);
            else if (starId === "sc5") xp = Math.max(xp, 1190);
            else if (starId === "sc6") xp = Math.max(xp, 1220);
            else if (starId === "cp1") xp = Math.max(xp, 1350);
            else if (starId === "cp2") xp = Math.max(xp, 1450);
            else if (starId === "cp3") xp = Math.max(xp, 1520);
            else if (starId === "cp4") xp = Math.max(xp, 1580);
            else if (starId === "lp1") xp = Math.max(xp, 1720);
            else if (starId === "lp2") xp = Math.max(xp, 1820);
            else if (starId === "lp3") xp = Math.max(xp, 1920);
            localStorage.setItem("lumiu-xp", xp.toString());
        }

        syncWithLocalStorage();
        triggerToast("Star energy calibrated and synced!", "success");
    };

    return (
        <div className="fixed inset-0 w-screen h-screen bg-[#06020f] overflow-hidden text-white font-sans select-none z-[100]">
            
            {/* Ambient Background Audio Humming Loop / Canvas Cover */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(26,11,46,0.3)_0%,rgba(6,2,15,1)_85%)] pointer-events-none z-10" />

            {/* Glowing cosmic dust overlays */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 w-[45%] h-[45%] bg-cyan-600/10 blur-[140px] rounded-full pointer-events-none z-0" />

            {/* Top Navigation Panel */}
            <header className="absolute top-6 left-6 right-6 flex justify-between items-center z-40 pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <Link
                        href="/dashboard"
                        onClick={() => playSound("click")}
                        className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 hover:border-white/20 backdrop-blur-md rounded-full text-white/80 hover:text-white text-xs font-semibold uppercase tracking-[2px] transition-all duration-300 shadow-xl"
                    >
                        <ArrowLeft size={13} />
                        Base Hub
                    </Link>

                    <div className="h-6 w-px bg-white/15" />

                    <div className="flex items-center gap-2">
                        <Zap size={14} className="text-purple-400 animate-pulse" />
                        <span className="text-xs font-medium text-white/50 tracking-wider">LEVEL:</span>
                        <span className="text-sm font-bold text-purple-200 tracking-wide">{Math.floor(systemXp / 100)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 pointer-events-auto">
                    <button
                        onClick={() => { playSound("click"); setShowDevPanel(!showDevPanel); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold tracking-wider transition-all duration-300 ${
                            showDevPanel 
                                ? "bg-cyan-500/20 text-cyan-200 border-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.25)]" 
                                : "bg-white/[0.03] text-white/60 border-white/10 hover:border-white/20"
                        }`}
                    >
                        <Settings size={13} className={showDevPanel ? "animate-spin" : ""} />
                        CALIBRATION LAB
                    </button>
                </div>
            </header>

            {/* Floating Left Panel: Constellation Index & Overall Cognitive Sync */}
            <aside className="absolute top-24 left-6 w-[340px] max-h-[calc(100vh-120px)] bg-black/40 border border-white/5 backdrop-blur-xl rounded-2xl p-5 flex flex-col z-30 shadow-2xl overflow-y-auto pointer-events-auto select-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                
                {/* User Cognitive Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-[10px] tracking-[4px] uppercase text-purple-400 font-bold mb-1">
                        <Compass size={12} className="animate-spin" style={{ animationDuration: "12s" }} />
                        Cognitive Constellations
                    </div>
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-purple-200">
                        {userName}'s Mind Map
                    </h2>
                </div>

                {/* Overall Alignment Score Wheel/Bar */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl mb-6 shadow-inner relative overflow-hidden">
                    <div className="absolute top-[-30px] right-[-30px] w-20 h-20 bg-purple-500/10 blur-xl rounded-full" />
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-white/50 tracking-wider">ALIGNMENT INDEX</span>
                        <span className="text-sm font-bold text-cyan-400 tracking-wide">{syncPercentage}% Synced</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${syncPercentage}%` }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                    </div>
                    <div className="flex justify-between text-[9px] text-white/30 font-medium tracking-wide mt-2">
                        <span>{activeStars} / {totalStars} STARS ACTIVE</span>
                        <span>{totalStars - activeStars} CALIBRATIONS PENDING</span>
                    </div>
                </div>

                {/* List of Constellations */}
                <div className="space-y-2 flex-1 min-h-0">
                    <span className="text-[10px] font-bold text-white/40 tracking-[3px] uppercase block mb-3">CONSTELLATION LIST</span>
                    {constellations.map((c) => {
                        const isSelected = selectedConstellation && selectedConstellation.id === c.id;
                        const isHovered = hoveredConstellation === c.id;
                        const unlockedStars = c.stars.filter((s: any) => s.completed).length;
                        const isCompleted = c.status === "completed" || (c.status !== "locked" && unlockedStars === c.stars.length);
                        
                        return (
                            <button
                                key={c.id}
                                onClick={() => {
                                    playSound("click");
                                    setSelectedConstellation(c);
                                }}
                                onMouseEnter={() => setHoveredConstellation(c.id)}
                                onMouseLeave={() => setHoveredConstellation(null)}
                                className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                                    isSelected
                                        ? "bg-purple-950/40 border-purple-500/40 shadow-[0_0_14px_rgba(168,85,247,0.15)]"
                                        : (isHovered
                                            ? "bg-white/[0.04] border-white/10"
                                            : "bg-white/[0.01] border-transparent")
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                                        c.status === "locked"
                                            ? "bg-black/40 border-white/5 text-white/20"
                                            : (isCompleted
                                                ? "bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.2)]"
                                                : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300")
                                    }`}>
                                        {c.status === "locked" ? (
                                            <Lock size={12} />
                                        ) : (
                                            <span className="text-xs font-bold font-mono">
                                                {c.name.split(" ")[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-xs font-bold tracking-wide transition-colors ${
                                                c.status === "locked" 
                                                    ? "text-white/30" 
                                                    : (isSelected ? "text-purple-300" : "text-white/80")
                                            }`}>
                                                {c.name.split(" ").slice(1).join(" ")}
                                            </span>
                                            {isCompleted && (
                                                <Award size={10} className="text-purple-400 animate-bounce" />
                                            )}
                                        </div>
                                        <span className="text-[10px] text-white/40 font-medium block truncate max-w-[170px] mt-0.5">
                                            {c.status === "locked" ? `Unlock at ${c.id === 'serpens' ? '500' : c.id === 'scorpius' ? '800' : c.id === 'capricorn' ? '1200' : '1600'} XP` : c.description}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    {c.status === "locked" ? (
                                        <span className="text-[9px] font-bold text-white/20 tracking-wider">LOCKED</span>
                                    ) : (
                                        <div className="flex flex-col items-end">
                                            <span className={`text-[10px] font-bold ${isCompleted ? "text-purple-300" : "text-cyan-400"}`}>
                                                {unlockedStars}/{c.stars.length}
                                            </span>
                                            <span className="text-[8px] text-white/35 font-medium uppercase tracking-widest mt-0.5">Stars</span>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Floating Right Detail Panel: Star Activation Details & Real-Time Sync Actions */}
            <AnimatePresence>
                {selectedConstellation && (
                    <motion.aside
                        initial={{ opacity: 0, x: 80 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 80 }}
                        transition={{ type: "spring", damping: 25, stiffness: 120 }}
                        className="absolute top-24 right-6 w-[380px] max-h-[calc(100vh-120px)] bg-black/40 border border-white/5 backdrop-blur-xl rounded-2xl p-5 flex flex-col z-30 shadow-2xl overflow-y-auto pointer-events-auto select-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full"
                    >
                        {/* Header Details */}
                        <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                            <div>
                                <div className="flex items-center gap-1 text-[10px] tracking-[4px] uppercase text-cyan-400 font-bold mb-1">
                                    <Sparkles size={11} className="animate-pulse" />
                                    Active Calibrator
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-wide">
                                    {selectedConstellation.name.split(" ").slice(1).join(" ")}
                                </h3>
                                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mt-0.5">
                                    {selectedConstellation.description}
                                </p>
                            </div>
                            <button
                                onClick={() => { playSound("click"); setSelectedConstellation(null); }}
                                className="text-white/40 hover:text-white text-xs font-semibold px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                            >
                                CLOSE
                            </button>
                        </div>

                        {/* Lore & Astronomical Intel */}
                        <div className="mb-5 p-3.5 bg-purple-950/20 border border-purple-500/10 rounded-xl">
                            <span className="text-[9px] font-bold text-purple-400 tracking-[3px] uppercase block mb-1.5">ASTRONOMICAL INTEL</span>
                            <p className="text-xs text-purple-100/70 leading-relaxed font-light">
                                {selectedConstellation.lore}
                            </p>
                        </div>

                        {/* Star Activation checklist */}
                        <div className="space-y-2 mb-6">
                            <span className="text-[10px] font-bold text-white/40 tracking-[3px] uppercase block mb-3">INDIVIDUAL STAR STATUS</span>
                            {selectedConstellation.stars.map((star: any) => {
                                const isLocked = selectedConstellation.status === "locked";
                                
                                return (
                                    <div
                                        key={star.id}
                                        className={`p-3 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                                            isLocked
                                                ? "bg-black/20 border-white/5 opacity-50"
                                                : (star.completed
                                                    ? "bg-purple-950/20 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.06)]"
                                                    : "bg-white/[0.01] border-white/5 hover:border-white/10")
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isLocked ? (
                                                <Lock size={12} className="text-white/20" />
                                            ) : star.completed ? (
                                                <CheckCircle2 size={15} className="text-purple-400 shrink-0" />
                                            ) : (
                                                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 shrink-0" />
                                            )}
                                            <div>
                                                <span className={`text-xs font-bold block ${
                                                    isLocked 
                                                        ? "text-white/30" 
                                                        : (star.completed ? "text-purple-200" : "text-white/70")
                                                }`}>
                                                    {star.name}
                                                </span>
                                                <span className="text-[10px] text-white/45 font-medium leading-normal mt-0.5 block">
                                                    {star.requirement}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Quick individual activation button (Dev override) */}
                                        {!isLocked && !star.completed && (
                                            <button
                                                onClick={() => toggleStarCalibration(selectedConstellation.id, star.id)}
                                                className="text-[9px] font-bold text-cyan-400 hover:text-cyan-200 uppercase tracking-widest px-2.5 py-1.5 bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg transition-all"
                                                title="Manually force activate this star"
                                            >
                                                CALIBRATE
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Deep Module Link Sync */}
                        {selectedConstellation.status !== "locked" && (
                            <div className="border-t border-white/5 pt-5 mt-auto">
                                <Link
                                    href={selectedConstellation.moduleUrl}
                                    onClick={() => playSound("click")}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-xl text-center text-xs font-bold uppercase tracking-[3px] flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(168,85,247,0.3)] transition-all duration-300 hover:scale-[1.02]"
                                >
                                    <Play size={12} fill="white" />
                                    Launch {selectedConstellation.moduleName}
                                    <ChevronRight size={14} />
                                </Link>
                            </div>
                        )}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Calibration Simulator Panel (Bottom glassmorphic override laboratory) */}
            <AnimatePresence>
                {showDevPanel && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="absolute bottom-6 left-6 right-6 h-[170px] bg-black/60 border border-cyan-500/20 backdrop-blur-2xl rounded-2xl p-5 flex flex-col z-30 shadow-[0_0_30px_rgba(34,211,238,0.15)] pointer-events-auto"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                                <span className="text-[10px] font-bold text-cyan-400 tracking-[3px] uppercase">COGNITIVE SYNC SIMULATOR LAB</span>
                            </div>
                            <span className="text-[9px] text-white/40 font-medium">Click simulator tools to write real integration variables into the framework's database (localStorage)</span>
                        </div>

                        <div className="grid grid-cols-5 gap-3 flex-1">
                            {/* Focus block */}
                            <button
                                onClick={simulateFocusSession}
                                className="p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-purple-500/30 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group"
                            >
                                <Flame size={18} className="text-orange-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold text-white/80">Simulate Focus Session</span>
                                <span className="text-[9px] text-white/35 font-medium">+25 Min Block (+100 XP)</span>
                            </button>

                            {/* Flashcard block */}
                            <button
                                onClick={simulateFlashcardStudy}
                                className="p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-pink-500/30 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group"
                            >
                                <Award size={18} className="text-pink-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold text-white/80">Simulate Deck Study</span>
                                <span className="text-[9px] text-white/35 font-medium">+1 Deck & Reviews (+80 XP)</span>
                            </button>

                            {/* Note block */}
                            <button
                                onClick={simulateNoteWriting}
                                className="p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-cyan-500/30 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group"
                            >
                                <Sparkles size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold text-white/80">Draft Insight Note</span>
                                <span className="text-[9px] text-white/35 font-medium">+750 Chars plainText (+60 XP)</span>
                            </button>

                            {/* Neural block */}
                            <button
                                onClick={simulateNeuralGame}
                                className="p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-emerald-500/30 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group"
                            >
                                <Zap size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold text-white/80">Mini-Game Victory</span>
                                <span className="text-[9px] text-white/35 font-medium">+1 Neural Entry (+150 XP)</span>
                            </button>

                            {/* Quiz block */}
                            <button
                                onClick={simulateAIQuiz}
                                className="p-3 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-yellow-500/30 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition-all group"
                            >
                                <Compass size={18} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-bold text-white/80">Conclude AI Quiz</span>
                                <span className="text-[9px] text-white/35 font-medium">+1 Quiz (90% Score) (+120 XP)</span>
                            </button>
                        </div>

                        {/* Reset and status triggers */}
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                            <span className="text-[9px] text-white/40 font-semibold tracking-wider uppercase">DEV LAB CALIBRATION BYPASS MODE</span>
                            <button
                                onClick={resetAllSimulatedData}
                                className="flex items-center gap-1.5 text-[9px] font-bold text-rose-400 hover:text-rose-200 uppercase tracking-widest px-3 py-1 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 hover:border-rose-500/40 rounded-lg transition-all"
                            >
                                <RefreshCw size={9} />
                                Reset Galaxy to Default
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Glowing Toast Alert slide-up */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        className={`absolute bottom-8 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl backdrop-blur-xl border flex items-center gap-3 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)] ${
                            toast.type === "success" 
                                ? "bg-purple-950/60 border-purple-500/40 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                                : toast.type === "error"
                                    ? "bg-rose-950/60 border-rose-500/40 text-rose-200 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                    : "bg-cyan-950/60 border-cyan-500/40 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${
                            toast.type === "success" 
                                ? "bg-purple-400 animate-pulse" 
                                : toast.type === "error"
                                    ? "bg-rose-400"
                                    : "bg-cyan-400 animate-pulse"
                        }`} />
                        <span className="text-xs font-semibold tracking-wide uppercase">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Centered Instructions on Canvas Load */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.0 }}
                        className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50 pointer-events-none select-none"
                    >
                        <motion.div 
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1.0, ease: "easeOut" }}
                            className="flex flex-col items-center text-center px-6"
                        >
                            <Compass size={40} className="text-purple-400 animate-spin mb-4" style={{ animationDuration: "12s" }} />
                            <h1 className="text-3xl font-bold tracking-[0.25em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-300 to-cyan-400">
                                GOK VISUALIZER
                            </h1>
                            <p className="text-[10px] tracking-[4px] uppercase text-white/40 mt-3 font-semibold">
                                Syncing cognitive alignment indexes...
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lower-Right Panoramic Hint */}
            <AnimatePresence>
                {!selectedConstellation && !showIntro && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="absolute bottom-6 right-6 text-right pointer-events-none select-none text-[10px] text-white/30 font-semibold tracking-[2px] uppercase z-20 leading-relaxed"
                    >
                        Drag to rotate map <br />
                        Scroll to zoom cosmic fields
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3D WebGL Canvas */}
            <div className="w-full h-full absolute inset-0 z-10 pointer-events-auto">
                <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
                    {/* Cinematic lighting */}
                    <ambientLight intensity={0.25} />
                    <pointLight position={[10, 10, 10]} intensity={0.6} />
                    <pointLight position={[-10, -10, -10]} intensity={0.2} />
                    
                    {/* Ethereal Post-Processing Bloom */}
                    <EffectComposer>
                        <Bloom luminanceThreshold={1.0} mipmapBlur intensity={1.9} />
                    </EffectComposer>

                    {/* Cosmic stars background */}
                    <Stars radius={15} depth={100} count={9500} factor={6} saturation={0.65} speed={0} fade />
                    
                    {/* Cinematic drift camera movement with free handoff */}
                    <CameraController selectedConstellation={selectedConstellation} controlsRef={controlsRef} />
                    
                    {/* Orbit controls with dynamic targets */}
                    <OrbitControls 
                        ref={controlsRef}
                        enableDamping 
                        dampingFactor={0.05} 
                        maxDistance={60} 
                        minDistance={3} 
                    />
                    
                    {/* The Interactive Star Map */}
                    <StarMap 
                        constellations={constellations}
                        hoveredConstellation={hoveredConstellation}
                        setHoveredConstellation={setHoveredConstellation}
                        selectedConstellation={selectedConstellation}
                        onSelectConstellation={setSelectedConstellation}
                    />
                </Canvas>
            </div>
        </div>
    );
}
