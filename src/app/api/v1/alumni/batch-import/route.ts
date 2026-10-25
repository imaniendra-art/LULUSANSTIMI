import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import { invalidateStatsCache } from "@/lib/statsCache";
import { inferCohortYearFromNim, isCohortBelow2020 } from "@/lib/cohort";

function parseDateIndo(str?: string) {
  if (!str) return new Date();
  const direct = new Date(str);
  if (!isNaN(direct.getTime()) && !/^[0-9]{1,2}\s+[a-zA-Z]+/i.test(String(str).trim())) {
    return direct;
  }
  const months: Record<string, number> = {
    jan: 0, januari: 0, january: 0,
    feb: 1, februari: 1, february: 1,
    mar: 2, maret: 2, march: 2,
    apr: 3, april: 3,
    mei: 4, may: 4,
    jun: 5, juni: 5, june: 5,
    jul: 6, juli: 6, july: 6,
    ags: 7, agustus: 7, aug: 7, august: 7,
    sep: 8, september: 8,
    okt: 9, oktober: 9, oct: 9, october: 9,
    nov: 10, november: 10,
    des: 11, desember: 11, dec: 11, december: 11,
  };
  const clean = String(str).trim().toLowerCase();
  const parts = clean.split(/[\s,.-]+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const month = months[parts[1]] ?? 6;
    const year = parseInt(parts[2], 10) || 2025;
    return new Date(Date.UTC(year, month, day, 0, 0, 0));
  }
  return new Date();
}

function parseSafeDate(str?: string | null): Date | null {
  if (!str) return null;
  const clean = String(str).trim();
  if (!clean || clean === "-" || clean === "null" || clean === "undefined") return null;

  const months: Record<string, number> = {
    jan: 0, januari: 0, january: 0,
    feb: 1, februari: 1, february: 1,
    mar: 2, maret: 2, march: 2,
    apr: 3, april: 3,
    mei: 4, may: 4,
    jun: 5, juni: 5, june: 5,
    jul: 6, juli: 6, july: 6,
    ags: 7, agustus: 7, aug: 7, august: 7,
    sep: 8, september: 8,
    okt: 9, oktober: 9, oct: 9, october: 9,
    nov: 10, november: 10,
    des: 11, desember: 11, dec: 11, december: 11,
  };

  const parts = clean.toLowerCase().split(/[\s,.-]+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const month = months[parts[1]];
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && month !== undefined && !isNaN(year) && year > 1900 && year < 2100) {
      return new Date(Date.UTC(year, month, day, 0, 0, 0));
    }
  }

  const direct = new Date(clean);
  if (!isNaN(direct.getTime()) && direct.getFullYear() > 1900 && direct.getFullYear() < 2100) {
    return direct;
  }
  return null;
}

function normalizePeriod(str?: string): string {
  if (!str) return "";
  const s = String(str).trim();
  if (/^\d{4}-[12]$/.test(s)) return s;

  const matchGenap = s.match(/(\d{4}).*genap/i);
  if (matchGenap) return `${matchGenap[1]}-2`;

  const matchGanjil = s.match(/(\d{4}).*ganjil/i);
  if (matchGanjil) return `${matchGanjil[1]}-1`;

  const matchSlash = s.match(/(\d{4})\/(\d{4})/);
  if (matchSlash) {
    const isGenap = s.toLowerCase().includes("genap") || s.includes("/2");
    return `${matchSlash[1]}-${isGenap ? "2" : "1"}`;
  }

  // Handle 5-digit semester notation like 20211 (2021-1) or 20212 (2021-2)
  const matchFive = s.match(/^(\d{4})([12])$/);
  if (matchFive) return `${matchFive[1]}-${matchFive[2]}`;

  // Handle 4-digit year like 2021 -> 2021-1
  const matchFour = s.match(/^(\d{4})$/);
  if (matchFour) return `${matchFour[1]}-1`;

  return s;
}

// Parses Feeder Header format: e.g. ": 2026 / 2026/2027 Ganjil" or ": 2025 / 2024/2025 Ganjil"
// 2026 is Tahun Keluar (graduationYear), 2026/2027 Ganjil is Periode Keluar (exitPeriod -> 2026-1)
function parseFeederPeriodHeader(text: string): { gradYear: number; exitPeriod: string } | null {
  if (!text) return null;
  const match = text.match(/(\d{4})\s*\/\s*(\d{4}\/\d{4}\s*(?:Genap|Ganjil)?)/i);
  if (match) {
    const gradYear = parseInt(match[1], 10);
    const rawPeriod = match[2];
    const isGenap = rawPeriod.toLowerCase().includes("genap");
    const acadYearMatch = rawPeriod.match(/(\d{4})\/(\d{4})/);
    const acadYear = acadYearMatch ? acadYearMatch[1] : gradYear.toString();
    const exitPeriod = `${acadYear}-${isGenap ? "2" : "1"}`;
    return { gradYear, exitPeriod };
  }

  const matchAcadOnly = text.match(/(\d{4})\/(\d{4})\s*(Genap|Ganjil)?/i);
  if (matchAcadOnly) {
    const acadYear = matchAcadOnly[1];
    const isGenap = String(matchAcadOnly[2] || "").toLowerCase().includes("genap");
    const exitPeriod = `${acadYear}-${isGenap ? "2" : "1"}`;
    const gradYear = isGenap ? parseInt(matchAcadOnly[2] || acadYear, 10) : parseInt(acadYear, 10);
    return { gradYear, exitPeriod };
  }

  return null;
}

// Feeder PDDIKTI Parsed Student Structure
interface FeederParsedStudent {
  nim: string;
  fullName: string;
  prodiCode: string;
  prodiName: string;
  degree: string;
  gender: "MALE" | "FEMALE";
  status: string;
  yudisiumDate: Date;
  graduationYear: number;
  pisnNumber: string | null;
  certificateNumber: string | null;
  gpa: number | null;
  thesisTitle: string;
  entryPeriod: string | null;
  exitPeriod: string;
  cohortYear: number | null;
}

// Unified parser for Feeder rows matrix (works for both HTML table and XLSX spreadsheets)
function parseFeederRows(
  allRows: any[][],
  initialExitPeriod = "2026-1",
  initialGradYear = 2026
): {
  graduates: FeederParsedStudent[];
  ignoredDo: Array<{ nim: string; fullName: string; status: string }>;
} {
  let headerExitPeriod = initialExitPeriod;
  let headerGradYear = initialGradYear;

  // Scan top 20 rows for "Periode" header in spreadsheet or HTML table
  for (let i = 0; i < Math.min(allRows.length, 20); i++) {
    const row = allRows[i];
    if (!Array.isArray(row)) continue;
    const rowStr = row.map((c) => String(c || "")).join(" ");
    if (rowStr.toLowerCase().includes("periode") || /(\d{4})\s*\/\s*(\d{4}\/\d{4})/i.test(rowStr)) {
      const parsedHeader = parseFeederPeriodHeader(rowStr);
      if (parsedHeader) {
        headerGradYear = parsedHeader.gradYear;
        headerExitPeriod = parsedHeader.exitPeriod;
        break;
      }
    }
  }

  let nimIdx = -1;
  let nameIdx = -1;
  let prodiIdx = -1;
  let genderIdx = -1;
  let statusIdx = -1;
  let exitDateIdx = -1;
  let ijazahIdx = -1;
  let gpaIdx = -1;
  let startRow = 0;

  // Scan top 20 rows for column headers
  for (let i = 0; i < Math.min(allRows.length, 20); i++) {
    const row = allRows[i];
    if (!Array.isArray(row)) continue;
    for (let j = 0; j < row.length; j++) {
      const val = String(row[j] || "").toLowerCase().trim();
      if (val === "nim" || val.includes("nomor induk mahasiswa")) nimIdx = j;
      if (val === "nama" || val.includes("nama mahasiswa") || val === "nama lengkap") nameIdx = j;
      if (val.includes("program studi") || val.includes("prodi")) prodiIdx = j;
      if (val === "l/p" || val.includes("jenis kelamin") || val === "jk") genderIdx = j;
      if (val === "status" || val.includes("status keluar")) statusIdx = j;
      if (val.includes("tanggal keluar") || val.includes("tgl keluar") || val.includes("tanggal yudisium") || val.includes("tgl yudisium")) exitDateIdx = j;
      if (val.includes("nomor ijazah") || val.includes("no ijazah") || val.includes("pisn") || val.includes("pin")) ijazahIdx = j;
      if (val === "ipk" || val.includes("indeks prestasi")) gpaIdx = j;
    }
    if (nimIdx !== -1 && nameIdx !== -1) {
      startRow = i + 1;
      break;
    }
  }

  // Fallback defaults if header row wasn't found explicitly
  if (nimIdx === -1) nimIdx = 1;
  if (nameIdx === -1) nameIdx = 2;

  const graduates: FeederParsedStudent[] = [];
  const ignoredDo: Array<{ nim: string; fullName: string; status: string }> = [];

  for (let i = startRow; i < allRows.length; i++) {
    const cells = allRows[i];
    if (!cells || !cells[nimIdx]) continue;

    const nim = String(cells[nimIdx]).trim().replace(/[^0-9]/g, "");
    if (nim.length < 5) continue;

    const fullName = nameIdx !== -1 && cells[nameIdx] ? String(cells[nameIdx]).trim() : "";
    if (!fullName || fullName.toLowerCase().includes("nama") || fullName.toLowerCase().includes("total")) continue;

    const prodiText = prodiIdx !== -1 && cells[prodiIdx] ? String(cells[prodiIdx]).trim() : "S1 Manajemen";
    const genderRaw = genderIdx !== -1 && cells[genderIdx] ? String(cells[genderIdx]).trim() : "L";
    const statusText = statusIdx !== -1 && cells[statusIdx] ? String(cells[statusIdx]).trim() : "Lulus";
    const exitDateStr = exitDateIdx !== -1 && cells[exitDateIdx] ? String(cells[exitDateIdx]).trim() : "";
    const ijazahRaw = ijazahIdx !== -1 && cells[ijazahIdx] ? String(cells[ijazahIdx]).trim() : "";
    const gpaRaw = gpaIdx !== -1 && cells[gpaIdx] ? String(cells[gpaIdx]).trim() : "";

    // Filter Angkatan: abaikan mahasiswa dengan angkatan di bawah 2020 (< 2020)
    const cohortYearFromNim = inferCohortYearFromNim(nim);
    if (cohortYearFromNim < 2020) {
      ignoredDo.push({ nim, fullName, status: `Angkatan ${cohortYearFromNim} (< 2020) diabaikan` });
      continue;
    }

    // Status filter: only Lulus
    if (statusIdx !== -1 && !statusText.toLowerCase().includes("lulus")) {
      ignoredDo.push({ nim, fullName, status: statusText });
      continue;
    }

    const yudisiumDate = parseDateIndo(exitDateStr);
    const graduationYear = headerGradYear || yudisiumDate.getFullYear();

    let pisnNumber: string | null = null;
    let certificateNumber: string | null = null;
    if (ijazahRaw && ijazahRaw !== "-" && !ijazahRaw.toLowerCase().includes("belum")) {
      certificateNumber = ijazahRaw;
      const numOnly = ijazahRaw.replace(/[^0-9]/g, "");
      // Nomor Ijazah / PISN resmi:
      // - Format lama: 14-15 digit (cth: 612012024000048)
      // - Format baru PISN/PIN nasional: 21 digit (cth: 093046612012025100028)
      // Toleransi minimal >= 10 digit angka diakui sebagai nomor resmi
      if (numOnly.length >= 10) {
        pisnNumber = numOnly;
      }
    }

    let gpa: number | null = null;
    if (gpaRaw && gpaRaw !== "-") {
      const parsedGpa = parseFloat(String(gpaRaw).replace(",", "."));
      if (!isNaN(parsedGpa) && parsedGpa > 0 && parsedGpa <= 4.0) {
        gpa = parsedGpa;
      }
    }

    const isS2 = prodiText.includes("61101") || prodiText.toLowerCase().includes("s2") || prodiText.toLowerCase().includes("magister");
    const prodiCode = isS2 ? "61101" : "61201";
    const prodiName = isS2 ? "S2 Manajemen" : "S1 Manajemen";
    const degree = isS2 ? "S2" : "S1";
    const gender: "MALE" | "FEMALE" = genderRaw.toLowerCase().includes("p") ? "FEMALE" : "MALE";

    graduates.push({
      nim,
      fullName,
      prodiCode,
      prodiName,
      degree,
      gender,
      status: statusText,
      yudisiumDate,
      graduationYear,
      pisnNumber,
      certificateNumber,
      gpa,
      thesisTitle: "",
      entryPeriod: null, // Kosongkan saat impor lulusan Feeder (diisi valid dari Sinkron Mahasiswa Feeder)
      exitPeriod: headerExitPeriod,
      cohortYear: null, // Kosongkan saat impor lulusan Feeder (diisi valid dari Sinkron Mahasiswa Feeder)
    });
  }

  return { graduates, ignoredDo };
}

// Helper to convert HTML table string to 2D array of cells
function extractHtmlTableRows(html: string): {
  rows: string[][];
  headerExitPeriod: string;
  headerGradYear: number;
} {
  let headerExitPeriod = "2026-1";
  let headerGradYear = 2026;

  const parsedHeader = parseFeederPeriodHeader(html);
  if (parsedHeader) {
    headerGradYear = parsedHeader.gradYear;
    headerExitPeriod = parsedHeader.exitPeriod;
  }

  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
  const rows: string[][] = [];
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const cells: string[] = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push(
        cellMatch[1]
          .replace(/<[^>]+>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .trim()
      );
    }
    if (cells.length > 0) rows.push(cells);
  }

  return { rows, headerExitPeriod, headerGradYear };
}

// Belmawa Text Formatter Parser
interface BelmawaParsedStudent {
  nim: string;
  fullName: string;
  pisnNumber: string;
  pisnBatchNumber?: string;
  yudisiumDate: Date;
  graduationYear: number;
  prodiCode: string;
  prodiName: string;
  degree: string;
  entryPeriod: string;
  exitPeriod: string;
}

function parseBelmawaText(text: string): BelmawaParsedStudent[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const students: BelmawaParsedStudent[] = [];

  let currentBatch = "";
  let currentGenerateDate: Date = new Date();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes("Batch") || line.includes("No. Batch")) {
      const match = line.match(/(?:Batch|No\.\s*Batch)[:\s]+([A-Za-z0-9\-_]+)/i);
      if (match) currentBatch = match[1];
      continue;
    }

    if (line.includes("Tanggal Generate") || line.includes("Tgl Generate")) {
      const match = line.match(/Tanggal Generate[:\s]+(\d{1,2}\s+[a-zA-Z]+\s+\d{4})/i);
      if (match) currentGenerateDate = parseDateIndo(match[1]);
      continue;
    }

    if (
      line.startsWith("NIM,") ||
      line.startsWith("Perguruan Tinggi:") ||
      line.startsWith("Program Studi:") ||
      line.startsWith("Operator PT:") ||
      line.startsWith("Tanggal Export Data:") ||
      line.startsWith(",,,")
    ) {
      continue;
    }

    const cols = line.split(",").map((c) => c.trim());
    if (cols.length >= 3 && /^\d+$/.test(cols[0])) {
      const nim = cols[0];
      const entryYear = inferCohortYearFromNim(nim);
      const gradYear = currentGenerateDate.getFullYear() || 2026;

      students.push({
        nim,
        fullName: cols[1],
        pisnNumber: cols[2],
        pisnBatchNumber: currentBatch,
        yudisiumDate: currentGenerateDate,
        graduationYear: gradYear,
        prodiCode: "61201",
        prodiName: "S1 Manajemen",
        degree: "S1",
        entryPeriod: `${entryYear}-1`,
        exitPeriod: `${gradYear - 1}-2`,
      });
    }
  }

  return students;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const importType = (formData.get("importType") as string) || "feeder-graduates";
    const rawText = formData.get("rawText") as string | null;
    const overwrite = formData.get("overwrite") !== "false";

    // Deduplicate file list: prefer 'files' if provided, otherwise 'file'
    const filesFromFiles = formData.getAll("files") as File[];
    const filesFromFile = formData.getAll("file") as File[];
    const rawFileList = (filesFromFiles.length > 0 ? filesFromFiles : filesFromFile).filter(
      (f) => f && typeof f === "object" && "size" in f && f.size > 0
    );

    let recordsInserted = 0;
    let recordsUpdated = 0;
    let recordsFailed = 0;
    let recordsIgnored = 0;
    const errors: Array<{ row: number; nim?: string; error: string }> = [];

    // =========================================================================
    // IMPORT TYPE 2: SINKRON JENIS PENDAFTARAN (DARI FEEDER MAHASISWA)
    // Multi-file supported (e.g. upload Angkatan 2021, 2022, 2023, 2024 simultaneously)
    // =========================================================================
    if (importType === "sync-registration-type") {
      if (rawFileList.length === 0 && (!rawText || !rawText.trim())) {
        return NextResponse.json({ error: "Silakan unggah minimal satu file Excel/HTML hasil ekspor Mahasiswa Feeder" }, { status: 400 });
      }

      const updatedSample: Array<{ nim: string; fullName: string; registrationType: string }> = [];
      let totalFilesProcessed = 0;

      // 1 Query cepat di awal ke MongoDB untuk memuat seluruh alumni ke memori
      // Ini mencegah N+1 network roundtrips bolak-balik ke cloud database
      const existingAlumniList = await prisma.alumni.findMany({
        select: {
          id: true,
          nim: true,
          fullName: true,
          graduationYear: true,
          entryPeriod: true,
        },
      });
      const alumniMap = new Map(existingAlumniList.map((a) => [a.nim, a]));

      interface SyncRegItem {
        nim: string;
        fullName: string;
        registrationType:
          | "PESERTA_DIDIK_BARU"
          | "RPL_PEROLEHAN_SKS"
          | "RPL_TRANSFER_SKS"
          | "RPL_KONVERSI_SKS"
          | "KONVERSI_TRANSFER_NILAI";
        cohortYear: number;
        entryPeriod: string;
        nik?: string | null;
        gender?: "MALE" | "FEMALE" | null;
        birthPlace?: string | null;
        birthDate?: Date | null;
        fileLabel: string;
        row: number;
      }

      const updatesMap = new Map<string, SyncRegItem>();

      const processRegistrationRows = (rows: any[][], fileLabel = "") => {
        if (!rows || rows.length === 0) return;

        let nimIdx = -1;
        let nikIdx = -1;
        let regTypeIdx = -1;
        let entryDateIdx = -1;
        let entryPeriodIdx = -1;
        let genderIdx = -1;
        let birthInfoIdx = -1;
        let startRow = 0;
        let fileHeaderPeriod = "";
        let fileHeaderCohort: number | null = null;

        // Periksa baris metadata (0-10) di atas tabel untuk mendeteksi periode/angkatan global
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const rowStr = (rows[i] || []).map((c) => String(c || "")).join(" ");
          if (/periode\s*:\s*([^\r\n,;]+)/i.test(rowStr) || /angkatan\s*:\s*([^\r\n,;]+)/i.test(rowStr)) {
            const m = rowStr.match(/(?:periode|angkatan)\s*:\s*([^\r\n,;]+)/i);
            if (m && m[1]) {
              fileHeaderPeriod = m[1].trim();
              const yM = fileHeaderPeriod.match(/(\d{4})/);
              if (yM) fileHeaderCohort = parseInt(yM[1], 10);
            }
          }
        }

        // Cek jika nama file mengandung tahun/angkatan (misal "Mahasiswa 2021" atau "2021-1")
        if (!fileHeaderCohort && fileLabel) {
          const fnMatch = fileLabel.match(/(20\d{2})/);
          if (fnMatch) fileHeaderCohort = parseInt(fnMatch[1], 10);
        }

        // Deteksi indeks kolom NIM, NIK, Jenis Pendaftaran, Tanggal Masuk, Periode Masuk, dll
        for (let i = 0; i < Math.min(rows.length, 15); i++) {
          const row = rows[i];
          if (!Array.isArray(row)) continue;
          for (let j = 0; j < row.length; j++) {
            const val = String(row[j] || "").toLowerCase().trim();
            if (val === "nim" || val.includes("nomor induk mahasiswa")) nimIdx = j;
            if (val === "nik" || val.includes("nomor induk kependudukan") || val === "no. ktp") nikIdx = j;
            if (val.includes("jenis pendaftaran") || val.includes("status masuk") || val.includes("jalur masuk") || val.includes("status pendaftaran")) regTypeIdx = j;
            if (val.includes("tanggal masuk") || val.includes("tgl masuk") || val === "tanggal masuk") entryDateIdx = j;
            if (
              val.includes("periode masuk") ||
              val.includes("semester masuk") ||
              val.includes("tahun masuk") ||
              val.includes("thn masuk") ||
              val.includes("smt masuk") ||
              val.includes("periode pendaftaran") ||
              val === "angkatan" ||
              val.includes("angkatan masuk")
            ) {
              entryPeriodIdx = j;
            }
            if (val.includes("jenis kelamin") || val === "jk" || val === "gender") genderIdx = j;
            if (val.includes("tempat,tanggal lahir") || val.includes("tempat, tanggal lahir") || val.includes("tempat tanggal lahir") || val.includes("ttl")) birthInfoIdx = j;
          }
          if (nimIdx !== -1 && (regTypeIdx !== -1 || entryDateIdx !== -1 || entryPeriodIdx !== -1)) {
            startRow = i + 1;
            break;
          }
        }

        if (nimIdx === -1) nimIdx = 1;
        if (regTypeIdx === -1) {
          for (let j = 0; j < (rows[startRow] || []).length; j++) {
            const str = String(rows[startRow]?.[j] || "").toLowerCase();
            if (str.includes("peserta didik baru") || str.includes("rpl") || str.includes("pindahan")) {
              regTypeIdx = j;
              break;
            }
          }
        }
        if (regTypeIdx === -1) regTypeIdx = 7;

        for (let i = startRow; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[nimIdx]) continue;

          const nim = String(row[nimIdx]).trim().replace(/[^0-9]/g, "");
          if (nim.length < 5) continue;

          // Abaikan mahasiswa angkatan di bawah 2020 (< 2020)
          if (isCohortBelow2020(nim)) {
            recordsIgnored++;
            continue;
          }

          // Cek instan di memory (0 ms) apakah mahasiswa ini ada di repository alumni lulus
          const alumni = alumniMap.get(nim);
          if (!alumni) {
            recordsIgnored++;
            continue;
          }

          // 1. Jenis Pendaftaran / Jalur Masuk
          const regRaw = regTypeIdx !== -1 ? String(row[regTypeIdx] || "").trim().toLowerCase() : "";
          let registrationType:
            | "PESERTA_DIDIK_BARU"
            | "RPL_PEROLEHAN_SKS"
            | "RPL_TRANSFER_SKS"
            | "RPL_KONVERSI_SKS"
            | "KONVERSI_TRANSFER_NILAI" = "PESERTA_DIDIK_BARU";

          if (regRaw.includes("perolehan")) {
            registrationType = "RPL_PEROLEHAN_SKS";
          } else if (regRaw.includes("transfer")) {
            registrationType = "RPL_TRANSFER_SKS";
          } else if (regRaw.includes("konversi") || regRaw.includes("pindahan") || regRaw.includes("alih")) {
            registrationType = "KONVERSI_TRANSFER_NILAI";
          } else {
            registrationType = "PESERTA_DIDIK_BARU";
          }

          // 2. Tahun Angkatan & Periode Masuk (Ganjil vs Genap)
          const inferredNimCohort = inferCohortYearFromNim(nim, alumni.graduationYear);
          const cohortYear = fileHeaderCohort || inferredNimCohort || (alumni.graduationYear ? alumni.graduationYear - 4 : 2025);

          let entryPeriod = "";
          let isGenap = false;
          let isGanjil = false;

          // Cek kolom Periode Masuk eksplisit jika ada
          if (entryPeriodIdx !== -1 && row[entryPeriodIdx]) {
            const rawP = String(row[entryPeriodIdx]).trim();
            if (rawP) entryPeriod = normalizePeriod(rawP);
          }

          // Jika belum ada entryPeriod, gunakan Tanggal Masuk sesuai kalender akademik
          if (!entryPeriod && entryDateIdx !== -1 && row[entryDateIdx]) {
            const d = parseSafeDate(String(row[entryDateIdx]));
            if (d) {
              const entryYear = d.getUTCFullYear();
              const entryMonth = d.getUTCMonth() + 1; // 1-12
              // Filter anomali (misal salah ketik tahun lahir 2006 padahal angkatan 2025)
              const isAnomaly = Math.abs(entryYear - cohortYear) > 2;
              if (!isAnomaly) {
                if (entryMonth >= 7 && entryMonth <= 12) {
                  isGanjil = true;
                } else {
                  isGenap = true;
                }
              }
            }
          }

          if (!entryPeriod) {
            if (!isGanjil && !isGenap) {
              // Cek pola nomor urut NIM (contoh NIM ...200 s/d ...299 adalah kloter genap)
              const numSuffix = parseInt(nim.slice(-3), 10);
              if (!isNaN(numSuffix) && numSuffix >= 200 && numSuffix < 300) {
                isGenap = true;
              } else {
                isGanjil = true;
              }
            }
            entryPeriod = isGenap ? `${cohortYear}-2` : `${cohortYear}-1`;
          }

          // 3. NIK (12-18 digit)
          let nik: string | null = null;
          if (nikIdx !== -1 && row[nikIdx]) {
            const rawNik = String(row[nikIdx]).trim().replace(/[^0-9]/g, "");
            if (rawNik.length >= 12 && rawNik.length <= 18) {
              nik = rawNik;
            }
          }

          // 4. Jenis Kelamin
          let gender: "MALE" | "FEMALE" | null = null;
          if (genderIdx !== -1 && row[genderIdx]) {
            const gRaw = String(row[genderIdx]).trim().toLowerCase();
            if (gRaw.includes("p") || gRaw.includes("perempuan") || gRaw.includes("female")) {
              gender = "FEMALE";
            } else if (gRaw.includes("l") || gRaw.includes("laki") || gRaw.includes("male")) {
              gender = "MALE";
            }
          }

          // 5. Tempat & Tanggal Lahir
          let birthPlace: string | null = null;
          let birthDate: Date | null = null;
          if (birthInfoIdx !== -1 && row[birthInfoIdx]) {
            const rawBirth = String(row[birthInfoIdx]).trim();
            if (rawBirth && rawBirth !== "-") {
              const commaIdx = rawBirth.lastIndexOf(",");
              if (commaIdx !== -1) {
                birthPlace = rawBirth.substring(0, commaIdx).trim() || null;
                const datePart = rawBirth.substring(commaIdx + 1).trim();
                const parsedBd = parseSafeDate(datePart);
                if (parsedBd) birthDate = parsedBd;
              } else {
                birthPlace = rawBirth;
              }
            }
          }

          updatesMap.set(nim, {
            nim,
            fullName: alumni.fullName,
            registrationType,
            cohortYear,
            entryPeriod,
            nik,
            gender,
            birthPlace,
            birthDate,
            fileLabel,
            row: i + 1,
          });
        }
      };

      if (rawFileList.length > 0) {
        for (const file of rawFileList) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const peekText = buffer.toString("utf-8");
          let rows: any[][] = [];

          if (peekText.includes("<table") || peekText.includes("<html") || peekText.includes("<tr")) {
            const { rows: htmlRows } = extractHtmlTableRows(peekText);
            rows = htmlRows;
          } else {
            const wb = XLSX.read(buffer, { type: "buffer" });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
          }

          processRegistrationRows(rows, file.name);
          totalFilesProcessed++;
        }
      } else if (rawText && rawText.trim()) {
        const { rows } = extractHtmlTableRows(rawText);
        processRegistrationRows(rows);
        totalFilesProcessed = 1;
      }

      // Eksekusi pembaruan data secara paralel dalam batch (25 concurrent per chunk)
      const updateList = Array.from(updatesMap.values());
      const CHUNK_SIZE = 25;
      for (let i = 0; i < updateList.length; i += CHUNK_SIZE) {
        const chunk = updateList.slice(i, i + CHUNK_SIZE);
        await Promise.all(
          chunk.map(async (item) => {
            try {
              const updatePayload: {
                registrationType: typeof item.registrationType;
                cohortYear: number;
                entryPeriod: string;
                nik?: string;
                gender?: "MALE" | "FEMALE";
                birthPlace?: string;
                birthDate?: Date;
              } = {
                registrationType: item.registrationType,
                cohortYear: item.cohortYear,
                entryPeriod: item.entryPeriod,
              };
              if (item.nik) updatePayload.nik = item.nik;
              if (item.gender) updatePayload.gender = item.gender;
              if (item.birthPlace) updatePayload.birthPlace = item.birthPlace;
              if (item.birthDate) updatePayload.birthDate = item.birthDate;

              await prisma.alumni.update({
                where: { nim: item.nim },
                data: updatePayload,
              });
              recordsUpdated++;
              if (updatedSample.length < 5) {
                updatedSample.push({ nim: item.nim, fullName: item.fullName, registrationType: item.registrationType });
              }
            } catch (err: unknown) {
              recordsFailed++;
              errors.push({
                row: item.row,
                nim: item.nim,
                error: `${item.fileLabel ? `[${item.fileLabel}] ` : ""}${(err as Error).message}`,
              });
            }
          })
        );
      }

      return NextResponse.json({
        success: true,
        message: `Sinkronisasi jenis pendaftaran dari ${totalFilesProcessed} file selesai. ${recordsUpdated} mahasiswa lulus berhasil diperbarui, ${recordsIgnored} data lainnya diabaikan secara aman.`,
        summary: {
          importType: "sync-registration-type",
          filesProcessed: totalFilesProcessed,
          recordsUpdated,
          recordsIgnored,
          recordsFailed,
          updatedSample,
          errors: errors.slice(0, 15),
        },
      });
    }

    // =========================================================================
    // IMPORT TYPE: IMPOR HASIL NOMOR PISN / PIN (DARI KEMDIKTISAINTEK PISN)
    // Multi-file supported (e.g. upload multiple batch spreadsheets simultaneously)
    // =========================================================================
    if (importType === "pisn-result") {
      if (rawFileList.length === 0 && (!rawText || !rawText.trim())) {
        return NextResponse.json({ error: "Silakan unggah minimal satu file Excel/CSV hasil ekspor PISN" }, { status: 400 });
      }

      const updatedSample: Array<{ nim: string; fullName: string; pisnNumber: string }> = [];
      const batchesFound = new Set<string>();
      let totalFilesProcessed = 0;

      // Pre-load all alumni in memory once for instant lookup
      const existingAlumniList = await prisma.alumni.findMany({
        select: {
          id: true,
          nim: true,
          fullName: true,
          pisnBatchNumber: true,
        },
      });
      const alumniByNim = new Map(existingAlumniList.map((a) => [a.nim, a]));

      const processPisnRows = async (rows: any[][], fileLabel = "") => {
        if (!rows || rows.length === 0) return;

        let batchNumberFromHeader = "";
        let prodiCodeFromHeader = "61201";
        let prodiNameFromHeader = "S1 Manajemen";

        for (let i = 0; i < Math.min(rows.length, 15); i++) {
          const rowStr = (rows[i] || []).map((c) => String(c || "")).join(" ");
          if (/Nomor\s*Batch\s*:/i.test(rowStr)) {
            const match = rowStr.match(/Nomor\s*Batch\s*:\s*,?\s*([A-Za-z0-9\-]+)/i);
            if (match && match[1]) {
              batchNumberFromHeader = match[1].trim();
              batchesFound.add(batchNumberFromHeader);
            }
          }
          if (/Program\s*Studi\s*:/i.test(rowStr)) {
            if (rowStr.includes("61101") || rowStr.toLowerCase().includes("magister") || rowStr.toLowerCase().includes("s2")) {
              prodiCodeFromHeader = "61101";
              prodiNameFromHeader = "S2 Manajemen";
            } else {
              prodiCodeFromHeader = "61201";
              prodiNameFromHeader = "S1 Manajemen";
            }
          }
        }

        let nimIdx = -1;
        let nameIdx = -1;
        let pisnIdx = -1;
        let batchIdx = -1;
        let startRow = 0;

        for (let i = 0; i < Math.min(rows.length, 25); i++) {
          const row = rows[i];
          if (!Array.isArray(row)) continue;
          for (let j = 0; j < row.length; j++) {
            const colName = String(row[j] || "").toLowerCase().trim();
            if (valIsNim(colName)) nimIdx = j;
            if (colName.includes("nama") || colName.includes("mahasiswa")) nameIdx = j;
            if (colName.includes("nomor ijazah") || colName.includes("no ijazah") || colName.includes("pisn") || colName.includes("pin")) pisnIdx = j;
            if (colName.includes("batch") || colName.includes("gelombang") || colName === "no. batch" || colName === "no batch") batchIdx = j;
          }
          if (nimIdx !== -1 && pisnIdx !== -1) {
            startRow = i + 1;
            break;
          }
        }

        function valIsNim(val: string) {
          return val === "nim" || val.includes("nomor induk mahasiswa") || val === "npm";
        }

        if (nimIdx === -1) nimIdx = 0;
        if (nameIdx === -1) nameIdx = 1;
        if (pisnIdx === -1) pisnIdx = 2;

        for (let i = startRow; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[nimIdx]) continue;

          const nim = String(row[nimIdx]).trim().replace(/[^0-9]/g, "");
          if (nim.length < 5) continue;

          // Abaikan mahasiswa angkatan di bawah 2020 (< 2020)
          if (isCohortBelow2020(nim)) {
            recordsIgnored++;
            continue;
          }

          const fullName = nameIdx !== -1 && row[nameIdx] ? String(row[nameIdx]).trim() : "Mahasiswa";
          const rawPisn = pisnIdx !== -1 && row[pisnIdx] ? String(row[pisnIdx]).trim() : "";
          const pisnNumber = rawPisn.replace(/[^0-9]/g, "");

          if (!pisnNumber || pisnNumber.length < 10) continue;

          // Deteksi Nomor Batch dari kolom atau header
          let rowBatch = "";
          if (batchIdx !== -1 && row[batchIdx]) {
            const bVal = String(row[batchIdx]).trim();
            if (bVal && bVal !== "-" && bVal.toLowerCase() !== "null") {
              rowBatch = bVal;
            }
          }
          if (!rowBatch && batchNumberFromHeader) {
            rowBatch = batchNumberFromHeader;
          }
          // Jika masih kosong, cek apakah ada sel di baris ini yang berformat kode Batch Belmawa (misal NI-093046...)
          if (!rowBatch) {
            for (let c = 0; c < row.length; c++) {
              const cellStr = String(row[c] || "").trim();
              if (/^NI-\d+/i.test(cellStr)) {
                rowBatch = cellStr;
                break;
              }
            }
          }
          if (rowBatch) batchesFound.add(rowBatch);

          try {
            const existing = alumniByNim.get(nim);

            if (existing) {
              const finalBatch = rowBatch || existing.pisnBatchNumber || null;
              await prisma.alumni.update({
                where: { nim },
                data: {
                  pisnNumber,
                  certificateNumber: pisnNumber,
                  pisnBatchNumber: finalBatch,
                },
              });
              recordsUpdated++;
              if (updatedSample.length < 5) {
                updatedSample.push({ nim, fullName: existing.fullName, pisnNumber });
              }
            } else {
              const inferredCohort = inferCohortYearFromNim(nim);
              const entryPeriod = `${inferredCohort}-1`;
              const currentYear = new Date().getFullYear();

              await prisma.alumni.create({
                data: {
                  nim,
                  fullName,
                  prodiCode: prodiCodeFromHeader,
                  prodiName: prodiNameFromHeader,
                  degree: prodiCodeFromHeader === "61101" ? "S2" : "S1",
                  registrationType: null,
                  cohortYear: null,
                  entryPeriod: null,
                  exitPeriod: `${currentYear}-2`,
                  graduationYear: currentYear,
                  yudisiumDate: new Date(),
                  yudisiumDecreeNumber: "",
                  thesisTitle: "",
                  pisnNumber,
                  certificateNumber: pisnNumber,
                  pisnBatchNumber: batchNumberFromHeader || null,
                  graduationSource: "YUDISIUM_NON_WISUDA",
                },
              });
              recordsInserted++;
              if (updatedSample.length < 5) {
                updatedSample.push({ nim, fullName, pisnNumber });
              }
            }
          } catch (err: unknown) {
            recordsFailed++;
            errors.push({ row: i + 1, nim, error: `${fileLabel ? `[${fileLabel}] ` : ""}${(err as Error)?.message || "Gagal memproses data"}` });
          }
        }
      };

      if (rawFileList.length > 0) {
        for (const file of rawFileList) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const isCsv = file.name.toLowerCase().endsWith(".csv");
          let rows: any[][] = [];

          if (isCsv) {
            const text = buffer.toString("utf8");
            const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
            rows = lines.map((l) => {
              if (l.includes(";")) return l.split(";").map((c) => c.trim().replace(/^"|"$/g, ""));
              return l.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
            });
          } else {
            const wb = XLSX.read(buffer, { type: "buffer" });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
          }

          await processPisnRows(rows, file.name);
          totalFilesProcessed++;
        }
      } else if (rawText && rawText.trim()) {
        const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
        const rows = lines.map((l) => {
          if (l.includes(";")) return l.split(";").map((c) => c.trim().replace(/^"|"$/g, ""));
          if (l.includes(",")) return l.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          return l.split("\t").map((c) => c.trim().replace(/^"|"$/g, ""));
        });
        await processPisnRows(rows);
        totalFilesProcessed = 1;
      }

      const batchSummary = Array.from(batchesFound).join(", ");
      invalidateStatsCache();

      return NextResponse.json({
        success: true,
        message: `Impor hasil PISN dari ${totalFilesProcessed} file selesai. ${recordsUpdated} nomor PISN berhasil diperbarui, ${recordsInserted} data baru dibuat${batchSummary ? ` (Batch: ${batchSummary})` : ""}.`,
        summary: {
          importType: "pisn-result",
          filesProcessed: totalFilesProcessed,
          batchNumber: batchSummary || null,
          recordsUpdated,
          recordsInserted,
          recordsFailed,
          updatedSample,
          errors: errors.slice(0, 15),
        },
      });
    }

    // =========================================================================
    // IMPORT TYPE 3: IMPOR JUDUL SKRIPSI (DARI PANDAWA EXPORT PDDIKTI)
    // Multi-file supported (e.g. S1 and S2 thesis exports simultaneously)
    // =========================================================================
    if (importType === "pandawa-thesis") {
      if (rawFileList.length === 0) {
        return NextResponse.json({ error: "Silakan unggah minimal satu file Excel/CSV hasil Export PDDIKTI dari PANDAWA (.xlsx / .xls / .csv)" }, { status: 400 });
      }

      const updatedSample: Array<{ nim: string; fullName: string; thesisTitle: string }> = [];
      let totalFilesProcessed = 0;

      // Pre-load all alumni in memory once for instant lookup
      const allAlumni = await prisma.alumni.findMany({
        select: {
          id: true,
          nim: true,
          fullName: true,
          nik: true,
          birthPlace: true,
          birthDate: true,
          thesisTitle: true,
          personalEmail: true,
        },
      });
      const alumniByNim = new Map(allAlumni.map((a) => [a.nim, a]));

      for (const file of rawFileList) {
        let rows: any[][] = [];
        const buffer = Buffer.from(await file.arrayBuffer());
        const peekText = buffer.toString("utf-8");

        if (peekText.includes(";") && (peekText.includes("Judul Skripsi") || peekText.includes("NIM"))) {
          const lines = peekText.split(/\r?\n/);
          for (const line of lines) {
            if (!line.trim()) continue;
            const regex = /(?:^|;)("(?:[^"]|"")*"|[^;]*)/g;
            const cols: string[] = [];
            let match;
            while ((match = regex.exec(line)) !== null) {
              let val = match[1] ?? "";
              if (val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1).replace(/""/g, '"');
              }
              cols.push(val.trim());
              if (regex.lastIndex === line.length) break;
            }
            if (cols.length > 0) rows.push(cols);
          }
        } else {
          const wb = XLSX.read(buffer, { type: "buffer" });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        }

        if (rows.length === 0) continue;

        let nimIdx = -1;
        let nikIdx = -1;
        let nameIdx = -1;
        let birthPlaceIdx = -1;
        let birthDateIdx = -1;
        let thesisIdx = -1;
        let startRow = 0;

        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const row = rows[i];
          if (!Array.isArray(row)) continue;
          for (let j = 0; j < row.length; j++) {
            const val = String(row[j] || "").toLowerCase().trim();
            if (val === "nim" || val.includes("nomor induk mahasiswa")) nimIdx = j;
            if (val === "nik" || val.includes("kependudukan")) nikIdx = j;
            if (val.includes("nama") || val.includes("lengkap")) nameIdx = j;
            if (val.includes("tempat lahir") || val.includes("tmp lahir")) birthPlaceIdx = j;
            if (val.includes("tanggal lahir") || val.includes("tgl lahir")) birthDateIdx = j;
            if (
              val.includes("judul") ||
              val.includes("skripsi") ||
              val.includes("tugas akhir") ||
              val.includes("thesis")
            ) {
              thesisIdx = j;
            }
          }
          if (nimIdx !== -1 && thesisIdx !== -1) {
            startRow = i + 1;
            break;
          }
        }

        if (nimIdx === -1) nimIdx = 0;
        if (thesisIdx === -1) thesisIdx = rows[0]?.length ? rows[0].length - 1 : 6;

        for (let i = startRow; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[nimIdx]) continue;

          const rawNim = String(row[nimIdx]).trim();
          const rawTitle = thesisIdx !== -1 ? String(row[thesisIdx] || "").trim() : "";
          const rawNik = nikIdx !== -1 ? String(row[nikIdx] || "").trim() : "";
          const rawName = nameIdx !== -1 ? String(row[nameIdx] || "").trim() : "";
          const rawBirthPlace = birthPlaceIdx !== -1 ? String(row[birthPlaceIdx] || "").trim() : "";
          const rawBirthDateStr = birthDateIdx !== -1 ? String(row[birthDateIdx] || "").trim() : "";

          if (!rawNim && !rawName) continue;

          try {
            if (rawNim && isCohortBelow2020(rawNim)) {
              recordsIgnored++;
              continue;
            }

            let alumni = null;

            if (rawNim && /^\d+$/.test(rawNim)) {
              alumni = alumniByNim.get(rawNim);
              if (!alumni && rawNim.startsWith("22161201")) {
                const altNim = "2261201" + rawNim.slice(8);
                alumni = alumniByNim.get(altNim);
              }
            }

            if (!alumni && rawName) {
              const cleanName = rawName.replace(/[.,]/g, "").trim().toLowerCase();
              alumni = allAlumni.find((a) => {
                const dbName = a.fullName.replace(/[.,]/g, "").trim().toLowerCase();
                return dbName === cleanName || dbName.includes(cleanName) || cleanName.includes(dbName);
              }) as any;
            }

            if (alumni) {
              const updateData: any = {};

              const isPlaceholder =
                !alumni.thesisTitle ||
                alumni.thesisTitle.includes("syarat kelulusan") ||
                alumni.thesisTitle === "-";

              if (rawTitle && rawTitle !== "-" && (overwrite || isPlaceholder)) {
                updateData.thesisTitle = rawTitle;
              }

              if (rawNik && /^\d{16}$/.test(rawNik) && !alumni.nik) {
                updateData.nik = rawNik;
              }

              if (rawBirthPlace && !alumni.birthPlace) {
                updateData.birthPlace = rawBirthPlace;
              }

              if (rawBirthDateStr && !alumni.birthDate) {
                const bParts = rawBirthDateStr.split(/[\/\-]/);
                if (bParts.length === 3) {
                  const day = parseInt(bParts[0], 10);
                  const month = parseInt(bParts[1], 10) - 1;
                  const year = parseInt(bParts[2], 10);
                  if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    updateData.birthDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
                  }
                }
              }

              if (rawNim.includes("@") && !alumni.personalEmail) {
                updateData.personalEmail = rawNim;
              }

              if (Object.keys(updateData).length > 0) {
                await prisma.alumni.update({
                  where: { id: alumni.id },
                  data: updateData,
                });

                recordsUpdated++;
                if (updatedSample.length < 5) {
                  updatedSample.push({
                    nim: alumni.nim,
                    fullName: alumni.fullName,
                    thesisTitle: updateData.thesisTitle || alumni.thesisTitle,
                  });
                }
              } else {
                recordsIgnored++;
              }
            } else {
              recordsIgnored++;
            }
          } catch (err: unknown) {
            recordsFailed++;
            errors.push({ row: i + 1, nim: rawNim, error: `[${file.name}] ${(err as Error).message}` });
          }
        }
        totalFilesProcessed++;
      }

      invalidateStatsCache();

      return NextResponse.json({
        success: true,
        message: `Impor data Pandawa dari ${totalFilesProcessed} file selesai. ${recordsUpdated} mahasiswa berhasil diselaraskan judul skripsi, NIK, dan identitasnya.`,
        summary: {
          importType: "pandawa-thesis",
          filesProcessed: totalFilesProcessed,
          recordsUpdated,
          recordsIgnored,
          recordsFailed,
          updatedSample,
          errors: errors.slice(0, 15),
        },
      });
    }

    // =========================================================================
    // IMPORT TYPE 1: FEEDER PDDIKTI (MAHASISWA LULUS / DO - DEFAULT)
    // Multi-file supported (e.g. multiple batch/period exports uploaded at once)
    // =========================================================================
    let totalIgnoredDoCount = 0;
    const ignoredDoSample: Array<{ nim: string; fullName: string; status: string }> = [];

    // CASE 1A: Process Uploaded Files (HTML disguised as XLS, or real XLSX spreadsheets)
    if (rawFileList.length > 0) {
      let totalFilesProcessed = 0;

      // Pre-load all alumni in memory once for instant lookup
      const allAlumni = await prisma.alumni.findMany({
        select: {
          id: true,
          nim: true,
          fullName: true,
          nik: true,
          birthPlace: true,
          birthDate: true,
          thesisTitle: true,
          personalEmail: true,
        },
      });
      const alumniByNim = new Map(allAlumni.map((a) => [a.nim, a]));

      for (const file of rawFileList) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const peekText = buffer.toString("utf-8");

        const isFeederHtml =
          peekText.includes("DAFTAR MAHASISWA LULUS") ||
          peekText.includes("PANGKALAN DATA PENDIDIKAN TINGGI") ||
          peekText.includes("<table") ||
          peekText.includes("<html") ||
          peekText.includes("<tr");

        let graduates: FeederParsedStudent[] = [];
        let ignoredDo: Array<{ nim: string; fullName: string; status: string }> = [];

        if (isFeederHtml) {
          const { rows, headerExitPeriod, headerGradYear } = extractHtmlTableRows(peekText);
          const parsed = parseFeederRows(rows, headerExitPeriod, headerGradYear);
          graduates = parsed.graduates;
          ignoredDo = parsed.ignoredDo;
        } else {
          // Binary spreadsheet (.xlsx / .xls)
          try {
            const workbook = XLSX.read(buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            const parsed = parseFeederRows(allRows);
            graduates = parsed.graduates;
            ignoredDo = parsed.ignoredDo;
          } catch (e) {
            console.error("Spreadsheet parse error:", e);
          }
        }

        totalIgnoredDoCount += ignoredDo.length;
        if (ignoredDoSample.length < 5) {
          ignoredDoSample.push(...ignoredDo.slice(0, 5 - ignoredDoSample.length));
        }

        for (let i = 0; i < graduates.length; i++) {
          const g = graduates[i];
          try {
            const existing = await prisma.alumni.findUnique({ where: { nim: g.nim } });

            if (existing) {
              await prisma.alumni.update({
                where: { nim: g.nim },
                data: {
                  fullName: g.fullName,
                  prodiCode: g.prodiCode,
                  prodiName: g.prodiName,
                  degree: g.degree,
                  entryPeriod: existing.entryPeriod || g.entryPeriod,
                  exitPeriod: g.exitPeriod || existing.exitPeriod,
                  yudisiumDate: g.yudisiumDate,
                  graduationYear: g.graduationYear,
                  pisnNumber: g.pisnNumber || existing.pisnNumber,
                  certificateNumber: g.certificateNumber || g.pisnNumber || existing.certificateNumber,
                  gpa: g.gpa !== null ? g.gpa : existing.gpa,
                },
              });
              recordsUpdated++;
            } else {
              await prisma.alumni.create({
                data: {
                  nim: g.nim,
                  fullName: g.fullName,
                  prodiCode: g.prodiCode,
                  prodiName: g.prodiName,
                  degree: g.degree,
                  gender: g.gender,
                  registrationType: null, // Jangan buat data asal-asalan, kosongkan sampai disinkronkan resmi
                  entryPeriod: null,
                  exitPeriod: g.exitPeriod,
                  cohortYear: null,
                  graduationYear: g.graduationYear,
                  yudisiumDate: g.yudisiumDate,
                  yudisiumDecreeNumber: null,
                  thesisTitle: "",
                  pisnNumber: g.pisnNumber,
                  certificateNumber: g.certificateNumber || g.pisnNumber || null,
                  gpa: g.gpa,
                  graduationSource: "YUDISIUM_NON_WISUDA",
                },
              });
              recordsInserted++;
            }
          } catch (err: unknown) {
            recordsFailed++;
            errors.push({
              row: i + 1,
              nim: g.nim,
              error: `[${file.name}] ${(err as Error)?.message || "Gagal menyimpan data"}`,
            });
          }
        }

        totalFilesProcessed++;
      }

      invalidateStatsCache();

      return NextResponse.json({
        success: true,
        message: `Tarik data Feeder dari ${totalFilesProcessed} file berhasil. ${recordsInserted} data baru, ${recordsUpdated} diperbarui${totalIgnoredDoCount > 0 ? `, ${totalIgnoredDoCount} status non-lulus diabaikan secara aman` : ""}.`,
        summary: {
          source: "FEEDER_MULTI_FILE",
          filesProcessed: totalFilesProcessed,
          recordsInserted,
          recordsUpdated,
          recordsFailed,
          ignoredDoCount: totalIgnoredDoCount,
          ignoredSample: ignoredDoSample,
          errors: errors.slice(0, 15),
        },
      });
    }

    // CASE 1B: Paste Raw Text (HTML or Belmawa format)
    if (rawText && rawText.trim()) {
      const isHtmlText =
        rawText.includes("DAFTAR MAHASISWA LULUS") ||
        rawText.includes("PANGKALAN DATA PENDIDIKAN TINGGI") ||
        rawText.includes("<table") ||
        rawText.includes("<html") ||
        rawText.includes("<tr");

      if (isHtmlText) {
        const { rows, headerExitPeriod, headerGradYear } = extractHtmlTableRows(rawText);
        const { graduates, ignoredDo } = parseFeederRows(rows, headerExitPeriod, headerGradYear);

        for (let i = 0; i < graduates.length; i++) {
          const g = graduates[i];
          try {
            const existing = await prisma.alumni.findUnique({ where: { nim: g.nim } });

            if (existing) {
              await prisma.alumni.update({
                where: { nim: g.nim },
                data: {
                  fullName: g.fullName,
                  prodiCode: g.prodiCode,
                  prodiName: g.prodiName,
                  degree: g.degree,
                  entryPeriod: existing.entryPeriod || g.entryPeriod,
                  exitPeriod: g.exitPeriod || existing.exitPeriod,
                  yudisiumDate: g.yudisiumDate,
                  graduationYear: g.graduationYear,
                  pisnNumber: g.pisnNumber || existing.pisnNumber,
                  certificateNumber: g.certificateNumber || g.pisnNumber || existing.certificateNumber,
                  gpa: g.gpa !== null ? g.gpa : existing.gpa,
                },
              });
              recordsUpdated++;
            } else {
              await prisma.alumni.create({
                data: {
                  nim: g.nim,
                  fullName: g.fullName,
                  prodiCode: g.prodiCode,
                  prodiName: g.prodiName,
                  degree: g.degree,
                  gender: g.gender,
                  registrationType: null, // Jangan buat data asal-asalan, kosongkan sampai disinkronkan resmi
                  entryPeriod: null,
                  exitPeriod: g.exitPeriod,
                  cohortYear: null,
                  graduationYear: g.graduationYear,
                  yudisiumDate: g.yudisiumDate,
                  yudisiumDecreeNumber: null,
                  thesisTitle: "",
                  pisnNumber: g.pisnNumber,
                  certificateNumber: g.certificateNumber || g.pisnNumber || null,
                  gpa: g.gpa,
                  graduationSource: "YUDISIUM_NON_WISUDA",
                },
              });
              recordsInserted++;
            }
          } catch (err: unknown) {
            recordsFailed++;
            errors.push({
              row: i + 1,
              nim: g.nim,
              error: (err as Error)?.message || "Gagal menyimpan data",
            });
          }
        }

        invalidateStatsCache();

        return NextResponse.json({
          success: true,
          message: `Tarik data Feeder HTML berhasil. ${recordsInserted} data baru, ${recordsUpdated} diperbarui, ${ignoredDo.length} status non-lulus diabaikan.`,
          summary: {
            source: "FEEDER_HTML",
            totalRowsInFile: graduates.length + ignoredDo.length,
            graduatesProcessed: graduates.length,
            ignoredDoCount: ignoredDo.length,
            recordsInserted,
            recordsUpdated,
            recordsFailed,
            ignoredSample: ignoredDo.slice(0, 5),
            errors: errors.slice(0, 15),
          },
        });
      } else {
        // Belmawa Text Formatter
        const parsedStudents = parseBelmawaText(rawText);

        for (let i = 0; i < parsedStudents.length; i++) {
          const s = parsedStudents[i];
          if (isCohortBelow2020(s.nim, s.graduationYear ? s.graduationYear - 4 : undefined)) {
            recordsIgnored++;
            continue;
          }
          try {
            const existing = await prisma.alumni.findUnique({ where: { nim: s.nim } });

            if (existing) {
              await prisma.alumni.update({
                where: { nim: s.nim },
                data: {
                  fullName: s.fullName,
                  pisnNumber: s.pisnNumber,
                  certificateNumber: s.pisnNumber,
                  pisnBatchNumber: s.pisnBatchNumber || existing.pisnBatchNumber,
                  yudisiumDate: s.yudisiumDate,
                  graduationYear: s.graduationYear,
                  prodiCode: s.prodiCode,
                  prodiName: s.prodiName,
                  entryPeriod: existing.entryPeriod || s.entryPeriod,
                  exitPeriod: existing.exitPeriod || s.exitPeriod,
                },
              });
              recordsUpdated++;
            } else {
              await prisma.alumni.create({
                data: {
                  nim: s.nim,
                  fullName: s.fullName,
                  pisnNumber: s.pisnNumber,
                  certificateNumber: s.pisnNumber,
                  pisnBatchNumber: s.pisnBatchNumber,
                  prodiCode: s.prodiCode,
                  prodiName: s.prodiName,
                  degree: s.degree,
                  registrationType: "PESERTA_DIDIK_BARU",
                  entryPeriod: s.entryPeriod,
                  exitPeriod: s.exitPeriod,
                  cohortYear: inferCohortYearFromNim(s.nim, s.graduationYear),
                  graduationYear: s.graduationYear,
                  yudisiumDate: s.yudisiumDate,
                  yudisiumDecreeNumber: null,
                  thesisTitle: "",
                  graduationSource: "YUDISIUM_NON_WISUDA",
                },
              });
              recordsInserted++;
            }
          } catch (err: unknown) {
            recordsFailed++;
            errors.push({
              row: i + 1,
              nim: s.nim,
              error: (err as Error)?.message || "Gagal menyimpan baris data",
            });
          }
        }

        invalidateStatsCache();

        return NextResponse.json({
          success: true,
          message: `Impor teks Belmawa berhasil. ${recordsInserted} data baru, ${recordsUpdated} diperbarui, ${recordsFailed} gagal.`,
          summary: {
            source: "BELMAWA_TEXT",
            totalRows: parsedStudents.length,
            recordsInserted,
            recordsUpdated,
            recordsFailed,
            errors: errors.slice(0, 15),
          },
        });
      }
    }

    return NextResponse.json(
      { error: "Silakan unggah setidaknya satu file spreadsheet (.xlsx/.xls/.csv) atau tempel teks tabel Feeder." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Batch import error:", error);
    return NextResponse.json({ error: "Gagal memproses file spreadsheet" }, { status: 500 });
  }
}
