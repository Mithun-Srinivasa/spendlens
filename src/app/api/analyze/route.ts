import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { parseCSV } from "@/lib/parseCSV";
import type { AnalysisResult } from "@/types";

// ─── Basic in-memory rate limiting (per-IP, 10 req/min) ──────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (entry && now < entry.resetAt) {
        if (entry.count >= 10) return false;
        entry.count++;
    } else {
        rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    }
    return true;
}

// ─── Gemini system prompt ─────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a financial data analyst specializing in Indian bank statements. Parse the bank statement text and return ONLY valid JSON — no markdown, no explanation, no code fences. Just raw JSON.

Return this exact structure:
{
  "transactions": [
    { "date": "YYYY-MM-DD", "description": "string", "amount": number, "type": "debit|credit", "category": "string" }
  ],
  "summary": {
    "totalSpent": number,
    "totalCredits": number,
    "topCategory": "string",
    "largestExpense": { "description": "string", "amount": number },
    "monthsAnalyzed": number
  },
  "insights": [
    { "type": "anomaly|pattern|tip", "title": "string", "body": "string" }
  ],
  "categoryBreakdown": [
    { "category": "string", "amount": number, "percentage": number }
  ],
  "monthlyBreakdown": [
    { "month": "string", "spent": number, "credited": number }
  ]
}

Rules:
- Use ONLY these categories: Food & Dining, Transport, Shopping, Entertainment, Utilities, Health, Travel, Transfers, EMI/Loan, Others
- All amounts must be positive numbers
- Dates must be in YYYY-MM-DD format  
- Generate 3-5 meaningful insights — mix of anomaly, pattern, and tip types
- monthlyBreakdown MUST be sorted chronologically (earliest month first)
- Insight bodies should be specific with actual amounts, not vague
- If you see "UPI" or "IMPS" in description, it's likely a Transfer
- Food delivery apps (Swiggy, Zomato) → Food & Dining
- Fuel, Ola, Uber, Metro → Transport
- Amazon, Flipkart, Myntra → Shopping`;

// ─── Validate the shape of the Gemini response ───────────────────────────────
function validateAnalysisResult(data: unknown): data is AnalysisResult {
    if (!data || typeof data !== "object") return false;
    const d = data as Record<string, unknown>;
    return (
        Array.isArray(d.transactions) &&
        Array.isArray(d.insights) &&
        Array.isArray(d.categoryBreakdown) &&
        Array.isArray(d.monthlyBreakdown) &&
        typeof d.summary === "object" &&
        d.summary !== null
    );
}

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    // Rate limiting
    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        req.headers.get("x-real-ip") ??
        "unknown";

    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: "Too many requests. Please wait a minute before trying again." },
            { status: 429 }
        );
    }

    // Parse request body
    let body: { text?: string; base64?: string; fileType?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid request body." },
            { status: 400 }
        );
    }

    const { fileType, text, base64 } = body;

    if (!fileType || !["csv", "pdf"].includes(fileType)) {
        return NextResponse.json(
            { error: "fileType must be 'csv' or 'pdf'." },
            { status: 400 }
        );
    }

    // Prepare statement text
    let statementText: string;

    if (fileType === "csv") {
        if (!text || typeof text !== "string") {
            return NextResponse.json(
                { error: "Missing text for CSV analysis." },
                { status: 400 }
            );
        }
        if (text.length > 500_000) {
            return NextResponse.json(
                {
                    error:
                        "File is too large to process. Please export a shorter date range.",
                },
                { status: 400 }
            );
        }
        statementText = parseCSV(text);
    } else {
        // PDF
        if (!base64 || typeof base64 !== "string") {
            return NextResponse.json(
                { error: "Missing base64 data for PDF analysis." },
                { status: 400 }
            );
        }
        try {
            const { parsePDF } = await import("@/lib/parsePDF");
            const buffer = Buffer.from(base64, "base64");
            statementText = await parsePDF(buffer);
        } catch (err) {
            return NextResponse.json(
                {
                    error:
                        err instanceof Error
                            ? err.message
                            : "Could not read the PDF. Please try a CSV export instead.",
                },
                { status: 400 }
            );
        }
    }

    if (!statementText || statementText.trim().length < 30) {
        return NextResponse.json(
            {
                error:
                    "The file appears empty or unreadable. Please check the file and try again.",
            },
            { status: 400 }
        );
    }

    // Call Gemini
    try {
        const model = getGeminiModel();
        const prompt = `${SYSTEM_PROMPT}\n\nBank Statement:\n${statementText}`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Extract JSON even if Gemini accidentally adds wrapper text
        let jsonText = responseText;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonText = jsonMatch[0];
        }

        const parsed = JSON.parse(jsonText);

        if (!validateAnalysisResult(parsed)) {
            throw new Error("Incomplete response structure from AI.");
        }

        return NextResponse.json(parsed as AnalysisResult);
    } catch (err) {
        if (err instanceof SyntaxError) {
            return NextResponse.json(
                {
                    error:
                        "The AI returned an unexpected response. Please try again — this usually works on a second attempt.",
                },
                { status: 500 }
            );
        }
        console.error("[/api/analyze] Error:", err);
        return NextResponse.json(
            {
                error:
                    err instanceof Error ? err.message : "Analysis failed. Please retry.",
            },
            { status: 500 }
        );
    }
}
