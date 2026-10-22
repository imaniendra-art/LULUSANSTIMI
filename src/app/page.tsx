"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Lock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Layers,
  Copy,
  Check,
  AlertCircle,
  Database,
  Briefcase,
  FileCheck,
  FolderGit2,
  Compass,
  Calendar,
  UserCheck,
} from "lucide-react";

interface VerificationResult {
  found: boolean;
  message?: string;
  data?: {
    id: string;
    nim: string;
    fullName: string;
    prodiCode: string;
    prodiName: string;
    degree: string;
    registrationType?: string;
    entryPeriod?: string;
    exitPeriod?: string;
    graduationYear: number;
    yudisiumDate: string;
    yudisiumDecreeNumber?: string;
    thesisTitle: string;
    pisnNumber?: string;
    pisnBatchNumber?: string;
    certificateNumber?: string;
    statusLegalitas: string;
    institution: string;
    hasIjazahArchive: boolean;
    hasTranskripArchive: boolean;
  };
}

export default function PublicPortalPage() {
  const [verifyQuery, setVerifyQuery] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyQuery.trim()) return;

    setIsVerifying(true);
    setVerifyResult(null);

    try {
      const res = await fetch(`/api/v1/verify?q=${encodeURIComponent(verifyQuery.trim())}`);
      const json = await res.json();
      setVerifyResult(json);
    } catch {
      setVerifyResult({
        found: false,
        message: "Gagal menghubungkan ke server verifikasi. Silakan coba kembali.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const copyPisn = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="space-y-16 sm:space-y-20 pb-16 font-sans">
      {/* ================================================================== */}
      {/* 1. HERO SECTION                                                    */}
      {/* ================================================================== */}
      <section className="relative text-center max-w-4xl mx-auto pt-2 sm:pt-6">
        {/* Ambient Radial Lights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-gradient-to-tr from-indigo-500/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="space-y-6">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Repositori Kredensial & PISN Kemdikbud
            </span>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
              87 Lulusan Aktif
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Verifikasi Kredensial & Repositori Lulusan{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 dark:from-indigo-400 dark:via-cyan-400 dark:to-emerald-400">
              STIMI Yapmi
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Pusat data terpadu Penomoran Ijazah Nasional (PISN/PIN Kemdikbud), brankas penyimpanan arsip pindaian ijazah & transkrip di server kampus, serta pelacakan jejak alumni Program Sarjana (S1) dan Magister (S2) Manajemen.
          </p>

          {/* Raycast / Linear Style Search Input */}
          <div className="pt-2 max-w-2xl mx-auto">
            <form
              onSubmit={handleVerify}
              className="p-1.5 sm:p-2 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-xl dark:shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row gap-2 transition duration-200"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ketik NIM Mahasiswa atau 21-digit Nomor PISN..."
                  value={verifyQuery}
                  onChange={(e) => setVerifyQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50"
              >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memeriksa...
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    <span>Cek Status</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Filter Pill Suggestions */}
            <div className="flex items-center justify-center gap-2 flex-wrap pt-3 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Coba sampel data:</span>
              <button
                type="button"
                onClick={() => setVerifyQuery("2261201003")}
                className="font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 transition"
              >
                NIM 2261201003
              </button>
              <button
                type="button"
                onClick={() => setVerifyQuery("093046612012026100074")}
                className="font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 transition"
              >
                PISN 093046612012026100074
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 2. VERIFICATION RESULT PRESENTATION                                */}
      {/* ================================================================== */}
      {verifyResult && (
        <section className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          {verifyResult.found && verifyResult.data ? (
            <div className="rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-900/90 border border-emerald-500/40 shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Status Kredensial Valid
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Terdaftar di PISN Kemdikbud</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                      {verifyResult.data.fullName}
                    </h3>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    NIM Mahasiswa
                  </span>
                  <span className="font-mono text-base font-bold text-slate-800 dark:text-slate-200">
                    {verifyResult.data.nim}
                  </span>
                </div>
              </div>

              {/* PISN Official Highlight Banner */}
              <div className="my-6 p-4 rounded-xl bg-slate-50 dark:bg-[#07090E]/80 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold">
                      Nomor Ijazah Nasional (PISN / PIN)
                    </span>
                    {verifyResult.data.pisnBatchNumber && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                        Batch: {verifyResult.data.pisnBatchNumber}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider">
                    {verifyResult.data.pisnNumber || "Dalam Proses Penomoran"}
                  </p>
                </div>

                {verifyResult.data.pisnNumber && (
                  <button
                    type="button"
                    onClick={() => copyPisn(verifyResult.data?.pisnNumber || "")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition shadow-xs"
                  >
                    {hasCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin PISN</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Academic Metadata Grid (With Separated Periods & Decree) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <div className="space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Program Studi</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {verifyResult.data.prodiName} ({verifyResult.data.degree})
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Jenis Pendaftar</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {verifyResult.data.registrationType === "RPL_PEROLEHAN_SKS" ||
                    verifyResult.data.registrationType === "RPL_KONVERSI_SKS"
                      ? "RPL Perolehan SKS"
                      : verifyResult.data.registrationType === "RPL_TRANSFER_SKS"
                      ? "RPL Transfer SKS"
                      : verifyResult.data.registrationType === "KONVERSI_TRANSFER_NILAI"
                      ? "Perolehan SKS (Transfer Nilai)"
                      : "Peserta Didik Baru"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Tanggal Yudisium</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {verifyResult.data.yudisiumDate
                      ? new Date(verifyResult.data.yudisiumDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Tercatat Resmi"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Periode Masuk</span>
                  <span className="font-semibold font-mono text-slate-900 dark:text-white">
                    {verifyResult.data.entryPeriod || "-"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Periode Keluar</span>
                  <span className="font-semibold font-mono text-slate-900 dark:text-white">
                    {verifyResult.data.exitPeriod || "-"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Nomor SK Yudisium</span>
                  <span className="font-semibold font-mono text-slate-900 dark:text-white">
                    {verifyResult.data.yudisiumDecreeNumber || "-"}
                  </span>
                </div>

                <div className="sm:col-span-2 md:col-span-3 space-y-1 pt-1 border-t border-slate-200 dark:border-white/[0.06]">
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Judul Skripsi / Karya Ilmiah</span>
                  <span className="text-slate-700 dark:text-slate-300 italic">
                    "{verifyResult.data.thesisTitle || "Tugas Akhir Sarjana Manajemen"}"
                  </span>
                </div>
              </div>

              {/* Document Storage Indicators */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        verifyResult.data.hasIjazahArchive ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    <span>
                      Scan Ijazah:{" "}
                      <strong className="text-slate-800 dark:text-slate-300">
                        {verifyResult.data.hasIjazahArchive ? "Tersimpan di Server" : "Belum Diunggah"}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        verifyResult.data.hasTranskripArchive ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    <span>
                      Scan Transkrip:{" "}
                      <strong className="text-slate-800 dark:text-slate-300">
                        {verifyResult.data.hasTranskripArchive ? "Tersimpan di Server" : "Belum Diunggah"}
                      </strong>
                    </span>
                  </div>
                </div>

                <Link
                  href="/admin"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold inline-flex items-center gap-1 text-xs"
                >
                  <span>Kelola di Portal BAAK</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-6 bg-white dark:bg-slate-900/90 border border-rose-300 dark:border-rose-500/30 text-center space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Data Lulusan Tidak Ditemukan</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {verifyResult.message ||
                  "Kredensial dengan NIM atau Nomor Ijazah tersebut tidak terdaftar pada repositori STIMI Yapmi."}
              </p>
            </div>
          )}
        </section>
      )}

      {/* ================================================================== */}
      {/* 3. BENTO GRID ARCHITECTURE (ID: #layanan)                          */}
      {/* ================================================================== */}
      <section id="layanan" className="space-y-8 scroll-mt-24">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Arsitektur Repositori & Ekosistem Alumni
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Dirancang secara khusus untuk kebutuhan validasi ijazah S1 & S2 Manajemen, penyimpanan kredensial on-premise, dan kepatuhan akreditasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: PISN Ingestion */}
          <div className="saas-card rounded-2xl p-6 space-y-4 relative overflow-hidden transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Repositori PISN Kemdikbud</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Format penomoran 21-digit standar Belmawa Dikti dengan pemisahan batch resmi secara otomatis.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
              <span>Multi-batch parser</span>
              <span>·</span>
              <span>Batch NI-...</span>
            </div>
          </div>

          {/* Card 2: Server Storage */}
          <div className="saas-card rounded-2xl p-6 space-y-4 relative overflow-hidden transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Database className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Brankas Dokumen Server Lokal</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Penyimpanan arsip pindaian ijazah & transkrip langsung pada hard disk server kampus secara aman.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              <span>On-premise storage</span>
              <span>·</span>
              <span>Zero-cloud bill</span>
            </div>
          </div>

          {/* Card 3: Tracer Study */}
          <div className="saas-card rounded-2xl p-6 space-y-4 relative overflow-hidden transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Tracer Study Standar Dikti</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Modul kuesioner pelacakan karir, waktu tunggu kerja, dan kesesuaian bidang untuk instrumen akreditasi.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
              <span>BAN-PT & LAMEMBA</span>
              <span>·</span>
              <span>Waktu tunggu</span>
            </div>
          </div>

          {/* Card 4: Ikatan Alumni */}
          <div className="saas-card rounded-2xl p-6 space-y-4 relative overflow-hidden transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Jejaring Karir & Portal IKA</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Kanal berbagi informasi lowongan kerja, direktori alumni resmi terverifikasi, dan warta almamater.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-amber-600 dark:text-amber-400">
              <span>Verified directory</span>
              <span>·</span>
              <span>Info loker</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 4. TELEMETRY & LIVE STATS STRIP                                    */}
      {/* ================================================================== */}
      <section className="rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">87</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Lulusan Ber-PISN Aktif</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">10</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Nomor Batch Belmawa</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">100%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Validitas Legalitas Kemdikbud</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono tracking-tight">Local Disk</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Arsip Server Hard Disk</p>
          </div>
        </div>
      </section>
    </div>
  );
}
