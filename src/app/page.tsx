"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Copy,
  Check,
  AlertCircle,
  FileText,
  Briefcase,
  Users,
  Printer,
  X,
  ArrowRight,
  Award,
  BookOpen,
} from "lucide-react";
import QRCode from "qrcode";

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
    institutionCode?: string;
    hasIjazahArchive: boolean;
    hasTranskripArchive: boolean;
  };
}

export default function PublicPortalPage() {
  const [verifyQuery, setVerifyQuery] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Handle URL query parameter ?q=... (e.g. from scanned QR code)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q && q.trim()) {
        setVerifyQuery(q.trim());
        performVerify(q.trim());
      }
    }
  }, []);

  const performVerify = async (queryText: string) => {
    if (!queryText.trim()) return;

    setIsVerifying(true);
    setVerifyResult(null);

    try {
      const res = await fetch(`/api/v1/verify?q=${encodeURIComponent(queryText.trim())}`);
      const json: VerificationResult = await res.json();
      setVerifyResult(json);

      // Generate Live QR code linking to verification URL
      if (json.found && json.data) {
        const verifyUrl = `${window.location.origin}/?q=${encodeURIComponent(json.data.nim)}`;
        try {
          const qr = await QRCode.toDataURL(verifyUrl, {
            width: 160,
            margin: 1,
            color: { dark: "#0f172a", light: "#ffffff" },
          });
          setQrCodeUrl(qr);
        } catch (err) {
          console.error("QR Code generation error:", err);
        }
      }
    } catch {
      setVerifyResult({
        found: false,
        message: "Gagal menghubungkan ke server verifikasi. Silakan periksa koneksi dan coba kembali.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    performVerify(verifyQuery);
  };

  const copyPisn = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
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
          {/* Heading Padat & Manusiawi */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-teal-950 dark:text-white leading-[1.15]">
            Verifikasi Kelulusan & Ijazah{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 dark:from-teal-300 dark:via-cyan-300 dark:to-emerald-300">
              STIMI YAPMI Makassar
            </span>
          </h1>

          <p className="text-sm sm:text-base text-teal-900/80 dark:text-teal-100/75 max-w-2xl mx-auto leading-relaxed">
            Portal resmi pengecekan keabsahan data kelulusan, Penomoran Ijazah Nasional (PISN Kemdiktisaintek), dan informasi alumni Program Sarjana (S1) & Magister (S2) Manajemen.
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
                  placeholder="Ketik NIM Mahasiswa (contoh: 202061201001) atau Nomor PISN..."
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
                      Memverifikasi...
                    </span>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-emerald-200" />
                      <span>Cek Ijazah</span>
                    </>
                  )}
                </button>

                <Link
                  href="/login"
                  className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/70 dark:hover:bg-teal-900/60 text-teal-900 dark:text-teal-200 font-semibold text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-teal-200/90 dark:border-teal-500/30 transition flex items-center justify-center gap-1.5 flex-shrink-0 shadow-xs cursor-pointer group"
                  title="Masuk ke Portal Staf BAAK"
                >
                  <Lock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 group-hover:rotate-12 transition duration-200" />
                  <span>Login BAAK</span>
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
                        Terdaftar di Pangkalan Data PT
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
                      Nomor Ijazah Nasional (PISN / PIN Kemdiktisaintek)
                    </span>
                    {verifyResult.data.pisnBatchNumber && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100/70 dark:bg-teal-950/90 text-teal-800 dark:text-teal-300 border border-teal-300/60 dark:border-teal-500/30">
                        Batch: {verifyResult.data.pisnBatchNumber}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider">
                    {verifyResult.data.pisnNumber || "Dalam Proses Penomoran Resmi"}
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
                    Jenjang Kelulusan
                  </span>
                  <span className="font-semibold text-teal-950 dark:text-white">
                    {verifyResult.data.degree === "S.M." || verifyResult.data.degree === "S1"
                      ? "Sarjana Manajemen (S1)"
                      : verifyResult.data.degree === "M.M." || verifyResult.data.degree === "S2"
                      ? "Magister Manajemen (S2)"
                      : `${verifyResult.data.degree}`}
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
                    Nomor SK Yudisium
                  </span>
                  <span className="font-semibold font-mono text-teal-950 dark:text-white">
                    {verifyResult.data.yudisiumDecreeNumber || "-"}
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

                <div className="sm:col-span-2 md:col-span-3 space-y-1 pt-1 border-t border-teal-200/80 dark:border-teal-500/20">
                  <span className="text-teal-700/70 dark:text-teal-300/60 text-[11px] block">
                    Judul Skripsi / Karya Ilmiah
                  </span>
                  <span className="text-teal-900/90 dark:text-teal-100/90 italic">
                    {verifyResult.data.thesisTitle ? `"${verifyResult.data.thesisTitle}"` : "-"}
                  </span>
                </div>
              </div>

              {/* Status Dokumen & Tombol Aksi Cetak */}
              <div className="mt-6 pt-4 border-t border-teal-200/80 dark:border-teal-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 text-teal-800/80 dark:text-teal-300/75">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        verifyResult.data.hasIjazahArchive ? "bg-emerald-500" : "bg-teal-300 dark:bg-teal-700"
                      }`}
                    />
                    <span>
                      Scan Ijazah:{" "}
                      <strong className="text-teal-950 dark:text-teal-100">
                        {verifyResult.data.hasIjazahArchive ? "Terarsip di BAAK" : "Dalam Proses"}
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
                        {verifyResult.data.hasTranskripArchive ? "Terarsip di BAAK" : "Dalam Proses"}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Tombol Cetak Bukti Verifikasi Resmi (E-Legalisir QR) & Link BAAK */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md shadow-teal-700/20 transition cursor-pointer"
                  >
                    <Printer className="h-4 w-4 text-teal-200" />
                    <span>Cetak Bukti Verifikasi Resmi</span>
                  </button>

                  <Link
                    href="/login"
                    className="text-teal-700 dark:text-teal-300 hover:underline font-semibold inline-flex items-center gap-1 text-xs"
                    title="Kelola arsip ini di portal BAAK"
                  >
                    <span>Portal BAAK</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl sm:rounded-3xl p-6 bg-white/95 dark:bg-[#041d21]/95 border border-rose-300 dark:border-rose-500/30 text-center space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-teal-950 dark:text-white">Data Kelulusan Tidak Ditemukan</h3>
              <p className="text-xs text-teal-800/80 dark:text-teal-200/80 max-w-md mx-auto">
                {verifyResult.message ||
                  "Kredensial dengan NIM atau Nomor Ijazah tersebut tidak terdaftar pada pangkalan data resmi STIMI YAPMI Makassar."}
              </p>
            </div>
          )}
        </section>
      )}

      {/* ================================================================== */}
      {/* 3. MODAL SURAT KETERANGAN VERIFIKASI RESMI (BER-QR CODE DINAMIS)   */}
      {/* ================================================================== */}
      {isPrintModalOpen && verifyResult?.data && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print-backdrop">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative my-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Action Bar (Screen Only) */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 no-print">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pratinjau Surat Keterangan Verifikasi Kredensial
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  title="Tutup Pratinjau"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE OFFICIAL LETTERHEAD DOCUMENT */}
            <div id="printable-certificate" className="space-y-5 text-slate-900 bg-white">
              {/* Kop Surat Institusi */}
              <div className="flex items-center gap-4 pb-3 border-b-2 border-slate-900">
                <div className="w-16 h-16 relative flex-shrink-0">
                  <Image
                    src="/images/logo.jpg"
                    alt="Logo STIMI YAPMI Makassar"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div className="text-center flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                    Yayasan Pembina Manajemen Indonesia Makassar
                  </p>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-950">
                    Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI
                  </h2>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-teal-800">
                    Biro Administrasi Akademik & Kemahasiswaan (BAAK)
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Kampus: Jl. Perintis Kemerdekaan Km. 9, Tamalanrea, Kota Makassar 90245 · Telp. (0411) 585488
                  </p>
                </div>
              </div>

              {/* Judul & Nomor Surat */}
              <div className="text-center space-y-0.5 pt-1">
                <h3 className="text-xs sm:text-sm font-extrabold uppercase underline tracking-wider text-slate-950">
                  Surat Keterangan Verifikasi Kredensial Ijazah
                </h3>
                <p className="text-[10px] font-mono text-slate-600">
                  Nomor: {new Date().getFullYear()}/BAAK-STIMI/VERIF/{verifyResult.data.nim}
                </p>
              </div>

              {/* Pengantar */}
              <p className="text-[11px] text-slate-700 leading-relaxed">
                Biro Administrasi Akademik & Kemahasiswaan (BAAK) Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar dengan ini menerangkan bahwa data kelulusan di bawah ini terdaftar resmi dalam pangkalan data institusi:
              </p>

              {/* Tabel Detail Lulusan */}
              <div className="rounded-lg border border-slate-300 text-[11px] overflow-hidden">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="w-40 py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Nama Lengkap</td>
                      <td className="py-1.5 px-3 font-bold text-slate-950">{verifyResult.data.fullName}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Nomor Induk Mahasiswa (NIM)</td>
                      <td className="py-1.5 px-3 font-mono font-bold text-slate-900">{verifyResult.data.nim}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Program Studi / Gelar</td>
                      <td className="py-1.5 px-3 font-semibold text-slate-900">
                        {verifyResult.data.prodiName} ({verifyResult.data.degree})
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Nomor Ijazah Nasional (PISN)</td>
                      <td className="py-1.5 px-3 font-mono font-bold text-teal-800">
                        {verifyResult.data.pisnNumber || "Dalam Proses Penomoran Resmi"}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Tanggal & SK Yudisium</td>
                      <td className="py-1.5 px-3 text-slate-900">
                        {verifyResult.data.yudisiumDate
                          ? new Date(verifyResult.data.yudisiumDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}{" "}
                        {verifyResult.data.yudisiumDecreeNumber && `(SK: ${verifyResult.data.yudisiumDecreeNumber})`}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 bg-slate-50 font-semibold text-slate-700">Judul Karya Ilmiah</td>
                      <td className="py-1.5 px-3 italic text-slate-800">
                        {verifyResult.data.thesisTitle ? `"${verifyResult.data.thesisTitle}"` : "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Keterangan Status Keabsahan */}
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 flex-shrink-0" />
                <span>
                  <strong>STATUS KREDENSIAL SAH:</strong> Yang bersangkutan dinyatakan resmi sebagai lulusan STIMI YAPMI Makassar dan kredensial ijazah telah terdaftar pada pangkalan data Ditjen Diktiristek Kemdiktisaintek.
                </span>
              </div>

              {/* Kolom Validasi QR Code & Tanda Tangan */}
              <div className="pt-2 flex items-center justify-between gap-6 border-t border-slate-200">
                {/* QR Code Dinamis */}
                <div className="flex items-center gap-3">
                  {qrCodeUrl && (
                    <div className="w-20 h-20 border border-slate-300 rounded p-1 bg-white flex-shrink-0">
                      <Image
                        src={qrCodeUrl}
                        alt="QR Code Verifikasi Ijazah"
                        width={72}
                        height={72}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="text-[9px] text-slate-600 max-w-[190px] leading-tight">
                    <p className="font-bold text-slate-900">Validasi Digital:</p>
                    <p>
                      Pindai QR-Code ini dengan kamera ponsel untuk memastikan keaslian surat langsung pada portal kelulusan resmi kampus.
                    </p>
                  </div>
                </div>

                {/* Stempel & Pengesahan */}
                <div className="text-right text-[10px] text-slate-700 min-w-[160px]">
                  <p>
                    Makassar,{" "}
                    {new Date().toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="font-semibold text-slate-900">a.n. Ketua STIMI YAPMI Makassar</p>
                  <p className="text-slate-600">Kepala BAAK & PUSDATIN</p>
                  <div className="my-1 text-[9px] text-emerald-700 font-mono font-bold">
                    [TERVALIDASI SISTEM RESMI]
                  </div>
                  <p className="font-bold text-slate-950 underline">Biro Adm. Akademik</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Print Style Hook */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate,
          #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15mm 20mm;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print,
          .no-print-backdrop {
            display: none !important;
          }
        }
      `}</style>

      {/* ================================================================== */}
      {/* 4. BENTO GRID LAYANAN RESMI KELULUSAN (ID: #layanan)               */}
      {/* ================================================================== */}
      <section id="layanan" className="space-y-8 scroll-mt-24">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-teal-950 dark:text-white">
            Layanan Akademik & Ekosistem Alumni
          </h2>
          <p className="text-xs sm:text-sm text-teal-800/80 dark:text-teal-200/80 max-w-xl mx-auto">
            Pusat pelayanan kelulusan terpadu untuk lulusan, perusahaan mitra kerja, dan civitas akademika STIMI YAPMI Makassar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Verifikasi PISN */}
          <div className="saas-card rounded-2xl sm:rounded-3xl p-6 space-y-4 relative overflow-hidden transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-teal-100/70 dark:bg-teal-950/70 border border-teal-200/90 dark:border-teal-500/30 flex items-center justify-center text-teal-700 dark:text-teal-300">
              <Layers className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-teal-950 dark:text-white">Verifikasi PISN Nasional</h3>
              <p className="text-xs text-teal-800/80 dark:text-teal-200/80 leading-relaxed">
                Pengecekan keabsahan nomor ijazah 21-digit standar nasional Kemdiktisaintek secara instan dan akurat.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-teal-700 dark:text-teal-300">
              <span>Standar Kemdiktisaintek</span>
              <span>·</span>
              <span>Validasi PIN</span>
            </div>
          </div>

          {/* Card 2: Layanan Arsip Dokumen */}
          <div id="arsip" className="saas-card scroll-mt-24 rounded-2xl sm:rounded-3xl p-6 space-y-4 relative overflow-hidden transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/70 border border-emerald-200/90 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <FileText className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-teal-950 dark:text-white">Layanan Arsip Dokumen</h3>
              <p className="text-xs text-teal-800/80 dark:text-teal-200/80 leading-relaxed">
                Penyimpanan dan verifikasi terpusat arsip pindaian ijazah, transkrip nilai, dan SK Yudisium resmi oleh BAAK.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
              <span>Arsip Terkelola BAAK</span>
              <span>·</span>
              <span>Keabsahan Dokumen</span>
            </div>
          </div>

          {/* Card 3: Tracer Study & Karir */}
          <div id="tracer" className="saas-card scroll-mt-24 rounded-2xl sm:rounded-3xl p-6 space-y-4 relative overflow-hidden transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100/70 dark:bg-cyan-950/70 border border-cyan-200/90 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-300">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-teal-950 dark:text-white">Tracer Study & Karir</h3>
              <p className="text-xs text-teal-800/80 dark:text-teal-200/80 leading-relaxed">
                Pelacakan masa tunggu kerja lulusan dan survei kepuasan atasan untuk jaminan mutu akreditasi kampus.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-cyan-700 dark:text-cyan-300">
              <span>Standar LAMEMBA</span>
              <span>·</span>
              <span>Evaluasi Mutu</span>
            </div>
          </div>

          {/* Card 4: Jejaring Komunitas Alumni */}
          <div id="alumni" className="saas-card scroll-mt-24 rounded-2xl sm:rounded-3xl p-6 space-y-4 relative overflow-hidden transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-2xl bg-amber-100/70 dark:bg-amber-950/70 border border-amber-200/90 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <Users className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-teal-950 dark:text-white">Jejaring Komunitas Alumni</h3>
              <p className="text-xs text-teal-800/80 dark:text-teal-200/80 leading-relaxed">
                Wadah komunikasi, direktori lulusan terverifikasi, serta penyebaran informasi lowongan kerja Ikatan Alumni (IKA).
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-amber-700 dark:text-amber-300">
              <span>Komunitas IKA</span>
              <span>·</span>
              <span>Bursa Karir</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
