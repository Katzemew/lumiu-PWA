"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { LumiuWordmark } from "@/components/LumiuWordmark";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        rememberMe: false,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            localStorage.setItem("user-authenticated", "true");
            localStorage.setItem("user-name", formData.name || "User");
            router.push("/");
        }, 1500);
    };

    const containerStyle = {
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#dbdffd',
        padding: '40px',
        fontFamily: '"Outfit", sans-serif',
    };

    const cardStyle = {
        display: 'flex',
        width: '100%',
        maxWidth: '1200px',
        height: '750px',
        backgroundColor: '#dbdffd', // matching outer background, or slightly lighter
        borderRadius: '40px',
        overflow: 'hidden',
    };

    const leftSideStyle = {
        flex: 1,
        position: 'relative' as const,
        borderTopLeftRadius: '40px',
        borderBottomLeftRadius: '40px',
        overflow: 'hidden',
    };

    const rightSideStyle = {
        flex: 1,
        padding: '60px 80px',
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
    };

    const titleStyle = {
        fontSize: '44px',
        fontWeight: '900',
        color: '#a855f7',
        marginBottom: '10px',
        letterSpacing: '0.05em',
    };

    const subtitleStyle = {
        fontSize: '18px',
        color: '#6b7280',
        fontWeight: '500',
        marginBottom: '40px',
        letterSpacing: '0.05em',
    };

    const inputContainerStyle = {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
        marginBottom: '24px',
    };

    const labelStyle = {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1e1b4b',
        letterSpacing: '0.05em',
    };

    const inputStyle = {
        width: '100%',
        padding: '16px 20px',
        borderRadius: '16px',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        color: '#1e1b4b',
        fontSize: '16px',
        outline: 'none',
        boxShadow: 'none',
    };

    const loginBtnStyle = {
        width: '100%',
        padding: '16px',
        backgroundColor: '#a855f7',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        fontSize: '20px',
        fontWeight: '700',
        cursor: 'pointer',
        marginTop: '10px',
        letterSpacing: '0.05em',
        transition: 'all 0.2s',
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                {/* Left Side: Cinematic Art */}
                <div style={leftSideStyle} className="hide-on-mobile">
                    <Image
                        src="/auth-illustration.png"
                        alt="Lumiu Learning Journey"
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                </div>

                {/* Right Side: Form */}
                <div style={rightSideStyle}>
                    <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
                        <LumiuWordmark size="lg" className="mb-6" />
                        <p style={subtitleStyle}>Please Log in to get started</p>

                        <form onSubmit={handleSubmit}>
                            <div style={inputContainerStyle}>
                                <label style={labelStyle}>Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div style={inputContainerStyle}>
                                <label style={labelStyle}>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div style={inputContainerStyle}>
                                <label style={labelStyle}>Password</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        checked={formData.rememberMe}
                                        onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                        style={{ width: '16px', height: '16px', accentColor: '#a855f7' }}
                                    />
                                    <label htmlFor="remember" style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Remember me</label>
                                </div>
                                <Link href="#" style={{ fontSize: '14px', color: '#a855f7', fontWeight: '600', textDecoration: 'none' }}>
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{ ...loginBtnStyle, opacity: loading ? 0.7 : 1 }}
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: '40px' }}>
                            <p style={{ color: '#1e1b4b', fontWeight: '600', marginBottom: '20px' }}>
                                Have an account? <Link href="/signup" style={{ color: '#a855f7', textDecoration: 'none' }}>Sign Up</Link>
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                                <div style={{ flex: 1, height: '1px', backgroundColor: '#cbd5e1' }}></div>
                                <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>Or</span>
                                <div style={{ flex: 1, height: '1px', backgroundColor: '#cbd5e1' }}></div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                                <span style={{ color: '#1e1b4b', fontWeight: '700', fontSize: '14px', marginRight: '10px' }}>Create an account with</span>
                                {['facebook', 'google', 'linkedin'].map((social) => (
                                    <button
                                        key={social}
                                        style={{
                                            width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        <Image src={`https://www.svgrepo.com/show/512317/${social === 'facebook' ? 'github' : social}.svg`} alt={social} width={20} height={20} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        @media (max-width: 1024px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
        </div>
    );
}
