"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LunaLogo } from "./LunaLogo";

const LunaIcon = () => <LunaLogo size={40} className="w-full h-full" />;

export function LunaFloatingButton() {
    const pathname = usePathname();

    // Don't show the floating button if we are already inside the dedicated Luna chat page
    if (pathname === "/luna") return null;

    return (
        <Link 
            href="/luna"
            style={{
                position: "fixed",
                bottom: "32px",
                right: "32px",
                width: "64px",
                height: "64px",
                backgroundColor: "rgba(15, 23, 42, 0.95)", // matching deep slate
                backdropFilter: "blur(8px)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 30px rgba(168, 85, 247, 0.4)",
                cursor: "pointer",
                zIndex: 9999, // Ensure it's above practically everything
                border: "2px solid rgba(168, 85, 247, 0.5)",
                transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.15) translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(168, 85, 247, 0.6)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1) translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(168, 85, 247, 0.4)";
            }}
            title="Chat with Luna AI"
            aria-label="Chat with Luna AI"
        >
            <div style={{ width: "40px", height: "40px" }}>
                <LunaIcon />
            </div>
            
            {/* Notification Dot (optional subtle glowing dot to attract attention) */}
            <div style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                width: "14px",
                height: "14px",
                backgroundColor: "#a855f7",
                borderRadius: "50%",
                border: "2px solid rgba(15, 23, 42, 1)",
                animation: "pulseAura 2s infinite"
            }} />
            
            <style>{`
                @keyframes pulseAura {
                    0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(168, 85, 247, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
                }
            `}</style>
        </Link>
    );
}
