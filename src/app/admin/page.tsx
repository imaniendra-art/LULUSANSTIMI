"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardView } from "@/components/admin/DashboardView";
import { UploadDecreeModal } from "@/components/admin/UploadDecreeModal";
import { GeneratePisnModal } from "@/components/admin/GeneratePisnModal";
import { SiamApiModal } from "@/components/admin/SiamApiModal";
import { AdminSettingsView } from "@/components/admin/AdminSettingsView";
import {
  LayoutDashboard,
  UploadCloud,
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
  Sparkles,
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
  Loader2,
  Lock,
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
  cohortYear?: number | null;
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
  hasDecreePdf?: boolean;
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
  cohortPisnStats?: Record<string, { total: number; withPisn: number; withoutPisn: number }>;
  cohortThesisStats?: Record<string, { total: number; withThesis: number; withoutThesis: number }>;
  cohortFileStats?: Record<string, { total: number; withIjazah: number; withoutIjazah: number }>;
  thesisStats?: { total: number; withThesis: number; withoutThesis: number };
  fileStats?: { total: number; withIjazah: number; withoutIjazah: number; withTranskrip: number; withoutTranskrip: number };
  graduationYears?: string[];
  graduationYearCounts?: Record<string, number>;
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

// Reusable Smooth Rounded Filter Dropdown (Bebas dari sudut tajam & responsif)
function FilterDropdown<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Pilih",
  className = "",
  panelWidth = "min-w-[180px]",
  align = "left",
  title,
  isActive,
}: {
  value: T;
  onChange: (val: T) => void;
  options: Array<{ value: T; label: string }>;
  placeholder?: string;
  className?: string;
  panelWidth?: string;
  align?: "left" | "right";
  title?: string;
  isActive?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((o) => o.value === value);
  const isHighlighted = isActive !== undefined ? isActive : Boolean(value);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        title={title}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition focus:outline-none ${
          isHighlighted
            ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/40 dark:text-indigo-300 font-bold shadow-2xs"
            : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        <span className="truncate max-w-[160px] text-left">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180 text-indigo-500" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-1.5 ${panelWidth} max-w-[340px] p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-xl z-50 max-h-64 overflow-y-auto space-y-0.5`}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition cursor-pointer ${
                  active
                    ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {active && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminConsoleContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const filterParam = searchParams.get("filter");

  const mainTab: "dashboard" | "repo" | "settings" =
    tabParam === "settings"
      ? "settings"
      : tabParam === "repo" || tabParam === "pisn" || tabParam === "skripsi" || tabParam === "berkas"
      ? "repo"
      : "dashboard";
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
  const [thesisFilter, setThesisFilter] = useState<"" | "true" | "false">("");
  const [cohortFilter, setCohortFilter] = useState("");
  const [yudisiumFilter, setYudisiumFilter] = useState("");
  const [graduationYearFilter, setGraduationYearFilter] = useState("");
  const [entryPeriodFilter, setEntryPeriodFilter] = useState("");
  const [fileStatusFilter, setFileStatusFilter] = useState("");
  const [gpaRangeFilter, setGpaRangeFilter] = useState("");
  const [sortBy, setSortBy] = useState("nim");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [copiedPisn, setCopiedPisn] = useState<string | null>(null);

  // Tab Mode: Menu PISN vs IPK & Judul Skripsi vs Ijazah & SK Yudisium
  const [activeTableTab, setActiveTableTab] = useState<"pisn" | "skripsi" | "berkas">("pisn");
  const [uploadedDecrees, setUploadedDecrees] = useState<Record<string, { fileName: string; size: number }>>({});
  const [isUploadDecreeModalOpen, setIsUploadDecreeModalOpen] = useState(false);
  const [isGeneratePisnModalOpen, setIsGeneratePisnModalOpen] = useState(false);
  const [selectedDecreeForUpload, setSelectedDecreeForUpload] = useState("");
  const [selectedYudisiumDateForUpload, setSelectedYudisiumDateForUpload] = useState("");
  const [cascadeConfirmData, setCascadeConfirmData] = useState<{
    isOpen: boolean;
    alumniId: string;
    nim: string;
    fullName: string;
    yudisiumDateStr: string;
    decreeNumber: string;
    sameDateCount: number;
  } | null>(null);

  const fetchDecrees = async () => {
    try {
      const res = await fetch("/api/v1/yudisium-decree", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.decrees) {
        setUploadedDecrees(json.decrees);
      }
    } catch (e) {
      console.error("Fetch decrees status error:", e);
    }
  };

  const getSafeKey = (sk?: string) => (sk || "").replace(/[/\\?%*:|"<>]/g, "_").trim();

  const checkIsDecreeUploaded = (alumni: AlumniRecord) => {
    if (alumni.hasDecreePdf) return true;
    if (!alumni.yudisiumDecreeNumber) return false;
    const sk = alumni.yudisiumDecreeNumber.trim();
    const safeKey = getSafeKey(sk);
    if (uploadedDecrees[safeKey]) return true;

    const targetNorm = safeKey.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (targetNorm) {
      for (const k of Object.keys(uploadedDecrees)) {
        if (k.toLowerCase().replace(/[^a-z0-9]/g, "") === targetNorm) {
          return true;
        }
      }
    }

    if (alumni.yudisiumDate && stats?.yudisiumSkMap) {
      const dateStr = alumni.yudisiumDate.split("T")[0];
      const mappedSk = stats.yudisiumSkMap[dateStr];
      if (mappedSk) {
        const mappedSafe = getSafeKey(mappedSk);
        if (uploadedDecrees[mappedSafe]) return true;
        const mappedNorm = mappedSafe.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (mappedNorm) {
          for (const k of Object.keys(uploadedDecrees)) {
            if (k.toLowerCase().replace(/[^a-z0-9]/g, "") === mappedNorm) return true;
          }
        }
      }
    }

    return false;
  };

  const [editingThesisId, setEditingThesisId] = useState<string | null>(null);
  const [editingThesisTitle, setEditingThesisTitle] = useState<string>("");
  const [isSavingThesis, setIsSavingThesis] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState<boolean>(false);
  const filterPopoverRef = useRef<HTMLDivElement>(null);

  // Click outside listener for filter popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(event.target as Node)) {
        setIsFilterPopoverOpen(false);
      }
    }
    if (isFilterPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterPopoverOpen]);

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

  const hasActiveFilters = Boolean(
    searchQuery ||
    prodiFilter ||
    regTypeFilter ||
    pisnFilter ||
    thesisFilter ||
    cohortFilter ||
    yudisiumFilter ||
    graduationYearFilter ||
    entryPeriodFilter ||
    batchFilter ||
    fileStatusFilter ||
    gpaRangeFilter
  );

  const totalMasterCount = stats?.totalGraduates || 187;

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

  // Memoized Filter Options untuk Dropdown Custom Bebas Tajam
  const cohortOptions = useMemo(
    () => [
      { value: "", label: "Semua Angkatan" },
      ...(stats?.cohorts?.map((c) => ({
        value: c,
        label: `Angkatan ${c}${stats?.cohortCounts?.[c] ? ` (${stats.cohortCounts[c]})` : ""}`,
      })) || []),
    ],
    [stats?.cohorts, stats?.cohortCounts]
  );

  const yudisiumOptions = useMemo(
    () => [
      { value: "", label: "Semua Tanggal Yudisium" },
      ...(stats?.yudisiumDates?.map((dateStr) => ({
        value: dateStr,
        label: formatYudisiumOption(dateStr),
      })) || []),
    ],
    [stats?.yudisiumDates, stats?.yudisiumCounts, stats?.yudisiumSkMap]
  );

  const graduationYearOptions = useMemo(
    () => [
      { value: "", label: "Semua Tahun Keluar" },
      ...(stats?.graduationYears?.map((y) => ({
        value: y,
        label: `Tahun ${y}${stats?.graduationYearCounts?.[y] ? ` (${stats.graduationYearCounts[y]})` : ""}`,
      })) || []),
    ],
    [stats?.graduationYears, stats?.graduationYearCounts]
  );

  const prodiOptions = useMemo(
    () => [
      { value: "", label: "Semua Prodi" },
      { value: "61201", label: "S1 Manajemen" },
      { value: "61101", label: "S2 Manajemen" },
    ],
    []
  );

  const regTypeOptions = useMemo(
    () => [
      { value: "", label: "Semua Jalur" },
      { value: "PESERTA_DIDIK_BARU", label: "Peserta Didik Baru" },
      { value: "RPL_PEROLEHAN_SKS", label: "RPL Perolehan SKS" },
      { value: "RPL_TRANSFER_SKS", label: "RPL Transfer SKS" },
    ],
    []
  );

  const sortOptions = useMemo(
    () => [
      { value: "nim-asc", label: "Urut: NIM (Terkecil)" },
      { value: "nim-desc", label: "Urut: NIM (Terbesar)" },
      { value: "name-asc", label: "Urut: Nama (A → Z)" },
      { value: "name-desc", label: "Urut: Nama (Z → A)" },
      { value: "yudisiumDate-desc", label: "Urut: Yudisium (Terbaru)" },
      { value: "yudisiumDate-asc", label: "Urut: Yudisium (Terlama)" },
      { value: "graduationYear-desc", label: "Urut: Tahun Keluar (Terbaru)" },
      { value: "graduationYear-asc", label: "Urut: Tahun Keluar (Terlama)" },
      { value: "gpa-desc", label: "Urut: IPK (Tertinggi)" },
      { value: "gpa-asc", label: "Urut: IPK (Terendah)" },
      { value: "entryPeriod-desc", label: "Urut: Periode Masuk (Terbaru)" },
      { value: "pisnNumber-desc", label: "Urut: PISN Dahulu" },
    ],
    []
  );

  const [isSiamModalOpen, setIsSiamModalOpen] = useState(false);

  useEffect(() => {
    fetchDecrees();
  }, []);

  useEffect(() => {
    fetchDecrees();
    if (tabParam === "skripsi" || filterParam === "skripsi") {
      setActiveTableTab("skripsi");
      setPisnFilter("");
      setFileStatusFilter("");
    } else if (tabParam === "berkas") {
      setActiveTableTab("berkas");
      setPisnFilter("");
      setThesisFilter("");
    } else if (tabParam === "pisn" || (tabParam === "repo" && filterParam !== "skripsi")) {
      setActiveTableTab("pisn");
      setThesisFilter("");
      setFileStatusFilter("");
    }
  }, [tabParam, filterParam]);

  const handleSwitchTab = (
    tab: "dashboard" | "repo" | "import" | "pisn" | "skripsi" | "berkas",
    tableTab?: "pisn" | "skripsi" | "berkas"
  ) => {
    if (tab === "dashboard") {
      router.push("/admin");
    } else if (tab === "pisn") {
      setActiveTableTab("pisn");
      setThesisFilter("");
      setFileStatusFilter("");
      router.push("/admin?tab=pisn");
    } else if (tab === "skripsi") {
      setActiveTableTab("skripsi");
      setPisnFilter("");
      setFileStatusFilter("");
      router.push("/admin?tab=skripsi");
    } else if (tab === "berkas") {
      setActiveTableTab("berkas");
      setPisnFilter("");
      setThesisFilter("");
      router.push("/admin?tab=berkas");
    } else {
      if (tableTab === "skripsi") {
        setActiveTableTab("skripsi");
        setPisnFilter("");
        setFileStatusFilter("");
        router.push("/admin?tab=skripsi");
      } else if (tableTab === "berkas") {
        setActiveTableTab("berkas");
        setPisnFilter("");
        setThesisFilter("");
        router.push("/admin?tab=berkas");
      } else {
        setActiveTableTab("pisn");
        setThesisFilter("");
        setFileStatusFilter("");
        router.push("/admin?tab=pisn");
      }
    }
  };

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
    cohortYear: 2022,
    yudisiumDate: new Date().toISOString().split("T")[0],
    yudisiumDecreeNumber: "",
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

  // Fetch Data & Stats (supports silent background re-fetch without table flicker)
  const fetchData = useCallback(async (opts?: boolean | { silent?: boolean } | unknown) => {
    const silent = opts === true || (typeof opts === "object" && opts !== null && "silent" in opts && Boolean((opts as { silent?: boolean }).silent));
    if (!silent) setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (prodiFilter) params.set("prodi", prodiFilter);
      if (regTypeFilter) params.set("registrationType", regTypeFilter);
      if (batchFilter) params.set("batch", batchFilter);
      if (pisnFilter) params.set("hasPisn", pisnFilter);
      if (thesisFilter) params.set("hasThesis", thesisFilter);
      if (cohortFilter) params.set("cohort", cohortFilter);
      if (yudisiumFilter) params.set("yudisiumDate", yudisiumFilter);
      if (graduationYearFilter) params.set("year", graduationYearFilter);
      if (entryPeriodFilter) params.set("entryPeriod", entryPeriodFilter);
      if (fileStatusFilter) params.set("fileStatus", fileStatusFilter);
      if (gpaRangeFilter) params.set("gpaRange", gpaRangeFilter);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("page", currentPage.toString());
      params.set("limit", pageSize.toString());

      const [resAlumni, resStats, resDecrees] = await Promise.all([
        fetch(`/api/v1/alumni?${params.toString()}`, { cache: "no-store" }),
        fetch("/api/v1/alumni/stats", { cache: "no-store" }),
        fetch("/api/v1/yudisium-decree", { cache: "no-store" }),
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
      if (resDecrees.ok) {
        const jsonDecrees = await resDecrees.json();
        if (jsonDecrees.success && jsonDecrees.decrees) {
          setUploadedDecrees(jsonDecrees.decrees);
        }
      }
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [
    searchQuery,
    prodiFilter,
    regTypeFilter,
    batchFilter,
    pisnFilter,
    thesisFilter,
    cohortFilter,
    yudisiumFilter,
    graduationYearFilter,
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
    thesisFilter,
    cohortFilter,
    yudisiumFilter,
    graduationYearFilter,
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

  const getOfficialSkFromDate = (_dateStr: string): string => {
    return "";
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

  // Handle Export Excel (.xlsx) - Smart Contextual Export
  const handleExportExcel = (scope: "filtered" | "all" = "filtered") => {
    setIsExporting(true);
    const params = new URLSearchParams();
    params.set("tab", activeTableTab);
    
    if (scope === "all") {
      params.set("scope", "all");
    } else {
      if (searchQuery) params.set("q", searchQuery);
      if (prodiFilter) params.set("prodi", prodiFilter);
      if (regTypeFilter) params.set("registrationType", regTypeFilter);
      if (batchFilter) params.set("batch", batchFilter);
      if (pisnFilter) params.set("hasPisn", pisnFilter);
      if (thesisFilter) params.set("hasThesis", thesisFilter);
      if (cohortFilter) params.set("cohort", cohortFilter);
      if (yudisiumFilter) params.set("yudisiumDate", yudisiumFilter);
      if (graduationYearFilter) params.set("year", graduationYearFilter);
      if (entryPeriodFilter) params.set("entryPeriod", entryPeriodFilter);
      if (fileStatusFilter) params.set("fileStatus", fileStatusFilter);
      if (gpaRangeFilter) params.set("gpaRange", gpaRangeFilter);
    }

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
      cohortYear: 2022,
      yudisiumDate: defaultDate,
      yudisiumDecreeNumber: "",
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
      cohortYear: alumni.cohortYear || (alumni.entryPeriod ? parseInt(alumni.entryPeriod.slice(0, 4), 10) : (alumni.nim.startsWith("221") ? 2021 : (parseInt(alumni.nim.slice(0, 2), 10) ? 2000 + parseInt(alumni.nim.slice(0, 2), 10) : 2022))),
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

    if (formData.pisnNumber && formData.pisnNumber.trim().length > 0 && formData.pisnNumber.trim().length !== 21) {
      setFormError(`Nomor PISN Belmawa harus tepat 21 digit (saat ini ${formData.pisnNumber.trim().length} digit). Kosongkan jika belum diterbitkan oleh Belmawa.`);
      return;
    }

    const isEdit = Boolean(formData.id);
    const dateKey = formData.yudisiumDate;
    const sameDateCount = stats?.yudisiumCounts?.[dateKey] || 0;
    const skChanged = (formData.yudisiumDecreeNumber || "").trim() !== (selectedGraduate?.yudisiumDecreeNumber || "").trim();

    if (isEdit && skChanged && sameDateCount > 1) {
      setCascadeConfirmData({
        isOpen: true,
        alumniId: formData.id,
        nim: formData.nim,
        fullName: formData.fullName,
        yudisiumDateStr: formData.yudisiumDate,
        decreeNumber: (formData.yudisiumDecreeNumber || "").trim(),
        sameDateCount,
      });
      return;
    }

    await doSubmitForm(false);
  };

  const handleExecuteSaveWithCascade = async (cascadeToAll: boolean) => {
    setCascadeConfirmData(null);
    await doSubmitForm(cascadeToAll);
  };

  const doSubmitForm = async (cascadeSameDate: boolean) => {
    setIsSubmitting(true);
    setFormError("");

    try {
      const data = new FormData();
      data.append("nim", formData.nim);
      data.append("fullName", formData.fullName);
      data.append("prodiCode", formData.prodiCode);
      data.append("prodiName", formData.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen");
      data.append("registrationType", formData.registrationType);
      if (formData.cohortYear) data.append("cohortYear", String(formData.cohortYear));
      data.append("entryPeriod", formData.entryPeriod);
      data.append("exitPeriod", formData.exitPeriod);
      data.append("yudisiumDate", formData.yudisiumDate);
      data.append("yudisiumDecreeNumber", formData.yudisiumDecreeNumber);
      data.append("thesisTitle", formData.thesisTitle || "");
      data.append("pisnNumber", formData.pisnNumber);
      data.append("pisnBatchNumber", formData.pisnBatchNumber);
      data.append("certificateNumber", formData.certificateNumber);
      if (formData.gpa) data.append("gpa", formData.gpa);
      if (formData.phoneNumber) data.append("phoneNumber", formData.phoneNumber);
      if (formData.personalEmail) data.append("personalEmail", formData.personalEmail);
      if (cascadeSameDate) data.append("cascadeSameDate", "true");

      if (ijazahFile) data.append("ijazahFile", ijazahFile);
      if (transkripFile) data.append("transkripFile", transkripFile);

      const isEdit = Boolean(formData.id);
      const url = isEdit ? `/api/v1/alumni/${formData.id}` : "/api/v1/alumni";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, { method, body: data });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan data lulusan");
      }

      // Optimistic Instant Update to Local State
      if (isEdit && json.data) {
        setGraduates((prev) =>
          prev.map((g) => {
            if (g.id === json.data.id || g.nim === json.data.nim) {
              return { ...g, ...json.data };
            }
            if (cascadeSameDate && g.yudisiumDate?.split("T")[0] === formData.yudisiumDate) {
              return { ...g, yudisiumDecreeNumber: formData.yudisiumDecreeNumber || null };
            }
            return g;
          })
        );
      } else if (!isEdit && json.data) {
        setGraduates((prev) => [json.data, ...prev]);
        setTotalRecords((prev) => prev + 1);
      }

      // Close modal immediately so user doesn't wait
      setIsAddEditOpen(false);

      // Re-fetch quietly in the background without screen flickering or blocking spinner
      fetchData(true);
      fetchDecrees();
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
        // Optimistic delete
        setGraduates((prev) => prev.filter((g) => g.id !== id && g.nim !== nim));
        setTotalRecords((prev) => Math.max(0, prev - 1));
        fetchData(true);
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

  // Unduh Format Template Excel Resmi (.xlsx)
  const handleDownloadTemplate = async () => {
    try {
      const XLSX = await import("xlsx");
      const templateData = [
        {
          "NO": 1,
          "NIM": "2261201001",
          "NAMA MAHASISWA": "NURHIKMAH",
          "PROGRAM STUDI": "S1 Manajemen",
          "JENJANG": "S1",
          "JALUR PENDAFTARAN": "Peserta Didik Baru",
          "PERIODE MASUK": "2022-1",
          "PERIODE KELUAR": "2025-2",
          "TANGGAL YUDISIUM": "2026-09-18",
          "NOMOR SK YUDISIUM": "000.2/512/STIMI-YAPMI/MKS/IX/2026",
          "NOMOR PISN": "093046612012026100074",
          "NOMOR BATCH BELMAWA": "NI-09304661201266",
          "NOMOR SERI IJAZAH": "093046612012026100074",
          "IPK": 3.85,
          "JUDUL SKRIPSI": "Pengaruh Budaya Organisasi Terhadap Kinerja Pegawai Pada STIMI YAPMI Makassar",
        },
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(templateData);

      ws["!cols"] = [
        { wch: 6 },
        { wch: 16 },
        { wch: 30 },
        { wch: 16 },
        { wch: 10 },
        { wch: 22 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 },
        { wch: 35 },
        { wch: 25 },
        { wch: 22 },
        { wch: 25 },
        { wch: 8 },
        { wch: 55 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, "TEMPLATE IMPORT DATA LULUSAN");
      XLSX.writeFile(wb, "TEMPLATE_IMPORT_DATA_LULUSAN_STIMI.xlsx");
    } catch (err) {
      console.error("Gagal mengunduh template Excel:", err);
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
    <div className="space-y-6 font-sans w-full">



      {/* ==================================================================== */}
      {/* 3. CONDITIONAL TAB VIEWS                                             */}
      {/* ==================================================================== */}
      {mainTab === "dashboard" && (
        <DashboardView
          stats={stats}
          uploadedDecrees={uploadedDecrees}
          onRefreshDecrees={fetchDecrees}
          currentUser={currentUser}
          onSwitchTab={handleSwitchTab}
          onOpenAdd={handleOpenAdd}
          onFilterYudisium={(d) => {
            setYudisiumFilter(d);
            handleSwitchTab("berkas");
          }}
          onFilterCohort={(cohort) => {
            setCohortFilter(cohort);
            handleSwitchTab("berkas");
          }}
          onFilterExitPeriod={(period) => {
            setEntryPeriodFilter("");
            setSearchQuery(period);
            handleSwitchTab("berkas");
          }}
          onFilterPisnStatus={(hasPisn) => {
            setPisnFilter(hasPisn);
            handleSwitchTab("pisn");
          }}
          onFilterGpaRange={(range) => {
            setGpaRangeFilter(range);
            handleSwitchTab("berkas");
          }}
          onFilterFileStatus={(status) => {
            setFileStatusFilter(status);
            handleSwitchTab("berkas");
          }}
          onOpenSiamModal={() => setIsSiamModalOpen(true)}
          onRefreshData={fetchData}
        />
      )}

      {mainTab === "repo" && (
        <div className="space-y-5">
      {/* ==================================================================== */}
      {/* 2. STATS OVERVIEW CARDS                                              */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
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
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">PISN Kemdiktisaintek</p>
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

        {/* Belum Terbit PIN / PISN (BARU) */}
        <div
          onClick={() => setPisnFilter("no_pisn")}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xs flex items-center justify-between transition hover:border-amber-300 dark:hover:border-amber-500/30 cursor-pointer group"
          title="Klik untuk menyaring mahasiswa yang belum memiliki nomor PIN"
        >
          <div className="flex-1 mr-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">Belum Ada PIN</p>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                {stats?.totalGraduates ? Math.round(((stats?.withoutPisn ?? 0) / stats.totalGraduates) * 100) : 0}%
              </span>
            </div>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
              {stats?.withoutPisn ?? 0}
            </h3>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${stats?.totalGraduates ? Math.round(((stats?.withoutPisn ?? 0) / stats.totalGraduates) * 100) : 0}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-amber-700/80 dark:text-amber-300/80 mt-1 font-medium">Perlu diajukan ke PISN</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs flex-shrink-0 group-hover:scale-105 transition">
            <AlertCircle className="h-5 w-5" />
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
      <div className="sticky top-[88px] sm:top-[92px] z-30 p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-[#071719]/95 border border-teal-200/80 dark:border-teal-500/30 backdrop-blur-xl shadow-md space-y-3">
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
              onClick={() => setIsGeneratePisnModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md shadow-teal-600/20 transition cursor-pointer"
              title="Generate PISN: Unggah mahasiswa eligible PISN, kelompokkan per SK, buat Lampiran SK & SPTJM"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate PISN</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Lulusan</span>
            </button>

            {/* Smart Contextual Export Button */}
            {hasActiveFilters ? (
              <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                <button
                  type="button"
                  onClick={() => handleExportExcel("filtered")}
                  disabled={isExporting || totalRecords === 0}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                  title={`Unduh hasil filter (${totalRecords} data) ke Excel`}
                >
                  {isExporting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  <span>Ekspor Filter ({totalRecords})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportExcel("all")}
                  disabled={isExporting || totalMasterCount === 0}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                  title={`Unduh seluruh master database (${totalMasterCount} data) tanpa filter`}
                >
                  <Database className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Semua ({totalMasterCount})</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleExportExcel("all")}
                disabled={isExporting || totalMasterCount === 0}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                title={`Unduh seluruh master data (${totalMasterCount} mahasiswa) ke format Excel`}
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                <span>Ekspor Excel (Semua {totalMasterCount} Data)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fetchData()}
              title="Perbarui Data"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-indigo-600 dark:text-indigo-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Toolbar Filter & Urutkan (Satu Baris Efisien & Rapi) */}
        <div className="flex items-center justify-between gap-2.5 pt-2.5 border-t border-slate-200 dark:border-white/[0.06] text-xs flex-wrap">
          {/* Kelompok Filter Utama */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 1. Filter Angkatan */}
            <FilterDropdown
              value={cohortFilter}
              onChange={setCohortFilter}
              options={cohortOptions}
              placeholder="Semua Angkatan"
              panelWidth="min-w-[190px]"
              title="Saring berdasarkan tahun angkatan masuk"
            />

            {/* 2. Filter Tanggal Yudisium & SK */}
            <FilterDropdown
              value={yudisiumFilter}
              onChange={setYudisiumFilter}
              options={yudisiumOptions}
              placeholder="Semua Tanggal Yudisium"
              panelWidth="min-w-[240px]"
              title="Saring berdasarkan tanggal yudisium & SK kelulusan"
            />

            {/* 3. Status Quick Toggle with Badges (Dinamis Sesuai Menu Tab & Angkatan yang Dipilih) */}
            {activeTableTab === "skripsi" ? (
              (() => {
                const activeCounts = cohortFilter && stats?.cohortThesisStats?.[cohortFilter]
                  ? stats.cohortThesisStats[cohortFilter]
                  : {
                      total: stats?.thesisStats?.total ?? (stats?.totalGraduates ?? 0),
                      withThesis: stats?.thesisStats?.withThesis ?? 0,
                      withoutThesis: stats?.thesisStats?.withoutThesis ?? 0,
                    };

                return (
                  <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setThesisFilter("")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                        thesisFilter === ""
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                      title={cohortFilter ? `Semua judul lulusan Angkatan ${cohortFilter}` : "Semua judul skripsi & tesis"}
                    >
                      Semua Judul ({activeCounts.total})
                    </button>
                    <button
                      type="button"
                      onClick={() => setThesisFilter("false")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                        thesisFilter === "false"
                          ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                      }`}
                      title={cohortFilter ? `Lulusan Angkatan ${cohortFilter} yang belum ada judul skripsi` : "Hanya mahasiswa yang belum memiliki judul skripsi"}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                      <span>Belum Ada Judul</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono font-bold">
                        {activeCounts.withoutThesis}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setThesisFilter("true")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                        thesisFilter === "true"
                          ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                      }`}
                      title={cohortFilter ? `Lulusan Angkatan ${cohortFilter} yang sudah ada judul skripsi` : "Hanya mahasiswa yang sudah memiliki judul skripsi"}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Sudah Ada Judul</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                        {activeCounts.withThesis}
                      </span>
                    </button>
                  </div>
                );
              })()
            ) : activeTableTab === "berkas" ? (
              (() => {
                const activeCounts = cohortFilter && stats?.cohortFileStats?.[cohortFilter]
                  ? stats.cohortFileStats[cohortFilter]
                  : {
                      total: stats?.fileStats?.total ?? (stats?.totalGraduates ?? 0),
                      withIjazah: stats?.fileStats?.withIjazah ?? (stats?.withIjazah ?? 0),
                      withoutIjazah: stats?.fileStats?.withoutIjazah ?? ((stats?.totalGraduates ?? 0) - (stats?.withIjazah ?? 0)),
                    };

                return (
                  <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setFileStatusFilter("")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                        fileStatusFilter === ""
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                      title={cohortFilter ? `Semua berkas lulusan Angkatan ${cohortFilter}` : "Semua arsip berkas ijazah"}
                    >
                      Semua Berkas ({activeCounts.total})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFileStatusFilter("no_ijazah")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                        fileStatusFilter === "no_ijazah"
                          ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                      }`}
                      title={cohortFilter ? `Lulusan Angkatan ${cohortFilter} yang belum upload ijazah` : "Hanya mahasiswa yang belum upload ijazah"}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                      <span>Belum Upload Ijazah</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono font-bold">
                        {activeCounts.withoutIjazah}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFileStatusFilter("has_ijazah")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                        fileStatusFilter === "has_ijazah"
                          ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                      }`}
                      title={cohortFilter ? `Lulusan Angkatan ${cohortFilter} yang sudah upload ijazah` : "Hanya mahasiswa yang sudah upload ijazah"}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Sudah Upload Ijazah</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                        {activeCounts.withIjazah}
                      </span>
                    </button>
                  </div>
                );
              })()
            ) : (
              (() => {
                const activeCounts = cohortFilter && stats?.cohortPisnStats?.[cohortFilter]
                  ? stats.cohortPisnStats[cohortFilter]
                  : {
                      total: stats?.totalGraduates ?? 0,
                      withPisn: stats?.withPisn ?? 0,
                      withoutPisn: stats?.withoutPisn ?? 0,
                    };

                return (
                  <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setPisnFilter("")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                        pisnFilter === ""
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                      title={cohortFilter ? `Semua lulusan Angkatan ${cohortFilter}` : "Semua lulusan"}
                    >
                      Semua PISN ({activeCounts.total})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPisnFilter("false")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                        pisnFilter === "false"
                          ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                      }`}
                      title={cohortFilter ? `Lulusan Angkatan ${cohortFilter} yang belum memiliki PISN` : "Hanya mahasiswa yang belum memiliki nomor PISN"}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                      <span>Belum PISN</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-mono font-bold">
                        {activeCounts.withoutPisn}
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
                      title={cohortFilter ? `Lulusan Angkatan ${cohortFilter} yang sudah memiliki PISN` : "Hanya mahasiswa yang sudah memiliki nomor PISN resmi"}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Sudah PISN</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                        {activeCounts.withPisn}
                      </span>
                    </button>
                  </div>
                );
              })()
            )}

            {/* 4. Filter Program Studi */}
            <FilterDropdown
              value={prodiFilter}
              onChange={setProdiFilter}
              options={prodiOptions}
              placeholder="Semua Prodi"
              panelWidth="min-w-[160px]"
              title="Saring berdasarkan program studi"
            />

            {/* 5. Filter Jalur Masuk */}
            <FilterDropdown
              value={regTypeFilter}
              onChange={setRegTypeFilter}
              options={regTypeOptions}
              placeholder="Semua Jalur"
              panelWidth="min-w-[180px]"
              title="Saring berdasarkan jalur pendaftaran"
            />

            {/* 6. Filter Tahun Keluar Kalender */}
            <FilterDropdown
              value={graduationYearFilter}
              onChange={setGraduationYearFilter}
              options={graduationYearOptions}
              placeholder="Semua Tahun Keluar"
              panelWidth="min-w-[170px]"
              title="Saring berdasarkan tahun kalender kelulusan (contoh: 2026)"
            />
          </div>

          {/* Kelompok Kanan: Filter Tambahan, Urutkan, & Reset */}
          <div className="flex items-center gap-2 relative z-30">
            {/* Advanced Filter Popover Trigger */}
            <div ref={filterPopoverRef} className="relative">
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
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl z-50 space-y-3 max-h-[85vh] overflow-y-auto">
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
              )}
            </div>

            {/* Compact Sort Dropdown (Custom Rounded Bebas Sudut Tajam) */}
            <FilterDropdown
              value={`${sortBy}-${sortOrder}`}
              onChange={(val) => {
                const [f, o] = val.split("-");
                setSortBy(f);
                setSortOrder(o as "asc" | "desc");
              }}
              options={sortOptions}
              placeholder="Urutkan"
              align="right"
              panelWidth="min-w-[210px]"
              title="Urutkan daftar lulusan"
              isActive={sortBy !== "nim" || sortOrder !== "asc"}
            />

            {/* Reset All Filters Button */}
            {(searchQuery || prodiFilter || regTypeFilter || pisnFilter || thesisFilter || cohortFilter || yudisiumFilter || graduationYearFilter || activeAdvancedFiltersCount > 0 || sortBy !== "nim" || sortOrder !== "asc") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setProdiFilter("");
                  setRegTypeFilter("");
                  setPisnFilter("");
                  setThesisFilter("");
                  setCohortFilter("");
                  setYudisiumFilter("");
                  setGraduationYearFilter("");
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
      </div>



      <div className="relative z-0 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 backdrop-blur-xl shadow-xs overflow-hidden w-full">
        <div className="overflow-x-auto w-full scrollbar-thin">
          {activeTableTab === "skripsi" ? (
            /* TABEL KHUSUS JUDUL SKRIPSI & TESIS */
            <table className="w-full table-fixed min-w-[1150px] text-left text-slate-700 dark:text-slate-300">
              <colgroup>
                <col className="w-[3.5%]" />  {/* 0. No */}
                <col className="w-[17%]" />   {/* 1. Mahasiswa */}
                <col className="w-[9.5%]" />  {/* 2. Prodi */}
                <col className="w-[5.5%]" />  {/* 3. IPK (BARU) */}
                <col className="w-[35%]" />   {/* 4. Judul Skripsi (LEBAR & TIDAK TERPOTONG) */}
                <col className="w-[5.5%]" />  {/* 5. Masuk */}
                <col className="w-[6%]" />    {/* 6. Periode Keluar */}
                <col className="w-[6%]" />    {/* 7. Tahun Keluar */}
                <col className="w-[12%]" />   {/* 8. Yudisium & SK */}
                <col className="w-[5%]" />    {/* 9. Aksi */}
              </colgroup>

              <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08] shadow-2xs">
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
                  <th className="py-3 px-2 font-semibold text-center">
                    <button
                      type="button"
                      onClick={() => handleSort("gpa")}
                      className={`inline-flex items-center gap-1 group transition cursor-pointer ${
                        sortBy === "gpa" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                      }`}
                      title="Urutkan berdasarkan IPK"
                    >
                      <span>IPK</span>
                      {renderSortIcon("gpa")}
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
                      title="Periode Masuk Mahasiswa (Semester Masuk)"
                    >
                      <span>Periode Masuk</span>
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
                      title="Periode Keluar / Semester Kelulusan"
                    >
                      <span>Periode Keluar</span>
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
                      <span>Tahun Keluar</span>
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
                    <td colSpan={12} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 dark:text-indigo-400 mb-2" />
                      <p className="text-xs">Memuat repositori judul skripsi...</p>
                    </td>
                  </tr>
                ) : graduates.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-500 dark:text-slate-400">
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
                      <td className="py-2.5 px-2 text-center font-mono text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>

                      {/* 1. Mahasiswa */}
                      <td className="py-2.5 px-3">
                        <p
                          className="font-semibold text-xs text-slate-900 dark:text-white truncate block group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition"
                          title={alumni.fullName}
                        >
                          {alumni.fullName}
                        </p>
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {alumni.nim}
                        </span>
                      </td>

                      {/* 2. Prodi */}
                      <td className="py-2.5 px-2">
                        <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 block truncate">
                          {alumni.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen"}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          {alumni.degree || "S1"}
                        </span>
                      </td>

                      {/* 3. IPK (Kolom Khusus & Rapi) */}
                      <td className="py-2.5 px-2 text-center">
                        {alumni.gpa !== null && alumni.gpa !== undefined ? (
                          <span
                            className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border inline-block ${
                              alumni.gpa >= 3.75
                                ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 shadow-2xs"
                                : alumni.gpa >= 3.5
                                ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30 shadow-2xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}
                            title={`Indeks Prestasi Kumulatif: ${alumni.gpa.toFixed(2)}`}
                          >
                            {alumni.gpa.toFixed(2)}
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-slate-400">-</span>
                        )}
                      </td>

                      {/* 4. Judul Skripsi (LEBAR, UTUH, TIDAK ADA YANG TERSEMBUNYI) */}
                      <td className="py-2.5 px-3">
                        {editingThesisId === alumni.id ? (
                          <div className="flex items-center gap-1.5">
                            <textarea
                              rows={2}
                              value={editingThesisTitle}
                              onChange={(e) => setEditingThesisTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSaveThesis(alumni.id);
                                }
                                if (e.key === "Escape") handleCancelEditThesis();
                              }}
                              autoFocus
                              disabled={isSavingThesis}
                              className="w-full p-2 bg-white dark:bg-slate-950 border border-indigo-500 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none ring-2 ring-indigo-500/30 resize-none leading-relaxed"
                              placeholder="Ketik judul skripsi / karya ilmiah..."
                            />
                            <div className="flex flex-col gap-1">
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
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartEditThesis(alumni)}
                            className="group/thesis flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/50 dark:border-white/[0.04] hover:border-indigo-300 dark:hover:border-indigo-500/30 cursor-pointer transition w-full"
                            title="Klik untuk mengedit judul skripsi ini secara langsung"
                          >
                            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-normal break-words w-full">
                              {alumni.thesisTitle ? (
                                `"${alumni.thesisTitle}"`
                              ) : (
                                <span className="text-slate-400 italic font-normal">Belum ada judul skripsi - Klik untuk mengisi</span>
                              )}
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

                      {/* 5. Periode Masuk */}
                      <td className="py-2.5 px-2 text-center">
                        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">
                          {alumni.entryPeriod || "-"}
                        </span>
                      </td>

                      {/* 6. Periode Keluar */}
                      <td className="py-2.5 px-2 text-center">
                        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">
                          {alumni.exitPeriod || "-"}
                        </span>
                      </td>

                      {/* 7. Tahun Keluar (Angka Tahun Kalender) */}
                      <td className="py-2.5 px-2 text-center">
                        <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.5 rounded-md shadow-2xs">
                          {getTahunKeluar(alumni)}
                        </span>
                      </td>

                      {/* 8. Tanggal Yudisium & SK */}
                      <td className="py-2.5 px-2">
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

                      {/* 9. Aksi */}
                      <td className="py-2.5 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEditThesis(alumni)}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 transition cursor-pointer"
                          >
                            Ubah
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
          ) : activeTableTab === "berkas" ? (
            /* TABEL KHUSUS IJAZAH & SK YUDISIUM (TERHUBUNG LANGSUNG DENGAN FILE PDF SK KETUA PER MAHASISWA) */
            <table className="w-full table-fixed min-w-[1150px] text-left text-slate-700 dark:text-slate-300">
              <colgroup>
                <col className="w-[3.5%]" />  {/* 0. No */}
                <col className="w-[18%]" />   {/* 1. Mahasiswa */}
                <col className="w-[10%]" />   {/* 2. Prodi */}
                <col className="w-[11%]" />   {/* 3. Tgl Yudisium */}
                <col className="w-[18%]" />   {/* 4. Nomor SK Yudisium */}
                <col className="w-[16%]" />   {/* 5. File PDF SK Yudisium */}
                <col className="w-[11%]" />   {/* 6. Scan Ijazah & Transkrip */}
                <col className="w-[12.5%]" /> {/* 7. Aksi */}
              </colgroup>

              <thead className="bg-teal-50/70 dark:bg-teal-950/60 text-[10px] sm:text-[11px] uppercase tracking-wider text-teal-800/70 dark:text-teal-300/70 border-b border-teal-200/80 dark:border-teal-500/20">
                <tr>
                  <th className="py-3 px-2 font-semibold text-center text-teal-700/60">No</th>
                  <th className="py-3 px-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort("name")}
                      className={`flex items-center gap-1 group transition cursor-pointer ${
                        sortBy === "name" || sortBy === "nim" ? "text-teal-700 dark:text-teal-300 font-bold" : "hover:text-slate-900 dark:hover:text-white"
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
                        sortBy === "prodi" ? "text-teal-700 dark:text-teal-300 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span>Prodi</span>
                      {renderSortIcon("prodi")}
                    </button>
                  </th>
                  <th className="py-3 px-2 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort("yudisiumDate")}
                      className={`flex items-center gap-1 group transition cursor-pointer ${
                        sortBy === "yudisiumDate" ? "text-teal-700 dark:text-teal-300 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                      }`}
                      title="Urutkan berdasarkan Tanggal Yudisium"
                    >
                      <span>Tgl Yudisium</span>
                      {renderSortIcon("yudisiumDate")}
                    </button>
                  </th>
                  <th className="py-3 px-2 font-semibold">
                    <span>Nomor SK Yudisium</span>
                  </th>
                  <th className="py-3 px-2 font-semibold text-teal-700 dark:text-teal-300">
                    Dokumen PDF SK Ketua
                  </th>
                  <th className="py-3 px-2 font-semibold text-center">
                    Scan Berkas
                  </th>
                  <th className="py-3 px-2 font-semibold text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-teal-100/60 dark:divide-teal-500/10">
                {isLoading && graduates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-teal-600 dark:text-teal-400 mb-2" />
                      <p className="text-xs">Memuat repositori berkas ijazah & SK yudisium...</p>
                    </td>
                  </tr>
                ) : graduates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      <AlertCircle className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tidak ada data ditemukan</p>
                      <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci atau filter di atas.</p>
                    </td>
                  </tr>
                ) : (
                  graduates.map((alumni, idx) => {
                    const skKey = getSafeKey(alumni.yudisiumDecreeNumber || "");
                    const isDecreeUploaded = checkIsDecreeUploaded(alumni);

                    return (
                      <tr
                        key={alumni.id}
                        className="hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition duration-150 group"
                      >
                        {/* 0. No */}
                        <td className="py-2.5 px-2 text-center font-mono text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>

                        {/* 1. Mahasiswa */}
                        <td className="py-2.5 px-3">
                          <p
                            className="font-semibold text-xs text-slate-900 dark:text-white truncate block group-hover:text-teal-600 dark:group-hover:text-teal-300 transition"
                            title={alumni.fullName}
                          >
                            {alumni.fullName}
                          </p>
                          <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            {alumni.nim}
                          </span>
                        </td>

                        {/* 2. Prodi */}
                        <td className="py-2.5 px-2">
                          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 block truncate">
                            {alumni.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen"}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                            {alumni.degree || "S1"}
                          </span>
                        </td>

                        {/* 3. Tgl Yudisium */}
                        <td className="py-2.5 px-2">
                          <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {alumni.yudisiumDate ? new Date(alumni.yudisiumDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                          </span>
                        </td>

                        {/* 4. Nomor SK */}
                        <td className="py-2.5 px-2">
                          <span
                            className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 block truncate"
                            title={alumni.yudisiumDecreeNumber || ""}
                          >
                            {alumni.yudisiumDecreeNumber || "-"}
                          </span>
                        </td>

                        {/* 5. Dokumen PDF SK Yudisium Ketua */}
                        <td className="py-2.5 px-2">
                          {isDecreeUploaded ? (
                            <a
                              href={`/api/v1/yudisium-decree/preview?sk=${encodeURIComponent(alumni.yudisiumDecreeNumber || (alumni.yudisiumDate ? stats?.yudisiumSkMap?.[alumni.yudisiumDate.split("T")[0]] : "") || "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition shadow-xs cursor-pointer"
                              title="Buka dokumen PDF SK Yudisium Ketua di tab baru"
                            >
                              <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Lihat SK PDF ↗</span>
                            </a>
                          ) : alumni.yudisiumDecreeNumber ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDecreeForUpload(alumni.yudisiumDecreeNumber || "");
                                setSelectedYudisiumDateForUpload(alumni.yudisiumDate ? alumni.yudisiumDate.split("T")[0] : "");
                                setIsUploadDecreeModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-300 dark:border-amber-500/30 text-[11px] font-semibold transition cursor-pointer shadow-xs"
                              title="Nomor SK sudah terdaftar. Klik untuk mengunggah berkas scan PDF resmi"
                            >
                              <Upload className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                              <span>Unggah PDF SK</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDecreeForUpload("");
                                setSelectedYudisiumDateForUpload(alumni.yudisiumDate ? alumni.yudisiumDate.split("T")[0] : "");
                                setIsUploadDecreeModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-dashed border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 text-[11px] font-medium transition cursor-pointer"
                              title="Belum ada SK. Klik untuk memasukkan Nomor SK untuk tanggal yudisium ini"
                            >
                              <span>+ Masukkan SK</span>
                            </button>
                          )}
                        </td>

                        {/* 6. Scan Ijazah & Transkrip */}
                        <td className="py-2.5 px-2 text-center">
                          <div className="flex items-center gap-1.5 justify-center">
                            {alumni.ijazahScan ? (
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(alumni, "ijazah")}
                                title="Lihat Scan Ijazah"
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[9px] font-mono font-bold cursor-pointer transition shadow-2xs"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                <span>IJZ</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(alumni)}
                                title="Unggah Scan Ijazah"
                                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 text-[9px] font-mono cursor-pointer hover:bg-slate-200"
                              >
                                -IJZ
                              </button>
                            )}

                            {alumni.transkripScan ? (
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(alumni, "transkrip")}
                                title="Lihat Scan Transkrip"
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[9px] font-mono font-bold cursor-pointer transition shadow-2xs"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                <span>TRK</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(alumni)}
                                title="Unggah Scan Transkrip"
                                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 text-[9px] font-mono cursor-pointer hover:bg-slate-200"
                              >
                                -TRK
                              </button>
                            )}
                          </div>
                        </td>

                        {/* 7. Aksi */}
                        <td className="py-2.5 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(alumni)}
                              title="Kelola Berkas Ijazah & Transkrip"
                              className="p-1 rounded-lg text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-500/20 transition cursor-pointer"
                            >
                              <Upload className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(alumni)}
                              title="Lihat Detail Lengkap"
                              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(alumni)}
                              title="Ubah Data Mahasiswa"
                              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : (
            /* TABEL REPOSITORI PISN & STATUS IJAZAH (DIPERBARUI: PRODI & PENDAFTARAN TERPISAH + ANGKATAN) */
            <table className="w-full table-fixed min-w-[1200px] text-left text-slate-700 dark:text-slate-300">
              <colgroup>
                <col className="w-[3%]" />   {/* 0. No */}
                <col className="w-[17%]" />  {/* 1. Mahasiswa */}
                <col className="w-[9%]" />   {/* 2. Prodi */}
                <col className="w-[13%]" />  {/* 3. Jenis Pendaftaran */}
                <col className="w-[6%]" />   {/* 4. Angkatan */}
                <col className="w-[5.5%]" /> {/* 5. Masuk */}
                <col className="w-[5.5%]" /> {/* 6. Periode Keluar */}
                <col className="w-[5.5%]" /> {/* 7. Tahun Keluar */}
                <col className="w-[15%]" />  {/* 8. Kelulusan & SK */}
                <col className="w-[15%]" />  {/* 9. PISN & Batch */}
                <col className="w-[4.5%]" /> {/* 10. Berkas */}
                <col className="w-[6%]" />   {/* 11. Aksi */}
              </colgroup>

              <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08] shadow-2xs">
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
                        sortBy === "prodi" ? "text-teal-600 dark:text-teal-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                      }`}
                      title="Klik untuk mengurutkan Program Studi"
                    >
                      <span>Prodi</span>
                      {renderSortIcon("prodi")}
                    </button>
                  </th>
                  <th className="py-3 px-2 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort("registrationType")}
                      className={`flex items-center gap-1 group transition cursor-pointer ${
                        sortBy === "registrationType" ? "text-teal-600 dark:text-teal-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                      }`}
                      title="Klik untuk mengurutkan Jenis Pendaftaran"
                    >
                      <span>Jenis Pendaftaran</span>
                      {renderSortIcon("registrationType")}
                    </button>
                  </th>
                  <th className="py-3 px-2 font-semibold text-center">
                    <button
                      type="button"
                      onClick={() => handleSort("cohort")}
                      className={`inline-flex items-center gap-1 group transition cursor-pointer ${
                        sortBy === "cohort" ? "text-teal-600 dark:text-teal-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                      }`}
                      title="Tahun Angkatan Mahasiswa"
                    >
                      <span>Angkatan</span>
                      {renderSortIcon("cohort")}
                    </button>
                  </th>
                  <th className="py-3 px-2 font-semibold text-center">
                    <button
                      type="button"
                      onClick={() => handleSort("entryPeriod")}
                      className={`inline-flex items-center gap-1 group transition cursor-pointer ${
                        sortBy === "entryPeriod" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "hover:text-slate-900 dark:hover:text-white"
                      }`}
                      title="Periode Masuk Mahasiswa (Semester Masuk)"
                    >
                      <span>Periode Masuk</span>
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
                      title="Periode Keluar / Semester Kelulusan"
                    >
                      <span>Periode Keluar</span>
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
                      <span>Tahun Keluar</span>
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
                  <th className="py-3 px-1 font-semibold text-center" title="Status Berkas Scan Ijazah (IJZ) & Transkrip (TRK) di Server">Berkas PDF</th>
                  <th className="py-3 px-2 font-semibold text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {isLoading && graduates.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 dark:text-indigo-400 mb-2" />
                      <p className="text-xs">Memuat data repositori lulusan...</p>
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

                      {/* 1. Mahasiswa Info (Bersih tanpa IPK, IPK ada di tab Skripsi) */}
                      <td className="py-2.5 px-3">
                        <p
                          className="font-semibold text-xs text-slate-900 dark:text-white truncate block group-hover:text-teal-600 dark:group-hover:text-teal-300 transition"
                          title={alumni.fullName}
                        >
                          {alumni.fullName}
                        </p>
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {alumni.nim}
                        </span>
                      </td>

                      {/* 2. Program Studi */}
                      <td className="py-2.5 px-2">
                        <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 block truncate">
                          {alumni.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {alumni.prodiCode}
                        </span>
                      </td>

                      {/* 3. Jenis Pendaftaran (Sesuai Penamaan Resmi Feeder) */}
                      <td className="py-2.5 px-2">
                        {alumni.registrationType === "RPL_PEROLEHAN_SKS" || alumni.registrationType === "RPL_KONVERSI_SKS" ? (
                          <span className="inline-block text-[10px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/30 px-2 py-0.5 rounded-md truncate" title="RPL Perolehan SKS">
                            RPL Perolehan SKS
                          </span>
                        ) : alumni.registrationType === "RPL_TRANSFER_SKS" ? (
                          <span className="inline-block text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded-md truncate" title="RPL Transfer SKS">
                            RPL Transfer SKS
                          </span>
                        ) : alumni.registrationType === "KONVERSI_TRANSFER_NILAI" ? (
                          <span className="inline-block text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 px-2 py-0.5 rounded-md truncate" title="Mahasiswa Pindahan">
                            Pindahan
                          </span>
                        ) : alumni.registrationType === "PESERTA_DIDIK_BARU" ? (
                          <span className="inline-block text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded-md truncate" title="Peserta Didik Baru">
                            Peserta Didik Baru
                          </span>
                        ) : (
                          <span className="inline-block text-[11px] font-mono text-slate-400 dark:text-slate-500 px-2 py-0.5" title="Belum Disinkron">
                            -
                          </span>
                        )}
                      </td>

                      {/* 4. Angkatan (Kolom Mandiri) */}
                      <td className="py-2.5 px-2 text-center">
                        <span className="font-mono text-[11px] font-bold text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-500/30 px-2 py-0.5 rounded-md shadow-2xs">
                          {alumni.cohortYear || "-"}
                        </span>
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

                      {/* 7. Nomor PISN & Batch */}
                      <td className="py-2.5 px-2">
                        {alumni.pisnNumber || alumni.certificateNumber ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 truncate block">
                              {alumni.pisnNumber || alumni.certificateNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard((alumni.pisnNumber || alumni.certificateNumber)!)}
                              title="Salin Nomor PISN / Ijazah"
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition flex-shrink-0 cursor-pointer"
                            >
                              {copiedPisn === (alumni.pisnNumber || alumni.certificateNumber) ? (
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

                      {/* 8. Berkas Server */}
                      <td className="py-2.5 px-1">
                        <div className="flex items-center gap-1 justify-center">
                          {alumni.ijazahScan ? (
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(alumni, "ijazah")}
                              title={`Lihat Scan Ijazah (${alumni.ijazahScan.fileName || "PDF"})`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[9px] font-mono font-bold cursor-pointer transition shadow-2xs"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                              <span>IJZ</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(alumni)}
                              title="Scan Ijazah belum ada - Klik untuk unggah"
                              className="inline-flex items-center px-1.5 py-0.5 rounded border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-[9px] font-mono text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                            >
                              + IJZ
                            </button>
                          )}

                          {alumni.transkripScan ? (
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(alumni, "transkrip")}
                              title={`Lihat Scan Transkrip (${alumni.transkripScan.fileName || "PDF"})`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 border border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-[9px] font-mono font-bold cursor-pointer transition shadow-2xs"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />
                              <span>TRK</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(alumni)}
                              title="Scan Transkrip belum ada - Klik untuk unggah"
                              className="inline-flex items-center px-1.5 py-0.5 rounded border border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30 text-[9px] font-mono text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition cursor-pointer"
                            >
                              + TRK
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 9. Actions */}
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
        </div>

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
        <div className="py-2 px-4 bg-teal-50/70 dark:bg-[#02181c]/60 border-t border-teal-200/60 dark:border-teal-500/10 flex items-center justify-between text-[10px] text-teal-800/70 dark:text-teal-400">
          <span>
            Mode:{" "}
            <strong>
              {activeTableTab === "skripsi"
                ? "Menu IPK & Judul Skripsi"
                : activeTableTab === "berkas"
                ? "Menu Ijazah & SK Yudisium"
                : "Menu Repositori PISN Kemdiktisaintek"}
            </strong>{" "}
            · Data Lulusan S1 & S2 Manajemen STIMI YAPMI Makassar
          </span>
          <span className="font-mono">Total {totalRecords} Data Terindeks · Port 3022</span>
        </div>
      </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* ==================================================================== */}
      {/* 4. SETTINGS VIEW TAB                                                 */}
      {/* ==================================================================== */}
      {mainTab === "settings" && (
        currentUser?.role === "SUPERADMIN" ? (
          <AdminSettingsView
            currentUser={currentUser}
            onRefresh={fetchData}
          />
        ) : (
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#071719] border border-amber-300 dark:border-amber-500/30 shadow-xl text-center max-w-xl mx-auto my-12 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Akses Pengaturan Terkunci
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Halaman Pengaturan Sistem, Pengelolaan Akun, dan Identitas Dokumen dibatasi khusus untuk pengguna dengan hak akses <strong className="text-amber-600 dark:text-amber-400 font-bold">Superadmin</strong>. Akun Anda saat ini memiliki hak akses Staf BAAK.
              </p>
              <div className="pt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                <span>Peran Akun:</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">
                  {currentUser?.role || "Staf BAAK"}
                </span>
              </div>
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => handleSwitchTab("dashboard")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition cursor-pointer"
              >
                <span>Kembali ke Dashboard</span>
              </button>
            </div>
          </div>
        )
      )}

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
                        : selectedGraduate.registrationType === "PESERTA_DIDIK_BARU"
                        ? "Peserta Didik Baru"
                        : "Belum Disinkron"}
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
                    <option value="KONVERSI_TRANSFER_NILAI">Pindahan / Konversi Nilai Transfer</option>
                    <option value="RPL_KONVERSI_SKS">RPL Konversi SKS</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Tahun Angkatan, Periode Masuk & Periode Keluar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tahun Angkatan *
                  </label>
                  <input
                    type="number"
                    required
                    min={2000}
                    max={2035}
                    placeholder="Contoh: 2021"
                    value={formData.cohortYear || ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const currentYearStr = String(formData.cohortYear || "");
                      const isDefaultPeriod = !formData.entryPeriod || (currentYearStr && formData.entryPeriod.startsWith(currentYearStr));
                      setFormData({
                        ...formData,
                        cohortYear: isNaN(val) ? 0 : val,
                        entryPeriod: isDefaultPeriod && !isNaN(val) && val > 0 ? `${val}-1` : formData.entryPeriod,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Periode Masuk (Semester)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 2021-1"
                    value={formData.entryPeriod}
                    onChange={(e) => {
                      const ep = e.target.value;
                      const m = ep.match(/^(\d{4})/);
                      setFormData({
                        ...formData,
                        entryPeriod: ep,
                        cohortYear: m ? parseInt(m[1], 10) : formData.cohortYear,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Periode Keluar (Semester)
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

              {/* Row 4B: IPK & Nomor Ijazah Fisik / Internal Kampus */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Indeks Prestasi Kumulatif (IPK)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    placeholder="Contoh: 3.75"
                    value={formData.gpa}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Ijazah Fisik (Blanko Kampus)
                  </label>
                  <input
                    type="text"
                    placeholder="Nomor pada blanko fisik ijazah..."
                    value={formData.certificateNumber}
                    onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400">
                        Nomor PISN (21 Digit)
                      </label>
                      <span
                        className={`text-[10px] font-mono font-bold ${
                          formData.pisnNumber.length === 21
                            ? "text-emerald-600 dark:text-emerald-400"
                            : formData.pisnNumber.length > 21
                            ? "text-rose-500"
                            : formData.pisnNumber.length > 0
                            ? "text-amber-500"
                            : "text-slate-400"
                        }`}
                      >
                        {formData.pisnNumber.length === 21
                          ? "✓ 21/21 Digit (Valid)"
                          : formData.pisnNumber.length > 21
                          ? `! Kelebihan ${formData.pisnNumber.length - 21}`
                          : formData.pisnNumber.length > 0
                          ? `${formData.pisnNumber.length}/21 Digit`
                          : "21 Digit"}
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="093046612012026100074"
                      value={formData.pisnNumber}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").slice(0, 21);
                        setFormData({ ...formData, pisnNumber: clean });
                      }}
                      className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none font-mono transition ${
                        formData.pisnNumber.length === 21
                          ? "border-emerald-500 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                          : formData.pisnNumber.length > 0
                          ? "border-amber-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          : "border-slate-200 dark:border-white/10 focus:border-indigo-500"
                      }`}
                    />
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                      Struktur: 093046 (Kode PT) + 61201 (Prodi) + Tahun + Urut
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      Nomor / Kode Batch Kemdiktisaintek
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400">
                        File Scan Ijazah (.pdf, maks 10MB)
                      </label>
                      {selectedGraduate?.ijazahScan && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          ✓ Sudah Terarsip
                        </span>
                      )}
                    </div>
                    {selectedGraduate?.ijazahScan && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-1 truncate">
                        File: {selectedGraduate.ijazahScan.fileName}
                      </p>
                    )}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setIjazahFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400">
                        File Scan Transkrip (.pdf, maks 10MB)
                      </label>
                      {selectedGraduate?.transkripScan && (
                        <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold">
                          ✓ Sudah Terarsip
                        </span>
                      )}
                    </div>
                    {selectedGraduate?.transkripScan && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-1 truncate">
                        File: {selectedGraduate.transkripScan.fileName}
                      </p>
                    )}
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
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-md transition disabled:opacity-50 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>{formData.id ? "Simpan Perubahan" : "Simpan Data Lulusan"}</span>
                    </>
                  )}
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
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Impor Data Lulusan & PISN</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Unggah file spreadsheet Excel (.xlsx) sesuai permintaan sistem atau tempel teks Belmawa
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mode Switcher & Template Download Button */}
            <div className="px-4 py-2.5 bg-slate-100/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setImportMode("file")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    importMode === "file"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900"
                  }`}
                >
                  Unggah Spreadsheet (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode("paste")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    importMode === "paste"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900"
                  }`}
                >
                  Tempel Teks Belmawa
                </button>
              </div>

              {/* Unduh Format Template Excel Resmi */}
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold transition cursor-pointer shadow-2xs"
                title="Unduh file format template Excel (.xlsx) yang persis dengan permintaan sistem"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Unduh Format Template Excel (.xlsx)</span>
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
                <div className="space-y-4">
                  <div className="p-6 border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-indigo-500/50 rounded-2xl text-center space-y-3 bg-slate-50/50 dark:bg-slate-950/40 transition">
                    <FileSpreadsheet className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Pilih file spreadsheet Excel (.xlsx / .xls)
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Format kolom telah diselaraskan dengan permintaan dan ekspor sistem STIMI YAPMI Makassar.
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-600 dark:text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Panduan Format Kolom Permintaan Sistem */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        Daftar Kolom Permintaan Sistem:
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        *Wajib diisi
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px] font-mono">
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-between">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">NIM</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-between">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">NAMA MAHASISWA</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300">
                        PROGRAM STUDI
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300">
                        JALUR PENDAFTARAN
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300">
                        PERIODE MASUK
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300">
                        PERIODE KELUAR
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300">
                        TANGGAL YUDISIUM
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300">
                        NOMOR SK YUDISIUM
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300">
                        NOMOR PISN
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300">
                        NOMOR BATCH BELMAWA
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300">
                        IPK
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300">
                        JUDUL SKRIPSI
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                      Catatan: Sistem juga otomatis mengenali nama kolom lama (seperti <em>ANGKATAN</em>, <em>NOMOR</em>, <em>TANGGAL</em>, <em>Jalur</em>) dan secara otomatis mengonversi format periode (misal: <em>2024 GENAP</em> menjadi <em>2024-2</em>).
                    </p>
                  </div>
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
      {/* Siam API Modal */}
      <SiamApiModal
        isOpen={isSiamModalOpen}
        onClose={() => setIsSiamModalOpen(false)}
        totalGraduates={stats?.totalGraduates ?? 0}
      />


      {/* Generate PISN & SK Modal */}
      <GeneratePisnModal
        isOpen={isGeneratePisnModalOpen}
        onClose={() => {
          setIsGeneratePisnModalOpen(false);
          fetchData();
        }}
        onSuccess={() => {
          fetchData();
        }}
      />

      {/* Upload Decree Modal */}
      <UploadDecreeModal
        isOpen={isUploadDecreeModalOpen}
        onClose={() => {
          setIsUploadDecreeModalOpen(false);
          setSelectedDecreeForUpload("");
          setSelectedYudisiumDateForUpload("");
        }}
        onSuccess={() => {
          fetchDecrees();
          fetchData(true);
        }}
        initialDecreeNumber={selectedDecreeForUpload}
        initialYudisiumDate={selectedYudisiumDateForUpload}
        knownDecrees={(stats?.yudisiumDates || []).map((dateStr) => ({
          dateStr,
          skNumber: stats?.yudisiumSkMap?.[dateStr] || "",
          count: stats?.yudisiumCounts?.[dateStr] || 0,
        }))}
      />

      {/* Cascade SK Yudisium Confirmation Modal */}
      {cascadeConfirmData && cascadeConfirmData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#081521] border border-cyan-500/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Penyeragaman Nomor SK Yudisium
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tanggal Yudisium: <strong className="text-cyan-600 dark:text-cyan-400">{cascadeConfirmData.yudisiumDateStr}</strong>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                Anda mengubah Nomor SK untuk <strong>{cascadeConfirmData.fullName}</strong> ({cascadeConfirmData.nim}) menjadi:
              </p>
              <p className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-white/10 break-all">
                {cascadeConfirmData.decreeNumber || "(Dikosongkan)"}
              </p>
              <p>
                Ditemukan <strong className="text-cyan-600 dark:text-cyan-400">{cascadeConfirmData.sameDateCount} mahasiswa</strong> dengan tanggal yudisium yang sama ({cascadeConfirmData.yudisiumDateStr}).
              </p>
              <p className="text-[11px] text-slate-500 italic">
                Apakah Anda ingin menerapkan Nomor SK ini ke seluruh {cascadeConfirmData.sameDateCount} mahasiswa pada tanggal tersebut?
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleExecuteSaveWithCascade(true)}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" />
                <span>Ya, Terapkan ke Semua ({cascadeConfirmData.sameDateCount} Mahasiswa)</span>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteSaveWithCascade(false)}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-white/10 transition cursor-pointer"
              >
                Hanya Mahasiswa Ini Saja
              </button>

              <button
                type="button"
                onClick={() => setCascadeConfirmData(null)}
                disabled={isSubmitting}
                className="w-full py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminConsolePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-mono">
          <RefreshCw className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
          <span>Memuat konsol BAAK...</span>
        </div>
      }
    >
      <AdminConsoleContent />
    </Suspense>
  );
}
