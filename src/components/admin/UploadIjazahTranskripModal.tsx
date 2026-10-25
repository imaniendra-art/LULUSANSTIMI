"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  User,
  GraduationCap,
  FileCheck,
  Calendar,
  Check,
} from "lucide-react";

interface StoredFile {
  fileName: string;
  filePath: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedAt: string;
}

interface AlumniItem {
  id: string;
  nim: string;
  fullName: string;
  prodiCode: string;
  prodiName: string;
  degree?: string;
  yudisiumDate?: string;
  yudisiumDecreeNumber?: string;
  ijazahScan?: StoredFile | null;
  transkripScan?: StoredFile | null;
}

interface UploadIjazahTranskripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadIjazahTranskripModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadIjazahTranskripModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AlumniItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<AlumniItem | null>(null);

  const [ijazahFile, setIjazahFile] = useState<File | null>(null);
  const [transkripFile, setTranskripFile] = useState<File | null>(null);
  const [skFile, setSkFile] = useState<File | null>(null);
  const [customSkNumber, setCustomSkNumber] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [existingDecrees, setExistingDecrees] = useState<Record<string, { fileName: string; size: number }>>({});
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch list of uploaded SK decrees to display status
  const fetchExistingDecrees = async () => {
    try {
      const res = await fetch("/api/v1/yudisium-decree");
      if (res.ok) {
        const json = await res.json();
        if (json.decrees) setExistingDecrees(json.decrees);
      }
    } catch {
      // ignore
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedStudent(null);
      setIjazahFile(null);
      setTranskripFile(null);
      setSkFile(null);
      setCustomSkNumber("");
      setResult(null);
      fetchExistingDecrees();

      // Focus search input after modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Debounced live search
  useEffect(() => {
    if (!isOpen || selectedStudent) return;

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/v1/alumni?q=${encodeURIComponent(searchQuery.trim())}&limit=12`);
        if (res.ok) {
          const json = await res.json();
          setSearchResults(json.data || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen, selectedStudent]);

  if (!isOpen) return null;

  const handleSelectStudent = (student: AlumniItem) => {
    setSelectedStudent(student);
    setSearchQuery("");
    setSearchResults([]);
    setResult(null);
    setCustomSkNumber(student.yudisiumDecreeNumber || "");
  };

  const handleResetSelection = () => {
    setSelectedStudent(null);
    setIjazahFile(null);
    setTranskripFile(null);
    setSkFile(null);
    setCustomSkNumber("");
    setResult(null);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const getSafeKey = (sk: string) => sk.replace(/[/\\?%*:|"<>]/g, "_").trim();
  const currentSkKey = selectedStudent?.yudisiumDecreeNumber ? getSafeKey(selectedStudent.yudisiumDecreeNumber) : "";
  const hasUploadedSk = currentSkKey ? Boolean(existingDecrees[currentSkKey]) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    if (!ijazahFile && !transkripFile && !skFile) {
      setResult({
        success: false,
        message: "Silakan pilih setidaknya satu file (Scan Ijazah, Scan Transkrip, atau Berkas SK Yudisium) untuk diunggah.",
      });
      return;
    }

    setIsUploading(true);
    setResult(null);

    const uploadedItems: string[] = [];

    try {
      // 1. Upload Ijazah & Transkrip jika dipilih
      if (ijazahFile || transkripFile) {
        const formData = new FormData();
        if (ijazahFile) formData.append("ijazahFile", ijazahFile);
        if (transkripFile) formData.append("transkripFile", transkripFile);

        const resAlumni = await fetch(`/api/v1/alumni/${selectedStudent.id}`, {
          method: "PUT",
          body: formData,
        });

        const jsonAlumni = await resAlumni.json();
        if (!resAlumni.ok) {
          throw new Error(jsonAlumni.error || "Gagal mengunggah Ijazah / Transkrip");
        }

        if (ijazahFile) uploadedItems.push("Ijazah");
        if (transkripFile) uploadedItems.push("Transkrip Nilai");

        if (jsonAlumni.data) {
          setSelectedStudent(jsonAlumni.data);
        }
      }

      // 2. Upload Berkas SK Yudisium jika dipilih
      if (skFile) {
        const targetSkNumber = (customSkNumber || selectedStudent.yudisiumDecreeNumber || "").trim();
        if (!targetSkNumber) {
          throw new Error("Nomor SK Yudisium belum ditentukan untuk mengunggah file SK.");
        }

        const decreeData = new FormData();
        decreeData.append("decreeNumber", targetSkNumber);
        decreeData.append("file", skFile);

        const resSk = await fetch("/api/v1/yudisium-decree", {
          method: "POST",
          body: decreeData,
        });

        const jsonSk = await resSk.json();
        if (!resSk.ok) {
          throw new Error(jsonSk.error || "Gagal mengunggah Berkas SK Yudisium");
        }

        uploadedItems.push("SK Yudisium");
        fetchExistingDecrees();
      }

      setResult({
        success: true,
        message: `Berkas (${uploadedItems.join(", ")}) untuk ${selectedStudent.fullName} (NIM: ${selectedStudent.nim}) berhasil diunggah dan disimpan ke server lokal!`,
      });

      setIjazahFile(null);
      setTranskripFile(null);
      setSkFile(null);

      onSuccess();
    } catch (err: unknown) {
      setResult({
        success: false,
        message: (err as Error).message || "Terjadi kesalahan saat mengunggah berkas",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shadow-inner">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Upload Berkas Yudisium, Ijazah & Transkrip
              </h3>
              <p className="text-xs text-white/80">
                Pilih nama mahasiswa lalu unggah scan PDF SK Yudisium, Ijazah, atau Transkrip Nilai
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Result Alert */}
          {result && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                result.success
                  ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <span className="font-semibold block">{result.message}</span>
                {result.success && (
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetSelection}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                    >
                      + Upload Mahasiswa Lain
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: PILIH MAHASISWA */}
          {!selectedStudent ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  1. Cari & Pilih Nama Mahasiswa
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik NIM atau Nama Mahasiswa (contoh: 2261201001 atau Nurhikmah)..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  {isSearching && (
                    <RefreshCw className="absolute right-3.5 top-3 h-4 w-4 animate-spin text-indigo-500" />
                  )}
                  {searchQuery && !isSearching && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Results List */}
              {searchQuery && searchResults.length > 0 && (
                <div className="border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-950 overflow-hidden divide-y divide-slate-100 dark:divide-white/5 max-h-64 overflow-y-auto shadow-inner">
                  {searchResults.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectStudent(s)}
                      className="p-3 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {s.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {s.fullName}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">NIM: {s.nim}</span>
                            <span>·</span>
                            <span>{s.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen"}</span>
                          </div>
                        </div>
                      </div>

                      {/* File Badges */}
                      <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium ${
                            s.ijazahScan
                              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          Ijazah: {s.ijazahScan ? "Ada" : "Belum"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium ${
                            s.transkripScan
                              ? "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          Transkrip: {s.transkripScan ? "Ada" : "Belum"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && !isSearching && searchResults.length === 0 && (
                <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-white/10 text-slate-400 text-xs">
                  Tidak ditemukan mahasiswa dengan kata kunci "<strong>{searchQuery}</strong>".
                </div>
              )}

              {!searchQuery && (
                <div className="p-6 text-center rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/5 text-slate-400 dark:text-slate-500 text-xs space-y-1">
                  <User className="h-6 w-6 mx-auto opacity-50 mb-1" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Mulai dengan mencari nama mahasiswa</p>
                  <p className="text-[11px]">Ketik nama lengkap atau NIM mahasiswa yang ingin diunggah berkas SK Yudisium, Ijazah, atau Transkripnya.</p>
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: MAHASISWA DIPILIH & FORM UPLOAD 3 BERKAS */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selected Student Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50/80 via-white to-indigo-50/80 dark:from-teal-950/20 dark:via-slate-950 dark:to-indigo-950/20 border border-teal-200 dark:border-teal-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-indigo-600/20 flex-shrink-0">
                    {selectedStudent.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {selectedStudent.fullName}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono font-bold">
                        {selectedStudent.nim}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedStudent.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen"} · Yudisium: {formatDate(selectedStudent.yudisiumDate)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetSelection}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-semibold transition cursor-pointer flex-shrink-0"
                >
                  Ganti
                </button>
              </div>

              {/* Status Berkas Saat Ini (3 Kolom) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* 1. SK Yudisium */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    1. File SK Yudisium
                  </span>
                  {hasUploadedSk ? (
                    <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-semibold text-[11px] truncate">
                      <Check className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">Tersimpan di Disk</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Belum diunggah</span>
                  )}
                </div>

                {/* 2. Ijazah */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    2. Scan Ijazah
                  </span>
                  {selectedStudent.ijazahScan ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] truncate">
                      <Check className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{selectedStudent.ijazahScan.fileName}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Belum diunggah</span>
                  )}
                </div>

                {/* 3. Transkrip */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    3. Scan Transkrip
                  </span>
                  {selectedStudent.transkripScan ? (
                    <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-semibold text-[11px] truncate">
                      <Check className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{selectedStudent.transkripScan.fileName}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Belum diunggah</span>
                  )}
                </div>
              </div>

              {/* 2. AREA PILIH BERKAS PDF (3 PILIHAN) */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  2. Pilih File Scan Berkas (.pdf) yang Ingin Diunggah
                </label>

                {/* Upload Ijazah */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-emerald-500" />
                      Scan Ijazah Asli (PDF)
                    </span>
                    {ijazahFile && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                        {formatFileSize(ijazahFile.size)}
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setIjazahFile(e.target.files?.[0] || null)}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-500/20 dark:file:text-emerald-300 hover:file:bg-emerald-100 transition cursor-pointer border border-slate-200 dark:border-white/10 rounded-xl p-1 bg-slate-50 dark:bg-slate-950"
                    />
                    {ijazahFile && (
                      <button
                        type="button"
                        onClick={() => setIjazahFile(null)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-rose-500 p-1"
                        title="Hapus file ijazah yang dipilih"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Upload Transkrip */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileCheck className="h-4 w-4 text-cyan-500" />
                      Scan Transkrip Nilai (PDF)
                    </span>
                    {transkripFile && (
                      <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                        {formatFileSize(transkripFile.size)}
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setTranskripFile(e.target.files?.[0] || null)}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-50 file:text-cyan-700 dark:file:bg-cyan-500/20 dark:file:text-cyan-300 hover:file:bg-cyan-100 transition cursor-pointer border border-slate-200 dark:border-white/10 rounded-xl p-1 bg-slate-50 dark:bg-slate-950"
                    />
                    {transkripFile && (
                      <button
                        type="button"
                        onClick={() => setTranskripFile(null)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-rose-500 p-1"
                        title="Hapus file transkrip yang dipilih"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Upload SK Yudisium */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-teal-500" />
                      Berkas Dokumen SK Yudisium (PDF)
                    </span>
                    {skFile && (
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-mono font-bold">
                        {formatFileSize(skFile.size)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={customSkNumber}
                      onChange={(e) => setCustomSkNumber(e.target.value)}
                      placeholder="Nomor SK Yudisium (contoh: 000.2/512/STIMI-YAPMI/MKS/IX/2026)..."
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                    />

                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => setSkFile(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 dark:file:bg-teal-500/20 dark:file:text-teal-300 hover:file:bg-teal-100 transition cursor-pointer border border-slate-200 dark:border-white/10 rounded-xl p-1 bg-slate-50 dark:bg-slate-950"
                      />
                      {skFile && (
                        <button
                          type="button"
                          onClick={() => setSkFile(null)}
                          className="absolute right-2 top-2 text-slate-400 hover:text-rose-500 p-1"
                          title="Hapus file SK yang dipilih"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading || (!ijazahFile && !transkripFile && !skFile)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-teal-600/25 transition cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Mengunggah Berkas...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload & Simpan Berkas</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
