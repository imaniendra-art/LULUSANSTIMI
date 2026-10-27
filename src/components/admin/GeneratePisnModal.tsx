"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronUp,
  Save,
  Printer,
  FileText,
} from "lucide-react";

interface StudentSKItem {
  nim: string;
  fullName: string;
  nik: string;
  prodiName: string;
  degree: string;
  birthDateStr: string;
  birthPlace: string;
  gpa: number | null;
  predikat: string;
  yudisiumDateStr: string;
  yudisiumDecreeNumber: string;
  pisnNumber: string | null;
  thesisTitle: string;
  foundInDb: boolean;
}

interface SKGroup {
  groupKey: string;
  dateStr: string;
  dateLabel: string;
  decreeNumber: string;
  hasDecreeNumber: boolean;
  totalStudents: number;
  students: StudentSKItem[];
}

interface GenerateResult {
  success: boolean;
  summary: {
    totalEligibleInFile: number;
    totalFoundInDb: number;
    totalGroups: number;
    notFoundInDbCount: number;
    missingYudisiumDateCount: number;
    notEligibleInFileCount: number;
  };
  groups: SKGroup[];
  notFoundInDb: Array<{ nim: string; fullName: string; nik: string }>;
  missingYudisiumDate: StudentSKItem[];
  notEligibleRecords: Array<{ nim: string; fullName: string; reason: string }>;
}

interface GeneratePisnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GeneratePisnModal({ isOpen, onClose, onSuccess }: GeneratePisnModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Accordion state per groupKey
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  // Editing decree number state per dateStr
  const [editingSk, setEditingSk] = useState<Record<string, string>>({});
  const [savingSkDate, setSavingSkDate] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setErrorMsg(null);
    setExpandedGroups({});
    setEditingSk({});
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Silakan pilih file Excel (.xlsx / .xls) hasil ekspor PISN.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/v1/pisn/generate", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memproses file Excel PISN.");
      }

      setResult(json);
      // Auto-expand all groups
      const initialExpanded: Record<string, boolean> = {};
      json.groups?.forEach((g: SKGroup) => {
        initialExpanded[g.groupKey] = true;
      });
      setExpandedGroups(initialExpanded);

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Terjadi kesalahan saat memproses data.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Unduh Lampiran SK (.xlsx)
  const handleDownloadExcel = async (group: SKGroup) => {
    try {
      const res = await fetch("/api/v1/pisn/export-sk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: group.students,
          decreeNumber: group.decreeNumber,
          dateStr: group.dateStr,
          dateLabel: group.dateLabel,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal mengunduh file Lampiran SK");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeSk = group.decreeNumber ? group.decreeNumber.replace(/[/\\?%*:|"<>]/g, "_").trim() : "";
      a.download = safeSk
        ? `LAMPIRAN SK - ${safeSk} (${group.students.length} Mahasiswa).xlsx`
        : `LAMPIRAN SK - Yudisium ${group.dateStr} (${group.students.length} Mahasiswa).xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      alert((err as Error).message || "Terjadi kesalahan saat mengunduh file.");
    }
  };

  // Unduh Berkas Permintaan PISN (No, NIM) format .xlsx atau .csv
  const handleDownloadPisnList = async (group: SKGroup, format: "xlsx" | "csv" = "xlsx") => {
    try {
      const res = await fetch("/api/v1/pisn/export-permintaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: group.students,
          decreeNumber: group.decreeNumber,
          dateStr: group.dateStr,
          format,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal mengunduh file Daftar Permintaan PISN");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeSk = group.decreeNumber ? group.decreeNumber.replace(/[/\\?%*:|"<>]/g, "_").trim() : "";
      const baseName = safeSk
        ? `DAFTAR_PISN_${safeSk}_(${group.students.length}_Mahasiswa)`
        : `DAFTAR_PISN_Yudisium_${group.dateStr}_(${group.students.length}_Mahasiswa)`;
      a.download = `${baseName}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      alert((err as Error).message || "Terjadi kesalahan saat mengunduh berkas PISN.");
    }
  };

  // Simpan SK jika belum ada
  const handleSaveDecree = async (dateStr: string, groupKey: string) => {
    const skValue = editingSk[dateStr]?.trim();
    if (!skValue) {
      alert("Masukkan Nomor SK Yudisium terlebih dahulu.");
      return;
    }

    setSavingSkDate(dateStr);
    try {
      const formData = new FormData();
      formData.append("decreeNumber", skValue);
      formData.append("yudisiumDate", dateStr);

      const res = await fetch("/api/v1/yudisium-decree", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan Nomor SK");
      }

      // Update state lokal
      if (result) {
        const updatedGroups = result.groups.map((g) => {
          if (g.dateStr === dateStr) {
            return {
              ...g,
              decreeNumber: skValue,
              hasDecreeNumber: true,
              students: g.students.map((s) => ({
                ...s,
                yudisiumDecreeNumber: skValue,
              })),
            };
          }
          return g;
        });

        setResult({
          ...result,
          groups: updatedGroups,
        });
      }

      alert(`Berhasil menetapkan SK: ${skValue}`);
    } catch (e: unknown) {
      alert((e as Error).message || "Gagal menyimpan Nomor SK.");
    } finally {
      setSavingSkDate(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-4xl w-full rounded-3xl bg-white dark:bg-[#071719] border border-teal-500/30 dark:border-teal-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-teal-500/20 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Generate PISN & Berkas SK</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                  Upload Excel
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unggah file Excel hasil ekspor PISN Dikti untuk membuat 3 berkas per SK: 1. Lampiran SK (.xlsx), 2. Berkas Usulan PISN (No, NIM), 3. Cetak SPTJM Resmi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {!result ? (
            /* ============================================================== */
            /* FORM UPLOAD FILE EXCEL ELIGIBLE PISN                            */
            /* ============================================================== */
            <form onSubmit={handleProcess} className="space-y-4">
              {/* Dropzone Upload Excel */}
              <div className="space-y-3">
                <div
                  onClick={() => document.getElementById("pisn-file-input")?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3.5 ${
                    file
                      ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/20"
                      : "border-slate-300 dark:border-white/15 hover:border-teal-500/60 dark:hover:border-teal-500/40 bg-slate-50/50 dark:bg-slate-900/40"
                  }`}
                >
                  <input
                    id="pisn-file-input"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                        setErrorMsg(null);
                      }
                    }}
                  />

                  <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <FileSpreadsheet className="h-8 w-8" />
                  </div>

                  {file ? (
                    <div>
                      <p className="text-sm font-bold text-teal-700 dark:text-teal-300">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        {(file.size / 1024).toFixed(1)} KB · File Excel Siap Dianalisis
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Klik untuk memilih file Excel hasil ekspor PISN (.xlsx / .xls)
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        File unduhan resmi dari menu Daftar Penomoran / Cek Kelayakan di pisn.kemdiktisaintek.go.id
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Petunjuk Sumber File */}
              <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-900 dark:text-teal-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                  <span>Cara Memperoleh File dari Portal PISN Dikti:</span>
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  1. Login ke <strong>pisn.kemdiktisaintek.go.id</strong> &rarr; Buka menu <strong>Daftar Penomoran</strong>.<br />
                  2. Lakukan pengecekan kelayakan mahasiswa calon lulusan, lalu klik tombol <strong>Export Data (.xlsx)</strong>.<br />
                  3. Unggah file Excel tersebut di sini. Sistem akan otomatis menyaring mahasiswa <em>Eligible</em> dan mengelompokkannya per SK Yudisium.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !file}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Menganalisis & Mengelompokkan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Proses & Kelompokkan per SK</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ============================================================== */
            /* HASIL PENGELOMPOKAN PER SK YUDISIUM                             */
            /* ============================================================== */
            <div className="space-y-5">
              {/* Summary Stats Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Eligible di File
                  </p>
                  <p className="text-xl font-black text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                    {result.summary.totalEligibleInFile}
                  </p>
                  <span className="text-[10px] text-slate-400">Mahasiswa</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Ditemukan di DB
                  </p>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                    {result.summary.totalFoundInDb}
                  </p>
                  <span className="text-[10px] text-slate-400">Mahasiswa</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Kelompok SK
                  </p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {result.summary.totalGroups}
                  </p>
                  <span className="text-[10px] text-slate-400">Paket Usulan</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Belum Ada di DB
                  </p>
                  <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                    {result.summary.notFoundInDbCount}
                  </p>
                  <span className="text-[10px] text-slate-400">NIM Belum Terdaftar</span>
                </div>
              </div>

              {/* Warning jika ada NIM tidak terdaftar di DB */}
              {result.summary.notFoundInDbCount > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span>
                      {result.summary.notFoundInDbCount} mahasiswa pada file PISN belum terdaftar di database LULUSANSTIMI:
                    </span>
                  </div>
                  <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-300">
                    {result.notFoundInDb.map((x) => `${x.nim} (${x.fullName})`).join(", ")}
                  </p>
                </div>
              )}

              {/* 3 Berkas Output Info Banner */}
              <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                  <span className="font-bold text-teal-950 dark:text-teal-200">
                    3 Berkas Lengkap Siap Ekspor per Kelompok SK untuk Permintaan PISN Dikti:
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-semibold">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                    1. Lampiran SK (.xlsx 9 Kolom)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/20">
                    2. Berkas PISN (No, NIM)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/20">
                    3. SPTJM Resmi (Cetak/PDF)
                  </span>
                </div>
              </div>

              {/* Daftar Kelompok SK */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center gap-2">
                    <span>Paket Usulan PISN per SK Yudisium ({result.groups.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Unggah File Lain</span>
                  </button>
                </div>

                {result.groups.map((group, idx) => {
                  const isExpanded = expandedGroups[group.groupKey] ?? true;

                  return (
                    <div
                      key={group.groupKey}
                      className="rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-900/60 overflow-hidden shadow-xs"
                    >
                      {/* Header Group */}
                      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="w-6 h-6 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold font-mono text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-teal-500" />
                              <span>Yudisium {group.dateLabel}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                              {group.totalStudents} Mahasiswa Eligible
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">Nomor SK:</span>
                            {group.hasDecreeNumber ? (
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/10">
                                {group.decreeNumber}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 text-[11px]">
                                <AlertCircle className="h-3.5 w-3.5" />
                                <span>Nomor SK Belum Diisi</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons Header: 3 Berkas Wajib PISN */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* 1. Unduh Lampiran SK (.xlsx 9 Kolom) */}
                          <button
                            type="button"
                            onClick={() => handleDownloadExcel(group)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition cursor-pointer"
                            title="1. Lampiran SK: Format 9 kolom (NIM, Nama, NIK, Prodi, Jenjang, Tgl Lahir, IPK, Predikat)"
                          >
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>1. Lampiran SK (.xlsx)</span>
                          </button>

                          {/* 2. Berkas Permintaan PISN (No, NIM) */}
                          <div className="inline-flex rounded-xl shadow-sm shadow-indigo-600/20 overflow-hidden border border-indigo-600/30">
                            <button
                              type="button"
                              onClick={() => handleDownloadPisnList(group, "xlsx")}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
                              title="2. Berkas Permintaan PISN: Format 2 kolom (No, NIM) Excel untuk diunggah ke portal PISN Dikti"
                            >
                              <FileText className="h-4 w-4" />
                              <span>2. File PISN (No, NIM)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadPisnList(group, "csv")}
                              className="inline-flex items-center px-2 py-2 bg-indigo-700 hover:bg-indigo-600 text-indigo-100 hover:text-white font-mono font-bold text-[11px] border-l border-indigo-500/40 transition cursor-pointer"
                              title="Unduh format CSV: No,NIM"
                            >
                              .CSV
                            </button>
                          </div>

                          {/* 3. Cetak / Unduh SPTJM */}
                          <a
                            href={`/api/v1/pisn/sptjm?dateStr=${group.dateStr}&decreeNumber=${encodeURIComponent(group.decreeNumber)}&count=${group.totalStudents}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm shadow-teal-600/20 transition cursor-pointer"
                            title="3. SPTJM Resmi: Surat Pernyataan Tanggung Jawab Mutlak bermeterai untuk dicetak/disimpan PDF"
                          >
                            <Printer className="h-4 w-4" />
                            <span>3. Cetak SPTJM</span>
                          </a>

                          {/* Toggle Expand */}
                          <button
                            type="button"
                            onClick={() => toggleGroup(group.groupKey)}
                            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title={isExpanded ? "Sembunyikan tabel" : "Tampilkan tabel mahasiswa"}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Baris Input SK jika belum diatur */}
                      {!group.hasDecreeNumber && (
                        <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <span className="text-amber-800 dark:text-amber-200 font-medium">
                            💡 Tetapkan nomor SK untuk seluruh mahasiswa di tanggal ini:
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingSk[group.dateStr] || ""}
                              onChange={(e) =>
                                setEditingSk((prev) => ({
                                  ...prev,
                                  [group.dateStr]: e.target.value,
                                }))
                              }
                              placeholder="Contoh: 000.2/493/STIMI-YAPMI/MKS/IX/2026"
                              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40 text-xs font-mono min-w-[260px] focus:outline-none"
                            />
                            <button
                              type="button"
                              disabled={savingSkDate === group.dateStr}
                              onClick={() => handleSaveDecree(group.dateStr, group.groupKey)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                            >
                              {savingSkDate === group.dateStr ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Save className="h-3.5 w-3.5" />
                              )}
                              <span>Simpan SK</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Tabel Preview Mahasiswa */}
                      {isExpanded && (
                        <div className="overflow-x-auto max-h-72">
                          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                            <thead className="bg-slate-100 dark:bg-slate-800/80 sticky top-0 text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">
                              <tr>
                                <th className="px-3 py-2 w-10 text-center">No</th>
                                <th className="px-3 py-2">NIM</th>
                                <th className="px-3 py-2">Nama Mahasiswa</th>
                                <th className="px-3 py-2">NIK</th>
                                <th className="px-3 py-2">Prodi</th>
                                <th className="px-3 py-2">Jenjang</th>
                                <th className="px-3 py-2">Tgl Lahir</th>
                                <th className="px-3 py-2 text-center">IPK</th>
                                <th className="px-3 py-2">Predikat</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                              {group.students.map((student, sIdx) => (
                                <tr
                                  key={student.nim}
                                  className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition"
                                >
                                  <td className="px-3 py-2 text-center text-slate-400 font-mono text-[11px]">
                                    {sIdx + 1}
                                  </td>
                                  <td className="px-3 py-2 font-mono font-bold text-slate-900 dark:text-white">
                                    {student.nim}
                                  </td>
                                  <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-200">
                                    {student.fullName}
                                  </td>
                                  <td className="px-3 py-2 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                                    {student.nik}
                                  </td>
                                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                                    {student.prodiName}
                                  </td>
                                  <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-400">
                                    {student.degree}
                                  </td>
                                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400 text-[11px]">
                                    {student.birthDateStr}
                                  </td>
                                  <td className="px-3 py-2 text-center font-mono font-bold text-slate-900 dark:text-white">
                                    {student.gpa !== null ? student.gpa.toFixed(2) : "-"}
                                  </td>
                                  <td className="px-3 py-2">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        student.predikat === "Dengan Pujian"
                                          ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                          : student.predikat === "Sangat Memuaskan"
                                          ? "bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300"
                                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                      }`}
                                    >
                                      {student.predikat}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer Modal Actions */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Unggah File Lain
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs transition cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
