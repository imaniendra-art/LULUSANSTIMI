"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  ClipboardPaste,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  FileText,
  Download,
  Info,
  Layers,
  Database,
  Check,
  HelpCircle,
} from "lucide-react";
import { MultiFileDropzone } from "./MultiFileDropzone";

interface FeederImportViewProps {
  onSuccess: () => void;
  onSwitchToRepo: () => void;
  onDownloadTemplate: () => void;
}

export function FeederImportView({
  onSuccess,
  onSwitchToRepo,
  onDownloadTemplate,
}: FeederImportViewProps) {
  const [importMode, setImportMode] = useState<"file" | "paste">("file");
  const [files, setFiles] = useState<File[]>([]);
  const [rawText, setRawText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    summary?: {
      source?: string;
      totalRows?: number;
      totalRowsInFile?: number;
      filesProcessed?: number;
      graduatesProcessed?: number;
      ignoredDoCount?: number;
      recordsInserted: number;
      recordsUpdated: number;
      recordsFailed: number;
      ignoredSample?: Array<{ nim: string; fullName: string; status: string }>;
      errors: Array<{ row: number; nim?: string; error: string }>;
    };
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setResult(null);

    try {
      const data = new FormData();
      if (importMode === "file") {
        if (files.length === 0) {
          throw new Error("Silakan pilih file hasil ekspor Feeder (.xls / .html) atau spreadsheet (.xlsx).");
        }
        files.forEach((f) => {
          data.append("files", f);
        });
      } else {
        if (!rawText.trim()) {
          throw new Error("Silakan tempel teks atau kode HTML tabel Feeder terlebih dahulu.");
        }
        data.append("rawText", rawText);
      }

      const res = await fetch("/api/v1/alumni/batch-import", {
        method: "POST",
        body: data,
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal memproses data impor");
      }

      setResult(json);
      onSuccess();
    } catch (err: unknown) {
      setResult({
        success: false,
        message: (err as Error).message || "Terjadi kesalahan saat memproses data",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* 1. HEADER & OPERATIONAL BRIEF                                        */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Tarik & Impor Data Neo Feeder PDDIKTI
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                  Multi-File
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Impor dan sinkronisasi data lulusan, nomor PISN 21-digit, dan tanggal yudisium dari Neo Feeder
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownloadTemplate}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span>Download Template Excel</span>
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-500/20 flex items-start gap-3 text-xs text-indigo-950 dark:text-indigo-200">
          <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <p className="font-semibold">
              Filter Otomatis Status Kelulusan:
            </p>
            <p className="text-[11px] text-indigo-900/80 dark:text-indigo-300/80">
              Sistem secara otomatis hanya memasukkan mahasiswa dengan status <strong>LULUS</strong> ke repository alumni. Status Drop Out (DO) atau Pengunduran Diri akan disaring dan diabaikan secara aman.
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. FORM UPLOAD / PASTE SECTION                                       */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-5">
        {/* Mode Switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-950/60 rounded-xl w-fit border border-slate-200/80 dark:border-white/5">
          <button
            type="button"
            onClick={() => setImportMode("file")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              importMode === "file"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Unggah File Feeder (.xls / .html / .xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => setImportMode("paste")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              importMode === "paste"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ClipboardPaste className="h-4 w-4" />
            <span>Tempel Kode / Teks Tabel HTML Feeder</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {importMode === "file" ? (
            <div className="space-y-3">
              <MultiFileDropzone
                files={files}
                onFilesChange={setFiles}
                accept=".xls,.xlsx,.html,.htm"
                colorScheme="indigo"
                label="Pilih atau Seret Beberapa File Ekspor Feeder ke Sini:"
                hint="Mendukung file ekspor dari menu Feeder Mahasiswa -> Keluar/Lulus -> Export Data (.xls / .html / .xlsx). Bisa pilih banyak file sekaligus."
                disabled={isProcessing}
              />

              {/* Feeder Column Reference */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-indigo-500" />
                  Struktur Kolom Feeder yang Dikenali Otomatis:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Kolom 2:</span> NIM
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Kolom 3:</span> Nama Mahasiswa
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Kolom 6:</span> Status (Lulus)
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Kolom 8:</span> No Ijazah (PISN)
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tempel Kode HTML atau Teks Tabel Feeder di Bawah:
                </label>
                <textarea
                  rows={10}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Tempel seluruh kode HTML tabel Feeder atau teks hasil salin di sini (cth: <tr><td>1</td><td>2061201083</td><td>NAMA...</td></tr>)..."
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tip: Anda dapat membuka file <code>.xls</code> hasil ekspor Feeder menggunakan browser (Google Chrome / Edge) atau teks editor, lalu salin dan tempel langsung ke kotak di atas.
              </p>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
            <span className="text-[11px] text-slate-500">
              {importMode === "file" ? (files.length > 0 ? `${files.length} file terpilih` : "Pilih file terlebih dahulu") : `${rawText.length} karakter teks`}
            </span>

            <button
              type="submit"
              disabled={isProcessing || (importMode === "file" && files.length === 0) || (importMode === "paste" && !rawText.trim())}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>
                    {importMode === "file" && files.length > 1
                      ? `Memproses ${files.length} File...`
                      : "Sedang Memproses Data..."}
                  </span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  <span>
                    Mulai Impor & Sinkronkan {files.length > 0 && importMode === "file" ? `(${files.length} File)` : ""}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* ================================================================== */}
        {/* RESULT SUMMARY ALERT                                               */}
        {/* ================================================================== */}
        {result && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-3 animate-in fade-in duration-200 ${
              result.success
                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                : "bg-rose-50 dark:bg-rose-950/20 border-rose-500/30 text-rose-900 dark:text-rose-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                )}
                <span>{result.message}</span>
              </div>

              {result.success && (
                <button
                  type="button"
                  onClick={onSwitchToRepo}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <span>Lihat di Repository Alumni</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {result.summary && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-[11px]">
                  <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-emerald-500/20">
                    <span className="block text-slate-500 text-[10px]">Data Baru</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
                      {result.summary.recordsInserted}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-emerald-500/20">
                    <span className="block text-slate-500 text-[10px]">Diperbarui</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 text-sm">
                      {result.summary.recordsUpdated}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-emerald-500/20">
                    <span className="block text-slate-500 text-[10px]">Non-Lulus Diabaikan</span>
                    <strong className="text-slate-600 dark:text-slate-300 text-sm">
                      {result.summary.ignoredDoCount ?? 0}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-emerald-500/20">
                    <span className="block text-slate-500 text-[10px]">Gagal</span>
                    <strong className="text-rose-600 dark:text-rose-400 text-sm">
                      {result.summary.recordsFailed}
                    </strong>
                  </div>
                </div>

                {result.summary.ignoredSample && result.summary.ignoredSample.length > 0 && (
                  <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase font-mono">
                      Contoh Mahasiswa Non-Lulus yang Diabaikan:
                    </span>
                    <div className="space-y-0.5 text-[11px]">
                      {result.summary.ignoredSample.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between font-mono">
                          <span>{s.nim} - {s.fullName}</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px]">
                            {s.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
