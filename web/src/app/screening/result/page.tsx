"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Summary = {
  score: number;
  category: "Low" | "Mild" | "Moderate" | "High";
  group: "toddler" | "child";
  totals: { socialRaw: number; repSensRaw: number; regulationRaw: number; maxRaw: number };
  createdAt: string;
};

const categoryColor = (c: Summary["category"]) => {
  switch (c) {
    case "Low":
      return { bg: "bg-green-100", text: "text-green-700", stroke: "#16a34a" };
    case "Mild":
      return { bg: "bg-yellow-100", text: "text-yellow-700", stroke: "#eab308" };
    case "Moderate":
      return { bg: "bg-orange-100", text: "text-orange-700", stroke: "#f97316" };
    case "High":
      return { bg: "bg-rose-100", text: "text-rose-700", stroke: "#e11d48" };
  }
};

export default function ScreeningResultPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [saveEnabled, setSaveEnabled] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("nk-screening-summary");
    if (raw) {
      try {
        setSummary(JSON.parse(raw));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (saveEnabled && summary) {
      try {
        const existing = JSON.parse(localStorage.getItem("nk-screening-summaries") || "[]");
        existing.push({
          score: summary.score,
          category: summary.category,
          group: summary.group,
          createdAt: summary.createdAt,
        });
        localStorage.setItem("nk-screening-summaries", JSON.stringify(existing));
      } catch {}
    }
  }, [saveEnabled, summary]);

  const gauge = useMemo(() => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const pct = Math.max(0, Math.min(100, summary?.score ?? 0));
    const dash = (pct / 100) * circumference;
    return { radius, circumference, dash };
  }, [summary]);

  if (!summary) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-gray-600">No results found. Please start the screening.</p>
        <Link href="/screening" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white">Go to Screening</Link>
      </div>
    );
  }

  const color = categoryColor(summary.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Screening Results</h1>
        <p className="mt-1 text-sm text-gray-600">Group: {summary.group === "toddler" ? "Toddler (18–36 months)" : "Child (3–12 years)"}</p>

        {/* Gauge */}
        <div className="mt-8 grid gap-8 sm:grid-cols-2 items-center">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-center">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r={gauge.radius} stroke="#e5e7eb" strokeWidth="16" fill="none" />
                <circle
                  cx="100" cy="100" r={gauge.radius} stroke={color.stroke} strokeWidth="16" fill="none"
                  strokeDasharray={`${gauge.dash} ${gauge.circumference}`} strokeLinecap="round" transform="rotate(-90 100 100)"
                />
                <text x="100" y="110" textAnchor="middle" className="fill-gray-900" fontSize="28" fontWeight={700}>{summary.score}</text>
              </svg>
            </div>
            <div className={`mt-4 inline-flex items-center rounded-lg px-3 py-1 text-sm font-semibold ${color.bg} ${color.text}`}>
              {summary.category} screening likelihood
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Screening likelihood score: {summary.score}/100
            </p>
          </div>

          {/* Breakdown */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900">Breakdown</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-sm text-gray-600">Social communication</div>
                <div className="text-xl font-bold text-gray-900">{summary.totals.socialRaw}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Repetitive / sensory</div>
                <div className="text-xl font-bold text-gray-900">{summary.totals.repSensRaw}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Regulation</div>
                <div className="text-xl font-bold text-gray-900">{summary.totals.regulationRaw}</div>
              </div>
            </div>

            <div className="mt-6 rounded-lg border p-3 text-xs text-gray-600">
              Disclaimer: This screening does not diagnose autism. It only indicates whether a professional evaluation may be helpful.
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <Link href={{ pathname: "/community/new", query: { title: "Screening results", body: `Score ${summary.score}/100 (${summary.category}). Looking for next steps.` } }} className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">
            <div className="text-2xl">👥</div>
            <div className="mt-3 font-bold">Ask the Community</div>
            <div className="mt-1 text-sm text-gray-600">Share anonymously and get parent insights</div>
          </Link>
          <Link href={{ pathname: "/providers", query: { ageGroup: summary.group } }} className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">
            <div className="text-2xl">⚕️</div>
            <div className="mt-3 font-bold">Find Providers</div>
            <div className="mt-1 text-sm text-gray-600">Filter by age group and specialty</div>
          </Link>
          <Link href="/ai-support" className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md">
            <div className="text-2xl">🧠</div>
            <div className="mt-3 font-bold">AI Support</div>
            <div className="mt-1 text-sm text-gray-600">Get personalized guidance</div>
          </Link>
        </div>

        {/* Save toggle */}
        <div className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={saveEnabled} onChange={(e) => setSaveEnabled(e.target.checked)} />
            Save my screening summary (age group, total score, category, date)
          </label>
          <p className="mt-2 text-xs text-gray-600">Answers are not stored.</p>
        </div>
      </div>
    </div>
  );
}
