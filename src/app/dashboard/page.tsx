"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
    Search, Home, Moon, Maximize, Asterisk, LayoutGrid,
    Settings, UserCircle, ChevronLeft, ChevronRight
} from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const [userName, setUserName] = useState("Lauv");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setUserName(localStorage.getItem("user-name") || "Lauv");
            const auth = localStorage.getItem("user-authenticated");
            if (!auth) router.push("/login");
        }
    }, [router]);

    // Keep existing modules and names
    const mainModules = [
        { name: "Home", icon: Home, href: "/dashboard", active: true },
        { name: "Luna", icon: Moon, href: "/luna", active: false },
        { name: "Focus Mode", icon: Maximize, href: "/focus", active: false },
        { name: "GoK", icon: Asterisk, href: "/galaxy", active: false },
        { name: "Dashboard", icon: LayoutGrid, href: "/dashboard/insights", active: false },
    ];

    const bottomModules = [
        { name: "Profile", icon: UserCircle, href: "#" },
        { name: "Settings", icon: Settings, href: "#" },
    ];

    // Mock data for the "Last Opened Courses" section from the image
    const recentCourses = [
        {
            id: 1,
            tag: "UI Design",
            tagColor: "bg-[#a882fc]",
            author: "Michael Brown",
            title: "Course One",
            desc: "1 hour - Intermediate",
            progress: 45
        },
        {
            id: 2,
            tag: "UI Design",
            tagColor: "bg-[#7cedf9]",
            author: "Mary Smith",
            title: "Course Two",
            desc: "1 hour - Beginner",
            progress: 30
        }
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

            {/* Full Bleed Left Sidebar - Keeping brand color and solid so it stands out from holographic back */}
            <aside className="w-[280px] h-full bg-[#a882fc] text-white flex flex-col shrink-0 relative z-30 px-6 py-12 shadow-[4px_0_30px_rgba(168,130,252,0.15)]">
                {/* Logo styled to fit existing brand */}
                <div className="mb-14 px-4">
                    <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
                        <h1 className="text-[32px] font-bold flex items-center tracking-[0.2em]">
                            Lumiu<span className="w-2 h-2 bg-white rounded-full ml-1 mb-2 inline-block shadow-sm" />
                        </h1>
                    </Link>
                </div>
                
                <nav className="flex flex-col gap-2 flex-1">
                    {mainModules.map((mod) => (
                        <Link 
                            href={mod.href} 
                            key={mod.name}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                                mod.active ? 'bg-white/20 font-semibold shadow-sm' : 'hover:bg-white/10 opacity-80 text-white hover:text-white'
                            }`}
                        >
                            <mod.icon size={22} strokeWidth={mod.active ? 2.5 : 2} className="shrink-0" />
                            <span className="text-[15px] tracking-[0.05em]">
                                {mod.name}
                            </span>
                        </Link>
                    ))}
                </nav>

                {/* Bottom Profile and Settings Links */}
                <div className="flex flex-col gap-2 mt-auto">
                    {bottomModules.map((mod) => (
                        <Link 
                            href={mod.href} 
                            key={mod.name}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/10 opacity-80 transition-all text-white hover:text-white"
                        >
                            <mod.icon size={22} strokeWidth={2} className="shrink-0" />
                            <span className="text-[15px] tracking-[0.05em]">
                                {mod.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto scroll-smooth z-10 w-full h-full p-12 bg-transparent">
                <div className="max-w-[1000px]">
                    
                    {/* Top Search Bar matched to dark aesthetic */}
                    <div className="flex items-center bg-white/5 backdrop-blur-[24px] border border-white/10 rounded-2xl w-[500px] h-[54px] shadow-[0_10px_40px_rgba(0,0,0,0.2)] overflow-hidden mb-12 p-1.5 pl-1.5 transition-all duration-300 group focus-within:bg-white/10 focus-within:border-white/30 focus-within:shadow-[0_10px_40px_rgba(168,85,247,0.15)] relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#a855f7]/10 to-[#38bdf8]/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                        <div className="relative w-[44px] h-full bg-white/10 rounded-xl flex items-center justify-center shrink-0 opacity-70 group-focus-within:opacity-100 transition-opacity">
                            <Search size={18} className="text-white group-focus-within:text-[#a855f7] transition-colors" strokeWidth={2.5} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search your universe..." 
                            className="relative w-full h-full bg-transparent outline-none px-4 text-white font-medium text-[15px] tracking-wide placeholder-white/40"
                        />
                    </div>

                    {/* Greetings matched to dark image */}
                    <div className="mb-10">
                        <h1 className="text-[36px] font-black tracking-widest text-white mb-3 drop-shadow-md">
                            Welcome back, {userName}!
                        </h1>
                        <p className="text-[14px] font-black tracking-[0.15em] text-white/70 drop-shadow-sm">
                            Let's build your focus today — at your own pace.
                        </p>
                    </div>

                    {/* Last Opened Courses Header */}
                    <div className="flex items-center justify-between mb-6 pr-4 mt-16">
                        <h2 className="text-[18px] font-bold text-white drop-shadow-sm">
                            Last Opened Courses
                        </h2>
                    </div>

                    {/* Course Cards Gallery (Glassmorphic dark styling) */}
                    <div className="flex gap-6 w-full pb-8">
                        {recentCourses.map((course) => (
                            <div key={course.id} className="w-[320px] pro-card p-5 shrink-0 hover:bg-white/10 transition-all cursor-pointer group">
                                {/* Image Placeholder */}
                                <div className="w-full h-[180px] bg-white/5 backdrop-blur-[10px] rounded-2xl relative mb-5 overflow-hidden transition-all group-hover:bg-white/15">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-white/10 group-hover:border-white/30 transition-colors">
                                        <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${course.tagColor}`} />
                                        <span className="text-xs font-bold text-white/90">{course.tag}</span>
                                    </div>
                                </div>

                                {/* Author Info */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-white/20 shadow-inner border border-white/10" />
                                    <span className="text-sm font-bold text-white/90">{course.author}</span>
                                </div>

                                {/* Course Details */}
                                <h3 className="text-lg font-bold text-white mb-1 drop-shadow-sm">{course.title}</h3>
                                <p className="text-sm text-white/60 mb-5 font-semibold">{course.desc}</p>

                                {/* Progress Bar */}
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner border border-white/5">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${course.id === 1 ? 'bg-[#a882fc]' : 'bg-[#3fb5bd]'}`}
                                        style={{ width: `${course.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </main>
        </div>
    );
}
