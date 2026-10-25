"use client";

import React, { useState } from "react";
import {
  X,
  GraduationCap,
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { MultiFileDropzone } from "./MultiFileDropzone";

interface PandawaThesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PandawaThesisModal({
  isOpen,
  onClose,
  onSuccess,
}: PandawaThesisModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [overwrite, setOverwrite] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    summary?: {
      filesProcessed?: number;
      recordsUpdated: number;
      recordsIgnored: number;
      recordsFailed: number;
      updatedSample?: Array<{ nim: string; fullName: string; thesisTitle: string }>;
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
      data.append("importType", "pandawa-thesis");
      data.append("overwrite", String(overwrite));
      files.forEach((f) => {
        data.append("files", f);
      });

      const res = await fetch("/api/v1/alumni/batch-import", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengimpor data skripsi Pandawa");

      setResult(json);
      onSuccess();
    } catch (err: unknown) {
      setResult({
        success: false,
        message: (err as Error).message || "Terjadi kesalahan saat memproses file",
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
      <div className="max-w-xl w-full rounded-3xl bg-white dark:bg-[#19140c] border border-amber-500/30 dark:border-amber-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Impor Judul Skripsi & Tesis
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Penyelarasan dari Sistem Informasi Skripsi PANDAWA (Bisa Banyak File)
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
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Petunjuk Ekspor Pandawa */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 font-mono">
                Panduan Ambil Data di PANDAWA:
              </span>
              <a
                href="https://pandawa.stimiyapmim.ac.id/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                <span>Buka PANDAWA ↗</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-decimal list-inside leading-relaxed">
              <li>
                Login sebagai Admin di Pandawa:{" "}
                <code className="text-amber-700 dark:text-amber-300 font-mono bg-amber-100/50 dark:bg-amber-900/40 px-1 py-0.5 rounded">
                  pandawa.stimiyapmim.ac.id
                </code>
              </li>
              <li>Buka menu ujian / skripsi alumni</li>
              <li>Klik tombol <strong>Export PDDIKTI</strong></li>
              <li>Unduh file spreadsheet (format <code>.xlsx</code> / <code>.xls</code> / <code>.csv</code>)</li>
              <li>Unggah file tersebut sekaligus di bawah ini (bisa multi-file S1 & S2)</li>
            </ol>
          </div>

          {/* Form Upload */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <MultiFileDropzone
              files={files}
              onFilesChange={setFiles}
              accept=".xlsx,.xls,.csv"
              colorScheme="amber"
              label="Pilih File Excel / CSV Export PDDIKTI Pandawa (Bisa Banyak File):"
              hint="Format didukung: .xlsx, .xls, .csv. Anda dapat mengunggah file S1 dan S2 sekaligus."
              disabled={isProcessing}
            />

            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-500/20">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Timpa Judul yang Ada
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Perbarui judul skripsi lama dengan judul terbaru dari Pandawa
                </p>
              </div>
              <input
                type="checkbox"
                checked={overwrite}
                onChange={(e) => setOverwrite(e.target.checked)}
                className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300 dark:border-amber-600"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing || files.length === 0}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>
                    {files.length > 1
                      ? `Menyinkronkan Judul dari ${files.length} File...`
                      : "Menyinkronkan Data Skripsi..."}
                  </span>
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  <span>
                    Mulai Impor Judul Skripsi {files.length > 0 ? `(${files.length} File Terpilih)` : ""}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Result Alert */}
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
                      <span className="block text-slate-500 dark:text-slate-400 text-[10px]">Diperbarui</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
                        {result.summary.recordsUpdated}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20">
                      <span className="block text-slate-500 dark:text-slate-400 text-[10px]">Dilewati</span>
                      <strong className="text-slate-600 dark:text-slate-300 text-sm">
                        {result.summary.recordsIgnored}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-emerald-500/20">
                      <span className="block text-slate-500 dark:text-slate-400 text-[10px]">Gagal</span>
                      <strong className="text-rose-600 dark:text-rose-400 text-sm">
                        {result.summary.recordsFailed}
                      </strong>
                    </div>
                  </div>

                  {result.summary.updatedSample && result.summary.updatedSample.length > 0 && (
                    <div className="pt-2">
                      <span className="font-bold text-[10px] text-slate-500 uppercase">
                        Contoh Skripsi Tersinkronisasi:
                      </span>
                      <div className="mt-1 space-y-1">
                        {result.summary.updatedSample.map((s, idx) => (
                          <div
                            key={idx}
                            className="p-1.5 rounded-lg bg-amber-100/40 dark:bg-amber-950/40 flex flex-col gap-0.5 text-[10px]"
                          >
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {s.nim} - {s.fullName}
                            </span>
                            <span className="italic text-slate-600 dark:text-slate-400 truncate">
                              &ldquo;{s.thesisTitle}&rdquo;
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

        {/* Footer Modal */}
        <div className="p-4 border-t border-amber-500/20 bg-slate-50/50 dark:bg-[#1a1409]/60 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Sistem mencocokkan data berdasarkan NIM atau Nama Lengkap Mahasiswa
          </p>
          <button
            type="button"
            onClick={handleModalClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-xs font-semibold text-slate-700 dark:text-amber-200 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
