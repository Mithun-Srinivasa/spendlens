import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

const SYSTEM_PROMPT = `You are a helpful personal finance assistant for SpendLens. The user has already analyzed their Indian bank statement. Answer their question based on the financial data provided as context. 

Keep answers to 2-3 sentences maximum. Be conversational and plain English. Do not use markdown, bullet points, or asterisks. Be specific with amounts where you can figure them out from the data. If the answer isn't in the data, say so briefly.`;

// Simple in-memory rate limit for chat (per-IP, 30 req/min)
const chatRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkChatRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = chatRateLimit.get(ip);
    if (entry && now < entry.resetAt) {
        if (entry.count >= 30) return false;
        entry.count++;
    } else {
        chatRateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    }
    return true;
}

export async function POST(req: NextRequest) {
    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        req.headers.get("x-real-ip") ??
        "unknown";

    if (!checkChatRateLimit(ip)) {
        return NextResponse.json(
            { error: "Too many questions. Please wait a moment." },
            { status: 429 }
        );
    }

    let body: { question?: string; context?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { question, context } = body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
        return NextResponse.json(
            { error: "Please provide a question." },
            { status: 400 }
        );
    }

    if (question.length > 500) {
        return NextResponse.json(
            { error: "Question is too long. Please keep it under 500 characters." },
            { status: 400 }
        );
    }

    try {
        const model = getGeminiModel();

        const contextSection = context
            ? `\n\nFinancial Context (from user's bank statement):\n${context}`
            : "";

        const prompt = `${SYSTEM_PROMPT}${contextSection}\n\nUser question: ${question.trim()}`;

        const result = await model.generateContent(prompt);
        const answer = result.response.text().trim();

        return NextResponse.json({ answer });
    } catch (err) {
        console.error("[/api/chat] Error:", err);
        return NextResponse.json(
            { error: "Could not get an answer right now. Please try again." },
            { status: 500 }
        );
    }
}
