"use client";

import { AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";
import type { Insight, InsightType } from "@/types";

const CONFIG: Record<
    InsightType,
    { icon: typeof AlertTriangle; color: string; bg: string; border: string; label: string }
> = {
    anomaly: {
        icon: AlertTriangle,
        color: "#e85447",
        bg: "rgba(232,84,71,0.08)",
        border: "rgba(232,84,71,0.2)",
        label: "Anomaly",
    },
    pattern: {
        icon: TrendingUp,
        color: "#e8c547",
        bg: "rgba(232,197,71,0.08)",
        border: "rgba(232,197,71,0.2)",
        label: "Pattern",
    },
    tip: {
        icon: Lightbulb,
        color: "#47e8a0",
        bg: "rgba(71,232,160,0.08)",
        border: "rgba(71,232,160,0.2)",
        label: "Tip",
    },
};

interface Props {
    insight: Insight;
    index?: number;
}

export default function InsightCard({ insight, index = 0 }: Props) {
    const config = CONFIG[insight.type] ?? CONFIG.tip;
    const Icon = config.icon;
    const delayClass = [`animate-fade-in-1`, `animate-fade-in-2`, `animate-fade-in-3`, `animate-fade-in-4`][
        index % 4
    ];

    return (
        <div
            className={`rounded-[12px] p-4 transition-all duration-200 hover:scale-[1.01] ${delayClass}`}
            style={{
                background: config.bg,
                border: `1px solid ${config.border}`,
            }}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                    className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: `${config.color}20` }}
                >
                    <Icon size={15} style={{ color: config.color }} />
                </div>

                {/* Content */}
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="text-[10px] font-medium uppercase tracking-wider rounded-full px-2 py-0.5"
                            style={{
                                color: config.color,
                                background: `${config.color}15`,
                            }}
                        >
                            {config.label}
                        </span>
                    </div>
                    <h4 className="text-primary text-sm font-medium leading-snug mb-1">
                        {insight.title}
                    </h4>
                    <p className="text-muted text-xs leading-relaxed">{insight.body}</p>
                </div>
            </div>
        </div>
    );
}
