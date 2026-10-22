"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  FileSpreadsheet,
  FileText,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Upload,
  X,
  ExternalLink,
  GraduationCap,
  RefreshCw,
  Layers,
  ClipboardPaste,
  LogOut,
  ShieldCheck,
  Database,
  User,
  Copy,
  Check,
  Server,
  Filter,
  UserCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface StoredFile {
  fileName: string;
  filePath: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedAt: string;
}

interface AlumniRecord {
  id: string;
  nim: string;
  fullName: string;
  prodiCode: string;
  prodiName: string;
  degree: string;
  registrationType:
    | "PESERTA_DIDIK_BARU"
    | "RPL_PEROLEHAN_SKS"
    | "RPL_TRANSFER_SKS"
    | "RPL_KONVERSI_SKS"
    | "KONVERSI_TRANSFER_NILAI";
  entryPeriod?: string;
  exitPeriod?: string;
  graduationYear: number;
  yudisiumDate: string;
  yudisiumDecreeNumber?: string;
  thesisTitle: string;
  pisnNumber?: string;
  pisnBatchNumber?: string;
  certificateNumber?: string;
  gpa?: number;
  phoneNumber?: string;
  personalEmail?: string;
  ijazahScan?: StoredFile | null;
  transkripScan?: StoredFile | null;
}

interface StatsData {
  totalGraduates: number;
  withPisn: number;
  withoutPisn: number;
  withIjazah: number;
  withTranskrip: number;
  bothFilesArchived: number;
  batches: string[];
  yudisiumDates?: string[];
  yudisiumCounts?: Record<string, number>;
  yudisiumSkMap?: Record<string, string>;
  cohorts?: string[];
  cohortCounts?: Record<string, number>;
  entryPeriods?: string[];
  prodi: {
    s1Manajemen: number;
    s2Manajemen: number;
  };
  registrationTypes?: {
    pesertaBaru: number;
    rplPerolehan?: number;
    rplKonversi?: number;
    rplTransfer?: number;
    transfer: number;
  };
}

export default function AdminConsolePage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<{ email: string; fullName: string; role: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [graduates, setGraduates] = useState<AlumniRecord[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [prodiFilter, setProdiFilter] = useState("");
  const [regTypeFilter, setRegTypeFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [pisnFilter, setPisnFilter] = useState("");
  const [cohortFilter, setCohortFilter] = useState("");
  const [yudisiumFilter, setYudisiumFilter] = useState("");
  const [entryPeriodFilter, setEntryPeriodFilter] = useState("");
  const [fileStatusFilter, setFileStatusFilter] = useState("");
  const [gpaRangeFilter, setGpaRangeFilter] = useState("");
  const [sortBy, setSortBy] = useState("nim");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [copiedPisn, setCopiedPisn] = useState<string | null>(null);

  // Tab Mode (PISN Table vs Judul Skripsi Table)
  const [activeTableTab, setActiveTableTab] = useState<"pisn" | "skripsi">("pisn");
  const [editingThesisId, setEditingThesisId] = useState<string | null>(null);
  const [editingThesisTitle, setEditingThesisTitle] = useState<string>("");
  const [isSavingThesis, setIsSavingThesis] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState<boolean>(false);

  // Pagination State (25, 50, 100)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const activeAdvancedFiltersCount = [
    entryPeriodFilter,
    batchFilter,
    fileStatusFilter,
    gpaRangeFilter,
  ].filter(Boolean).length;

  // Format Yudisium Date for Dropdowns & Badges
  const formatYudisiumOption = (dateStr: string) => {
    const parts = dateStr.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    const d = parseInt(parts[2], 10);
    const m = months[parseInt(parts[1], 10) - 1];
    const y = parts[0];
    const sk = stats?.yudisiumSkMap?.[dateStr];
    const count = stats?.yudisiumCounts?.[dateStr];
    const skShort = sk ? `(SK ${sk.split("/")[1] || sk})` : "";
    const countStr = count ? `· ${count} mhs` : "";
    return `${d} ${m} ${y} ${skShort} ${countStr}`.trim();
  };

  // Menghitung Tahun Keluar kalender (2025/2026 Genap -> 2026, 2026/2027 Ganjil -> 2026)
  const getTahunKeluar = (alumni: AlumniRecord): number | string => {
    if (alumni.yudisiumDate) {
      const d = new Date(alumni.yudisiumDate);
      const y = d.getFullYear();
      if (!isNaN(y) && y > 2000) return y;
    }
    if (alumni.graduationYear) {
      return alumni.graduationYear;
    }
    if (alumni.exitPeriod) {
      const match = alumni.exitPeriod.match(/^(\d{4})[-/]?([12])/);
      if (match) {
        const year = parseInt(match[1], 10);
        const sem = match[2];
        return sem === "2" ? year + 1 : year;
      }
    }
    return "-";
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tab = new URLSearchParams(window.location.search).get("tab");
      if (tab === "skripsi") {
        setActiveTableTab("skripsi");
      } else if (tab === "pisn") {
        setActiveTableTab("pisn");
      }
    }
  }, []);

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedGraduate, setSelectedGraduate] = useState<AlumniRecord | null>(null);
  const [previewTab, setPreviewTab] = useState<"ijazah" | "transkrip">("ijazah");

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    id: "",
    nim: "",
    fullName: "",
    prodiCode: "61201",
    prodiName: "S1 Manajemen",
    degree: "S1",
    registrationType: "PESERTA_DIDIK_BARU" as
      | "PESERTA_DIDIK_BARU"
      | "RPL_PEROLEHAN_SKS"
      | "RPL_TRANSFER_SKS"
      | "RPL_KONVERSI_SKS"
      | "KONVERSI_TRANSFER_NILAI",
    entryPeriod: "2022-1",
    exitPeriod: "2025-2",
    yudisiumDate: new Date().toISOString().split("T")[0],
    yudisiumDecreeNumber: "000.2/493/STIMI-YAPMI/MKS/IX/2026",
    thesisTitle: "",
    pisnNumber: "",
    pisnBatchNumber: "",
    certificateNumber: "",
    gpa: "",
    phoneNumber: "",
    personalEmail: "",
  });
  const [ijazahFile, setIjazahFile] = useState<File | null>(null);
  const [transkripFile, setTranskripFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Import State
  const [importMode, setImportMode] = useState<"paste" | "file">("paste");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [rawTextPaste, setRawTextPaste] = useState("");
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    summary?: {
      totalRows: number;
      recordsInserted: number;
      recordsUpdated: number;
      recordsFailed: number;
      errors: Array<{ row: number; nim?: string; error: string }>;
    };
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Check Authentication
  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.replace("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.authenticated) {
          setCurrentUser(data.user);
          setAuthChecked(true);
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  // Fetch Data & Stats
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (prodiFilter) params.set("prodi", prodiFilter);
      if (regTypeFilter) params.set("registrationType", regTypeFilter);
      if (batchFilter) params.set("batch", batchFilter);
      if (pisnFilter) params.set("hasPisn", pisnFilter);
      if (cohortFilter) params.set("cohort", cohortFilter);
      if (yudisiumFilter) params.set("yudisiumDate", yudisiumFilter);
      if (entryPeriodFilter) params.set("entryPeriod", entryPeriodFilter);
      if (fileStatusFilter) params.set("fileStatus", fileStatusFilter);
      if (gpaRangeFilter) params.set("gpaRange", gpaRangeFilter);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("page", currentPage.toString());
      params.set("limit", pageSize.toString());

      const [resAlumni, resStats] = await Promise.all([
        fetch(`/api/v1/alumni?${params.toString()}`),
        fetch("/api/v1/alumni/stats"),
      ]);

      if (resAlumni.ok) {
        const json = await resAlumni.json();
        setGraduates(json.data || []);
        if (json.meta) {
          setTotalRecords(json.meta.total || 0);
          setTotalPages(json.meta.totalPages || 1);
        }
      }
      if (resStats.ok) {
        const jsonStats = await resStats.json();
        setStats(jsonStats.stats);
      }
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    prodiFilter,
    regTypeFilter,
    batchFilter,
    pisnFilter,
    cohortFilter,
    yudisiumFilter,
    entryPeriodFilter,
    fileStatusFilter,
    gpaRangeFilter,
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
  ]);

  // Reset page to 1 on filter or search or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    prodiFilter,
    regTypeFilter,
    batchFilter,
    pisnFilter,
    cohortFilter,
    yudisiumFilter,
    entryPeriodFilter,
    fileStatusFilter,
    gpaRangeFilter,
    sortBy,
    sortOrder,
  ]);

  // Handle Sort Toggle for Column Headers
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Render Table Header Sort Indicator
  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-80 transition inline-block ml-1" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 transition inline-block ml-1" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 transition inline-block ml-1" />
    );
  };

  useEffect(() => {
    if (authChecked) {
      fetchData();
    }
  }, [authChecked, fetchData]);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      router.push("/");
    } catch {
      router.push("/");
    }
  };

  const copyToClipboard = (pisn: string) => {
    navigator.clipboard.writeText(pisn);
    setCopiedPisn(pisn);
    setTimeout(() => setCopiedPisn(null), 2000);
  };

  const getOfficialSkFromDate = (dateStr: string): string => {
    if (dateStr === "2026-07-31") return "000.2/342/STIMI-YAPMI/MKS/VII/2026";
    if (dateStr === "2026-08-08") return "000.2/443/STIMI-YAPMI/MKS/VIII/2026";
    if (dateStr === "2026-09-04") return "000.2/493/STIMI-YAPMI/MKS/IX/2026";
    if (dateStr === "2026-09-17") return "000.2/511/STIMI-YAPMI/MKS/IX/2026";
    if (dateStr === "2026-09-18") return "000.2/512/STIMI-YAPMI/MKS/IX/2026";
    return "000.2/512/STIMI-YAPMI/MKS/IX/2026";
  };

  // Thesis Inline Editing Handlers
  const handleStartEditThesis = (alumni: AlumniRecord) => {
    setEditingThesisId(alumni.id);
    setEditingThesisTitle(alumni.thesisTitle || "");
  };

  const handleCancelEditThesis = () => {
    setEditingThesisId(null);
    setEditingThesisTitle("");
  };

  const handleSaveThesis = async (id: string) => {
    if (!editingThesisTitle.trim()) return;
    setIsSavingThesis(true);
    try {
      const res = await fetch(`/api/v1/alumni/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thesisTitle: editingThesisTitle.trim() }),
      });
      if (res.ok) {
        setGraduates((prev) =>
          prev.map((g) => (g.id === id ? { ...g, thesisTitle: editingThesisTitle.trim() } : g))
        );
        setEditingThesisId(null);
      }
    } catch (err) {
      console.error("Save thesis error:", err);
    } finally {
      setIsSavingThesis(false);
    }
  };

  // Handle Export Excel (.xlsx)
  const handleExportExcel = () => {
    setIsExporting(true);
    const params = new URLSearchParams();
    params.set("tab", activeTableTab);
    if (searchQuery) params.set("q", searchQuery);
    if (prodiFilter) params.set("prodi", prodiFilter);
    if (regTypeFilter) params.set("registrationType", regTypeFilter);
    if (batchFilter) params.set("batch", batchFilter);
    if (pisnFilter) params.set("hasPisn", pisnFilter);
    if (cohortFilter) params.set("cohort", cohortFilter);
    if (yudisiumFilter) params.set("yudisiumDate", yudisiumFilter);
    if (entryPeriodFilter) params.set("entryPeriod", entryPeriodFilter);
    if (fileStatusFilter) params.set("fileStatus", fileStatusFilter);
    if (gpaRangeFilter) params.set("gpaRange", gpaRangeFilter);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);

    window.location.href = `/api/v1/alumni/export?${params.toString()}`;
    setTimeout(() => setIsExporting(false), 2000);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    const defaultDate = new Date().toISOString().split("T")[0];
    setFormData({
      id: "",
      nim: "",
      fullName: "",
      prodiCode: "61201",
      prodiName: "S1 Manajemen",
      degree: "S1",
      registrationType: "PESERTA_DIDIK_BARU",
      entryPeriod: "2022-1",
      exitPeriod: "2025-2",
      yudisiumDate: defaultDate,
      yudisiumDecreeNumber: getOfficialSkFromDate(defaultDate),
      thesisTitle: "",
      pisnNumber: "",
      pisnBatchNumber: "",
      certificateNumber: "",
      gpa: "",
      phoneNumber: "",
      personalEmail: "",
    });
    setIjazahFile(null);
    setTranskripFile(null);
    setFormError("");
    setSelectedGraduate(null);
    setIsAddEditOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (alumni: AlumniRecord) => {
    setSelectedGraduate(alumni);
    setFormData({
      id: alumni.id,
      nim: alumni.nim,
      fullName: alumni.fullName,
      prodiCode: alumni.prodiCode || "61201",
      prodiName: alumni.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen",
      degree: alumni.degree || (alumni.prodiCode === "61101" ? "S2" : "S1"),
      registrationType: alumni.registrationType || "PESERTA_DIDIK_BARU",
      entryPeriod: alumni.entryPeriod || "2022-1",
      exitPeriod: alumni.exitPeriod || "2025-2",
      yudisiumDate: alumni.yudisiumDate ? alumni.yudisiumDate.split("T")[0] : "",
      yudisiumDecreeNumber: alumni.yudisiumDecreeNumber || "",
      thesisTitle: alumni.thesisTitle || "",
      pisnNumber: alumni.pisnNumber || "",
      pisnBatchNumber: alumni.pisnBatchNumber || "",
      certificateNumber: alumni.certificateNumber || "",
      gpa: alumni.gpa ? String(alumni.gpa) : "",
      phoneNumber: alumni.phoneNumber || "",
      personalEmail: alumni.personalEmail || "",
    });
    setIjazahFile(null);
    setTranskripFile(null);
    setFormError("");
    setIsAddEditOpen(true);
  };

  // Open In-App PDF Preview
  const handleOpenPreview = (alumni: AlumniRecord, defaultTab: "ijazah" | "transkrip" = "ijazah") => {
    setSelectedGraduate(alumni);
    setPreviewTab(defaultTab);
    setIsPreviewOpen(true);
  };

  // Handle Submit Add / Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nim || !formData.fullName || !formData.yudisiumDate) {
      setFormError("NIM, Nama Lengkap, dan Tanggal Yudisium wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const data = new FormData();
      data.append("nim", formData.nim);
      data.append("fullName", formData.fullName);
      data.append("prodiCode", formData.prodiCode);
      data.append("prodiName", formData.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen");
      data.append("registrationType", formData.registrationType);
      data.append("entryPeriod", formData.entryPeriod);
      data.append("exitPeriod", formData.exitPeriod);
      data.append("yudisiumDate", formData.yudisiumDate);
      data.append("yudisiumDecreeNumber", formData.yudisiumDecreeNumber);
      data.append("thesisTitle", formData.thesisTitle || "Telah memenuhi syarat kelulusan");
      data.append("pisnNumber", formData.pisnNumber);
      data.append("pisnBatchNumber", formData.pisnBatchNumber);
      data.append("certificateNumber", formData.certificateNumber);
      if (formData.gpa) data.append("gpa", formData.gpa);
      if (formData.phoneNumber) data.append("phoneNumber", formData.phoneNumber);
      if (formData.personalEmail) data.append("personalEmail", formData.personalEmail);

      if (ijazahFile) data.append("ijazahFile", ijazahFile);
      if (transkripFile) data.append("transkripFile", transkripFile);

      const url = formData.id ? `/api/v1/alumni/${formData.id}` : "/api/v1/alumni";
      const method = formData.id ? "PUT" : "POST";

      const res = await fetch(url, { method, body: data });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan data lulusan");
      }

      setIsAddEditOpen(false);
      fetchData();
    } catch (err: unknown) {
      setFormError((err as Error).message || "Terjadi kesalahan saat menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, nim: string) => {
    if (!confirm(`Hapus data lulusan NIM: ${nim}? Tindakan ini tidak dapat dibatalkan.`)) return;

    try {
      const res = await fetch(`/api/v1/alumni/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        const json = await res.json();
        alert(json.error || "Gagal menghapus data");
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus data");
    }
  };

  // Handle Batch Import (File or Paste)
  const handleBatchImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsImporting(true);
    setImportResult(null);

    try {
      const data = new FormData();
      if (importMode === "paste") {
        if (!rawTextPaste.trim()) {
          throw new Error("Silakan tempel teks data PISN terlebih dahulu.");
        }
        data.append("rawText", rawTextPaste);
      } else {
        if (!importFile) {
          throw new Error("Silakan pilih file spreadsheet terlebih dahulu.");
        }
        data.append("file", importFile);
      }

      const res = await fetch("/api/v1/alumni/batch-import", {
        method: "POST",
        body: data,
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal memproses data impor");
      }

      setImportResult(json);
      fetchData();
    } catch (err: unknown) {
      setImportResult({
        success: false,
        message: (err as Error).message || "Gagal mengimpor data",
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-mono">
        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
        <span>Memverifikasi sesi administrator...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans w-full">
      {/* ==================================================================== */}
      {/* 1. TOPBAR CONSOLE BANNER                                             */}
      {/* ==================================================================== */}
      <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold flex-shrink-0">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Konsol Repositori PISN & Kredensial
              </h1>
              <span className="text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded-full">
                Sesi Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              STIMI Yapmi Makassar · Prodi: S1 Manajemen & S2 Manajemen · Penyimpanan Server On-Premise
            </p>
          </div>
        </div>

        {/* User Session Profile & Logout */}
        <div className="flex items-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{currentUser?.fullName}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{currentUser?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            title="Keluar dari sesi BAAK"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-xs font-semibold transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. STATS OVERVIEW CARDS                                              */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Lulusan */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xs flex items-center justify-between transition hover:border-slate-300 dark:hover:border-white/20">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">Total Lulusan</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
              {stats?.totalGraduates ?? 0}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
              S1: {stats?.prodi.s1Manajemen ?? 0} · S2: {stats?.prodi.s2Manajemen ?? 0}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>

        {/* Ber-PISN */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xs flex items-center justify-between transition hover:border-emerald-200 dark:hover:border-emerald-500/20">
          <div className="flex-1 mr-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">PISN Kemdikbud</p>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {stats?.totalGraduates ? Math.round(((stats?.withPisn || 0) / stats.totalGraduates) * 100) : 0}%
              </span>
            </div>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {stats?.withPisn ?? 0}
            </h3>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${stats?.totalGraduates ? Math.round(((stats?.withPisn || 0) / stats.totalGraduates) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs flex-shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Scan Ijazah */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xs flex items-center justify-between transition hover:border-indigo-200 dark:hover:border-indigo-500/20">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">Arsip Scan Ijazah</p>
            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
              {stats?.withIjazah ?? 0}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Tersimpan di Hard Disk Server</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* Scan Transkrip */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xs flex items-center justify-between transition hover:border-cyan-200 dark:hover:border-cyan-500/20">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">Arsip Scan Transkrip</p>
            <h3 className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono mt-1">
              {stats?.withTranskrip ?? 0}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Tersimpan di Hard Disk Server</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-xs">
            <FileCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. TOOLBAR ACTIONS & LIVE FILTERS                                    */}
      {/* ==================================================================== */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xs space-y-3">
        {/* Row 1: Search & Primary Actions */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan NIM, Nama, No PISN, No SK Yudisium, atau Periode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Lulusan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setImportResult(null);
                setRawTextPaste("");
                setImportFile(null);
                setIsImportOpen(true);
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-semibold text-xs transition cursor-pointer"
            >
              <ClipboardPaste className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Impor Belmawa</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExporting || graduates.length === 0}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
              title="Unduh data tabel ke format Microsoft Excel (.xlsx)"
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              <span>Ekspor Excel ({graduates.length})</span>
            </button>

            <button
              type="button"
              onClick={fetchData}
              title="Perbarui Data"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-indigo-600 dark:text-indigo-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Row 2: Direct Primary Filter Dropdowns & Controls */}
        <div className="flex items-center justify-between gap-2.5 pt-2.5 border-t border-slate-200 dark:border-white/[0.06] text-xs flex-wrap">
          {/* Left: Direct Filter Dropdowns & Segments */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Angkatan (Direct Dropdown) */}
            <div className="flex items-center gap-1.5">
              <select
                value={cohortFilter}
                onChange={(e) => setCohortFilter(e.target.value)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition focus:outline-none ${
                  cohortFilter
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/40 dark:text-indigo-300 font-bold"
                    : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                }`}
                title="Saring berdasarkan tahun angkatan masuk"
              >
                <option value="">Semua Angkatan</option>
                {stats?.cohorts?.map((c) => (
                  <option key={c} value={c}>
                    Angkatan {c} {stats?.cohortCounts?.[c] ? `(${stats.cohortCounts[c]})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Tanggal Yudisium & SK (Direct Dropdown) */}
            <div className="flex items-center gap-1.5">
              <select
                value={yudisiumFilter}
                onChange={(e) => setYudisiumFilter(e.target.value)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition focus:outline-none ${
                  yudisiumFilter
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/40 dark:text-indigo-300 font-bold"
                    : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                }`}
                title="Saring berdasarkan tanggal yudisium & SK kelulusan"
              >
                <option value="">Semua Tanggal Yudisium</option>
                {stats?.yudisiumDates?.map((dateStr) => (
                  <option key={dateStr} value={dateStr}>
                    {formatYudisiumOption(dateStr)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status PISN Quick Toggle with Badges */}
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/5">
              <button
                type="button"
                onClick={() => setPisnFilter("")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  pisnFilter === ""
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Semua PISN ({stats?.totalGraduates || 187})
              </button>
              <button
                type="button"
                onClick={() => setPisnFilter("false")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  pisnFilter === "false"
                    ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                }`}
                title="Hanya tampilkan mahasiswa yang belum memiliki nomor PISN"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                <span>Belum PISN</span>
                <span className="text-[10px] px-1 py-0.2 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono font-bold">
                  {stats?.withoutPisn ?? 100}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPisnFilter("true")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  pisnFilter === "true"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
                title="Hanya tampilkan mahasiswa yang sudah memiliki nomor PISN resmi"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>Sudah PISN</span>
                <span className="text-[10px] px-1 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                  {stats?.withPisn ?? 87}
                </span>
              </button>
            </div>

            {/* Prodi Segmented */}
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/5">
              <button
                type="button"
                onClick={() => setProdiFilter("")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  prodiFilter === ""
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Semua Prodi
              </button>
              <button
                type="button"
                onClick={() => setProdiFilter("61201")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  prodiFilter === "61201"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                S1 Manajemen
              </button>
              <button
                type="button"
                onClick={() => setProdiFilter("61101")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  prodiFilter === "61101"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                S2 Manajemen
              </button>
            </div>

            {/* Jalur Segmented */}
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/5">
              <button
                type="button"
                onClick={() => setRegTypeFilter("")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  regTypeFilter === ""
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Semua Jalur
              </button>
              <button
                type="button"
                onClick={() => setRegTypeFilter("PESERTA_DIDIK_BARU")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  regTypeFilter === "PESERTA_DIDIK_BARU"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Peserta Baru
              </button>
              <button
                type="button"
                onClick={() => setRegTypeFilter("RPL_PEROLEHAN_SKS")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  regTypeFilter === "RPL_PEROLEHAN_SKS"
                    ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                RPL Perolehan
              </button>
              <button
                type="button"
                onClick={() => setRegTypeFilter("RPL_TRANSFER_SKS")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  regTypeFilter === "RPL_TRANSFER_SKS"
                    ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                RPL Transfer
              </button>
            </div>
          </div>

          {/* Right: Advanced Filter Popover & Sort */}
          <div className="flex items-center gap-2 relative">
            {/* Advanced Filter Popover Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                  activeAdvancedFiltersCount > 0
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-500/15 dark:border-indigo-500/30 dark:text-indigo-300"
                    : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <Filter className="h-3.5 w-3.5 text-indigo-500" />
                <span>Filter Lainnya</span>
                {activeAdvancedFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeAdvancedFiltersCount}
                  </span>
                )}
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isFilterPopoverOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Popover Dropdown Menu */}
              {isFilterPopoverOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsFilterPopoverOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl z-50 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-500" />
                        Filter Tambahan
                      </span>
                      {activeAdvancedFiltersCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setEntryPeriodFilter("");
                            setBatchFilter("");
                            setFileStatusFilter("");
                            setGpaRangeFilter("");
                          }}
                          className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* Periode Masuk */}
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Periode Masuk Spesifik
                        </label>
                        <select
                          value={entryPeriodFilter}
                          onChange={(e) => setEntryPeriodFilter(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Semua Periode Masuk</option>
                          {stats?.entryPeriods?.map((p) => (
                            <option key={p} value={p}>
                              Periode: {p}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Kode Batch Belmawa */}
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Kode Batch Belmawa
                        </label>
                        <select
                          value={batchFilter}
                          onChange={(e) => setBatchFilter(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Semua Batch</option>
                          {stats?.batches?.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status Berkas Digital */}
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Status Berkas Ijazah & Transkrip
                        </label>
                        <select
                          value={fileStatusFilter}
                          onChange={(e) => setFileStatusFilter(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Semua Status Berkas</option>
                          <option value="has_both">Lengkap (Ijazah + Transkrip)</option>
                          <option value="has_ijazah">Ada Ijazah Saja</option>
                          <option value="has_transkrip">Ada Transkrip Saja</option>
                          <option value="no_files">Belum Ada Berkas</option>
                        </select>
                      </div>

                      {/* Rentang IPK */}
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Rentang IPK
                        </label>
                        <select
                          value={gpaRangeFilter}
                          onChange={(e) => setGpaRangeFilter(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Semua Rentang IPK</option>
                          <option value="cumlaude">Cum Laude (≥ 3.75)</option>
                          <option value="sangat_memuaskan">Sangat Memuaskan (3.50 - 3.74)</option>
                          <option value="memuaskan">Memuaskan (&lt; 3.50)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsFilterPopoverOpen(false)}
                        className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        Terapkan & Tutup
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Compact Sort Dropdown */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split("-");
                setSortBy(f);
                setSortOrder(o as "asc" | "desc");
              }}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="nim-asc">Urutkan: NIM (Terkecil)</option>
              <option value="nim-desc">Urutkan: NIM (Terbesar)</option>
              <option value="name-asc">Urutkan: Nama (A → Z)</option>
              <option value="name-desc">Urutkan: Nama (Z → A)</option>
              <option value="yudisiumDate-desc">Urutkan: Yudisium (Terbaru)</option>
              <option value="yudisiumDate-asc">Urutkan: Yudisium (Terlama)</option>
              <option value="gpa-desc">Urutkan: IPK (Tertinggi)</option>
              <option value="gpa-asc">Urutkan: IPK (Terendah)</option>
              <option value="entryPeriod-desc">Urutkan: Masuk (Terbaru)</option>
              <option value="pisnNumber-desc">Urutkan: PISN Dahulu</option>
            </select>

            {/* Reset All Filters Button */}
            {(searchQuery || prodiFilter || regTypeFilter || pisnFilter || cohortFilter || yudisiumFilter || activeAdvancedFiltersCount > 0 || sortBy !== "nim" || sortOrder !== "asc") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setProdiFilter("");
                  setRegTypeFilter("");
                  setPisnFilter("");
                  setCohortFilter("");
                  setYudisiumFilter("");
                  setEntryPeriodFilter("");
                  setBatchFilter("");
                  setFileStatusFilter("");
                  setGpaRangeFilter("");
                  setSortBy("nim");
                  setSortOrder("asc");
                }}
                title="Reset semua pencarian & filter"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:underline transition ml-1 cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Quick Filter Preset Chips (Pintasan 1-Klik) */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-white/[0.04] text-[11px] flex-wrap">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" />
            <span>Pintas:</span>
          </span>

          {/* Chip 1: Belum PISN */}
          <button
            type="button"
            onClick={() => setPisnFilter(pisnFilter === "false" ? "" : "false")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
              pisnFilter === "false"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30"
            }`}
            title="Saring cepat: Mahasiswa yang belum memiliki PISN"
          >
            <span>🔴 Belum PISN</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${pisnFilter === "false" ? "bg-white/20 text-white" : "bg-rose-200/70 dark:bg-rose-500/30 text-rose-800 dark:text-rose-200"}`}>
              {stats?.withoutPisn ?? 100}
            </span>
            {pisnFilter === "false" && <X className="h-3 w-3 ml-0.5" />}
          </button>

          {/* Chip 2: Sudah PISN */}
          <button
            type="button"
            onClick={() => setPisnFilter(pisnFilter === "true" ? "" : "true")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
              pisnFilter === "true"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30"
            }`}
            title="Saring cepat: Mahasiswa yang sudah memiliki PISN resmi"
          >
            <span>🟢 Sudah PISN</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${pisnFilter === "true" ? "bg-white/20 text-white" : "bg-emerald-200/70 dark:bg-emerald-500/30 text-emerald-800 dark:text-emerald-200"}`}>
              {stats?.withPisn ?? 87}
            </span>
            {pisnFilter === "true" && <X className="h-3 w-3 ml-0.5" />}
          </button>

          {/* Chip 3: Yudisium 26 Sep 2026 */}
          {stats?.yudisiumDates?.includes("2026-09-26") && (
            <button
              type="button"
              onClick={() => setYudisiumFilter(yudisiumFilter === "2026-09-26" ? "" : "2026-09-26")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                yudisiumFilter === "2026-09-26"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30"
              }`}
              title="Saring cepat: Yudisium 26 Sep 2026 (SK 512)"
            >
              <span>🎓 Yudisium 26 Sep 2026</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${yudisiumFilter === "2026-09-26" ? "bg-white/20 text-white" : "bg-indigo-200/70 dark:bg-indigo-500/30 text-indigo-800 dark:text-indigo-200"}`}>
                {stats?.yudisiumCounts?.["2026-09-26"] || 60}
              </span>
              {yudisiumFilter === "2026-09-26" && <X className="h-3 w-3 ml-0.5" />}
            </button>
          )}

          {/* Chip 4: Yudisium 4 Sep 2026 */}
          {stats?.yudisiumDates?.includes("2026-09-04") && (
            <button
              type="button"
              onClick={() => setYudisiumFilter(yudisiumFilter === "2026-09-04" ? "" : "2026-09-04")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                yudisiumFilter === "2026-09-04"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
              }`}
              title="Saring cepat: Yudisium 4 Sep 2026 (SK 493)"
            >
              <span>Yudisium 4 Sep 2026</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${yudisiumFilter === "2026-09-04" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}`}>
                {stats?.yudisiumCounts?.["2026-09-04"] || 4}
              </span>
              {yudisiumFilter === "2026-09-04" && <X className="h-3 w-3 ml-0.5" />}
            </button>
          )}

          {/* Chip 5: Yudisium 8 Ags 2026 */}
          {stats?.yudisiumDates?.includes("2026-08-08") && (
            <button
              type="button"
              onClick={() => setYudisiumFilter(yudisiumFilter === "2026-08-08" ? "" : "2026-08-08")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                yudisiumFilter === "2026-08-08"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
              }`}
              title="Saring cepat: Yudisium 8 Ags 2026 (SK 443)"
            >
              <span>Yudisium 8 Ags 2026</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${yudisiumFilter === "2026-08-08" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}`}>
                {stats?.yudisiumCounts?.["2026-08-08"] || 18}
              </span>
              {yudisiumFilter === "2026-08-08" && <X className="h-3 w-3 ml-0.5" />}
            </button>
          )}

          {/* Chip 6: Yudisium 31 Jul 2026 */}
          {stats?.yudisiumDates?.includes("2026-07-31") && (
            <button
              type="button"
              onClick={() => setYudisiumFilter(yudisiumFilter === "2026-07-31" ? "" : "2026-07-31")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                yudisiumFilter === "2026-07-31"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10"
              }`}
              title="Saring cepat: Yudisium 31 Jul 2026 (SK 342)"
            >
              <span>Yudisium 31 Jul 2026</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${yudisiumFilter === "2026-07-31" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}`}>
                {stats?.yudisiumCounts?.["2026-07-31"] || 24}
              </span>
              {yudisiumFilter === "2026-07-31" && <X className="h-3 w-3 ml-0.5" />}
            </button>
          )}

          {/* Chip 7: Angkatan 2021 */}
          {stats?.cohorts?.includes("2021") && (
            <button
              type="button"
              onClick={() => setCohortFilter(cohortFilter === "2021" ? "" : "2021")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
                cohortFilter === "2021"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30"
              }`}
              title="Saring cepat: Angkatan 2021"
            >
              <span>Angkatan 2021</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${cohortFilter === "2021" ? "bg-white/20 text-white" : "bg-amber-200/70 dark:bg-amber-500/30 text-amber-800 dark:text-amber-200"}`}>
                {stats?.cohortCounts?.["2021"] || 67}
              </span>
              {cohortFilter === "2021" && <X className="h-3 w-3 ml-0.5" />}
            </button>
          )}

          {/* Chip 8: RPL Perolehan SKS */}
          <button
            type="button"
            onClick={() => setRegTypeFilter(regTypeFilter === "RPL_PEROLEHAN_SKS" ? "" : "RPL_PEROLEHAN_SKS")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer ${
              regTypeFilter === "RPL_PEROLEHAN_SKS"
                ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                : "bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-500/30"
            }`}
            title="Saring cepat: Jalur RPL Perolehan SKS"
          >
            <span>RPL Perolehan SKS</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${regTypeFilter === "RPL_PEROLEHAN_SKS" ? "bg-white/20 text-white" : "bg-sky-200/70 dark:bg-sky-500/30 text-sky-800 dark:text-sky-200"}`}>
              {stats?.registrationTypes?.rplPerolehan || 40}
            </span>
            {regTypeFilter === "RPL_PEROLEHAN_SKS" && <X className="h-3 w-3 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. TABLE VIEW SELECTOR & REPOSITORY DATA TABLES                      */}
      {/* ==================================================================== */}
      {/* Table Mode Selector (Tab PISN vs Tab Judul Skripsi) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2.5 flex-wrap gap-2">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/5">
          <button
            type="button"
            onClick={() => setActiveTableTab("pisn")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTableTab === "pisn"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Repositori PISN & Ijazah</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTableTab === "pisn" ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold" : "bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-semibold"}`}>
              {graduates.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTableTab("skripsi")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTableTab === "skripsi"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Judul Skripsi & Tesis</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTableTab === "skripsi" ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold" : "bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-semibold"}`}>
              {graduates.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="text-[11px]">
            Menampilkan <strong className="text-slate-900 dark:text-white font-mono">{graduates.length}</strong> data lulusan
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 backdrop-blur-xl shadow-xs overflow-hidden w-full">
        {activeTableTab === "skripsi" ? (
          /* TABEL KHUSUS JUDUL SKRIPSI & TESIS */
          <table className="w-full table-fixed text-left text-slate-700 dark:text-slate-300">
            <colgroup>
              <col className="w-[3.5%]" />  {/* 0. No */}
              <col className="w-[17%]" />   {/* 1. Mahasiswa */}
              <col className="w-[9%]" />    {/* 2. Prodi */}
              <col className="w-[31.5%]" /> {/* 3. Judul Skripsi */}
              <col className="w-[7%]" />    {/* 4. Masuk */}
              <col className="w-[7.5%]" />  {/* 5. Periode Keluar */}
              <col className="w-[7.5%]" />  {/* 6. Tahun Keluar */}
              <col className="w-[12%]" />   {/* 7. Yudisium & SK */}
              <col className="w-[5%]" />    {/* 8. Aksi */}
            </colgroup>

            <thead className="bg-slate-50 dark:bg-slate-950/80 text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="py-3 px-2 font-semibold text-center text-slate-500">No</th>
                <th className="py-3 px-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSort("name")}
                    className={`flex items-center gap-1 group transition cursor-pointer ${
                      sortBy === "name" || sortBy === "nim" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="Klik untuk mengurutkan Nama Mahasiswa"
                  >
                    <span>Mahasiswa</span>
                    {renderSortIcon("name")}
                  </button>
                </th>
                <th className="py-3 px-2 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSort("prodi")}
                    className={`flex items-center gap-1 group transition cursor-pointer ${
                      sortBy === "prodi" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>Prodi</span>
                    {renderSortIcon("prodi")}
                  </button>
                </th>
                <th className="py-3 px-3 font-semibold text-indigo-600 dark:text-indigo-400">
                  Judul Skripsi / Karya Ilmiah Mahasiswa
                </th>
                <th className="py-3 px-2 font-semibold text-center">
                  <button
                    type="button"
                    onClick={() => handleSort("entryPeriod")}
                    className={`inline-flex items-center gap-1 group transition cursor-pointer ${
                      sortBy === "entryPeriod" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="Periode Masuk Mahasiswa"
                  >
                    <span>Masuk</span>
                    {renderSortIcon("entryPeriod")}
                  </button>
                </th>
                <th className="py-3 px-2 font-semibold text-center">
                  <button
                    type="button"
                    onClick={() => handleSort("exitPeriod")}
                    className={`inline-flex items-center gap-1 group transition cursor-pointer ${
                      sortBy === "exitPeriod" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="Periode Keluar / Lulus"
                  >
                    <span>P. Keluar</span>
                    {renderSortIcon("exitPeriod")}
                  </button>
                </th>
                <th className="py-3 px-2 font-semibold text-center">
                  <button
                    type="button"
                    onClick={() => handleSort("graduationYear")}
                    className={`inline-flex items-center gap-1 group transition cursor-pointer ${
                      sortBy === "graduationYear" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="Tahun Keluar Kalender"
                  >
                    <span>Thn Keluar</span>
                    {renderSortIcon("graduationYear")}
                  </button>
                </th>
                <th className="py-3 px-2 font-semibold">
                  <button
                    type="button"
                    onClick={() => handleSort("yudisiumDate")}
                    className={`flex items-center gap-1 group transition cursor-pointer ${
                      sortBy === "yudisiumDate" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>Yudisium & SK</span>
                    {renderSortIcon("yudisiumDate")}
                  </button>
                </th>
                <th className="py-3 px-2 font-semibold text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {isLoading && graduates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 dark:text-indigo-400 mb-2" />
                    <p className="text-xs">Memuat repositori judul skripsi...</p>
                  </td>
                </tr>
              ) : graduates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <AlertCircle className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tidak ada data ditemukan</p>
                    <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci atau filter di atas.</p>
                  </td>
                </tr>
              ) : (
                graduates.map((alumni, idx) => (
                  <tr
                    key={alumni.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition duration-150 group"
                  >
                    {/* 0. No */}
                    <td className="py-3 px-2 text-center font-mono text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>

                    {/* 1. Mahasiswa */}
                    <td className="py-3 px-3">
                      <p
                        className="font-semibold text-xs text-slate-900 dark:text-white truncate block group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition"
                        title={alumni.fullName}
                      >
                        {alumni.fullName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {alumni.nim}
                        </span>
                        {alumni.gpa && (
                          <span
                            className={`font-mono text-[9px] font-bold px-1 rounded border ${
                              alumni.gpa >= 3.75
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20"
                                : alumni.gpa >= 3.5
                                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/20"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}
                            title={`IPK: ${alumni.gpa.toFixed(2)}`}
                          >
                            IPK {alumni.gpa.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 2. Prodi */}
                    <td className="py-3 px-2">
                      <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        {alumni.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen"}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        {alumni.degree || "S1"}
                      </span>
                    </td>

                    {/* 3. Judul Skripsi (Inline Editable & Clear Wide Text) */}
                    <td className="py-3 px-3">
                      {editingThesisId === alumni.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingThesisTitle}
                            onChange={(e) => setEditingThesisTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveThesis(alumni.id);
                              if (e.key === "Escape") handleCancelEditThesis();
                            }}
                            autoFocus
                            disabled={isSavingThesis}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-indigo-500 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none ring-2 ring-indigo-500/30"
                            placeholder="Ketik judul skripsi / karya ilmiah..."
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveThesis(alumni.id)}
                            disabled={isSavingThesis}
                            title="Simpan Judul Skripsi"
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex-shrink-0 cursor-pointer"
                          >
                            {isSavingThesis ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditThesis}
                            disabled={isSavingThesis}
                            title="Batal"
                            className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex-shrink-0 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleStartEditThesis(alumni)}
                          className="group/thesis flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/50 dark:border-white/[0.04] hover:border-indigo-300 dark:hover:border-indigo-500/30 cursor-pointer transition"
                          title="Klik untuk mengedit judul skripsi ini secara langsung"
                        >
                          <p className="text-xs text-slate-800 dark:text-slate-200 italic leading-relaxed break-words font-medium">
                            "{alumni.thesisTitle || "Belum ada judul skripsi - Klik untuk mengisi"}"
                          </p>
                          <button
                            type="button"
                            className="opacity-0 group-hover/thesis:opacity-100 p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded transition flex-shrink-0 cursor-pointer"
                            title="Edit Judul"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* 4. Periode Masuk */}
                    <td className="py-3 px-2 text-center">
                      <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">
                        {alumni.entryPeriod || "-"}
                      </span>
                    </td>

                    {/* 5. Periode Keluar */}
                    <td className="py-3 px-2 text-center">
                      <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">
                        {alumni.exitPeriod || "-"}
                      </span>
                    </td>

                    {/* 6. Tahun Keluar (Angka Tahun Kalender) */}
                    <td className="py-3 px-2 text-center">
                      <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.5 rounded-md shadow-2xs">
                        {getTahunKeluar(alumni)}
                      </span>
                    </td>

                    {/* 7. Tanggal Yudisium & SK */}
                    <td className="py-3 px-2">
                      <p className="font-mono text-[11px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {alumni.yudisiumDate ? new Date(alumni.yudisiumDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                      </p>
                      <p
                        className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5"
                        title={alumni.yudisiumDecreeNumber || ""}
                      >
                        {alumni.yudisiumDecreeNumber || "-"}
                      </p>
                    </td>

                    {/* 8. Aksi */}
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEditThesis(alumni)}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 transition cursor-pointer"
                        >
                          Ubah Judul
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(alumni)}
                          title="Lihat Detail Lengkap"
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          /* TABEL REPOSITORI PISN & STATUS IJAZAH (10 KOLOM DENGAN NOMOR URUT) */
        <table className="w-full table-fixed text-left text-slate-700 dark:text-slate-300">
          <colgroup>
            <col className="w-[3.5%]" /> {/* 0. No */}
            <col className="w-[18%]" />   {/* 1. Mahasiswa */}
            <col className="w-[12%]" />   {/* 2. Prodi & Jalur */}
            <col className="w-[6.5%]" />  {/* 3. Masuk */}
            <col className="w-[7%]" />    {/* 4. Periode Keluar */}
            <col className="w-[7.5%]" />  {/* 5. Tahun Keluar */}
            <col className="w-[16%]" />   {/* 6. Kelulusan & SK */}
            <col className="w-[17%]" />   {/* 7. PISN & Batch */}
            <col className="w-[6%]" />    {/* 8. Berkas */}
            <col className="w-[6.5%]" />  {/* 9. Aksi */}
          </colgroup>

          <thead className="bg-slate-50 dark:bg-slate-950/80 text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08]">
            <tr>
              <th className="py-3 px-2 font-semibold text-center text-slate-500">No</th>
              <th className="py-3 px-3 font-semibold">
                <button
                  type="button"
                  onClick={() => handleSort("name")}
                  className={`flex items-center gap-1 group transition cursor-pointer ${
                    sortBy === "name" || sortBy === "nim" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Klik untuk mengurutkan Nama Mahasiswa"
                >
                  <span>Mahasiswa</span>
                  {renderSortIcon("name")}
                </button>
              </th>
              <th className="py-3 px-2 font-semibold">
                <button
                  type="button"
                  onClick={() => handleSort("prodi")}
                  className={`flex items-center gap-1 group transition cursor-pointer ${
                    sortBy === "prodi" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Klik untuk mengurutkan Program Studi"
                >
                  <span>Prodi & Jalur</span>
                  {renderSortIcon("prodi")}
                </button>
              </th>
              <th className="py-3 px-2 font-semibold text-center">
                <button
                  type="button"
                  onClick={() => handleSort("entryPeriod")}
                  className={`inline-flex items-center gap-1 group transition cursor-pointer ${
                    sortBy === "entryPeriod" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Periode Masuk Mahasiswa"
                >
                  <span>Masuk</span>
                  {renderSortIcon("entryPeriod")}
                </button>
              </th>
              <th className="py-3 px-2 font-semibold text-center">
                <button
                  type="button"
                  onClick={() => handleSort("exitPeriod")}
                  className={`inline-flex items-center gap-1 group transition cursor-pointer ${
                    sortBy === "exitPeriod" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Periode Keluar / Lulus"
                >
                  <span>P. Keluar</span>
                  {renderSortIcon("exitPeriod")}
                </button>
              </th>
              <th className="py-3 px-2 font-semibold text-center">
                <button
                  type="button"
                  onClick={() => handleSort("graduationYear")}
                  className={`inline-flex items-center gap-1 group transition cursor-pointer ${
                    sortBy === "graduationYear" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Tahun Keluar Kalender"
                >
                  <span>Thn Keluar</span>
                  {renderSortIcon("graduationYear")}
                </button>
              </th>
              <th className="py-3 px-2 font-semibold">
                <button
                  type="button"
                  onClick={() => handleSort("yudisiumDate")}
                  className={`flex items-center gap-1 group transition cursor-pointer ${
                    sortBy === "yudisiumDate" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Klik untuk mengurutkan Tanggal Yudisium"
                >
                  <span>Kelulusan & SK</span>
                  {renderSortIcon("yudisiumDate")}
                </button>
              </th>
              <th className="py-3 px-2 font-semibold">
                <button
                  type="button"
                  onClick={() => handleSort("pisnNumber")}
                  className={`flex items-center gap-1 group transition cursor-pointer ${
                    sortBy === "pisnNumber" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Klik untuk mengurutkan Nomor PISN"
                >
                  <span>PISN & Batch</span>
                  {renderSortIcon("pisnNumber")}
                </button>
              </th>
              <th className="py-3 px-1 font-semibold text-center">Berkas</th>
              <th className="py-3 px-2 font-semibold text-right">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {isLoading && graduates.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 dark:text-indigo-400 mb-2" />
                  <p className="text-xs">Memuat data lulusan dari MongoDB...</p>
                </td>
              </tr>
            ) : graduates.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <AlertCircle className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tidak ada data ditemukan</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Coba ganti kata kunci pencarian atau ubah filter di atas.
                  </p>
                </td>
              </tr>
            ) : (
              graduates.map((alumni, idx) => (
                <tr
                  key={alumni.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition duration-150 group"
                >
                  {/* 0. No Urut */}
                  <td className="py-2.5 px-2 text-center font-mono text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>

                  {/* 1. Mahasiswa Info */}
                  <td className="py-2.5 px-3">
                    <p
                      className="font-semibold text-xs text-slate-900 dark:text-white truncate block group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition"
                      title={alumni.fullName}
                    >
                      {alumni.fullName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {alumni.nim}
                      </span>
                      {alumni.gpa && (
                        <span
                          className={`font-mono text-[9px] font-bold px-1 rounded border ${
                            alumni.gpa >= 3.75
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20"
                              : alumni.gpa >= 3.5
                              ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}
                          title={`Indeks Prestasi Kumulatif: ${alumni.gpa.toFixed(2)}`}
                        >
                          IPK {alumni.gpa.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 2. Program Studi & Jalur */}
                  <td className="py-2.5 px-2">
                    <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {alumni.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen"}
                    </span>
                    <div className="mt-0.5">
                      {alumni.registrationType === "RPL_PEROLEHAN_SKS" || alumni.registrationType === "RPL_KONVERSI_SKS" ? (
                        <span className="inline-block text-[10px] font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-1.5 py-0.2 rounded truncate">
                          RPL Perolehan
                        </span>
                      ) : alumni.registrationType === "RPL_TRANSFER_SKS" || alumni.registrationType === "KONVERSI_TRANSFER_NILAI" ? (
                        <span className="inline-block text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-1.5 py-0.2 rounded truncate">
                          RPL Transfer
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-1.5 py-0.2 rounded truncate">
                          Peserta Baru
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 3. Periode Masuk */}
                  <td className="py-2.5 px-2 text-center">
                    <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5">
                      {alumni.entryPeriod || "-"}
                    </span>
                  </td>

                  {/* 4. Periode Keluar */}
                  <td className="py-2.5 px-2 text-center">
                    <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/5">
                      {alumni.exitPeriod || "-"}
                    </span>
                  </td>

                  {/* 5. Tahun Keluar */}
                  <td className="py-2.5 px-2 text-center">
                    <span className="font-mono text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.5 rounded-md shadow-2xs">
                      {getTahunKeluar(alumni)}
                    </span>
                  </td>

                  {/* 6. Kelulusan & SK Yudisium */}
                  <td className="py-2.5 px-2">
                    <p className="text-[11px] font-semibold text-slate-900 dark:text-slate-100">
                      {alumni.yudisiumDate ? new Date(alumni.yudisiumDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate block max-w-[160px]"
                        title={alumni.yudisiumDecreeNumber || ""}
                      >
                        {alumni.yudisiumDecreeNumber || "-"}
                      </span>
                      {alumni.yudisiumDecreeNumber && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(alumni.yudisiumDecreeNumber!)}
                          title="Salin No SK Yudisium"
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 rounded transition flex-shrink-0 cursor-pointer"
                        >
                          <Copy className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* 5. Nomor PISN & Batch */}
                  <td className="py-2.5 px-2">
                    {alumni.pisnNumber ? (
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 truncate block">
                          {alumni.pisnNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(alumni.pisnNumber!)}
                          title="Salin Nomor PISN"
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition flex-shrink-0 cursor-pointer"
                        >
                          {copiedPisn === alumni.pisnNumber ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Belum Ada PISN</span>
                    )}
                    {alumni.pisnBatchNumber ? (
                      <p className="font-mono text-[9px] text-indigo-600 dark:text-indigo-400/90 mt-0.5 truncate" title={`Batch Belmawa: ${alumni.pisnBatchNumber}`}>
                        Batch: {alumni.pisnBatchNumber}
                      </p>
                    ) : (
                      <p className="text-[9px] text-slate-400 mt-0.5">Batch: -</p>
                    )}
                  </td>

                  {/* 6. Berkas Server */}
                  <td className="py-2.5 px-1">
                    <div className="flex items-center gap-1 justify-center">
                      {alumni.ijazahScan ? (
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(alumni, "ijazah")}
                          title="Lihat Scan Ijazah"
                          className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[9px] font-mono font-bold cursor-pointer"
                        >
                          IJZ
                        </button>
                      ) : (
                        <span className="px-1 py-0.5 rounded border border-dashed border-slate-200 dark:border-slate-800 text-[9px] font-mono text-slate-400" title="Ijazah belum diunggah">
                          -
                        </span>
                      )}

                      {alumni.transkripScan ? (
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(alumni, "transkrip")}
                          title="Lihat Scan Transkrip"
                          className="px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-[9px] font-mono font-bold cursor-pointer"
                        >
                          TRK
                        </button>
                      ) : (
                        <span className="px-1 py-0.5 rounded border border-dashed border-slate-200 dark:border-slate-800 text-[9px] font-mono text-slate-400" title="Transkrip belum diunggah">
                          -
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 7. Actions */}
                  <td className="py-2.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(alumni)}
                        title="Lihat Detail & Berkas"
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition cursor-pointer"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(alumni)}
                        title="Edit Data & Unggah Berkas"
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition cursor-pointer"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(alumni.id, alumni.nim)}
                        title="Hapus Data"
                        className="p-1 rounded bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-500/20 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        )}

        {/* Pagination & Footer Controls */}
        <div className="p-3 bg-slate-50/90 dark:bg-slate-950/90 border-t border-slate-200 dark:border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          {/* Sisi Kiri: Per Page Selector & Info Rentang */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Tampilkan:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.1] rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-sm"
              >
                <option value={25}>25 baris</option>
                <option value={50}>50 baris</option>
                <option value={100}>100 baris</option>
              </select>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {totalRecords > 0 ? (
                <>
                  Menampilkan{" "}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {(currentPage - 1) * pageSize + 1}
                  </strong>{" "}
                  -{" "}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {Math.min(currentPage * pageSize, totalRecords)}
                  </strong>{" "}
                  dari{" "}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {totalRecords}
                  </strong>{" "}
                  lulusan
                </>
              ) : (
                <span>0 lulusan ditemukan</span>
              )}
            </div>
          </div>

          {/* Sisi Kanan: Pagination Navigation Buttons */}
          <div className="flex items-center gap-1.5 w-full md:w-auto justify-center md:justify-end">
            {/* Tombol Sebelumnya */}
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1 || isLoading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            {/* Nomor Halaman */}
            <div className="flex items-center gap-1">
              {(() => {
                const pages: (number | string)[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  if (currentPage <= 4) {
                    pages.push(1, 2, 3, 4, 5, "...", totalPages);
                  } else if (currentPage >= totalPages - 3) {
                    pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
                  }
                }

                return pages.map((page, i) =>
                  typeof page === "number" ? (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      disabled={isLoading}
                      className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        currentPage === page
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                          : "border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-1 text-slate-400 select-none text-xs"
                    >
                      {page}
                    </span>
                  )
                );
              })()}
            </div>

            {/* Tombol Selanjutnya */}
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages || totalPages === 0 || isLoading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
              title="Halaman Selanjutnya"
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Footer Subtle Meta Bar */}
        <div className="py-2 px-4 bg-slate-100/70 dark:bg-slate-950/60 border-t border-slate-200/60 dark:border-white/[0.04] flex items-center justify-between text-[10px] text-slate-400">
          <span>
            Mode: <strong>{activeTableTab === "skripsi" ? "Repositori Judul Skripsi & Tesis" : "Repositori PISN & Arsip Ijazah"}</strong> · Data Lulusan S1 & S2 Manajemen STIMI YAPMI Makassar
          </span>
          <span className="font-mono">Total {totalRecords} Data Terindeks · Port 3022</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. MODAL: IN-APP DOCUMENT PREVIEW & DETAILS                          */}
      {/* ==================================================================== */}
      {isPreviewOpen && selectedGraduate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-4xl w-full h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  {selectedGraduate.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {selectedGraduate.fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono">NIM: {selectedGraduate.nim}</span>
                    <span>·</span>
                    <span>{selectedGraduate.prodiName}</span>
                    <span>·</span>
                    <span>
                      {selectedGraduate.registrationType === "RPL_PEROLEHAN_SKS" ||
                      selectedGraduate.registrationType === "RPL_KONVERSI_SKS"
                        ? "RPL Perolehan SKS"
                        : selectedGraduate.registrationType === "RPL_TRANSFER_SKS"
                        ? "RPL Transfer SKS"
                        : selectedGraduate.registrationType === "KONVERSI_TRANSFER_NILAI"
                        ? "Perolehan SKS (Transfer Nilai)"
                        : "Peserta Didik Baru"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* PISN Banner & Academic Timeline in Modal */}
            <div className="py-2.5 px-4 bg-slate-100/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 dark:text-slate-400">PISN:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedGraduate.pisnNumber || "Belum ada PISN"}
                </span>
                {selectedGraduate.pisnBatchNumber && (
                  <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                    Batch: {selectedGraduate.pisnBatchNumber}
                  </span>
                )}
                <span className="text-slate-400">|</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Masuk: <strong>{selectedGraduate.entryPeriod || "-"}</strong>
                </span>
                <span className="text-slate-400">→</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Lulus: <strong>{selectedGraduate.exitPeriod || "-"}</strong>
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Yudisium: <strong>{selectedGraduate.yudisiumDate ? new Date(selectedGraduate.yudisiumDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}</strong>
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500 dark:text-slate-400">
                  SK: <strong>{selectedGraduate.yudisiumDecreeNumber || "-"}</strong>
                </span>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewTab("ijazah")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    previewTab === "ijazah"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Scan Ijazah
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("transkrip")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    previewTab === "transkrip"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Scan Transkrip
                </button>
              </div>
            </div>

            {/* PDF Viewer Frame */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex flex-col">
              {previewTab === "ijazah" ? (
                selectedGraduate.ijazahScan ? (
                  <iframe
                    src={`/api/v1/credentials/${selectedGraduate.id}/preview?type=ijazah`}
                    className="w-full h-full border-0"
                    title="Pratinjau Ijazah"
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 dark:text-slate-400">
                    <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Scan Ijazah belum diunggah ke server
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Gunakan tombol Edit pada tabel untuk mengunggah file PDF pindaian ijazah asli ke direktori server lokal.
                    </p>
                  </div>
                )
              ) : selectedGraduate.transkripScan ? (
                <iframe
                  src={`/api/v1/credentials/${selectedGraduate.id}/preview?type=transkrip`}
                  className="w-full h-full border-0"
                  title="Pratinjau Transkrip"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 dark:text-slate-400">
                  <FileCheck className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Scan Transkrip belum diunggah ke server
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Gunakan tombol Edit pada tabel untuk mengunggah file PDF pindaian transkrip nilai resmi ke direktori server lokal.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Bottom Metadata */}
            <div className="p-3 px-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="truncate max-w-md">
                Judul Skripsi: <i>"{selectedGraduate.thesisTitle || "-"}"</i>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsPreviewOpen(false);
                  handleOpenEdit(selectedGraduate);
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Edit / Unggah Berkas Baru →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. MODAL: ADD / EDIT GRADUATE FORM                                   */}
      {/* ==================================================================== */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-3xl w-full max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {formData.id ? "Edit Data Lulusan & Berkas" : "Tambah Lulusan Baru"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Isi data akademik, jenis pendaftar, periode masuk/keluar (contoh: 2022-1), PISN, dan berkas pindaian.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEditOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Row 1: NIM, Nama */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NIM Mahasiswa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2261201003"
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama sesuai ijazah..."
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Row 2: Program Studi & Jenis Pendaftar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Program Studi
                  </label>
                  <select
                    value={formData.prodiCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prodiCode: e.target.value,
                        prodiName: e.target.value === "61101" ? "S2 Manajemen" : "S1 Manajemen",
                        degree: e.target.value === "61101" ? "S2" : "S1",
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="61201">S1 Manajemen (Strata 1)</option>
                    <option value="61101">S2 Manajemen (Magister)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Pendaftar
                  </label>
                  <select
                    value={formData.registrationType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registrationType: e.target.value as
                          | "PESERTA_DIDIK_BARU"
                          | "RPL_PEROLEHAN_SKS"
                          | "RPL_TRANSFER_SKS"
                          | "RPL_KONVERSI_SKS"
                          | "KONVERSI_TRANSFER_NILAI",
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PESERTA_DIDIK_BARU">Peserta Didik Baru</option>
                    <option value="RPL_PEROLEHAN_SKS">RPL Perolehan SKS</option>
                    <option value="RPL_TRANSFER_SKS">RPL Transfer SKS</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Periode Masuk & Periode Keluar (Format Kompak YYYY-S) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Periode Masuk (Contoh: 2022-1)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 2022-1"
                    value={formData.entryPeriod}
                    onChange={(e) => setFormData({ ...formData, entryPeriod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Periode Keluar (Contoh: 2025-2)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 2025-2"
                    value={formData.exitPeriod}
                    onChange={(e) => setFormData({ ...formData, exitPeriod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Row 4: Tanggal Yudisium & Nomor SK Yudisium */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Yudisium *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.yudisiumDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setFormData({
                        ...formData,
                        yudisiumDate: newDate,
                        yudisiumDecreeNumber: getOfficialSkFromDate(newDate),
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor SK Yudisium
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 042/SK-YUD/STIMI/IX/2026"
                    value={formData.yudisiumDecreeNumber}
                    onChange={(e) => setFormData({ ...formData, yudisiumDecreeNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Row 5: Judul Skripsi / Tesis */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Skripsi / Tugas Akhir / Tesis
                </label>
                <textarea
                  rows={2}
                  placeholder="Judul skripsi atau karya ilmiah kelulusan..."
                  value={formData.thesisTitle}
                  onChange={(e) => setFormData({ ...formData, thesisTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Row 6: PISN & Batch Belmawa */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-3">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 block font-mono">
                  Identitas Penomoran Ijazah Nasional (PISN Belmawa)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      Nomor PISN (21 Digit)
                    </label>
                    <input
                      type="text"
                      placeholder="093046612012026100074"
                      value={formData.pisnNumber}
                      onChange={(e) => setFormData({ ...formData, pisnNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      Nomor / Kode Batch Kemdikbud
                    </label>
                    <input
                      type="text"
                      placeholder="NI-09304661201266"
                      value={formData.pisnBatchNumber}
                      onChange={(e) => setFormData({ ...formData, pisnBatchNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row 7: Berkas Upload Scan (Local Disk Server) */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-3">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block font-mono">
                  Unggah Berkas Scan ke Hard Disk Server (PDF)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      File Scan Ijazah (.pdf, maks 10MB)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setIjazahFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      File Scan Transkrip (.pdf, maks 10MB)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setTranskripFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan ke Server..." : "Simpan Data Lulusan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. MODAL: BATCH IMPORT (EXCEL / RAW BELMAWA TEXT)                     */}
      {/* ==================================================================== */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-2xl w-full max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Impor Data Penomoran Ijazah Nasional (PISN Belmawa)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tempel teks hasil unduh Belmawa Dikti atau unggah file spreadsheet .xlsx
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="px-4 pt-3 pb-2 bg-slate-100/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-2">
              <button
                type="button"
                onClick={() => setImportMode("paste")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  importMode === "paste"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900"
                }`}
              >
                Tempel Teks Belmawa (Multi-Batch)
              </button>
              <button
                type="button"
                onClick={() => setImportMode("file")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  importMode === "file"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900"
                }`}
              >
                Unggah File Spreadsheet (.xlsx)
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleBatchImport} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {importResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs border ${
                    importResult.success
                      ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  <p className="font-semibold">{importResult.message}</p>
                  {importResult.summary && (
                    <div className="mt-2 text-[11px] font-mono space-y-0.5">
                      <p>Total Baris Diproses: {importResult.summary.totalRows}</p>
                      <p>Data Baru Tersimpan: {importResult.summary.recordsInserted}</p>
                      <p>Data Terperbarui: {importResult.summary.recordsUpdated}</p>
                      <p>Baris Gagal: {importResult.summary.recordsFailed}</p>
                    </div>
                  )}
                </div>
              )}

              {importMode === "paste" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tempel Teks Ekspor Belmawa di Bawah:
                  </label>
                  <textarea
                    rows={10}
                    placeholder="Contoh:&#10;Nomor Batch: ,NI-09304661201266&#10;Tanggal Generate Nomor: ,13-02-2026 14:00:00&#10;NIM,Nama Mahasiswa,Nomor Ijazah,Keterangan&#10;2261201003,NURHIKMAH,093046612012026100074,PISN terbit"
                    value={rawTextPaste}
                    onChange={(e) => setRawTextPaste(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Sistem otomatis mendeteksi blok header Nomor Batch dan mengurai setiap baris mahasiswa dengan periode format kompak (YYYY-1).
                  </p>
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-indigo-500/50 rounded-2xl text-center space-y-3 bg-slate-50/50 dark:bg-slate-950/40 transition">
                  <FileSpreadsheet className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Pilih file spreadsheet Excel Belmawa
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Mendukung kolom: NIM, Nama Lengkap, Jenis Pendaftar, Periode Masuk, Periode Keluar, No SK Yudisium, Tanggal Yudisium, Nomor PISN, Nomor Batch (.xlsx)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="text-xs text-slate-600 dark:text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsImportOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={isImporting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
                >
                  {isImporting ? "Memproses Data..." : "Mulai Impor Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
