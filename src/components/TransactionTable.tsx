"use client";

import { useState, useMemo } from "react";
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Download,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import type { Transaction } from "@/types";

type SortField = "date" | "amount";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
        });
    } catch {
        return dateStr;
    }
}

function formatINR(amount: number): string {
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

interface Props {
    transactions: Transaction[];
}

export default function TransactionTable({ transactions }: Props) {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState<"all" | "debit" | "credit">("all");
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [page, setPage] = useState(1);

    // Unique categories for filter dropdown
    const categories = useMemo(() => {
        const cats = Array.from(new Set(transactions.map((t) => t.category))).sort();
        return ["All", ...cats];
    }, [transactions]);

    // Filter + sort
    const filtered = useMemo(() => {
        let result = [...transactions];

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (t) =>
                    t.description.toLowerCase().includes(q) ||
                    t.category.toLowerCase().includes(q)
            );
        }
        if (categoryFilter !== "All") {
            result = result.filter((t) => t.category === categoryFilter);
        }
        if (typeFilter !== "all") {
            result = result.filter((t) => t.type === typeFilter);
        }

        result.sort((a, b) => {
            let cmp = 0;
            if (sortField === "date") {
                cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
            } else {
                cmp = a.amount - b.amount;
            }
            return sortDir === "asc" ? cmp : -cmp;
        });

        return result;
    }, [transactions, search, categoryFilter, typeFilter, sortField, sortDir]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function toggleSort(field: SortField) {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("desc");
        }
        setPage(1);
    }

    function SortIcon({ field }: { field: SortField }) {
        if (sortField !== field) return <ArrowUpDown size={13} className="text-muted" />;
        return sortDir === "asc" ? (
            <ArrowUp size={13} className="text-accent" />
        ) : (
            <ArrowDown size={13} className="text-accent" />
        );
    }

    // Download CSV
    function downloadCSV() {
        const headers = ["Date", "Description", "Amount", "Type", "Category"];
        const rows = filtered.map((t) => [
            t.date,
            `"${t.description.replace(/"/g, '""')}"`,
            t.amount.toFixed(2),
            t.type,
            t.category,
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "spendlens-transactions.csv";
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                {/* Search */}
                <div className="relative flex-1 min-w-[160px]">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                        type="text"
                        placeholder="Search transactions…"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full rounded-[8px] bg-surface border border-border pl-8 pr-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-border-light transition-colors"
                    />
                </div>

                {/* Category filter */}
                <select
                    value={categoryFilter}
                    onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        setPage(1);
                    }}
                    className="rounded-[8px] bg-surface border border-border px-3 py-2 text-sm text-primary focus:outline-none focus:border-border-light transition-colors cursor-pointer"
                >
                    {categories.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>

                {/* Type filter */}
                <div className="flex rounded-[8px] border border-border overflow-hidden">
                    {(["all", "debit", "credit"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => {
                                setTypeFilter(t);
                                setPage(1);
                            }}
                            className={`px-3 py-2 text-xs font-medium capitalize transition-colors cursor-pointer ${typeFilter === t
                                ? "bg-surface-alt text-primary"
                                : "bg-surface text-muted hover:text-primary"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Download */}
                <button
                    onClick={downloadCSV}
                    className="flex items-center gap-1.5 rounded-[8px] border border-border bg-surface px-3 py-2 text-xs text-muted hover:text-primary hover:border-border-light transition-colors cursor-pointer ml-auto"
                >
                    <Download size={13} />
                    Export CSV
                </button>
            </div>

            {/* Table wrapper */}
            <div
                className="rounded-[12px] border border-border overflow-hidden"
                style={{ background: "#1a1a1a" }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                                <th className="py-3 px-4 text-left">
                                    <button
                                        onClick={() => toggleSort("date")}
                                        className="flex items-center gap-1.5 text-xs text-muted uppercase tracking-wider hover:text-primary transition-colors cursor-pointer"
                                    >
                                        Date <SortIcon field="date" />
                                    </button>
                                </th>
                                <th className="py-3 px-4 text-left text-xs text-muted uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="py-3 px-4 text-left text-xs text-muted uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="py-3 px-4 text-right">
                                    <button
                                        onClick={() => toggleSort("amount")}
                                        className="flex items-center gap-1.5 text-xs text-muted uppercase tracking-wider hover:text-primary transition-colors cursor-pointer ml-auto"
                                    >
                                        Amount <SortIcon field="amount" />
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-12 text-center text-muted text-sm"
                                    >
                                        No transactions match your filters.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((t, i) => (
                                    <tr
                                        key={`${t.date}-${t.description}-${i}`}
                                        className="transition-colors hover:bg-surface-alt"
                                        style={{ borderBottom: "1px solid #222" }}
                                    >
                                        <td className="py-3 px-4 text-muted text-xs whitespace-nowrap">
                                            {formatDate(t.date)}
                                        </td>
                                        <td className="py-3 px-4 text-primary max-w-[240px]">
                                            <span
                                                className="block truncate"
                                                title={t.description}
                                            >
                                                {t.description}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-xs text-muted rounded-full border border-border px-2 py-0.5">
                                                {t.category}
                                            </span>
                                        </td>
                                        <td
                                            className={`py-3 px-4 text-right font-medium tabular-nums ${t.type === "credit" ? "text-success" : "text-primary"
                                                }`}
                                        >
                                            {t.type === "credit" ? "+" : "−"}
                                            {formatINR(t.amount)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div
                        className="flex items-center justify-between px-4 py-3"
                        style={{ borderTop: "1px solid #2a2a2a" }}
                    >
                        <span className="text-xs text-muted">
                            {filtered.length} transactions · Page {page} of {totalPages}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-border text-muted disabled:opacity-30 hover:border-border-light hover:text-primary transition-colors cursor-pointer disabled:cursor-default"
                            >
                                <ChevronLeft size={13} />
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-border text-muted disabled:opacity-30 hover:border-border-light hover:text-primary transition-colors cursor-pointer disabled:cursor-default"
                            >
                                <ChevronRight size={13} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
