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
  GraduationCap,
} from "lucide-react";
import { MultiFileDropzone } from "./MultiFileDropzone";

interface FeederGraduatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function FeederGraduatesModal({
  isOpen,
  onClose,
  onSuccess,
}: FeederGraduatesModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    summary?: {
      filesProcessed?: number;
      recordsInserted: number;
      recordsUpdated: number;
      recordsFailed: number;
      ignoredDoCount?: number;
      ignoredSample?: Array<{ nim: string; fullName: string; status: string }>;
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
      files.forEach((f) => {
        data.append("files", f);
      });

      const res = await fetch("/api/v1/alumni/batch-import", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal memproses data impor kelulusan Feeder");
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

  const handleModalClose = () => {
    setFiles([]);
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-xl w-full rounded-3xl bg-white dark:bg-[#071719] border border-teal-500/30 dark:border-teal-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-teal-500/20 bg-gradient-to-r from-teal-500/10 via-transparent to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Tarik Data Mahasiswa Lulus Feeder
              </h3>
              <p className="text-xs text-teal-600 dark:text-teal-400">
                Impor data kelulusan, 21-digit nomor PISN, IPK, dan Yudisium (Bisa Banyak File)
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
          <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider font-mono">
                Langkah Ekspor Data Feeder:
              </span>
              <a
                href="https://feeder.stimiyapmim.ac.id/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
              >
                <span>Buka Feeder STIMI ↗</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <ol className="text-xs text-slate-700 dark:text-teal-200/90 space-y-1 list-decimal list-inside leading-relaxed font-sans">
              <li>
                Login ke Neo Feeder:{" "}
                <span className="font-mono text-[11px] text-teal-800 dark:text-teal-300">
                  feeder.stimiyapmim.ac.id
                </span>
              </li>
              <li>
                Masuk ke menu <strong>Export Data</strong> &rarr; pilih <strong>Mahasiswa Lulus</strong>
              </li>
              <li>Atur filter angkatan & periode kelulusan, periksa via format HTML</li>
              <li>Ekspor file dalam format Excel (.xlsx / .xls) lalu unggah di bawah (bisa pilih banyak file sekaligus)</li>
            </ol>
          </div>

          {/* Form Processing */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <MultiFileDropzone
              files={files}
              onFilesChange={setFiles}
              accept=".xlsx,.xls,.html,.htm"
              colorScheme="teal"
              label="Pilih File Ekspor Lulusan Feeder (Bisa Sekaligus Banyak File):"
              hint="Format didukung: .xlsx, .xls, atau .html. Bisa pilih banyak file per angkatan/periode."
              disabled={isProcessing}
            />

            <button
              type="submit"
              disabled={isProcessing || files.length === 0}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>
                    {files.length > 1
                      ? `Memproses ${files.length} File Lulusan Feeder...`
                      : "Memproses Data Lulusan Feeder..."}
                  </span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  <span>
                    Mulai Impor Data Lulusan {files.length > 0 ? `(${files.length} File Terpilih)` : ""}
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
                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-center">
                  <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20">
                    <span className="block text-slate-500 dark:text-slate-400 text-[10px]">Data Baru</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
                      {result.summary.recordsInserted}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20">
                    <span className="block text-slate-500 dark:text-slate-400 text-[10px]">Diperbarui</span>
                    <strong className="text-teal-600 dark:text-teal-400 text-sm">
                      {result.summary.recordsUpdated}
                    </strong>
                  </div>
                  <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20">
                    <span className="block text-slate-500 dark:text-slate-400 text-[10px]">Non-Lulus Diabaikan</span>
                    <strong className="text-slate-600 dark:text-slate-300 text-sm">
                      {result.summary.ignoredDoCount ?? 0}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-teal-500/20 bg-slate-50/50 dark:bg-[#041d21]/60 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Sistem otomatis memfilter status lulus & mengekstrak PISN 21-digit
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
