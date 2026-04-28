"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LumiuWordmark } from "@/components/LumiuWordmark";
import { AccessibilityWidget } from "@/components/AccessibilityWidget";

export default function Home() {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userName, setUserName] = useState("Explorer");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const auth = localStorage.getItem("user-authenticated");
    if (auth === "true") {
      setIsLoggedin(true);
      const name = localStorage.getItem("user-name");
      if (name) setUserName(name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user-authenticated");
    localStorage.removeItem("user-name");
    setIsLoggedin(false);
    setUserName("Explorer");
  };

  const navBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 40px',
    borderRadius: '9999px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    fontSize: '13px',
    fontWeight: '700',
    color: 'white',
    letterSpacing: '0.05em',
    transition: 'all 0.3s ease',
    textDecoration: 'none'
  };

  const startNowStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
    color: 'white',
    padding: '18px 56px',
    borderRadius: '24px',
    fontSize: '16px',
    fontWeight: '800',
    letterSpacing: '0.05em',
    boxShadow: '0 12px 30px -10px rgba(168, 85, 247, 0.8), inset 0 1px 0 rgba(255,255,255,0.2)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textDecoration: 'none',
    border: '1px solid rgba(168,85,247,0.3)',
  };

  const navLinkStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    letterSpacing: '0.02em'
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans bg-[#0c111d] selection:bg-purple-500/30">
      {/* 🌌 Cinematic Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/landing-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Subtle Overlay */}
      <div className="fixed inset-0 z-10 bg-black/15 pointer-events-none" />

      {/* 🧭 Top Navigation */}
      <div className="relative z-50 w-full flex items-center justify-center px-16 py-10">
        <div className="w-full max-w-[1600px] flex items-center justify-between">
          <Link href="/">
            <LumiuWordmark size="md" />
          </Link>

          <div className="flex items-center gap-16">
            <Link href="/" style={navLinkStyle} className="hover:text-white">Home</Link>
            <Link href="/galaxy" style={navLinkStyle} className="hover:text-white">Galaxy</Link>
            <Link href="/blog" style={navLinkStyle} className="hover:text-white">Blog</Link>
            <Link href="/about" style={navLinkStyle} className="hover:text-white">About Us</Link>
          </div>

          <div className="flex items-center gap-4">
            {!mounted ? (
              <div style={{ display: 'flex', gap: '16px', visibility: 'hidden' }}>
                <div style={navBtnStyle}>Login</div>
                <div style={navBtnStyle}>Sign Up</div>
              </div>
            ) : isLoggedin ? (
              <>
                <div style={{ ...navBtnStyle, backgroundColor: 'rgba(255,255,255,0.1)', border: 'none' }} className="cursor-default">
                  👋 Hi, {userName}
                </div>
                <button onClick={handleLogout} style={{ ...navBtnStyle, background: 'transparent' }} className="hover:bg-white/10 cursor-pointer">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={navBtnStyle} className="hover:bg-white/10">
                  Login
                </Link>
                <Link href="/signup" style={navBtnStyle} className="hover:bg-white/10">
                  Sign Up
                </Link>
              </>
            )}
            <AccessibilityWidget inline />
          </div>
        </div>
      </div>

      {/* 🚀 Main Hero Section */}
      <main className="relative z-20 flex flex-col items-center justify-center p-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center animate-orb-float relative"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(50px) saturate(160%)',
            WebkitBackdropFilter: 'blur(50px) saturate(160%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '40px',
            padding: '100px 40px',
            maxWidth: '1200px',
            width: '100%',
            boxShadow: '0 40px 120px -20px rgba(0, 0, 0, 0.5), 0 0 40px rgba(168, 85, 247, 0.15) inset'
          }}
        >
          <div className="absolute -top-[100px] -left-[100px] w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-[100px] -right-[100px] w-64 h-64 bg-teal-500/20 rounded-full blur-[80px] pointer-events-none" />

          <div className="space-y-12">
            <h1
              className="font-black leading-[1.1] tracking-tight text-white m-0"
              style={{ fontSize: '4.8rem', textShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
            >
              Illuminate <span className="iridescent-purple inline-block mx-2">Your</span> <br />
              Universe Of Knowledge !
            </h1>

            <p className="max-w-3xl mx-auto text-white/60 font-medium leading-relaxed tracking-wide text-xl">
              Lumiu is a neurodivergent-friendly, gamified learning platform that turns study time into a calm, focused journey — designed for every kind of mind.
            </p>

            <div className="pt-8">
              <Link
                href="/dashboard"
                style={startNowStyle}
                className="hover:brightness-110 hover:translate-y-[-2px]"
              >
                Start Now
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Placeholder for scrolling content */}
        <div className="h-[100vh]" />
      </main>

      <style jsx global>{`
        .stars { display: none !important; }
        .main-content { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; display: flex !important; flex-direction: column !important; }
        body::before { display: none !important; }
        .iridescent-purple {
          background: linear-gradient(to right, #a855f7, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
        }
        .iridescent-purple::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 4px;
          background: #a855f7;
          border-radius: 2px;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
