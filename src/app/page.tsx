"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Layers,
  Copy,
  Check,
  AlertCircle,
  Database,
  Briefcase,
  FolderGit2,
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
  const [statsData, setStatsData] = useState<{ totalGraduates?: number; withPisn?: number; withIjazah?: number; withTranskrip?: number } | null>(null);

  useEffect(() => {
    fetch("/api/v1/alumni/stats")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setStatsData({
            totalGraduates: json.data.totalGraduates,
            withPisn: json.data.withPisn,
            withIjazah: json.data.withIjazah,
            withTranskrip: json.data.withTranskrip,
          });
        }
      })
      .catch(() => {});
  }, []);

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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-gradient-to-tr from-teal-500/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="space-y-6">
          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-teal-950 dark:text-white leading-[1.15]">
            Verifikasi Kredensial & Repositori Lulusan{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 dark:from-teal-300 dark:via-cyan-300 dark:to-emerald-300">
              STIMI YAPMI Makassar
            </span>
          </h1>

          <p className="text-sm sm:text-base text-teal-900/80 dark:text-teal-100/75 max-w-2xl mx-auto leading-relaxed">
            Pusat data terpadu Penomoran Ijazah Nasional (PISN/PIN Kemdiktisaintek), brankas penyimpanan arsip pindaian ijazah & transkrip di server kampus, serta pelacakan jejak alumni Program Sarjana (S1) dan Magister (S2) Manajemen.
          </p>

          {/* Floating Search Dock */}
          <div className="pt-2 max-w-2xl mx-auto">
            <form
              onSubmit={handleVerify}
              className="p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-[#041d21]/95 border border-teal-200/90 dark:border-teal-500/30 hover:border-teal-400 dark:hover:border-teal-400 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 shadow-xl dark:shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row gap-2 transition duration-200"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 h-4 w-4 text-teal-500/70" />
                <input
                  type="text"
                  required
                  placeholder="Ketik NIM Mahasiswa atau 21-digit Nomor PISN..."
                  value={verifyQuery}
                  onChange={(e) => setVerifyQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-transparent text-sm text-teal-950 dark:text-white placeholder-teal-700/50 dark:placeholder-teal-300/40 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white font-semibold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md shadow-teal-700/20 transition flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memeriksa...
                    </span>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-emerald-200" />
                      <span>Cek Status</span>
                    </>
                  )}
                </button>

                <Link
                  href="/login"
                  className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/70 dark:hover:bg-teal-900/60 text-teal-900 dark:text-teal-200 font-semibold text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-teal-200/90 dark:border-teal-500/30 transition flex items-center justify-center gap-1.5 flex-shrink-0 shadow-xs cursor-pointer group"
                  title="Masuk ke Portal Staf BAAK"
                >
                  <Lock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 group-hover:rotate-12 transition duration-200" />
                  <span>Login</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 2. VERIFICATION RESULT PRESENTATION                                */}
      {/* ================================================================== */}
      {verifyResult && (
        <section className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          {verifyResult.found && verifyResult.data ? (
            <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-white/95 dark:bg-[#041d21]/95 border border-emerald-500/40 shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-200/80 dark:border-teal-500/20 pb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Status Kredensial Valid
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs text-teal-800/70 dark:text-teal-300/70">
                        Terdaftar di PISN Kemdiktisaintek
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-teal-950 dark:text-white tracking-tight mt-0.5">
                      {verifyResult.data.fullName}
                    </h3>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-teal-800/70 dark:text-teal-300/70 uppercase tracking-wider block">
                    NIM Mahasiswa
                  </span>
                  <span className="font-mono text-base font-bold text-teal-900 dark:text-teal-100">
                    {verifyResult.data.nim}
                  </span>
                </div>
              </div>

              {/* PISN Official Highlight Banner */}
              <div className="my-6 p-4 rounded-2xl bg-teal-50/80 dark:bg-[#02181c]/80 border border-teal-200/80 dark:border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-teal-700 dark:text-teal-300 font-semibold">
                      Nomor Ijazah Nasional (PISN / PIN)
                    </span>
                    {verifyResult.data.pisnBatchNumber && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100/70 dark:bg-teal-950/90 text-teal-800 dark:text-teal-300 border border-teal-300/60 dark:border-teal-500/30">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-teal-900/40 hover:bg-teal-50 dark:hover:bg-teal-800/40 text-xs font-semibold text-teal-900 dark:text-teal-100 border border-teal-200/90 dark:border-teal-500/30 transition shadow-xs cursor-pointer"
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

              {/* Academic Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-teal-900/80 dark:text-teal-100/80 pt-2">
                <div className="space-y-1">
                  <span className="text-teal-700/70 dark:text-teal-300/60 text-[11px] block">
                    Program Studi
                  </span>
                  <span className="font-semibold text-teal-950 dark:text-white">
                    {verifyResult.data.prodiName} ({verifyResult.data.degree})
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-teal-700/70 dark:text-teal-300/60 text-[11px] block">
                    Jenis Pendaftar
                  </span>
                  <span className="font-semibold text-teal-950 dark:text-white">
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
                  <span className="text-teal-700/70 dark:text-teal-300/60 text-[11px] block">
                    Tanggal Yudisium
                  </span>
                  <span className="font-semibold text-teal-950 dark:text-white">
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
                  <span className="text-teal-700/70 dark:text-teal-300/60 text-[11px] block">
                    Periode Masuk
                  </span>
                  <span className="font-semibold font-mono text-teal-950 dark:text-white">
                    {verifyResult.data.entryPeriod || "-"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-teal-700/70 dark:text-teal-300/60 text-[11px] block">
                    Periode Keluar
                  </span>
                  <span className="font-semibold font-mono text-teal-950 dark:text-white">
                    {verifyResult.data.exitPeriod || "-"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-teal-700/70 dark:text-teal-300/60 text-[11px] block">
                    Nomor SK Yudisium
                  </span>
                  <span className="font-semibold font-mono text-teal-950 dark:text-white">
                    {verifyResult.data.yudisiumDecreeNumber || "-"}
                  </span>
                </div>

                <div className="sm:col-span-2 md:col-span-3 space-y-1 pt-1 border-t border-teal-200/80 dark:border-teal-500/20">
                  <span className="text-teal-700/70 dark:text-teal-300/60 text-[11px] block">
                    Judul Skripsi / Karya Ilmiah
                  </span>
                  <span className="text-teal-900/90 dark:text-teal-100/90 italic">
                    {verifyResult.data.thesisTitle ? `"${verifyResult.data.thesisTitle}"` : "-"}
                  </span>
                </div>
              </div>

              {/* Document Storage Indicators */}
              <div className="mt-6 pt-4 border-t border-teal-200/80 dark:border-teal-500/20 flex flex-wrap items-center justify-between gap-3 text-xs text-teal-800/80 dark:text-teal-300/75">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        verifyResult.data.hasIjazahArchive ? "bg-emerald-500" : "bg-teal-300 dark:bg-teal-700"
                      }`}
                    />
                    <span>
                      Scan Ijazah:{" "}
                      <strong className="text-teal-950 dark:text-teal-100">
                        {verifyResult.data.hasIjazahArchive ? "Tersimpan di Server" : "Belum Diunggah"}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        verifyResult.data.hasTranskripArchive ? "bg-emerald-500" : "bg-teal-300 dark:bg-teal-700"
                      }`}
                    />
                    <span>
                      Scan Transkrip:{" "}
                      <strong className="text-teal-950 dark:text-teal-100">
                        {verifyResult.data.hasTranskripArchive ? "Tersimpan di Server" : "Belum Diunggah"}
                      </strong>
                    </span>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="text-teal-700 dark:text-teal-300 hover:underline font-semibold inline-flex items-center gap-1 text-xs"
                >
                  <span>Kelola di Portal BAAK</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl sm:rounded-3xl p-6 bg-white/95 dark:bg-[#041d21]/95 border border-rose-300 dark:border-rose-500/30 text-center space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-teal-950 dark:text-white">Data Lulusan Tidak Ditemukan</h3>
              <p className="text-xs text-teal-800/80 dark:text-teal-200/80 max-w-md mx-auto">
                {verifyResult.message ||
                  "Kredensial dengan NIM atau Nomor Ijazah tersebut tidak terdaftar pada repositori STIMI YAPMI Makassar."}
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
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-teal-950 dark:text-white">
            Arsitektur Repositori & Ekosistem Alumni
          </h2>
          <p className="text-xs sm:text-sm text-teal-800/80 dark:text-teal-200/80 max-w-xl mx-auto">
            Dirancang secara khusus untuk kebutuhan validasi ijazah S1 & S2 Manajemen, penyimpanan kredensial on-premise, dan kepatuhan akreditasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: PISN Ingestion */}
          <div className="saas-card rounded-2xl sm:rounded-3xl p-6 space-y-4 relative overflow-hidden transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-teal-100/70 dark:bg-teal-950/70 border border-teal-200/90 dark:border-teal-500/30 flex items-center justify-center text-teal-700 dark:text-teal-300">
              <Layers className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-teal-950 dark:text-white">Repositori PISN Kemdiktisaintek</h3>
              <p className="text-xs text-teal-800/80 dark:text-teal-200/80 leading-relaxed">
                Format penomoran 21-digit standar Belmawa Dikti dengan pemisahan batch resmi secara otomatis.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-teal-700 dark:text-teal-300">
              <span>Multi-batch parser</span>
              <span>·</span>
              <span>Batch NI-...</span>
            </div>
          </div>

          {/* Card 2: Server Storage */}
          <div className="saas-card rounded-2xl sm:rounded-3xl p-6 space-y-4 relative overflow-hidden transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/70 border border-emerald-200/90 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <Database className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-teal-950 dark:text-white">Brankas Dokumen Server Lokal</h3>
              <p className="text-xs text-teal-800/80 dark:text-teal-200/80 leading-relaxed">
                Penyimpanan arsip pindaian ijazah & transkrip langsung pada hard disk server kampus secara aman.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
              <span>On-premise storage</span>
              <span>·</span>
              <span>Zero-cloud bill</span>
            </div>
          </div>

          {/* Card 3: Tracer Study */}
          <div className="saas-card rounded-2xl sm:rounded-3xl p-6 space-y-4 relative overflow-hidden transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100/70 dark:bg-cyan-950/70 border border-cyan-200/90 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-300">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-teal-950 dark:text-white">Tracer Study Standar Dikti</h3>
              <p className="text-xs text-teal-800/80 dark:text-teal-200/80 leading-relaxed">
                Modul kuesioner pelacakan karir, waktu tunggu kerja, dan kesesuaian bidang untuk instrumen akreditasi.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-cyan-700 dark:text-cyan-300">
              <span>BAN-PT & LAMEMBA</span>
              <span>·</span>
              <span>Waktu tunggu</span>
            </div>
          </div>

          {/* Card 4: Ikatan Alumni */}
          <div className="saas-card rounded-2xl sm:rounded-3xl p-6 space-y-4 relative overflow-hidden transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-amber-100/70 dark:bg-amber-950/70 border border-amber-200/90 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-teal-950 dark:text-white">Jejaring Karir & Portal IKA</h3>
              <p className="text-xs text-teal-800/80 dark:text-teal-200/80 leading-relaxed">
                Kanal berbagi informasi lowongan kerja, direktori alumni resmi terverifikasi, dan warta almamater.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-amber-700 dark:text-amber-300">
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
      <section className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-white/90 dark:bg-[#041d21]/90 border border-teal-200/90 dark:border-teal-500/30 backdrop-blur-xl shadow-md">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-teal-950 dark:text-white font-mono tracking-tight">
              {statsData?.totalGraduates ?? 0}
            </p>
            <p className="text-xs text-teal-800/70 dark:text-teal-300/70">Lulusan Terarsip</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-300 font-mono tracking-tight">
              {statsData?.withPisn ?? 0}
            </p>
            <p className="text-xs text-teal-800/70 dark:text-teal-300/70">PISN Kemdiktisaintek Valid</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              100%
            </p>
            <p className="text-xs text-teal-800/70 dark:text-teal-300/70">Validitas Legalitas Kemdiktisaintek</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono tracking-tight">
              Local Disk
            </p>
            <p className="text-xs text-teal-800/70 dark:text-teal-300/70">Arsip Server Hard Disk</p>
          </div>
        </div>
      </section>
    </div>
  );
}
