"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  ShieldCheck,
  FileText,
  FileCheck,
  UploadCloud,
  Layers,
  Plus,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Calendar,
  ChevronRight,
  BookOpen,
  Users,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { FeederGraduatesModal } from "./FeederGraduatesModal";
import { SyncRegistrationTypeModal } from "./SyncRegistrationTypeModal";
import { PandawaThesisModal } from "./PandawaThesisModal";
import { UploadDecreeModal } from "./UploadDecreeModal";
import { PisnResultModal } from "./PisnResultModal";
import { UploadIjazahTranskripModal } from "./UploadIjazahTranskripModal";
import { GeneratePisnModal } from "./GeneratePisnModal";
import { DashboardAnalyticsSuite } from "./DashboardAnalyticsSuite";
import { AlertCircle, Clock, Sparkles } from "lucide-react";

interface StatsData {
  totalGraduates: number;
  withPisn: number;
  withoutPisn: number;
  withIjazah: number;
  withTranskrip: number;
  bothFilesArchived: number;
  batches: string[];
  yudisiumDates?: string[];
  yudisiumCounts?: Record<string, number>;
  yudisiumSkMap?: Record<string, string>;
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
  graduationYears?: string[];
  graduationYearCounts?: Record<string, number>;
  entryPeriods?: string[];
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
}

interface DashboardViewProps {
  stats: StatsData | null;
  currentUser?: { email: string; fullName: string; role: string } | null;
  onSwitchTab: (tab: "dashboard" | "repo" | "import" | "pisn" | "skripsi" | "berkas", tableTab?: "pisn" | "skripsi" | "berkas") => void;
  onOpenAdd: () => void;
  onFilterYudisium: (yudisiumDate: string) => void;
  onFilterCohort?: (cohort: string) => void;
  onFilterExitPeriod?: (exitPeriod: string) => void;
  onFilterPisnStatus?: (hasPisn: "true" | "false") => void;
  onFilterGpaRange?: (range: string) => void;
  onFilterFileStatus?: (status: string) => void;
  onOpenSiamModal?: () => void;
  onRefreshData?: () => void;
}

export function DashboardView({
  stats,
  onSwitchTab,
  onOpenAdd,
  onFilterYudisium,
  onFilterCohort,
  onFilterExitPeriod,
  onFilterPisnStatus,
  onFilterGpaRange,
  onFilterFileStatus,
  onRefreshData,
}: DashboardViewProps) {
  const totalGraduates = stats?.totalGraduates ?? 0;
  const withPisn = stats?.withPisn ?? 0;
  const pisnPercentage = totalGraduates ? Math.round((withPisn / totalGraduates) * 100) : 0;
  const withIjazah = stats?.withIjazah ?? 0;
  const withTranskrip = stats?.withTranskrip ?? 0;

  // Modals state
  const [isFeederModalOpen, setIsFeederModalOpen] = useState(false);
  const [isSyncRegModalOpen, setIsSyncRegModalOpen] = useState(false);
  const [isPisnModalOpen, setIsPisnModalOpen] = useState(false);
  const [isPandawaModalOpen, setIsPandawaModalOpen] = useState(false);
  const [isUploadDecreeModalOpen, setIsUploadDecreeModalOpen] = useState(false);
  const [isIjazahTranskripModalOpen, setIsIjazahTranskripModalOpen] = useState(false);
  const [isGeneratePisnOpen, setIsGeneratePisnOpen] = useState(false);
  const [selectedDecreeForUpload, setSelectedDecreeForUpload] = useState("");
  const [uploadedDecrees, setUploadedDecrees] = useState<Record<string, { fileName: string; size: number }>>({});

  const fetchDecrees = async () => {
    try {
      const res = await fetch("/api/v1/yudisium-decree");
      const json = await res.json();
      if (json.success && json.decrees) {
        setUploadedDecrees(json.decrees);
      }
    } catch (e) {
      console.error("Fetch decrees status error:", e);
    }
  };

  useEffect(() => {
    fetchDecrees();
  }, []);

  const formatDateIndo = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
      const d = parseInt(parts[2], 10);
      const m = months[parseInt(parts[1], 10) - 1];
      const y = parts[0];
      return `${d} ${m} ${y}`;
    } catch {
      return dateStr;
    }
  };

  const getSafeKey = (sk: string) => sk.replace(/[/\\?%*:|"<>]/g, "_").trim();

  const knownDecreesList = (stats?.yudisiumDates || []).map((dateStr) => ({
    dateStr,
    skNumber: stats?.yudisiumSkMap?.[dateStr] || "",
    count: stats?.yudisiumCounts?.[dateStr] || 0,
  }));

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* 1. STATS KPI CARDS                                                   */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* Total Lulusan */}
        <div
          onClick={() => onSwitchTab("repo")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xs flex items-center justify-between transition hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:-translate-y-0.5 cursor-pointer group"
          title="Klik untuk membuka Repositori Lulusan"
        >
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">
              Total Lulusan Terarsip
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
              {totalGraduates}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
              S1: {stats?.prodi.s1Manajemen ?? 0} · S2: {stats?.prodi.s2Manajemen ?? 0} mhs
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs group-hover:scale-105 transition">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>

        {/* PISN Valid */}
        <div
          onClick={() => onSwitchTab("repo")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xs flex items-center justify-between transition hover:border-emerald-400 dark:hover:border-emerald-500/40 hover:-translate-y-0.5 cursor-pointer group"
          title="Klik untuk membuka Repositori Lulusan"
        >
          <div className="flex-1 mr-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                PISN Kemdiktisaintek
              </p>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {pisnPercentage}%
              </span>
            </div>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {withPisn}
            </h3>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${pisnPercentage}%` }}
              />
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs flex-shrink-0 group-hover:scale-105 transition">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Belum Terbit PIN / PISN */}
        <div
          onClick={() => setIsGeneratePisnOpen(true)}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xs flex items-center justify-between transition hover:border-amber-400 dark:hover:border-amber-500/40 hover:-translate-y-0.5 cursor-pointer group"
          title="Klik untuk melihat mahasiswa yang belum memiliki PIN"
        >
          <div className="flex-1 mr-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                Belum Terbit PIN
              </p>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                {totalGraduates > 0 ? Math.round(((stats?.withoutPisn ?? (totalGraduates - withPisn)) / totalGraduates) * 100) : 0}%
              </span>
            </div>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
              {stats?.withoutPisn ?? (totalGraduates - withPisn)}
            </h3>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${totalGraduates > 0 ? Math.round(((stats?.withoutPisn ?? (totalGraduates - withPisn)) / totalGraduates) * 100) : 0}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-amber-700/80 dark:text-amber-300/80 mt-1 font-medium">
              Perlu ajukan ke PISN
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs flex-shrink-0 group-hover:scale-105 transition">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Scan Ijazah */}
        <div
          onClick={() => onSwitchTab("berkas", "berkas")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xs flex items-center justify-between transition hover:border-cyan-400 dark:hover:border-cyan-500/40 hover:-translate-y-0.5 cursor-pointer group"
          title="Klik untuk melihat berkas scan ijazah"
        >
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">
              Arsip Scan Ijazah
            </p>
            <h3 className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono mt-1">
              {withIjazah}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Tersimpan di disk server lokal
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-xs group-hover:scale-105 transition">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* Scan Transkrip */}
        <div
          onClick={() => onSwitchTab("berkas", "berkas")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xs flex items-center justify-between transition hover:border-violet-400 dark:hover:border-violet-500/40 hover:-translate-y-0.5 cursor-pointer group"
          title="Klik untuk melihat berkas scan transkrip"
        >
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">
              Arsip Scan Transkrip
            </p>
            <h3 className="text-2xl font-black text-violet-600 dark:text-violet-400 font-mono mt-1">
              {withTranskrip}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Tersimpan di disk server lokal
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-xs group-hover:scale-105 transition">
            <FileCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. OPERATIONAL ACTION HUB (4 SIMPLE & COLORFUL ACTION CARDS)         */}
      {/* ==================================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase font-extrabold">
              Pusat Tindakan Input & Impor Data Lulusan
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Klik tombol aksi atau buka portal langsung melalui link terkait
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Card 1: Import Lulusan */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-indigo-950/5 dark:from-indigo-950/25 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-500 dark:hover:border-indigo-400 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                  1. LULUSAN
                </span>
                <a
                  href="https://feeder.stimiyapmim.ac.id/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  title="Buka portal Neo Feeder STIMI YAPMI di tab baru"
                >
                  <span>Feeder ↗</span>
                </a>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  Import Lulusan
                </h4>
                <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  <p>• Buka <strong>Export Data &rarr; Mahasiswa Lulus</strong></p>
                  <p>• Atur Angkatan & Prodi</p>
                  <p>• Format <strong>HTML</strong> lalu Export <strong>Excel (.xlsx)</strong></p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold">• Auto-filter status Lulus & PISN</p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-indigo-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setIsFeederModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm shadow-teal-600/20 transition cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Import Lulusan</span>
              </button>
            </div>
          </div>

          {/* Card 2: Import Status Pendaftaran */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-teal-50/70 via-white to-teal-950/5 dark:from-teal-950/25 dark:via-slate-900 dark:to-teal-950/40 border border-teal-200 dark:border-teal-500/30 hover:border-teal-500 dark:hover:border-teal-400 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30">
                  2. PENDAFTARAN
                </span>
                <a
                  href="https://feeder.stimiyapmim.ac.id/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  title="Buka portal Neo Feeder STIMI YAPMI di tab baru"
                >
                  <span>Feeder ↗</span>
                </a>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                  Import Status Pendaftaran
                </h4>
                <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  <p>• Buka <strong>Export Data &rarr; Mahasiswa</strong></p>
                  <p>• Atur Angkatan mahasiswa</p>
                  <p>• Format <strong>HTML</strong> lalu Export <strong>Excel (.xlsx)</strong></p>
                  <p className="text-teal-600 dark:text-teal-400 font-semibold">• Jalur Masuk & Periode Masuk</p>
                </div>

                {/* Info Angkatan Terdeteksi di Sistem */}
                <div className="mt-2.5 p-2 rounded-xl bg-teal-100/60 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-500/20 text-[10px] space-y-1">
                  <span className="font-semibold text-teal-900 dark:text-teal-200 block">
                    💡 Terdeteksi:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {stats?.cohorts && stats.cohorts.length > 0 ? (
                      [...stats.cohorts].sort().map((yr) => (
                        <span
                          key={yr}
                          className="px-1 py-0.2 rounded bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 font-mono font-bold text-[9px] border border-teal-300/40"
                        >
                          {yr}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-teal-700/80 dark:text-teal-400/80 italic">
                        Belum ada data
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-teal-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setIsSyncRegModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm shadow-teal-600/20 transition cursor-pointer"
              >
                <Users className="h-4 w-4" />
                <span>Import Status Pendaftaran</span>
              </button>
            </div>
          </div>

                    {/* Card 3: Generate PISN & SK */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-teal-50/70 via-white to-teal-950/5 dark:from-teal-950/25 dark:via-slate-900 dark:to-teal-950/40 border border-teal-200 dark:border-teal-500/30 hover:border-teal-500 dark:hover:border-teal-400 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30">
                  3. GENERATE PISN
                </span>
                <a
                  href="https://pisn.kemdiktisaintek.go.id/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  title="Buka portal PISN Kemdiktisaintek"
                >
                  <span>PISN ↗</span>
                </a>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                  Generate PISN & SK
                </h4>
                <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  <p>• Unggah file <strong>Eligible PISN</strong></p>
                  <p>• Auto-kelompokkan per <strong>SK</strong></p>
                  <p>• Export <strong>Lampiran SK (9 Kolom)</strong></p>
                  <p className="text-teal-600 dark:text-teal-400 font-semibold">• Cetak SPTJM Resmi</p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-teal-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setIsGeneratePisnOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm shadow-teal-600/20 transition cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate PISN & SK</span>
              </button>
            </div>
          </div>

          {/* Card 4: Import PISN */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-emerald-950/5 dark:from-emerald-950/25 dark:via-slate-900 dark:to-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-500 dark:hover:border-emerald-400 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                  4. PASANG PISN
                </span>
                <a
                  href="https://pisn.kemdiktisaintek.go.id/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  title="Buka portal PISN Kemdiktisaintek di tab baru"
                >
                  <span>PISN ↗</span>
                </a>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  Import PISN
                </h4>
                <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  <p>• Buka <strong>pisn.kemdiktisaintek.go.id</strong></p>
                  <p>• Menu <strong>Daftar Penomoran</strong></p>
                  <p>• Ekspor Excel (.xlsx) / CSV</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold">• Pasang 21-digit PIN & No Batch</p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-emerald-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setIsPisnModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Import PISN</span>
              </button>
            </div>
          </div>

          {/* Card 5: Import Judul TA */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50/70 via-white to-amber-950/5 dark:from-amber-950/25 dark:via-slate-900 dark:to-amber-950/40 border border-amber-200 dark:border-amber-500/30 hover:border-amber-500 dark:hover:border-amber-400 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                  5. JUDUL TA
                </span>
                <a
                  href="https://pandawa.stimiyapmim.ac.id/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  title="Buka portal PANDAWA STIMI YAPMI di tab baru"
                >
                  <span>Pandawa ↗</span>
                </a>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                  Import Judul TA
                </h4>
                <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  <p>• Login <strong>pandawa.stimiyapmim.ac.id</strong></p>
                  <p>• Masuk menu ujian / skripsi alumni</p>
                  <p>• Klik <strong>Export PDDIKTI</strong></p>
                  <p className="text-amber-600 dark:text-amber-400 font-semibold">• Sinkron otomatis judul via NIM</p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-amber-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setIsPandawaModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm shadow-amber-600/20 transition cursor-pointer"
              >
                <BookOpen className="h-4 w-4" />
                <span>Import Judul TA</span>
              </button>
            </div>
          </div>

          {/* Card 6: Upload Berkas Yudisium */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-cyan-50/70 via-white to-cyan-950/5 dark:from-cyan-950/25 dark:via-slate-900 dark:to-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 hover:border-cyan-500 dark:hover:border-cyan-400 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                  6. BERKAS YUDISIUM
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>On-Premise</span>
                </span>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
                  Upload Berkas Yudisium, Ijazah & Transkrip
                </h4>
                <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  <p>• Buka modal arsip berkas kelulusan</p>
                  <p>• Cari & pilih nama / NIM mahasiswa</p>
                  <p>• Unggah scan PDF SK, Ijazah & Transkrip</p>
                  <p className="text-cyan-600 dark:text-cyan-400 font-semibold">• Tersimpan otomatis di server lokal</p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-cyan-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setIsIjazahTranskripModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-sm shadow-cyan-600/20 transition cursor-pointer"
              >
                <FileCheck className="h-4 w-4" />
                <span>Upload berkas Yudisium, Ijaza & Transkrip</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. QUICK INSIGHTS: YUDISIUM BATCHES & BREAKDOWN                      */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Yudisium Batches with SK PDF Attachment Action */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Daftar Yudisium, SK Ketua & Berkas PDF</span>
            </span>
            <button
              type="button"
              onClick={() => onSwitchTab("berkas", "berkas")}
              className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold cursor-pointer"
            >
              Lihat di Repositori &rarr;
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {stats?.yudisiumDates && stats.yudisiumDates.length > 0 ? (
              stats.yudisiumDates.map((dateStr) => {
                const count = stats.yudisiumCounts?.[dateStr] || 0;
                const sk = stats.yudisiumSkMap?.[dateStr] || "-";
                const safeKey = getSafeKey(sk);
                const hasPdf = !!uploadedDecrees[safeKey];

                return (
                  <div
                    key={dateStr}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-white/5 flex items-center justify-between hover:border-teal-300 dark:hover:border-teal-500/30 transition group"
                  >
                    <div
                      onClick={() => {
                        onFilterYudisium(dateStr);
                      }}
                      className="cursor-pointer flex-1"
                      title={`Klik untuk memfilter ${count} alumni yudisium ${formatDateIndo(dateStr)}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                          {formatDateIndo(dateStr)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({dateStr})
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-xs mt-0.5 font-mono">
                        SK: {sk}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-2xs">
                        {count} mhs
                      </span>

                      {hasPdf ? (
                        <a
                          href={`/api/v1/yudisium-decree/preview?sk=${encodeURIComponent(sk)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-100 transition cursor-pointer"
                          title="Lihat dokumen PDF SK Yudisium resmi"
                        >
                          <FileText className="h-3 w-3" />
                          <span>PDF SK</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDecreeForUpload(sk);
                            setIsUploadDecreeModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-cyan-400 hover:text-cyan-600 transition cursor-pointer"
                          title="Upload berkas scan PDF SK ini"
                        >
                          <Upload className="h-3 w-3" />
                          <span>+ SK</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada data tanggal yudisium terdaftar</p>
            )}
          </div>
        </div>

        {/* Academic Profile Breakdown */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Distribusi Program Studi & Jalur Pendaftaran</span>
            </span>
            <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold">STIMI YAPMI</span>
          </div>

          <div className="space-y-3.5">
            {/* S1 vs S2 */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">S1 Manajemen (61201)</span>
                <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">
                  {stats?.prodi.s1Manajemen ?? 0} mhs ({totalGraduates ? Math.round(((stats?.prodi.s1Manajemen || 0) / totalGraduates) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full"
                  style={{
                    width: `${totalGraduates ? ((stats?.prodi.s1Manajemen || 0) / totalGraduates) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">S2 Magister Manajemen (61101)</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                  {stats?.prodi.s2Manajemen ?? 0} mhs ({totalGraduates ? Math.round(((stats?.prodi.s2Manajemen || 0) / totalGraduates) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full"
                  style={{
                    width: `${totalGraduates ? ((stats?.prodi.s2Manajemen || 0) / totalGraduates) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Jalur Pendaftaran Badges */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5">
                <p className="text-[10px] text-slate-500">Peserta Didik Baru</p>
                <p className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {stats?.registrationTypes?.pesertaBaru ?? 0} mhs
                </p>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5">
                <p className="text-[10px] text-slate-500">RPL & Konversi Transfer SKS</p>
                <p className="text-sm font-bold font-mono text-teal-600 dark:text-teal-400 mt-0.5">
                  {(stats?.registrationTypes?.rplPerolehan ?? 0) +
                    (stats?.registrationTypes?.rplTransfer ?? 0) +
                    (stats?.registrationTypes?.transfer ?? 0)}{" "}
                  mhs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. EXECUTIVE ANALYTICS & VISUALIZATION SUITE                         */}
      {/* ==================================================================== */}
      <DashboardAnalyticsSuite
        stats={stats}
        onFilterCohort={onFilterCohort}
        onFilterExitPeriod={onFilterExitPeriod}
        onFilterPisnStatus={onFilterPisnStatus}
        onFilterGpaRange={onFilterGpaRange}
        onFilterFileStatus={onFilterFileStatus}
        onSwitchTab={onSwitchTab}
      />

      {/* ==================================================================== */}
      {/* 5. MODALS CONTAINER                                                  */}
      {/* ==================================================================== */}
      <FeederGraduatesModal
        isOpen={isFeederModalOpen}
        onClose={() => {
          setIsFeederModalOpen(false);
          onRefreshData?.();
        }}
        onSuccess={() => {
          fetchDecrees();
          onRefreshData?.();
        }}
      />

      <SyncRegistrationTypeModal
        isOpen={isSyncRegModalOpen}
        onClose={() => {
          setIsSyncRegModalOpen(false);
          onRefreshData?.();
        }}
        onSuccess={() => {
          onRefreshData?.();
        }}
      />

      <PisnResultModal
        isOpen={isPisnModalOpen}
        onClose={() => {
          setIsPisnModalOpen(false);
          onRefreshData?.();
        }}
        onSuccess={() => {
          onRefreshData?.();
        }}
      />

      <PandawaThesisModal
        isOpen={isPandawaModalOpen}
        onClose={() => {
          setIsPandawaModalOpen(false);
          onRefreshData?.();
        }}
        onSuccess={() => {
          onRefreshData?.();
        }}
      />

      <UploadDecreeModal
        isOpen={isUploadDecreeModalOpen}
        onClose={() => setIsUploadDecreeModalOpen(false)}
        onSuccess={() => {
          fetchDecrees();
        }}
        initialDecreeNumber={selectedDecreeForUpload}
        knownDecrees={knownDecreesList}
      />

      <UploadIjazahTranskripModal
        isOpen={isIjazahTranskripModalOpen}
        onClose={() => {
          setIsIjazahTranskripModalOpen(false);
          onRefreshData?.();
        }}
        onSuccess={() => {
          onRefreshData?.();
        }}
      />

      <GeneratePisnModal
        isOpen={isGeneratePisnOpen}
        onClose={() => {
          setIsGeneratePisnOpen(false);
          onRefreshData?.();
        }}
        onSuccess={() => {
          fetchDecrees();
          onRefreshData?.();
        }}
      />
    </div>
  );
}
