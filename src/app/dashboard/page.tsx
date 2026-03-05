"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    TrendingDown,
    Tag,
    Receipt,
    Calendar,
    Plus,
} from "lucide-react";
import dynamic from "next/dynamic";
import type { AnalysisResult } from "@/types";

// Dynamically import chart/table components (avoids SSR issues with Recharts)
const SpendingPieChart = dynamic(() => import("@/components/SpendingPieChart"), { ssr: false });
const MonthlyBarChart = dynamic(() => import("@/components/MonthlyBarChart"), { ssr: false });
const TransactionTable = dynamic(() => import("@/components/TransactionTable"), { ssr: false });
const ChatBox = dynamic(() => import("@/components/ChatBox"), { ssr: false });
import InsightCard from "@/components/InsightCard";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
    if (amount >= 10_00_000) {
        return `₹${(amount / 10_00_000).toFixed(2)}L`;
    }
    if (amount >= 1_000) {
        return `₹${amount.toLocaleString("en-IN")}`;
    }
    return `₹${amount.toFixed(0)}`;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonBlock({ className = "" }: { className?: string }) {
    return <div className={`skeleton ${className}`} />;
}

function DashboardSkeleton() {
    return (
        <div className="min-h-screen" style={{ background: "#0f0f0f" }}>
            {/* Header skeleton */}
            <div
                className="flex items-center justify-between px-6 py-4 border-b border-border"
                style={{ background: "#1a1a1a" }}
            >
                <SkeletonBlock className="h-6 w-32" />
                <SkeletonBlock className="h-8 w-28 rounded-full" />
            </div>
            {/* Summary strip skeleton */}
            <div className="grid grid-cols-2 gap-3 p-6 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="card p-4">
                        <SkeletonBlock className="h-3 w-20 mb-3" />
                        <SkeletonBlock className="h-7 w-28 mb-1" />
                        <SkeletonBlock className="h-3 w-16" />
                    </div>
                ))}
            </div>
            {/* Body skeleton */}
            <div className="px-6 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
                <div className="space-y-4">
                    <div className="card p-4" style={{ height: 280 }}>
                        <SkeletonBlock className="h-full" />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="card p-4" style={{ height: 340 }}>
                        <SkeletonBlock className="h-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Summary stat card ───────────────────────────────────────────────────────

interface StatCardProps {
    icon: typeof TrendingDown;
    label: string;
    value: string;
    sub?: string;
    color?: string;
    delay?: number;
}

function StatCard({ icon: Icon, label, value, sub, color = "#e8c547", delay = 0 }: StatCardProps) {
    return (
        <div
            className={`card p-4 hover:border-border-light transition-colors animate-fade-in-${delay}`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-xs text-muted uppercase tracking-wider mb-1.5">{label}</p>
                    <p
                        className="font-serif text-xl font-semibold leading-none truncate"
                        style={{ color }}
                    >
                        {value}
                    </p>
                    {sub && (
                        <p className="text-xs text-muted mt-1.5 truncate" title={sub}>
                            {sub}
                        </p>
                    )}
                </div>
                <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: `${color}15` }}
                >
                    <Icon size={16} style={{ color }} />
                </div>
            </div>
        </div>
    );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const [data, setData] = useState<AnalysisResult | null>(null);
    const [hydrated, setHydrated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const raw = sessionStorage.getItem("spendlens_analysis");
        if (!raw) {
            router.replace("/");
            return;
        }
        try {
            const parsed = JSON.parse(raw) as AnalysisResult;
            setData(parsed);
        } catch {
            router.replace("/");
        }
        setHydrated(true);
    }, [router]);

    if (!hydrated || !data) {
        return <DashboardSkeleton />;
    }

    const { summary, transactions, insights, categoryBreakdown, monthlyBreakdown } = data;

    return (
        <div className="min-h-screen" style={{ background: "#0f0f0f" }}>

            {/* ── Sticky Header ── */}
            <header
                className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-border"
                style={{ background: "rgba(26,26,26,0.9)", backdropFilter: "blur(10px)" }}
            >
                <div className="flex items-center gap-2">
                    <div
                        className="h-5 w-5 rounded-[4px]"
                        style={{ background: "#e8c547" }}
                    />
                    <span className="font-serif text-base font-semibold" style={{ color: "#f5f0e8" }}>
                        SpendLens
                    </span>
                    <span
                        className="ml-2 hidden rounded-full border px-2 py-0.5 text-[10px] font-medium sm:inline-block"
                        style={{ borderColor: "#2a2a2a", color: "#8a8580" }}
                    >
                        {summary.monthsAnalyzed} month{summary.monthsAnalyzed !== 1 ? "s" : ""} analyzed
                    </span>
                </div>

                <Link
                    href="/"
                    className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted hover:text-primary hover:border-border-light transition-all"
                >
                    <Plus size={12} />
                    New Analysis
                </Link>
            </header>

            <div className="mx-auto max-w-screen-xl px-4 md:px-6 pb-12">

                {/* ── Summary Strip ── */}
                <div className="grid grid-cols-2 gap-3 py-5 md:grid-cols-4">
                    <StatCard
                        icon={TrendingDown}
                        label="Total Spent"
                        value={formatINR(summary.totalSpent)}
                        sub={`₹${summary.totalCredits.toLocaleString("en-IN")} credited`}
                        color="#e85447"
                        delay={1}
                    />
                    <StatCard
                        icon={Tag}
                        label="Top Category"
                        value={summary.topCategory}
                        sub={(() => {
                            const cat = categoryBreakdown.find(
                                (c) => c.category === summary.topCategory
                            );
                            return cat ? `${cat.percentage.toFixed(1)}% of spend` : undefined;
                        })()}
                        color="#e8c547"
                        delay={2}
                    />
                    <StatCard
                        icon={Receipt}
                        label="Largest Expense"
                        value={formatINR(summary.largestExpense.amount)}
                        sub={summary.largestExpense.description}
                        color="#f5f0e8"
                        delay={3}
                    />
                    <StatCard
                        icon={Calendar}
                        label="Months Analyzed"
                        value={String(summary.monthsAnalyzed)}
                        sub={`${transactions.length} transactions`}
                        color="#47e8a0"
                        delay={4}
                    />
                </div>

                {/* ── Main Body ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">

                    {/* ── LEFT SIDEBAR ── */}
                    <div className="space-y-5">

                        {/* Chat */}
                        <div className="animate-fade-in-2">
                            <h2
                                className="font-serif text-base font-medium mb-3"
                                style={{ color: "#f5f0e8" }}
                            >
                                Ask a question
                            </h2>
                            <ChatBox summary={summary} categoryBreakdown={categoryBreakdown} />
                        </div>

                        {/* AI Insights (sidebar on mobile, shows here on desktop) */}
                        <div className="animate-fade-in-3 lg:block">
                            <h2
                                className="font-serif text-base font-medium mb-3"
                                style={{ color: "#f5f0e8" }}
                            >
                                Insights
                            </h2>
                            <div className="space-y-3">
                                {insights.map((insight, i) => (
                                    <InsightCard key={i} insight={insight} index={i} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── MAIN AREA ── */}
                    <div className="space-y-6 min-w-0">

                        {/* Charts row */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            {/* Pie */}
                            <div className="card p-5 animate-fade-in-1">
                                <h2
                                    className="font-serif text-sm font-medium mb-4"
                                    style={{ color: "#f5f0e8" }}
                                >
                                    Spending by Category
                                </h2>
                                <SpendingPieChart data={categoryBreakdown} />
                            </div>

                            {/* Bar */}
                            <div className="card p-5 animate-fade-in-2">
                                <h2
                                    className="font-serif text-sm font-medium mb-4"
                                    style={{ color: "#f5f0e8" }}
                                >
                                    Monthly Overview
                                </h2>
                                <MonthlyBarChart data={monthlyBreakdown} />
                            </div>
                        </div>

                        {/* Transaction Table */}
                        <div className="animate-fade-in-3">
                            <h2
                                className="font-serif text-base font-medium mb-3"
                                style={{ color: "#f5f0e8" }}
                            >
                                All Transactions
                            </h2>
                            <TransactionTable transactions={transactions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
