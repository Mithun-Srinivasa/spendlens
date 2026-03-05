"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle } from "lucide-react";
import type { ChatMessage, Summary } from "@/types";

const STARTER_PROMPTS = [
    "What was my biggest expense?",
    "How much did I spend on food?",
    "Am I spending more than I earn?",
];

interface Props {
    summary: Summary;
    categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
}

export default function ChatBox({ summary, categoryBreakdown }: Props) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Context string sent with each question
    const contextString = JSON.stringify({ summary, categoryBreakdown });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    async function sendMessage(text: string) {
        const q = text.trim();
        if (!q || loading) return;

        setInput("");
        setError(null);
        setMessages((prev) => [...prev, { role: "user", content: q }]);
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: q, context: contextString }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Could not get an answer.");
            }

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.answer },
            ]);
        } catch (err) {
            const msg =
                err instanceof Error ? err.message : "Something went wrong.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    }

    return (
        <div
            className="flex flex-col rounded-[12px] border border-border overflow-hidden"
            style={{ background: "#1a1a1a", minHeight: 320 }}
        >
            {/* Header */}
            <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid #2a2a2a" }}
            >
                <MessageCircle size={15} className="text-accent" />
                <span className="text-sm font-medium text-primary">Ask SpendLens</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 320 }}>
                {messages.length === 0 && !loading && (
                    <div className="pt-2 pb-1">
                        <p className="text-muted text-xs mb-3">
                            Ask anything about your spending
                        </p>
                        <div className="flex flex-col gap-2">
                            {STARTER_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => sendMessage(prompt)}
                                    className="text-left rounded-[8px] border border-border bg-surface-alt px-3 py-2 text-xs text-muted hover:text-primary hover:border-border-light transition-all cursor-pointer"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-[10px] px-3 py-2 text-sm leading-relaxed ${msg.role === "user"
                                ? "text-background font-medium"
                                : "text-primary"
                                }`}
                            style={
                                msg.role === "user"
                                    ? { background: "#e8c547" }
                                    : { background: "#242424", border: "1px solid #2e2e2e" }
                            }
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {/* Loading dots */}
                {loading && (
                    <div className="flex justify-start">
                        <div
                            className="rounded-[10px] px-4 py-3"
                            style={{ background: "#242424", border: "1px solid #2e2e2e" }}
                        >
                            <div className="dot-loader flex items-center gap-0.5">
                                <span />
                                <span />
                                <span />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-[10px] px-3 py-2 text-xs text-danger bg-danger/10 border border-danger/20">
                            {error}
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
                className="px-3 py-3"
                style={{ borderTop: "1px solid #2a2a2a" }}
            >
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="How much did I spend on Swiggy?"
                        maxLength={500}
                        disabled={loading}
                        className="flex-1 rounded-[8px] bg-surface-alt border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-border-light transition-colors disabled:opacity-50"
                    />
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || loading}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[8px] bg-accent text-background transition-all hover:bg-accent-dim disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
