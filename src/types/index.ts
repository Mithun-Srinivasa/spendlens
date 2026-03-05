// ─── Core Data Types ─────────────────────────────

export type TransactionType = "debit" | "credit";

export type InsightType = "anomaly" | "pattern" | "tip";

export type Category =
    | "Food & Dining"
    | "Transport"
    | "Shopping"
    | "Entertainment"
    | "Utilities"
    | "Health"
    | "Travel"
    | "Transfers"
    | "EMI/Loan"
    | "Others";

// ─── Transaction ──────────────────────────────────

export interface Transaction {
    date: string; // YYYY-MM-DD
    description: string;
    amount: number; // always positive
    type: TransactionType;
    category: string;
}

// ─── Summary ─────────────────────────────────────

export interface LargestExpense {
    description: string;
    amount: number;
}

export interface Summary {
    totalSpent: number;
    totalCredits: number;
    topCategory: string;
    largestExpense: LargestExpense;
    monthsAnalyzed: number;
}

// ─── Breakdown ───────────────────────────────────

export interface CategoryBreakdown {
    category: string;
    amount: number;
    percentage: number;
}

export interface MonthlyBreakdown {
    month: string; // e.g. "Jan 24"
    spent: number;
    credited: number;
}

// ─── Insight ─────────────────────────────────────

export interface Insight {
    type: InsightType;
    title: string;
    body: string;
}

// ─── Full Analysis Result ─────────────────────────

export interface AnalysisResult {
    transactions: Transaction[];
    summary: Summary;
    insights: Insight[];
    categoryBreakdown: CategoryBreakdown[];
    monthlyBreakdown: MonthlyBreakdown[];
}

// ─── Chat ─────────────────────────────────────────

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

// ─── API Payloads ─────────────────────────────────

export interface AnalyzeRequest {
    text?: string;
    base64?: string;
    fileType: "csv" | "pdf";
}

export interface ChatRequest {
    question: string;
    context: string;
}

export interface ChatResponse {
    answer: string;
}

export interface ApiError {
    error: string;
}
