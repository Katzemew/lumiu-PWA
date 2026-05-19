"use client";

import Link from "next/link";
import { Moon, Star, Home, Maximize, Orbit, FileText, Presentation, Layers, Zap, UserCircle, LineChart, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed left-0 top-0 h-full w-24 flex flex-col items-center py-8 pro-card m-4 z-50">
            <div className="mb-14">
                <Link href="/">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-xl shadow-teal-500/20 border border-white/20"
                    >
                        <Star className="text-white fill-white" size={32} />
                    </motion.div>
                </Link>
            </div>

            <div className="flex-1 flex flex-col gap-6 w-full px-3 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <NavItem icon={<Home size={24} />} href="/dashboard" label="Home" active={pathname === "/dashboard"} />
                <NavItem icon={<Moon size={24} />} href="/luna" label="Luna" active={pathname === "/luna"} />
                <NavItem icon={<Maximize size={24} />} href="/focus" label="Focus Mode" active={pathname === "/focus"} />
                <NavItem icon={<Orbit size={24} />} href="/galaxy" label="Gok" active={pathname === "/galaxy"} />
                <NavItem icon={<FileText size={24} />} href="/notes" label="Notes" active={pathname === "/notes"} />
                <NavItem icon={<Layers size={24} />} href="/flashcards" label="flashcards" active={pathname === "/flashcards"} />
                <NavItem icon={<Presentation size={24} />} href="/whiteboard" label="whiteboard" active={pathname === "/whiteboard"} />
                <NavItem icon={<Zap size={24} />} href="/gamification" label="Neural" active={pathname === "/gamification"} />
                <NavItem icon={<LineChart size={24} />} href="/dashboard/student" label="Analytics" active={pathname === "/dashboard/student"} />
                <NavItem icon={<UserCircle size={24} />} href="/profile" label="Profile" active={pathname === "/profile"} />
                <NavItem icon={<Settings size={24} />} href="/settings" label="Settings" active={pathname === "/settings"} />
            </div>

            <style jsx>{`
        nav {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem 0;
          width: 96px;
          height: calc(100vh - 2rem);
          margin: 1rem;
          border-radius: 32px;
          border-right: none;
        }
        
        .nav-item-container {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .label {
          font-size: 0.7rem;
          font-weight: 600;
          margin-top: 0.4rem;
          opacity: 0.6;
          letter-spacing: 0.02em;
        }
      `}</style>
        </nav>
    );
}

function NavItem({ icon, href, label, active }: { icon: React.ReactNode; href: string; label: string; active: boolean }) {
    return (
        <div className="nav-item-container">
            <Link href={href} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 w-full hover:bg-white/5 group ${active ? 'text-accent-teal bg-white/5' : 'text-text-secondary'}`}>
                <motion.div
                    animate={active ? { scale: 1.15, filter: "drop-shadow(0 0 10px rgba(45, 212, 191, 0.4))" } : { scale: 1 }}
                    whileHover={{ y: -2 }}
                    className="relative"
                >
                    {icon}
                    {active && (
                        <motion.div
                            layoutId="nav-active-dot"
                            className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-accent-teal shadow-lg shadow-accent-teal/50"
                        />
                    )}
                </motion.div>
                <span className={`label ${active ? 'opacity-100' : 'group-hover:opacity-100 group-hover:text-text-primary'}`}>{label}</span>
            </Link>
        </div>
    );
}
