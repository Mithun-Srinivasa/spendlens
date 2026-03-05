"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { CategoryBreakdown } from "@/types";

// Warm, editorial color palette — no neon
const CATEGORY_COLORS: Record<string, string> = {
    "Food & Dining": "#e8c547",
    Transport: "#d4845a",
    Shopping: "#c47a3a",
    Entertainment: "#8fa88c",
    Utilities: "#6b8fa3",
    Health: "#47e8a0",
    Travel: "#5a9fd4",
    Transfers: "#9a9088",
    "EMI/Loan": "#e85447",
    Others: "#b8965c",
};

const FALLBACK_COLORS = [
    "#e8c547",
    "#d4845a",
    "#c47a3a",
    "#8fa88c",
    "#6b8fa3",
    "#47e8a0",
    "#5a9fd4",
    "#9a9088",
    "#e85447",
    "#b8965c",
];

function getColor(category: string, index: number): string {
    return CATEGORY_COLORS[category] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function formatINR(amount: number): string {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toFixed(0)}`;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: CategoryBreakdown }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.[0]) return null;
    const item = payload[0].payload;
    return (
        <div
            className="card px-4 py-3 shadow-xl text-sm"
            style={{ border: "1px solid #383838" }}
        >
            <p className="text-primary font-medium">{item.category}</p>
            <p className="text-accent font-serif mt-0.5">
                ₹{item.amount.toLocaleString("en-IN")}
            </p>
            <p className="text-muted text-xs mt-0.5">{item.percentage.toFixed(1)}%</p>
        </div>
    );
}

interface Props {
    data: CategoryBreakdown[];
}

export default function SpendingPieChart({ data }: Props) {
    const sorted = [...data].sort((a, b) => b.amount - a.amount);

    return (
        <div>
            {/* Donut Chart */}
            <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={sorted}
                            cx="50%"
                            cy="50%"
                            innerRadius={72}
                            outerRadius={110}
                            dataKey="amount"
                            nameKey="category"
                            strokeWidth={0}
                            paddingAngle={2}
                            animationBegin={0}
                            animationDuration={700}
                        >
                            {sorted.map((entry, index) => (
                                <Cell
                                    key={entry.category}
                                    fill={getColor(entry.category, index)}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2">
                {sorted.map((entry, index) => (
                    <div
                        key={entry.category}
                        className="flex items-center justify-between gap-2"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <div
                                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                style={{ background: getColor(entry.category, index) }}
                            />
                            <span className="text-sm text-muted truncate">
                                {entry.category}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-xs text-muted">
                                {entry.percentage.toFixed(1)}%
                            </span>
                            <span className="text-sm text-primary font-medium tabular-nums w-16 text-right">
                                {formatINR(entry.amount)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
