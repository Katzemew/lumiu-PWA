"use client";

import { useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Line, Sphere } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Mock Data based on the reference Star Map provided by the user
const constellationsRaw = [
    {
        id: "aquila", name: "01 Aquila", description: "Mastered fundamentals.", x: -10, y: 5, z: -5, status: "completed",
        stars: [
            { id: "aq1", dx: -0.5, dy: 1, dz: 0, name: "Altair (Alpha Aquilae)", completed: true },
            { id: "aq2", dx: 0, dy: -0.5, dz: 1, name: "Tarazed", completed: true },
            { id: "aq3", dx: 0.4, dy: 0.6, dz: -0.5, name: "Alshain", completed: true },
            { id: "aq4", dx: 0.8, dy: 1.2, dz: 0, name: "Theta Aquilae", completed: true },
            { id: "aq5", dx: 1.4, dy: 1.8, dz: 0.5, name: "Eta Aquilae", completed: true },
        ],
        connections: [[0, 1], [1, 2], [0, 2], [2, 3], [3, 4]]
    },
    {
        id: "scutum", name: "02 Scutum", description: "The Shield.", x: -6, y: 3, z: 2, status: "completed",
        stars: [
            { id: "scu1", dx: 0, dy: -0.4, dz: 0, name: "Alpha Scuti", completed: true },
            { id: "scu2", dx: -0.3, dy: 0.2, dz: 0.5, name: "Beta Scuti", completed: true },
            { id: "scu3", dx: 0.4, dy: 0.3, dz: -0.5, name: "Delta Scuti", completed: true },
            { id: "scu4", dx: 0.1, dy: 0.8, dz: 0, name: "Gamma Scuti", completed: true },
        ],
        connections: [[0, 1], [0, 2], [1, 3], [2, 3]]
    },
    {
        id: "libra", name: "03 Libra", description: "The Scales.", x: 1, y: 7, z: -4, status: "completed",
        stars: [
            { id: "lb1", dx: 0, dy: -0.5, dz: 0, name: "Zubeneschamali", completed: true },
            { id: "lb2", dx: -0.6, dy: 0.4, dz: 1, name: "Zubenelgenubi", completed: true },
            { id: "lb3", dx: 0.8, dy: 0.6, dz: -0.5, name: "Brachium", completed: true },
            { id: "lb4", dx: -0.6, dy: 1.6, dz: 0, name: "Sigma Librae", completed: true },
        ],
        connections: [[0, 1], [0, 2], [1, 2], [1, 3]]
    },
    {
        id: "ophiuchus", name: "04 Ophiuchus", description: "The Serpent Bearer.", x: 5, y: 1, z: 5, status: "current",
        stars: [
            { id: "op1", dx: 0, dy: -1.0, dz: 0, name: "Rasalhague", completed: true },
            { id: "op2", dx: -0.8, dy: 0, dz: 0.5, name: "Cebalrai", completed: true },
            { id: "op3", dx: 0.8, dy: 0.2, dz: -0.5, name: "Yed Prior", completed: false },
            { id: "op4", dx: -1.2, dy: 1.2, dz: 0, name: "Sabik", completed: false },
            { id: "op5", dx: 1.2, dy: 1.4, dz: 1, name: "Zeta Ophiuchi", completed: false },
            { id: "op6", dx: 0, dy: 1.8, dz: -0.5, name: "Eta Ophiuchi", completed: false },
        ],
        connections: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5]]
    },
    {
        id: "sagittarius", name: "05 Sagittarius", description: "The Archer.", x: -3, y: -3, z: -8, status: "current",
        stars: [
            { id: "sg1", dx: -0.6, dy: 0, dz: 0, name: "Kaus Media", completed: true },
            { id: "sg2", dx: -0.2, dy: -0.5, dz: 0.5, name: "Kaus Borealis", completed: true },
            { id: "sg3", dx: 0.4, dy: -0.2, dz: -0.5, name: "Nunki", completed: false },
            { id: "sg4", dx: 0.8, dy: 0.8, dz: 0, name: "Ascella", completed: false },
            { id: "sg5", dx: 0, dy: 1.0, dz: 1, name: "Kaus Australis", completed: false },
        ],
        connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2]]
    },
    {
        id: "serpens", name: "06 Serpens", description: "The Serpent.", x: 10, y: 6, z: 2, status: "locked",
        stars: [
            { id: "sr1", dx: 0, dy: 0, dz: 0, name: "Unukalhai", completed: false },
            { id: "sr2", dx: -0.4, dy: 0.8, dz: 0.5, name: "Alya", completed: false },
            { id: "sr3", dx: 0.4, dy: -0.6, dz: -0.5, name: "Mu Serpentis", completed: false },
        ],
        connections: [[0, 1], [0, 2]]
    },
    {
        id: "scorpius", name: "07 Scorpius", description: "The Scorpion.", x: 4, y: -7, z: -2, status: "locked",
        stars: [
            { id: "sc1", dx: 0, dy: -0.8, dz: 0, name: "Antares", completed: false },
            { id: "sc2", dx: -0.4, dy: -1.2, dz: 0.5, name: "Graffias", completed: false },
            { id: "sc3", dx: -0.1, dy: -0.3, dz: -0.5, name: "Al Niyat", completed: false },
            { id: "sc4", dx: 0.4, dy: 0.2, dz: 0, name: "Wei", completed: false },
            { id: "sc5", dx: -0.1, dy: 0.8, dz: 0.5, name: "Sargas", completed: false },
            { id: "sc6", dx: -0.8, dy: 1.0, dz: -0.5, name: "Shaula", completed: false },
        ],
        connections: [[0, 2], [2, 3], [3, 4], [4, 5], [0, 1]]
    },
    {
        id: "capricorn", name: "08 Capricorn", description: "The Sea-Goat.", x: -9, y: -6, z: 6, status: "locked",
        stars: [
            { id: "cp1", dx: -0.5, dy: 0, dz: 0, name: "Algedi", completed: false },
            { id: "cp2", dx: 0.8, dy: -0.4, dz: 0.5, name: "Dabih", completed: false },
            { id: "cp3", dx: 0.6, dy: 0.6, dz: -0.5, name: "Nashira", completed: false },
            { id: "cp4", dx: -0.8, dy: 0.8, dz: 0, name: "Deneb Algedi", completed: false },
        ],
        connections: [[0, 1], [1, 2], [2, 3], [3, 0]]
    },
    {
        id: "lupus", name: "09 Lupus", description: "The Wolf.", x: 11, y: -3, z: -6, status: "locked",
        stars: [
            { id: "lp1", dx: 0, dy: 0, dz: 0, name: "Alpha Lupi", completed: false },
            { id: "lp2", dx: -0.4, dy: 0.4, dz: 0.5, name: "Beta Lupi", completed: false },
            { id: "lp3", dx: 0.4, dy: 0.6, dz: -0.5, name: "Gamma Lupi", completed: false },
        ],
        connections: [[0, 1], [0, 2]]
    }
];

function StarMap() {
    const [hoveredConstellation, setHoveredConstellation] = useState<string | null>(null);

    return (
        <group>
            {constellationsRaw.map((constellation) => (
                <group 
                    key={constellation.id} 
                    position={[constellation.x * 4, constellation.y * 4, constellation.z * 4]}
                    scale={hoveredConstellation === constellation.id ? [2.55, 2.55, 2.55] : [2.5, 2.5, 2.5]}
                    onPointerEnter={(e) => { e.stopPropagation(); setHoveredConstellation(constellation.id); }}
                    onPointerOut={() => setHoveredConstellation(null)}
                >
                    {/* Render Connections */}
                    {constellation.connections.map(([a, b], idx) => {
                        const starA = constellation.stars[a];
                        const starB = constellation.stars[b];
                        const isLocked = constellation.status === "locked";
                        const isCompleted = starA.completed && starB.completed;
                        const isHovered = hoveredConstellation === constellation.id;
                        
                        const color = isLocked ? "rgba(255, 255, 255, 0.1)" : 
                                      isHovered ? "rgba(34, 211, 238, 0.8)" : 
                                      isCompleted ? "rgba(168, 85, 247, 0.7)" : 
                                      "rgba(168, 85, 247, 0.3)";
                        const lineWidth = isHovered ? 2.5 : (isCompleted ? 1.5 : 0.8);
                        
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
                                opacity={isLocked ? 0.2 : 0.8}
                            />
                        );
                    })}

                    {/* Render Stars */}
                    {constellation.stars.map((star) => {
                        const isLocked = constellation.status === "locked";
                        const isCompleted = star.completed;
                        
                        // Deterministic pseudo-random size for variety
                        const rand = (star.name.charCodeAt(0) + star.name.charCodeAt(star.name.length - 1)) % 10;
                        const starSize = 0.08 + (rand * 0.01);
                        
                        const isHovered = hoveredConstellation === constellation.id;
                        const color = isLocked ? "#444444" : (isCompleted ? "#ffffff" : "#cccccc");
                        
                        // Add high-end neon variance: Teal, Purple, Bright White
                        const glowColor = rand % 3 === 0 ? "#22d3ee" : (rand % 3 === 1 ? "#a855f7" : "#ffffff"); 
                        const glow = isCompleted ? glowColor : (isLocked ? "#000000" : "rgba(168, 85, 247, 0.4)");
                        const glowIntensity = isHovered ? 4.0 : (isCompleted ? 1.8 + (rand * 0.5) : 0.8);

                        return (
                            <group key={star.id} position={[star.dx, star.dy, star.dz]}>
                                {/* Inner sharp core */}
                                <Sphere args={[starSize * 0.5, 16, 16]}>
                                    <meshBasicMaterial color={isLocked ? "#222222" : "#ffffff"} />
                                </Sphere>
                                {/* Glowing outer shell picked up by Bloom */}
                                <Sphere args={[starSize, 16, 16]}>
                                    <meshStandardMaterial color={color} emissive={glow} emissiveIntensity={glowIntensity} transparent opacity={0.6} />
                                </Sphere>
                                {/* Invisible interactive area around the star */}
                                <Sphere args={[0.3, 8, 8]} visible={false} />
                                
                                {/* Label shown on hover */}
                                {isHovered && !isLocked && (
                                    <Html center position={[0, -0.2, 0]} style={{ pointerEvents: 'none' }}>
                                        <div style={{ color: "white", fontSize: "10px", whiteSpace: "nowrap", textShadow: "0 0 4px black", pointerEvents: 'none' }}>
                                            {star.name}
                                        </div>
                                    </Html>
                                )}
                            </group>
                        );
                    })}

                    {/* Constellation Name Label */}
                    <Html center position={[0, -2, 0]} style={{ pointerEvents: 'none' }}>
                        <div style={{
                            color: hoveredConstellation === constellation.id ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.4)",
                            fontSize: "10px", fontWeight: "500", whiteSpace: "nowrap",
                            textTransform: "uppercase", letterSpacing: "4px",
                            transition: "all 0.3s ease-in-out",
                            textShadow: "0px 1px 3px rgba(0,0,0,1)"
                        }}>
                            {constellation.name}
                        </div>
                    </Html>
                </group>
            ))}
        </group>
    );
}


function MajesticDrift({ active }: { active: boolean }) {
    useFrame((state, delta) => {
        if (active) {
            // Elegant slow dolly inward
            state.camera.position.z -= 0.15 * delta;
            // Majestic sub-degree rotation
            state.camera.rotation.z += 0.005 * delta;
        }
    });
    return null;
}

export default function GalaxyTrackerPage() {
    const [showHint, setShowHint] = useState(true);
    const [showIntro, setShowIntro] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowHint(false), 7000);
        const introTimer = setTimeout(() => setShowIntro(false), 3500);
        return () => {
            clearTimeout(timer);
            clearTimeout(introTimer);
        };
    }, []);

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            width: "100%", height: "100%",
            backgroundColor: "#000000",
            overflow: "hidden",
            fontFamily: "var(--font-inter), sans-serif",
            userSelect: "none",
            zIndex: 100
        }}>


            {/* Top Navigation Overlay */}
            <div style={{
                position: "absolute",
                top: "32px", left: "32px", right: "32px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                zIndex: 50,
                pointerEvents: "auto"
            }}>
                <div>
                    <Link
                        href="/"
                        style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "8px 16px",
                            backgroundColor: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            backdropFilter: "blur(12px)",
                            borderRadius: "9999px",
                            color: "rgba(255, 255, 255, 0.8)",
                            fontSize: "12px",
                            fontWeight: "500",
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            textDecoration: "none",
                            transition: "all 0.3s",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                        }}
                    >
                        <ArrowLeft size={14} />
                        Back to Base
                    </Link>
                </div>

                {/* Animated Upper-Right Hint */}
                <AnimatePresence>
                    {showHint && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20, transition: { duration: 1 } }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{
                                color: "rgba(255, 255, 255, 0.5)",
                                fontSize: "11px",
                                fontWeight: "500",
                                letterSpacing: "1px",
                                pointerEvents: "none",
                                textAlign: "right",
                                marginTop: "60px" // Added margin to clear the global settings widget
                            }}
                        >
                            Drag to rotate. <br/> Scroll to zoom.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3D Canvas */}
            <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
                {/* Ambient logic and lights */}
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={0.5} />
                
                {/* Cinematic Post-Processing Bloom */}
                <EffectComposer>
                    <Bloom luminanceThreshold={1.2} mipmapBlur intensity={1.8} />
                </EffectComposer>

                {/* Static, decent background stars */}
                <Stars radius={15} depth={100} count={9000} factor={5} saturation={0.5} speed={0} fade />
                
                <MajesticDrift active={showIntro} />
                <OrbitControls enableDamping dampingFactor={0.05} maxDistance={50} minDistance={5} />
                
                <StarMap />
            </Canvas>
        </div>
    );
}
