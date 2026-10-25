"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileCheck,
  Upload,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Calendar,
  FileText,
  Save,
  Clock,
  Users,
} from "lucide-react";

interface KnownDecreeItem {
  dateStr: string;
  skNumber: string;
  count: number;
  hasPdf?: boolean;
}

interface UploadDecreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDecreeNumber?: string;
  initialYudisiumDate?: string;
  knownDecrees?: KnownDecreeItem[];
}

export function UploadDecreeModal({
  isOpen,
  onClose,
  onSuccess,
  initialDecreeNumber,
  initialYudisiumDate,
  knownDecrees = [],
}: UploadDecreeModalProps) {
  const [decreeNumber, setDecreeNumber] = useState(initialDecreeNumber || "");
  const [selectedDate, setSelectedDate] = useState(initialYudisiumDate || "");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [existingDecrees, setExistingDecrees] = useState<Record<string, { fileName: string; size: number }>>({});
  const [serverKnownDecrees, setServerKnownDecrees] = useState<KnownDecreeItem[]>([]);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const fetchDecrees = async () => {
    try {
      const res = await fetch("/api/v1/yudisium-decree");
      const json = await res.json();
      if (json.success) {
        if (json.decrees) setExistingDecrees(json.decrees);
        if (json.knownDecrees) setServerKnownDecrees(json.knownDecrees);
      }
    } catch (e) {
      console.error("Fetch decrees error:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialDecreeNumber) setDecreeNumber(initialDecreeNumber);
      if (initialYudisiumDate) setSelectedDate(initialYudisiumDate);
      fetchDecrees();
      setResult(null);
      setFile(null);
    }
  }, [isOpen, initialDecreeNumber, initialYudisiumDate]);

  if (!isOpen) return null;

  const combinedKnownDecrees = serverKnownDecrees.length > 0 ? serverKnownDecrees : knownDecrees;

  const handleSelectDateItem = (item: KnownDecreeItem) => {
    setSelectedDate(item.dateStr);
    if (item.skNumber) {
      setDecreeNumber(item.skNumber);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decreeNumber.trim()) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const data = new FormData();
      data.append("decreeNumber", decreeNumber.trim());
      if (selectedDate) {
        data.append("yudisiumDate", selectedDate);
      }
      if (file) {
        data.append("file", file);
      }

      const res = await fetch("/api/v1/yudisium-decree", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memproses SK Yudisium");

      setResult({ success: true, message: json.message });
      fetchDecrees();
      onSuccess();
    } catch (err: unknown) {
      setResult({
        success: false,
        message: (err as Error).message || "Terjadi kesalahan saat memproses",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getSafeKey = (sk: string) => sk.replace(/[/\\?%*:|"<>]/g, "_").trim();
  const currentKey = getSafeKey(decreeNumber);
  const currentUploaded = existingDecrees[currentKey];

  const selectedDateInfo = combinedKnownDecrees.find((d) => d.dateStr === selectedDate);

  const formatDateIndo = (dStr: string) => {
    if (!dStr) return "-";
    const parts = dStr.split("-");
    if (parts.length === 3) {
      const d = new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    }
    return dStr;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-xl w-full rounded-3xl bg-white dark:bg-[#07131d] border border-cyan-500/30 dark:border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Brankas SK Yudisium Ketua
              </h3>
              <p className="text-xs text-cyan-600 dark:text-cyan-400">
                Pencatatan Nomor SK & Pengarsipan Berkas PDF Resmi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Section: Pilih Tanggal Yudisium untuk Penerapan Kolektif */}
          {combinedKnownDecrees.length > 0 && (
            <div className="space-y-1.5">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Pilih Tanggal Yudisium Mahasiswa:</span>
                </span>
                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate("")}
                    className="text-[10px] text-slate-400 hover:text-rose-500 transition cursor-pointer"
                  >
                    Reset Pilihan
                  </button>
                )}
              </label>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-white/5">
                {combinedKnownDecrees.map((d) => {
                  const isSelected = selectedDate === d.dateStr;
                  const safeK = d.skNumber ? getSafeKey(d.skNumber) : "";
                  const hasPdf = safeK ? !!existingDecrees[safeK] : false;
                  const hasSk = Boolean(d.skNumber && d.skNumber.trim());

                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => handleSelectDateItem(d)}
                      className={`text-[11px] font-mono px-2.5 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-cyan-600 text-white border-cyan-500 font-bold shadow-xs"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-cyan-400"
                      }`}
                    >
                      <Calendar className="h-3 w-3 opacity-60" />
                      <span>{d.dateStr}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-sans font-bold ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {d.count} Mhs
                      </span>
                      {hasPdf ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" title="File PDF SK Lengkap" />
                      ) : hasSk ? (
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" title="Nomor SK Terdaftar (Belum PDF)" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" title="Belum Ada Nomor SK" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <div className="text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 mt-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    Tanggal <strong>{formatDateIndo(selectedDate)}</strong> terpilih ({selectedDateInfo?.count ?? 0} mahasiswa).
                    Nomor SK di bawah akan otomatis diterapkan ke seluruh mahasiswa pada tanggal ini.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Input Nomor SK Yudisium */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Nomor SK Yudisium Resmi Ketua <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 826/412/STIMI -YAPMI/MKS/VIII/2024"
              value={decreeNumber}
              onChange={(e) => setDecreeNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Nomor SK ini yang akan tercetak di Ijazah dan Surat Keterangan Lulus.
            </p>
          </div>

          {/* Current Status of Selected Decree Number */}
          {decreeNumber && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Status Berkas PDF di Server:</p>
                {currentUploaded ? (
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Sudah Tersimpan ({(currentUploaded.size / 1024).toFixed(1)} KB)</span>
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Belum ada file scan PDF (opsional, bisa diunggah menyusul)</span>
                  </p>
                )}
              </div>

              {currentUploaded && (
                <a
                  href={`/api/v1/yudisium-decree/preview?skNumber=${encodeURIComponent(decreeNumber)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Lihat PDF</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {/* Form Upload PDF (Opsional) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Unggah Dokumen Scan PDF SK Yudisium</span>
                <span className="text-[10px] font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  Opsional (Bisa Nanti)
                </span>
              </label>

              <div className="relative border-2 border-dashed border-cyan-500/30 dark:border-cyan-500/30 hover:border-cyan-500 rounded-2xl p-5 text-center transition bg-slate-50/50 dark:bg-cyan-950/10">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Upload className="h-5 w-5" />
                  </div>
                  {file ? (
                    <div>
                      <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{file.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Klik atau seret file PDF SK ke sini jika sudah ada
                      </p>
                      <p className="text-[10px] text-slate-400">Format: Dokumen scan resmi bertanda tangan (.pdf)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Tutup
              </button>

              <button
                type="submit"
                disabled={!decreeNumber.trim() || isProcessing}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50 ${
                  file
                    ? "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/20"
                    : "bg-teal-600 hover:bg-teal-500 shadow-teal-600/20"
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Menyimpan Data...</span>
                  </>
                ) : file ? (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Simpan Nomor SK & Upload PDF</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Simpan Nomor SK ke Database</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Result Feedback Banner */}
          {result && (
            <div
              className={`p-3.5 rounded-2xl border ${
                result.success
                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
                  : "bg-rose-50 dark:bg-rose-950/20 border-rose-500/30 text-rose-800 dark:text-rose-200"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <p className="text-xs font-bold">{result.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
