"use client";

import React, { useState } from "react";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { MultiFileDropzone } from "./MultiFileDropzone";

interface PisnResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PisnResultModal({
  isOpen,
  onClose,
  onSuccess,
}: PisnResultModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    summary?: {
      importType: string;
      filesProcessed?: number;
      batchNumber?: string | null;
      recordsUpdated: number;
      recordsInserted: number;
      recordsFailed: number;
      updatedSample?: Array<{ nim: string; fullName: string; pisnNumber: string }>;
      errors?: Array<{ row: number; nim?: string; error: string }>;
    };
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const data = new FormData();
      data.append("importType", "pisn-result");
      files.forEach((f) => {
        data.append("files", f);
      });

      const res = await fetch("/api/v1/alumni/batch-import", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memproses data hasil PISN");
      }

      setResult(json);
      onSuccess();
    } catch (err: unknown) {
      setResult({
        success: false,
        message: (err as Error).message || "Terjadi kesalahan saat memproses data hasil PISN",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModalClose = () => {
    setFiles([]);
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-xl w-full rounded-3xl bg-white dark:bg-[#071719] border border-teal-500/30 dark:border-teal-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-teal-500/20 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Impor Hasil Nomor PISN / PIN
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                PISN Kemdiktisaintek (pisn.kemdiktisaintek.go.id) · Bisa Banyak File
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* SOP Instruction Card with Direct Link */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider font-mono">
                Panduan Ekspor Hasil PISN:
              </span>
              <a
                href="https://pisn.kemdiktisaintek.go.id/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                <span>Buka Portal PISN ↗</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <ol className="text-xs text-slate-700 dark:text-emerald-200/90 space-y-1 list-decimal list-inside leading-relaxed font-sans">
              <li>
                Login ke portal PISN:{" "}
                <span className="font-mono text-[11px] text-emerald-800 dark:text-emerald-300">
                  pisn.kemdiktisaintek.go.id
                </span>
              </li>
              <li>
                Masuk ke menu <strong>Daftar Penomoran</strong> atau riwayat ajuan Batch
              </li>
              <li>
                Klik <strong>Export Data</strong> dalam format Excel (.xlsx / .xls / .csv)
              </li>
              <li>Unggah file hasil ekspor PISN tersebut di bawah ini (bisa beberapa file batch sekaligus)</li>
            </ol>
            <p className="text-[11px] text-slate-600 dark:text-emerald-300/80 italic pt-1 border-t border-emerald-200/60 dark:border-emerald-500/20">
              💡 Jika data PISN diunggah lebih dulu sebelum Feeder, sistem akan otomatis mencatat data mahasiswa & memberi status menunggu sinkronisasi detail.
            </p>
          </div>

          {/* Form Processing */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <MultiFileDropzone
              files={files}
              onFilesChange={setFiles}
              accept=".xlsx,.xls,.csv"
              colorScheme="emerald"
              label="Pilih File Ekspor Hasil PISN (Bisa Sekaligus Banyak File):"
              hint="Format didukung: .xlsx, .xls, .csv. Anda dapat mengunggah file beberapa batch sekaligus."
              disabled={isProcessing}
            />

            <button
              type="submit"
              disabled={isProcessing || files.length === 0}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>
                    {files.length > 1
                      ? `Memproses ${files.length} File Hasil PISN...`
                      : "Memproses Data Hasil PISN..."}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>
                    Mulai Impor Nomor PISN {files.length > 0 ? `(${files.length} File Terpilih)` : ""}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Result Alert & Sample */}
          {result && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                result.success
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-900 dark:text-emerald-200"
                  : "bg-rose-50 dark:bg-rose-950/30 border-rose-500/40 text-rose-900 dark:text-rose-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                )}
                <span className="font-bold">{result.message}</span>
              </div>

              {result.summary && (
                <div className="space-y-2 pt-1 font-mono text-[11px]">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20">
                      <span className="block text-slate-500 dark:text-slate-400 text-[10px]">PIN Terpasang</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
                        {result.summary.recordsUpdated}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20">
                      <span className="block text-slate-500 dark:text-slate-400 text-[10px]">Data Baru Dibuat</span>
                      <strong className="text-teal-600 dark:text-teal-400 text-sm">
                        {result.summary.recordsInserted}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20">
                      <span className="block text-slate-500 dark:text-slate-400 text-[10px]">Gagal</span>
                      <strong className="text-rose-600 dark:text-rose-400 text-sm">
                        {result.summary.recordsFailed}
                      </strong>
                    </div>
                  </div>

                  {result.summary.batchNumber && (
                    <div className="p-2 rounded-xl bg-emerald-100/50 dark:bg-emerald-950/50 text-[11px] text-emerald-900 dark:text-emerald-200">
                      <strong>Nomor Batch:</strong> {result.summary.batchNumber}
                    </div>
                  )}

                  {result.summary.updatedSample && result.summary.updatedSample.length > 0 && (
                    <div className="pt-1">
                      <span className="font-bold text-[10px] text-slate-500 uppercase">
                        Contoh Nomor PIN Terpasang:
                      </span>
                      <div className="mt-1 space-y-1">
                        {result.summary.updatedSample.map((s, idx) => (
                          <div
                            key={idx}
                            className="p-1.5 rounded-lg bg-emerald-100/40 dark:bg-emerald-950/40 flex items-center justify-between text-[10px]"
                          >
                            <span>
                              <strong>{s.nim}</strong> - {s.fullName}
                            </span>
                            <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">
                              {s.pisnNumber}
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

        {/* Footer Actions */}
        <div className="p-4 border-t border-teal-500/20 bg-slate-50/50 dark:bg-[#041d21]/60 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Sistem otomatis mengekstrak nomor batch dan memvalidasi PIN 21-digit
          </p>
          <button
            type="button"
            onClick={handleModalClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-teal-950 dark:hover:bg-teal-900 text-xs font-semibold text-slate-700 dark:text-teal-200 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
