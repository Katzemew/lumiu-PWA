"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "@/context/AccessibilityContext";
import { Settings, X, Type, Search, Eye, Orbit } from "lucide-react";

import { usePathname } from "next/navigation";

export function AccessibilityWidget({ inline = false }: { inline?: boolean }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const {
        dyslexiaFont, setDyslexiaFont,
        textSize, setTextSize,
        textSpacing, setTextSpacing,
        reducedMotion, setReducedMotion
    } = useAccessibility();

    if (!inline && pathname === '/') return null;

    const containerClasses = inline
        ? "relative z-[100] font-sans"
        : "fixed top-6 right-6 z-[100] font-sans";

    return (
        <div className={containerClasses}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className={`absolute mt-4 w-80 bg-white shadow-2xl rounded-3xl p-6 border border-purple-100 overflow-hidden ${inline ? 'top-12 right-0' : 'top-16 right-0'}`}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#1e1b4b] flex items-center gap-2">
                                <Eye className="text-[#a855f7]" size={24} />
                                Accessibility
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-700 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Dyslexic Font */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Type size={18} className="text-[#a855f7]" />
                                    <span className="font-semibold text-gray-700 text-sm">Dyslexia Font</span>
                                </div>
                                <button
                                    onClick={() => setDyslexiaFont(!dyslexiaFont)}
                                    className={`w-12 h-6 flex-shrink-0 rounded-full transition-colors relative cursor-pointer ${dyslexiaFont ? 'bg-[#a855f7]' : 'bg-gray-200'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] transition-transform ${dyslexiaFont ? 'translate-x-[26px]' : 'translate-x-[2px]'}`} />
                                </button>
                            </div>

                            {/* Reduced Motion */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Orbit size={18} className="text-[#a855f7]" />
                                    <span className="font-semibold text-gray-700 text-sm">Reduced Motion (2D)</span>
                                </div>
                                <button
                                    onClick={() => setReducedMotion(!reducedMotion)}
                                    className={`w-12 h-6 flex-shrink-0 rounded-full transition-colors relative cursor-pointer ${reducedMotion ? 'bg-[#a855f7]' : 'bg-gray-200'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] transition-transform ${reducedMotion ? 'translate-x-[26px]' : 'translate-x-[2px]'}`} />
                                </button>
                            </div>

                            {/* Text Size */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Search size={18} className="text-[#a855f7]" />
                                    <span className="font-semibold text-gray-700 text-sm">Text Size</span>
                                </div>
                                <div className="flex bg-gray-100 rounded-xl p-1 relative">
                                    {(['normal', 'large', 'xlarge'] as const).map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setTextSize(size)}
                                            className={`flex-1 py-1.5 cursor-pointer text-xs font-bold rounded-lg transition-colors z-10 ${textSize === size ? 'text-white' : 'text-gray-500'}`}
                                        >
                                            {size.toUpperCase()}
                                        </button>
                                    ))}
                                    <div
                                        className="absolute top-1 bottom-1 bg-[#a855f7] rounded-lg transition-all duration-300 shadow-md"
                                        style={{
                                            width: 'calc(33.33% - 2.66px)',
                                            left: textSize === 'normal' ? '4px' : textSize === 'large' ? 'calc(33.33% + 1.33px)' : 'calc(66.66% - 1.33px)'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Text Spacing */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1 text-[#a855f7] font-bold tracking-[0.2em] text-sm">A A</div>
                                    <span className="font-semibold text-gray-700 text-sm">Letter Spacing</span>
                                </div>
                                <div className="flex bg-gray-100 rounded-xl p-1 relative">
                                    {(['normal', 'wide', 'xwide'] as const).map((spacing) => (
                                        <button
                                            key={spacing}
                                            onClick={() => setTextSpacing(spacing)}
                                            className={`flex-1 py-1.5 cursor-pointer text-xs font-bold rounded-lg transition-colors z-10 ${textSpacing === spacing ? 'text-white' : 'text-gray-500'}`}
                                        >
                                            {spacing.toUpperCase()}
                                        </button>
                                    ))}
                                    <div
                                        className="absolute top-1 bottom-1 bg-[#a855f7] rounded-lg transition-all duration-300 shadow-md"
                                        style={{
                                            width: 'calc(33.33% - 2.66px)',
                                            left: textSpacing === 'normal' ? '4px' : textSpacing === 'wide' ? 'calc(33.33% + 1.33px)' : 'calc(66.66% - 1.33px)'
                                        }}
                                    />
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(168,85,247,0.3)] hover:bg-white/20 hover:scale-105 active:scale-95 transition-all border border-white/20 bg-white/10 backdrop-blur-md text-white rounded-full ${inline ? 'w-10 h-10' : 'w-14 h-14'}`}
            >
                <Settings size={inline ? 20 : 26} className={isOpen ? "rotate-90 transition-transform duration-300" : "transition-transform duration-300"} />
            </button>
        </div>
    );
}
