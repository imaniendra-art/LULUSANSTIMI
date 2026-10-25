"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Award,
  FileCheck2,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Filter,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Info,
} from "lucide-react";

export interface DashboardAnalyticsProps {
  stats: {
    totalGraduates: number;
    withPisn: number;
    withoutPisn: number;
    withIjazah: number;
    withTranskrip: number;
    bothFilesArchived: number;
    batches: string[];
    cohorts?: string[];
    cohortCounts?: Record<string, number>;
    cohortPisnStats?: Record<string, { total: number; withPisn: number; withoutPisn: number }>;
    cohortExitBreakdown?: Record<
      string,
      {
        cohort: string;
        total: number;
        withPisn: number;
        withoutPisn: number;
        exits: Record<string, number>;
      }
    >;
    exitPeriodStats?: Record<
      string,
      {
        period: string;
        total: number;
        withPisn: number;
        withoutPisn: number;
        cohorts: Record<string, number>;
      }
    >;
    accreditation?: {
      avgGpaS1: number | null;
      avgGpaS2: number | null;
      avgGpaOverall: number | null;
      gpaCount: number;
      cumlaudeCount: number;
      sangatMemuaskanCount: number;
      memuaskanCount: number;
      avgYearsReguler: number | null;
      avgYearsRpl: number | null;
      onTimeRate: number;
    };
    archiveHealth?: {
      total: number;
      fullComplete: number;
      hasPisn: number;
      hasIjazah: number;
      hasTranskrip: number;
      hasThesis: number;
      missingPisn: number;
      missingIjazah: number;
      missingTranskrip: number;
      missingThesis: number;
      healthScore: number;
    };
    prodi: {
      s1Manajemen: number;
      s2Manajemen: number;
    };
    registrationTypes?: {
      pesertaBaru: number;
      rplPerolehan?: number;
      rplKonversi?: number;
      rplTransfer?: number;
      transfer: number;
    };
  } | null;
  onFilterCohort?: (cohort: string) => void;
  onFilterExitPeriod?: (exitPeriod: string) => void;
  onFilterPisnStatus?: (hasPisn: "true" | "false") => void;
  onFilterGpaRange?: (range: string) => void;
  onFilterFileStatus?: (status: string) => void;
  onSwitchTab?: (tab: "dashboard" | "repo" | "import" | "pisn" | "skripsi" | "berkas", tableTab?: "pisn" | "skripsi" | "berkas") => void;
}

export function DashboardAnalyticsSuite({
  stats,
  onFilterCohort,
  onFilterExitPeriod,
  onFilterPisnStatus,
  onFilterGpaRange,
  onFilterFileStatus,
  onSwitchTab,
}: DashboardAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"all" | "cohort_exit" | "pisn_readiness" | "accreditation">(
    "all"
  );
  const [hoveredCohort, setHoveredCohort] = useState<string | null>(null);

  if (!stats) return null;

  const totalGraduates = stats.totalGraduates || 0;
  const cohortBreakdown = stats.cohortExitBreakdown || {};
  const exitStats = stats.exitPeriodStats || {};
  const sortedCohorts = Object.keys(cohortBreakdown).sort();
  const sortedExitPeriods = Object.keys(exitStats).sort();

  // Palette color map for exit periods to keep visual consistency
  const exitColors: Record<string, { bg: string; text: string; bar: string; border: string }> = {
    "2025-2": {
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
      text: "text-indigo-700 dark:text-indigo-300",
      bar: "bg-indigo-500",
      border: "border-indigo-300/60 dark:border-indigo-500/30",
    },
    "2026-1": {
      bg: "bg-cyan-50 dark:bg-cyan-950/40",
      text: "text-cyan-700 dark:text-cyan-300",
      bar: "bg-cyan-500",
      border: "border-cyan-300/60 dark:border-cyan-500/30",
    },
    "2026-2": {
      bg: "bg-teal-50 dark:bg-teal-950/40",
      text: "text-teal-700 dark:text-teal-300",
      bar: "bg-teal-500",
      border: "border-teal-300/60 dark:border-teal-500/30",
    },
  };

  const getExitColor = (period: string) =>
    exitColors[period] || {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-700 dark:text-slate-300",
      bar: "bg-slate-500",
      border: "border-slate-300 dark:border-white/10",
    };

  return (
    <div className="space-y-6 pt-4 border-t border-slate-200/80 dark:border-white/[0.08]">
      {/* ==================================================================== */}
      {/* 1. SUITE HEADER & NAVIGATION PILLS                                    */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20 animate-pulse" />
            <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase font-mono flex items-center gap-2">
              <span>Analitik Visual & Wawasan Kelulusan Mahasiswa</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 normal-case">
                Executive Campus View
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visualisasi distribusi lintas angkatan, periode keluar, indeks akreditasi, dan kesiapan berkas digital.
          </p>
        </div>

        {/* View Filter Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === "all"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Semua Analitik
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cohort_exit")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === "cohort_exit"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Angkatan & Periode
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pisn_readiness")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === "pisn_readiness"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Kesiapan PIN Belmawa
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("accreditation")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === "accreditation"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Indikator Akreditasi
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. ROW 1: COHORT VS EXIT PERIOD + EXIT PERIOD TREND                   */}
      {/* ==================================================================== */}
      {(activeTab === "all" || activeTab === "cohort_exit") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card A: Cohort vs Exit Period Stacked Bar Chart */}
          <div className="lg:col-span-7 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Distribusi Angkatan vs Periode Keluar (Cohort Cross-Tab)</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Perincian kelulusan tiap tahun angkatan masuk terhadap semester keluar kelulusannya.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-500/20">
                {sortedCohorts.length} Angkatan
              </span>
            </div>

            {/* Visual Stacked Bar Rows */}
            <div className="space-y-3.5 pt-1">
              {sortedCohorts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Belum ada data angkatan lulusan yang diimpor.
                </div>
              ) : (
                sortedCohorts.map((cohortYear) => {
                const data = cohortBreakdown[cohortYear];
                if (!data) return null;
                const totalInCohort = data.total;
                const exits = data.exits || {};
                const percentOfTotal = totalGraduates
                  ? Math.round((totalInCohort / totalGraduates) * 100)
                  : 0;

                return (
                  <div
                    key={cohortYear}
                    onMouseEnter={() => setHoveredCohort(cohortYear)}
                    onMouseLeave={() => setHoveredCohort(null)}
                    className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/70 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">
                          Angkatan {cohortYear}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-white/10 font-semibold shadow-2xs">
                          {totalInCohort} Lulusan ({percentOfTotal}%)
                        </span>
                      </div>

                      {/* Filter Shortcut */}
                      <button
                        type="button"
                        onClick={() => {
                          onFilterCohort?.(cohortYear);
                        }}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        title={`Filter tabel untuk Angkatan ${cohortYear}`}
                      >
                        <span>Lihat Mahasiswa</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Segmented Bar for Exit Periods */}
                    <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                      {Object.entries(exits).map(([ep, count]) => {
                        const widthPct = (count / totalInCohort) * 100;
                        const c = getExitColor(ep);
                        return (
                          <div
                            key={ep}
                            style={{ width: `${widthPct}%` }}
                            className={`${c.bar} h-full transition-all duration-300 hover:opacity-90 relative group/segment`}
                            title={`Periode ${ep}: ${count} mahasiswa (${Math.round(widthPct)}%)`}
                          />
                        );
                      })}
                    </div>

                    {/* Segment Pills Details */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      {Object.entries(exits).map(([ep, count]) => {
                        const c = getExitColor(ep);
                        const pct = Math.round((count / totalInCohort) * 100);
                        return (
                          <button
                            key={ep}
                            type="button"
                            onClick={() => {
                              onFilterCohort?.(cohortYear);
                              onFilterExitPeriod?.(ep);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold ${c.bg} ${c.text} border ${c.border} hover:scale-105 transition cursor-pointer`}
                            title={`Klik untuk filter Angkatan ${cohortYear} yang keluar di semester ${ep}`}
                          >
                            <span>Keluar {ep}:</span>
                            <span className="font-bold font-mono">{count} mhs</span>
                            <span className="opacity-70">({pct}%)</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }))}
            </div>

            {/* Dynamic Legend */}
            {sortedExitPeriods.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                <span className="text-[11px] font-medium text-slate-400">Semester Keluar:</span>
                <div className="flex items-center gap-3 text-[11px] font-mono flex-wrap">
                  {sortedExitPeriods.map((ep) => {
                    const c = getExitColor(ep);
                    const count = exitStats[ep]?.total || 0;
                    return (
                      <span key={ep} className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${c.bar}`} />
                        <span>{ep} ({count} mhs)</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Card B: Exit Period Volume & PISN Breakdown */}
          <div className="lg:col-span-5 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>Tren Volume per Semester Keluar</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Volume kelulusan per semester dan rasio kepemilikan nomor PIN Belmawa.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold border border-teal-200 dark:border-teal-500/20">
                {sortedExitPeriods.length} Periode
              </span>
            </div>

            {/* Exit Period Cards */}
            <div className="space-y-3 pt-1">
              {sortedExitPeriods.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Belum ada data semester keluar yang terdeteksi.
                </div>
              ) : (
                sortedExitPeriods.map((period) => {
                const epData = exitStats[period];
                if (!epData) return null;
                const totalInEp = epData.total;
                const withPisn = epData.withPisn;
                const withoutPisn = epData.withoutPisn;
                const pisnPct = totalInEp ? Math.round((withPisn / totalInEp) * 100) : 0;
                const cohorts = epData.cohorts || {};

                return (
                  <div
                    key={period}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/70 dark:border-white/5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                          Periode {period}
                        </span>
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300">
                          {totalInEp} Mahasiswa
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onFilterExitPeriod?.(period);
                        }}
                        className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Filter</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Stacked PIN status bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 inline" />
                          <span>PISN: {withPisn} mhs ({pisnPct}%)</span>
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 inline" />
                          <span>Belum: {withoutPisn} mhs</span>
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                        <div
                          style={{ width: `${pisnPct}%` }}
                          className="bg-emerald-500 h-full transition-all duration-300"
                          title={`Sudah terbit PISN: ${withPisn} mhs`}
                        />
                        <div
                          style={{ width: `${100 - pisnPct}%` }}
                          className="bg-amber-500 h-full transition-all duration-300"
                          title={`Belum terbit PISN: ${withoutPisn} mhs`}
                        />
                      </div>
                    </div>

                    {/* Source Cohorts in this Exit Period */}
                    <div className="pt-2 border-t border-slate-200/50 dark:border-white/5 flex items-center gap-1.5 flex-wrap text-[10px]">
                      <span className="text-slate-400 font-medium">Asal Angkatan:</span>
                      {Object.entries(cohorts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([cYear, count]) => (
                          <span
                            key={cYear}
                            className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-mono font-semibold"
                          >
                            {cYear} ({count})
                          </span>
                        ))}
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. ROW 2: PISN READINESS MONITOR & DIGITAL ARCHIVE HEALTH             */}
      {/* ==================================================================== */}
      {(activeTab === "all" || activeTab === "pisn_readiness") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card C: PISN Readiness Monitor by Cohort */}
          <div className="lg:col-span-7 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Kesiapan Nomor PIN / PISN Belmawa per Angkatan</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Prioritas penomoran ijazah nasional agar segera terbit untuk wisuda dan verifikasi akreditasi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onFilterPisnStatus?.("false");
                  onSwitchTab?.("repo", "pisn");
                }}
                className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 transition cursor-pointer"
              >
                Lihat Semua Yang Belum Ber-PIN &rarr;
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {sortedCohorts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Belum ada data angkatan untuk verifikasi PISN.
                </div>
              ) : (
                sortedCohorts.map((cohortYear) => {
                const pisnData = stats.cohortPisnStats?.[cohortYear];
                if (!pisnData) return null;
                const total = pisnData.total;
                const withP = pisnData.withPisn;
                const withoutP = pisnData.withoutPisn;
                const pct = total ? Math.round((withP / total) * 100) : 0;

                const isComplete = withoutP === 0;
                const isHigh = pct >= 80;

                return (
                  <div
                    key={cohortYear}
                    className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/70 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1 mr-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold font-mono text-slate-900 dark:text-white">
                            Angkatan {cohortYear}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                              isComplete
                                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                                : isHigh
                                ? "bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300"
                                : "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300"
                            }`}
                          >
                            {isComplete ? "100% Tuntas" : `${pct}% Ber-PIN`}
                          </span>
                        </div>

                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          {withP} / {total} mhs
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isComplete ? "bg-emerald-500" : isHigh ? "bg-teal-500" : "bg-amber-500"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Action Shortcut */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {withoutP > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            onFilterCohort?.(cohortYear);
                            onFilterPisnStatus?.("false");
                            onSwitchTab?.("repo", "pisn");
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-slate-200 dark:border-white/10 text-[11px] font-semibold transition shadow-2xs cursor-pointer flex items-center gap-1"
                          title={`Lihat ${withoutP} mahasiswa Angkatan ${cohortYear} yang belum punya nomor PIN`}
                        >
                          <AlertCircle className="h-3 w-3 text-amber-500" />
                          <span>{withoutP} Belum Ber-PIN</span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span>Lengkap</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>

          {/* Card D: Digital Archive Health Index */}
          <div className="lg:col-span-5 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Kesehatan Arsip Berkas Digital</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Kelengkapan 4 dokumen utama mahasiswa: PISN, Ijazah, Transkrip & Judul Skripsi.
                </p>
              </div>
              <span className="text-xs font-mono font-black text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20">
                {stats.archiveHealth?.healthScore ?? 0}% Siap
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {/* 1. PIN Belmawa */}
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/70 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Nomor PISN / PIN Belmawa
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {stats.withPisn} dari {totalGraduates} alumni
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {totalGraduates ? Math.round((stats.withPisn / totalGraduates) * 100) : 0}%
                </span>
              </div>

              {/* 2. Judul Skripsi / Tesis */}
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/70 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Judul Skripsi & Tesis
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {stats.archiveHealth?.hasThesis ?? 0} dari {totalGraduates} alumni
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    {totalGraduates
                      ? Math.round(((stats.archiveHealth?.hasThesis ?? 0) / totalGraduates) * 100)
                      : 0}
                    %
                  </span>
                  {(stats.archiveHealth?.missingThesis ?? 0) > 0 && (
                    <p className="text-[9px] text-amber-500">
                      Tersisa {stats.archiveHealth?.missingThesis} belum sinkron
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Scan Ijazah */}
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/70 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Scan Berkas PDF Ijazah
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {stats.withIjazah} dari {totalGraduates} alumni
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {totalGraduates ? Math.round((stats.withIjazah / totalGraduates) * 100) : 0}%
                </span>
              </div>

              {/* 4. Scan Transkrip Nilai */}
              <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/70 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Scan Transkrip Nilai Akademik
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {stats.withTranskrip} dari {totalGraduates} alumni
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400">
                  {totalGraduates ? Math.round((stats.withTranskrip / totalGraduates) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. ROW 3: ACCREDITATION METRICS (BAN-PT / LAMEMBA KPI INSIGHTS)       */}
      {/* ==================================================================== */}
      {(activeTab === "all" || activeTab === "accreditation") && (
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/50 via-white to-teal-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Indikator Akreditasi & Efisiensi Studi (Standar LAMEMBA / BAN-PT)</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Statistik mutu akademik untuk pelaporan borang akreditasi, rata-rata IPK, dan masa studi lulusan.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-500/30">
              Audit Siap
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Rata-rata IPK */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 space-y-1.5 shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Rata-Rata IPK Lulusan
              </span>
              <div className="flex items-baseline gap-2">
                <h4 className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {stats.accreditation?.avgGpaOverall !== null && stats.accreditation?.avgGpaOverall !== undefined
                    ? stats.accreditation.avgGpaOverall.toFixed(2)
                    : "-"}
                </h4>
                {stats.accreditation?.avgGpaOverall !== null && stats.accreditation?.avgGpaOverall !== undefined ? (
                  <span className="text-xs text-slate-400 font-mono">/ 4.00</span>
                ) : null}
              </div>
              <p className="text-[10px] text-slate-500">
                S1: {stats.accreditation?.avgGpaS1 !== null && stats.accreditation?.avgGpaS1 !== undefined ? stats.accreditation.avgGpaS1.toFixed(2) : "-"} · S2: {stats.accreditation?.avgGpaS2 !== null && stats.accreditation?.avgGpaS2 !== undefined ? stats.accreditation.avgGpaS2.toFixed(2) : "N/A"}
              </p>
            </div>

            {/* 2. Rata-rata Masa Studi Reguler */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 space-y-1.5 shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Rata-Rata Masa Studi Reguler
              </span>
              <div className="flex items-baseline gap-2">
                <h4 className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400">
                  {stats.accreditation?.avgYearsReguler !== null && stats.accreditation?.avgYearsReguler !== undefined
                    ? stats.accreditation.avgYearsReguler.toFixed(1)
                    : "-"}
                </h4>
                {stats.accreditation?.avgYearsReguler !== null && stats.accreditation?.avgYearsReguler !== undefined ? (
                  <span className="text-xs text-slate-400 font-mono">
                    Tahun (~{(stats.accreditation.avgYearsReguler * 2).toFixed(1)} Sem)
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-mono">Tahun</span>
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                Peserta Baru: {stats.registrationTypes?.pesertaBaru ?? 0} mahasiswa
              </p>
            </div>

            {/* 3. Rata-rata Masa Studi RPL / Konversi */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 space-y-1.5 shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Masa Studi RPL / Transfer
              </span>
              <div className="flex items-baseline gap-2">
                <h4 className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400">
                  {stats.accreditation?.avgYearsRpl !== null && stats.accreditation?.avgYearsRpl !== undefined
                    ? stats.accreditation.avgYearsRpl.toFixed(1)
                    : "-"}
                </h4>
                {stats.accreditation?.avgYearsRpl !== null && stats.accreditation?.avgYearsRpl !== undefined ? (
                  <span className="text-xs text-slate-400 font-mono">
                    Tahun (~{(stats.accreditation.avgYearsRpl * 2).toFixed(1)} Sem)
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-mono">Tahun</span>
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                Jalur RPL/Transfer: {(stats.registrationTypes?.rplPerolehan ?? 0) + (stats.registrationTypes?.rplTransfer ?? 0) + (stats.registrationTypes?.transfer ?? 0)} mahasiswa
              </p>
            </div>

            {/* 4. Kelulusan Tepat Waktu */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 space-y-1.5 shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Kelulusan Tepat Waktu
              </span>
              <div className="flex items-baseline gap-2">
                <h4 className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {stats.accreditation?.onTimeRate !== null && stats.accreditation?.onTimeRate !== undefined
                    ? `${stats.accreditation.onTimeRate}%`
                    : "-"}
                </h4>
                {stats.accreditation?.onTimeRate !== null && stats.accreditation?.onTimeRate !== undefined ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                    ≤ 4.0 Tahun
                  </span>
                ) : null}
              </div>
              <p className="text-[10px] text-slate-500">
                {stats.accreditation?.onTimeRate !== null && stats.accreditation?.onTimeRate !== undefined
                  ? stats.accreditation.onTimeRate >= 50
                    ? "Memenuhi kriteria akreditasi Unggul"
                    : "Perlu evaluasi masa studi"
                  : "Belum ada kalkulasi masa studi"}
              </p>
            </div>
          </div>

          {/* Predikat Kelulusan Distribution Bar */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200/70 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                <span>Distribusi Predikat Kelulusan (IPK)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {stats.accreditation?.gpaCount ?? 0} data nilai terverifikasi
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  onFilterGpaRange?.("cumlaude");
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 font-semibold cursor-pointer hover:scale-105 transition flex items-center gap-1.5"
                title="Filter lulusan dengan predikat Cum Laude (IPK ≥ 3.51)"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Dengan Pujian (Cum Laude):</span>
                <span className="font-bold font-mono">
                  {stats.accreditation?.cumlaudeCount ?? 0} mhs
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onFilterGpaRange?.("sangat_memuaskan");
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 font-semibold cursor-pointer hover:scale-105 transition flex items-center gap-1.5"
                title="Filter lulusan dengan predikat Sangat Memuaskan (IPK 3.00 - 3.50)"
              >
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>Sangat Memuaskan:</span>
                <span className="font-bold font-mono">
                  {stats.accreditation?.sangatMemuaskanCount ?? 0} mhs
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onFilterGpaRange?.("memuaskan");
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-semibold cursor-pointer hover:scale-105 transition flex items-center gap-1.5"
                title="Filter lulusan dengan predikat Memuaskan (IPK < 3.00)"
              >
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Memuaskan:</span>
                <span className="font-bold font-mono">
                  {stats.accreditation?.memuaskanCount ?? 0} mhs
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
