"use client";

import { useEffect, useRef } from "react";
import { Shield, Zap, Eye } from "lucide-react";
import dynamic from "next/dynamic";

const UploadZone = dynamic(() => import("@/components/UploadZone"), {
  ssr: false,
});

const FEATURES = [
  {
    icon: Shield,
    title: "Stays in your session",
    body: "Nothing is stored. No servers, no database, no tracking.",
  },
  {
    icon: Zap,
    title: "AI-powered analysis",
    body: "Gemini reads your statement and returns structured insights instantly.",
  },
  {
    icon: Eye,
    title: "Actually legible",
    body: "Categories, trends, anomalies — in one clean dashboard.",
  },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear any stale session data when landing page loads
    sessionStorage.removeItem("spendlens_analysis");
  }, []);

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "#0f0f0f" }}
    >
      {/* ── Subtle grid background ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#f5f0e8 1px, transparent 1px), linear-gradient(90deg, #f5f0e8 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-[4px]"
            style={{ background: "#e8c547" }}
            aria-hidden
          />
          <span
            className="font-serif text-lg font-semibold tracking-tight"
            style={{ color: "#f5f0e8" }}
          >
            SpendLens
          </span>
        </div>
        <a
          href="https://github.com/mithun-srinivasa/spendlens"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted hover:text-primary transition-colors"
        >
          GitHub →
        </a>
      </nav>

      {/* ── Hero ── */}
      <div
        ref={heroRef}
        className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16 text-center"
      >
        {/* Label */}
        <div className="animate-fade-in mb-6">
          <span
            className="inline-block rounded-full border px-3 py-1 text-xs font-medium"
            style={{
              borderColor: "rgba(232,197,71,0.3)",
              color: "#e8c547",
              background: "rgba(232,197,71,0.06)",
            }}
          >
            Expense Intelligence for India
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-in-1 font-serif text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl"
          style={{ color: "#f5f0e8", maxWidth: "720px" }}
        >
          Your money,
          <br />
          <span style={{ color: "#e8c547", fontStyle: "italic" }}>
            finally legible.
          </span>
        </h1>

        <p
          className="animate-fade-in-2 mt-5 text-base leading-relaxed"
          style={{ color: "#8a8580", maxWidth: "440px" }}
        >
          Upload your bank statement and get instant AI-powered expense
          insights — category breakdowns, monthly trends, and anomaly
          detection.
        </p>

        {/* Upload zone */}
        <div className="animate-fade-in-3 mt-10 w-full" style={{ maxWidth: "520px" }}>
          <UploadZone />
        </div>

        {/* Privacy note */}
        <p
          className="animate-fade-in-4 mt-5 text-xs"
          style={{ color: "#5a5550" }}
        >
          🔒 Your data never leaves your session. Nothing is stored or logged.
        </p>
      </div>

      {/* ── Features ── */}
      <div className="relative z-10 border-t border-border px-6 py-12 md:px-10">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`animate-fade-in-${i + 3} flex flex-col gap-2`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={15} style={{ color: "#e8c547" }} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#f5f0e8" }}
                  >
                    {f.title}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "#5a5550" }}>
                  {f.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer
        className="relative z-10 border-t border-border px-6 py-5 text-center text-xs"
        style={{ color: "#3a3530" }}
      >
        Built by Mithun Srinivasa · Everything processed on Vercel Edge, nothing persisted
      </footer>
    </main>
  );
}
