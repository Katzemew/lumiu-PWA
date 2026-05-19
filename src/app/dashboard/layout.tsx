"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home, Moon, Maximize, Orbit,
    Settings, UserCircle, FileText, Presentation, Layers, Zap, LineChart
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [userName, setUserName] = useState("Lauv");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setUserName(localStorage.getItem("user-name") || "Lauv");
        }
    }, []);

    const mainModules = [
        { name: "Home", icon: Home, href: "/dashboard", active: pathname === "/dashboard" },
        { name: "Luna", icon: Moon, href: "/luna", active: pathname === "/luna" },
        { name: "Focus Mode", icon: Maximize, href: "/focus", active: pathname === "/focus" },
        { name: "Gok", icon: Orbit, href: "/galaxy", active: pathname === "/galaxy" },
        { name: "Notes", icon: FileText, href: "/notes", active: pathname === "/notes" },
        { name: "Flashcards", icon: Layers, href: "/flashcards", active: pathname === "/flashcards" },
        { name: "Whiteboard", icon: Presentation, href: "/whiteboard", active: pathname === "/whiteboard" },
        { name: "Neural", icon: Zap, href: "/gamification", active: pathname === "/gamification" },
        { name: "Analytics", icon: LineChart, href: "/dashboard/student", active: pathname === "/dashboard/student" },
        { name: "Profile", icon: UserCircle, href: "/profile", active: pathname === "/profile" },
        { name: "Settings", icon: Settings, href: "/settings", active: pathname === "/settings" },
    ];

    return (
        <div className="flex h-screen w-screen bg-[#130924] font-sans text-white overflow-hidden relative">

            {/* Dark Sleek Teal & Purple Wave Gradient Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-br from-[#2a1352] via-[#150a28] to-[#150a28] opacity-100">
                <div className="absolute top-[-30%] left-[-10%] w-[100%] h-[100%] bg-[#5d31a5] blur-[150px] rounded-full opacity-60 animate-orb-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-[#3fb5bd] blur-[160px] rounded-full opacity-40 mix-blend-screen animate-orb-float" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] right-[10%] w-[60%] h-[60%] bg-[#8155ba] blur-[140px] rounded-full opacity-40 mix-blend-screen animate-orb-float" style={{ animationDelay: '4s' }} />
                <div className="absolute bottom-[20%] left-[10%] w-[60%] h-[60%] bg-[#3a8da3] blur-[150px] rounded-full opacity-35 mix-blend-screen animate-orb-float" style={{ animationDelay: '1s' }} />
                {/* Slanted overlays to simulate abstract sleek waves */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#875bbb]/10 to-transparent skew-x-12 scale-150 blur-[40px] opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-[#3fb5bd]/15 to-transparent -skew-y-12 scale-150 blur-[50px] opacity-70" />
            </div>

            {/* Full Bleed Left Sidebar */}
            <aside className="w-[280px] h-full bg-[#a882fc] text-white flex flex-col shrink-0 relative z-30 px-6 py-12 shadow-[4px_0_30px_rgba(168,130,252,0.15)]">
                <div className="mb-14 px-4">
                    <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
                        <h1 className="text-[32px] font-bold flex items-center tracking-[0.2em]">
                            Lumiu<span className="w-2 h-2 bg-white rounded-full ml-1 mb-2 inline-block shadow-sm" />
                        </h1>
                    </Link>
                </div>

                <nav className="flex flex-col gap-2 flex-1 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
                    {mainModules.map((mod) => (
                        <Link
                            href={mod.href}
                            key={mod.name}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all ${mod.active ? 'bg-white/20 font-semibold shadow-sm' : 'hover:bg-white/10 opacity-80 text-white hover:text-white'
                                }`}
                        >
                            <mod.icon size={22} strokeWidth={mod.active ? 2.5 : 2} className="shrink-0" />
                            <span className="text-[15px] tracking-[0.05em]">
                                {mod.name}
                            </span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto scroll-smooth z-10 w-full h-full">
                {children}
            </main>
        </div>
    );
}
