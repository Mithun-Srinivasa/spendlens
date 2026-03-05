"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import type { MonthlyBreakdown } from "@/types";

function formatINR(amount: number): string {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${Math.round(amount)}`;
}

interface CustomTooltipProps {
    active?: boolean;
    label?: string;
    payload?: Array<{ name: string; value: number; color: string }>;
}

function CustomTooltip({ active, label, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="card px-4 py-3 shadow-xl text-sm"
            style={{ border: "1px solid #383838" }}
        >
            <p className="text-muted text-xs mb-2">{label}</p>
            {payload.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                    <div
                        className="h-2 w-2 rounded-full"
                        style={{ background: item.color }}
                    />
                    <span className="text-muted">{item.name}:</span>
                    <span className="text-primary font-medium tabular-nums">
                        ₹{item.value.toLocaleString("en-IN")}
                    </span>
                </div>
            ))}
        </div>
    );
}

interface Props {
    data: MonthlyBreakdown[];
}

export default function MonthlyBarChart({ data }: Props) {
    return (
        <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                    barGap={3}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#2a2a2a"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="month"
                        tick={{ fill: "#8a8580", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tickFormatter={formatINR}
                        tick={{ fill: "#8a8580", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={52}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: "12px", color: "#8a8580", paddingTop: "12px" }}
                    />
                    <Bar
                        dataKey="spent"
                        name="Spent"
                        fill="#e8c547"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                        animationBegin={0}
                        animationDuration={700}
                    />
                    <Bar
                        dataKey="credited"
                        name="Credited"
                        fill="#47e8a0"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                        animationBegin={100}
                        animationDuration={700}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
