"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
    role: "user" | "assistant";
    content: string;
};

import { LunaLogo } from "@/components/LunaLogo";

// Use the newly created shared logo component
const LunaAvatar = () => <LunaLogo size={48} className="drop-shadow-md shrink-0" />;

export default function LunaChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I'm Luna. How can I help you navigate your journey today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        // Add a placeholder assistant message that we will populate with the stream
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages })
            });

            if (!response.ok) {
                const data = await response.json();
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = `Error: ${data.error || "Failed to connect"}`;
                    return updated;
                });
                return;
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullReply = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    fullReply += chunk;

                    // Update the last message (the assistant's) with the current stream content
                    setMessages(prev => {
                        const updated = [...prev];
                        updated[updated.length - 1].content = fullReply;
                        return updated;
                    });
                }
            }
        } catch (error) {
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1].content = "I'm having trouble connecting right now. Please try again later.";
                return updated;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "radial-gradient(circle at 20% 0%, #2e1065, #0f172a 40%, #020617 100%)",
            fontFamily: "var(--font-inter), sans-serif",
            display: "flex", flexDirection: "column"
        }}>
            {/* Header */}
            <div style={{
                position: "fixed", top: 0, left: 0, right: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "16px 32px",
                backgroundColor: "rgba(2, 6, 23, 0.6)",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                zIndex: 50
            }}>
                <div style={{ width: "100%", maxWidth: "800px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <Link
                            href="/"
                            style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                width: "40px", height: "40px",
                                backgroundColor: "rgba(255,255,255,0.03)",
                                borderRadius: "50%",
                                color: "rgba(255,255,255,0.8)",
                                textDecoration: "none",
                                transition: "all 0.3s",
                                border: "1px solid rgba(255,255,255,0.08)"
                            }}
                        >
                            <ArrowLeft size={18} />
                        </Link>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ transform: "scale(0.8)", transformOrigin: "center" }}><LunaAvatar /></div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "white", letterSpacing: "0.5px" }}>Luna</h1>
                                <p style={{ margin: 0, fontSize: "12px", color: "#c084fc", fontWeight: "500" }}>AI Assistant</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area Container */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}>
                <div style={{
                    width: "100%", maxWidth: "800px",
                    padding: "120px 24px 150px 24px",
                    display: "flex", flexDirection: "column", gap: "32px",
                    flexGrow: 1
                }}>
                    {messages.map((msg, idx) => (
                        msg.content && (
                            <div key={idx} style={{
                                display: "flex",
                                gap: "20px",
                                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                                maxWidth: "85%"
                            }}>
                                {msg.role === "assistant" && (
                                    <div style={{ transform: "scale(0.8)", transformOrigin: "top", marginTop: "-4px" }}>
                                        <LunaAvatar />
                                    </div>
                                )}
                                
                                <div style={{
                                    background: msg.role === "user" 
                                        ? "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)" 
                                        : "rgba(30, 41, 59, 0.4)",
                                    backdropFilter: msg.role === "user" ? "none" : "blur(12px)",
                                    border: msg.role === "user" ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                                    padding: "18px 24px",
                                    borderRadius: "24px",
                                    borderTopRightRadius: msg.role === "user" ? "4px" : "24px",
                                    borderTopLeftRadius: msg.role === "assistant" ? "4px" : "24px",
                                    borderBottomRightRadius: "24px",
                                    borderBottomLeftRadius: "24px",
                                    color: "rgba(255, 255, 255, 0.95)",
                                    fontSize: "15px",
                                    lineHeight: "1.7",
                                    boxShadow: msg.role === "user" 
                                        ? "0 10px 25px -5px rgba(126, 34, 206, 0.4)" 
                                        : "0 4px 20px -2px rgba(0, 0, 0, 0.2)"
                                }}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({node, ...props}) => <p style={{ margin: "0 0 16px 0", whiteSpace: "pre-wrap", lineHeight: "1.7" }} {...props} />,
                                            strong: ({node, ...props}) => <strong style={{ fontWeight: 800, color: "#ffffff", letterSpacing: "0.2px" }} {...props} />,
                                            em: ({node, ...props}) => <em style={{ fontStyle: "italic" }} {...props} />,
                                            a: ({node, ...props}) => <a style={{ color: "#d8b4fe", textDecoration: "underline" }} {...props} />,
                                            ul: ({node, ...props}) => <ul style={{ paddingLeft: "24px", margin: "10px 0", listStyleType: "disc" }} {...props} />,
                                            ol: ({node, ...props}) => <ol style={{ paddingLeft: "24px", margin: "10px 0", listStyleType: "decimal" }} {...props} />,
                                            li: ({node, ...props}) => <li style={{ marginBottom: "8px", lineHeight: "1.7" }} {...props} />
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )
                    ))}
                    {isLoading && !messages[messages.length - 1].content && (
                        <div style={{ display: "flex", gap: "20px", alignSelf: "flex-start", maxWidth: "85%", opacity: 0.7 }}>
                            <div style={{ transform: "scale(0.8)", transformOrigin: "top", marginTop: "-4px" }}>
                                <LunaAvatar />
                            </div>
                            <div style={{
                                background: "rgba(30, 41, 59, 0.4)",
                                backdropFilter: "blur(12px)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                padding: "18px 24px",
                                borderRadius: "24px", borderTopLeftRadius: "4px",
                                display: "flex", alignItems: "center", gap: "12px",
                                color: "rgba(255,255,255,0.6)",
                                fontSize: "15px",
                                boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.2)"
                            }}>
                                <Loader2 size={18} className="animate-spin" /> Gathering thoughts...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Overlay */}
            <div style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                display: "flex", justifyContent: "center",
                padding: "32px 24px",
                background: "linear-gradient(to top, rgba(2,6,23, 1) 10%, rgba(2,6,23, 0) 100%)",
                pointerEvents: "none"
            }}>
                <div style={{
                    width: "100%", maxWidth: "800px", pointerEvents: "auto",
                    display: "flex", alignItems: "flex-end", gap: "12px",
                    background: "rgba(30, 41, 59, 0.6)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "32px",
                    padding: "10px 10px 10px 24px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                }}>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Message Luna..."
                        style={{
                            flex: 1,
                            backgroundColor: "transparent",
                            border: "none",
                            color: "white",
                            padding: "14px 0",
                            outline: "none",
                            resize: "none",
                            minHeight: "48px",
                            maxHeight: "150px",
                            fontFamily: "inherit",
                            fontSize: "15px",
                            lineHeight: "1.5"
                        }}
                        rows={1}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: "48px", height: "48px",
                            background: input.trim() && !isLoading ? "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)" : "rgba(255,255,255,0.05)",
                            color: input.trim() && !isLoading ? "white" : "rgba(255,255,255,0.3)",
                            border: "none",
                            borderRadius: "50%",
                            cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                            transition: "all 0.3s",
                            flexShrink: 0,
                            boxShadow: input.trim() && !isLoading ? "0 4px 15px rgba(168, 85, 247, 0.4)" : "none"
                        }}
                    >
                        <Send size={20} style={{ marginLeft: "2px" }} />
                    </button>
                </div>
            </div>
        </div>
    );
}
