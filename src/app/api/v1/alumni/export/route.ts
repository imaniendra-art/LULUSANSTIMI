import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

function formatIndoDate(d?: Date | null): string {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function getTahunKeluar(a: { yudisiumDate?: Date | null; graduationYear?: number | null; exitPeriod?: string | null }): number | string {
  if (a.yudisiumDate) {
    const d = new Date(a.yudisiumDate);
    const y = d.getFullYear();
    if (!isNaN(y) && y > 2000) return y;
  }
  if (a.graduationYear) return a.graduationYear;
  if (a.exitPeriod) {
    const match = a.exitPeriod.match(/^(\d{4})[-/]?([12])/);
    if (match) {
      const year = parseInt(match[1], 10);
      const sem = match[2];
      return sem === "2" ? year + 1 : year;
    }
  }
  return "-";
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tab = searchParams.get("tab") || "pisn";
    const scope = searchParams.get("scope") || "filtered";
    const query = searchParams.get("q") || "";
    const prodi = searchParams.get("prodi") || "";
    const year = searchParams.get("year");
    const batch = searchParams.get("batch") || "";
    const registrationType = searchParams.get("registrationType") || "";
    const hasPisn = searchParams.get("hasPisn");
    const hasThesis = searchParams.get("hasThesis");
    const yudisiumDateParam = searchParams.get("yudisiumDate") || "";
    const entryPeriodParam = searchParams.get("entryPeriod") || "";
    const cohortParam = searchParams.get("cohort") || searchParams.get("angkatan") || "";
    const fileStatusParam = searchParams.get("fileStatus") || "";
    const gpaRangeParam = searchParams.get("gpaRange") || "";
    const sortBy = searchParams.get("sortBy") || "nim";
    const sortOrder = (searchParams.get("sortOrder") || "asc").toLowerCase() === "desc" ? "desc" : "asc";

    const where: Record<string, unknown> = {};

    // Jika scope !== "all", terapkan filter aktif
    if (scope !== "all") {
      if (query) {
        where.OR = [
          { nim: { contains: query, mode: "insensitive" } },
          { fullName: { contains: query, mode: "insensitive" } },
          { pisnNumber: { contains: query, mode: "insensitive" } },
          { pisnBatchNumber: { contains: query, mode: "insensitive" } },
          { yudisiumDecreeNumber: { contains: query, mode: "insensitive" } },
          { entryPeriod: { contains: query, mode: "insensitive" } },
          { exitPeriod: { contains: query, mode: "insensitive" } },
          { thesisTitle: { contains: query, mode: "insensitive" } },
        ];
      }

      if (prodi) where.prodiCode = prodi;
      if (batch) where.pisnBatchNumber = batch;
      if (registrationType) where.registrationType = registrationType;

      if (year) {
        const yearNum = parseInt(year, 10);
        const startOfYear = new Date(`${yearNum}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${yearNum}-12-31T23:59:59.999Z`);
        const prevYear = yearNum - 1;

        const yearCondition = {
          OR: [
            { graduationYear: yearNum },
            { yudisiumDate: { gte: startOfYear, lte: endOfYear } },
            { exitPeriod: { startsWith: `${yearNum}-1` } },
            { exitPeriod: { startsWith: `${prevYear}-2` } },
          ],
        };
        if (Array.isArray(where.AND)) {
          where.AND.push(yearCondition);
        } else if (where.AND) {
          where.AND = [where.AND, yearCondition];
        } else {
          where.AND = [yearCondition];
        }
      }

      if (entryPeriodParam) where.entryPeriod = entryPeriodParam;

      if (cohortParam) {
        const cohortYear = parseInt(cohortParam, 10);
        const condition = {
          OR: [
            ...(isNaN(cohortYear) ? [] : [{ cohortYear }]),
            { entryPeriod: { startsWith: cohortParam } },
          ],
        };
        if (Array.isArray(where.AND)) {
          where.AND.push(condition);
        } else if (where.AND) {
          where.AND = [where.AND, condition];
        } else {
          where.AND = [condition];
        }
      }

      if (yudisiumDateParam) {
        const start = new Date(`${yudisiumDateParam}T00:00:00.000Z`);
        const end = new Date(`${yudisiumDateParam}T23:59:59.999Z`);
        const condition = { yudisiumDate: { gte: start, lte: end } };
        if (Array.isArray(where.AND)) {
          where.AND.push(condition);
        } else if (where.AND) {
          where.AND = [where.AND, condition];
        } else {
          where.AND = [condition];
        }
      }

      if (fileStatusParam === "has_both") {
        const cond = {
          AND: [
            { ijazahScan: { isSet: true } },
            { transkripScan: { isSet: true } },
          ],
        };
        if (Array.isArray(where.AND)) where.AND.push(cond);
        else if (where.AND) where.AND = [where.AND, cond];
        else where.AND = [cond];
      } else if (fileStatusParam === "has_ijazah") {
        const cond = { ijazahScan: { isSet: true } };
        if (Array.isArray(where.AND)) where.AND.push(cond);
        else if (where.AND) where.AND = [where.AND, cond];
        else where.AND = [cond];
      } else if (fileStatusParam === "no_ijazah") {
        const cond = {
          OR: [
            { ijazahScan: { isSet: false } },
            { ijazahScan: { is: null } },
          ],
        };
        if (Array.isArray(where.AND)) where.AND.push(cond);
        else if (where.AND) where.AND = [where.AND, cond];
        else where.AND = [cond];
      } else if (fileStatusParam === "has_transkrip") {
        const cond = { transkripScan: { isSet: true } };
        if (Array.isArray(where.AND)) where.AND.push(cond);
        else if (where.AND) where.AND = [where.AND, cond];
        else where.AND = [cond];
      } else if (fileStatusParam === "no_files") {
        const cond = {
          AND: [
            { OR: [{ ijazahScan: { isSet: false } }, { ijazahScan: { is: null } }] },
            { OR: [{ transkripScan: { isSet: false } }, { transkripScan: { is: null } }] },
          ],
        };
        if (Array.isArray(where.AND)) where.AND.push(cond);
        else if (where.AND) where.AND = [where.AND, cond];
        else where.AND = [cond];
      }

      if (gpaRangeParam === "cumlaude") {
        where.gpa = { gte: 3.75 };
      } else if (gpaRangeParam === "sangat_memuaskan") {
        where.gpa = { gte: 3.5, lt: 3.75 };
      } else if (gpaRangeParam === "memuaskan") {
        where.gpa = { lt: 3.5 };
      }

      if (hasPisn === "true") {
        const condition = {
          AND: [
            { pisnNumber: { isSet: true } },
            { pisnNumber: { not: null } },
            { pisnNumber: { not: "" } },
          ],
        };
        if (Array.isArray(where.AND)) {
          where.AND.push(condition);
        } else if (where.AND) {
          where.AND = [where.AND, condition];
        } else {
          where.AND = [condition];
        }
      } else if (hasPisn === "false") {
        const condition = {
          OR: [
            { pisnNumber: { isSet: false } },
            { pisnNumber: null },
            { pisnNumber: "" },
          ],
        };
        if (Array.isArray(where.AND)) {
          where.AND.push(condition);
        } else if (where.AND) {
          where.AND = [where.AND, condition];
        } else {
          where.AND = [condition];
        }
      }

      if (hasThesis === "true") {
        const condition = { thesisTitle: { not: "" } };
        if (Array.isArray(where.AND)) {
          where.AND.push(condition);
        } else if (where.AND) {
          where.AND = [where.AND, condition];
        } else {
          where.AND = [condition];
        }
      } else if (hasThesis === "false") {
        const condition = { thesisTitle: "" };
        if (Array.isArray(where.AND)) {
          where.AND.push(condition);
        } else if (where.AND) {
          where.AND = [where.AND, condition];
        } else {
          where.AND = [condition];
        }
      }
    }

    let orderBy: Record<string, "asc" | "desc">[] = [{ nim: "asc" }];
    if (sortBy === "name" || sortBy === "fullName") {
      orderBy = [{ fullName: sortOrder }, { nim: "asc" }];
    } else if (sortBy === "nim") {
      orderBy = [{ nim: sortOrder }];
    } else if (sortBy === "yudisiumDate" || sortBy === "yudisium") {
      orderBy = [{ yudisiumDate: sortOrder }, { nim: "asc" }];
    } else if (sortBy === "gpa" || sortBy === "ipk") {
      orderBy = [{ gpa: sortOrder }, { nim: "asc" }];
    } else if (sortBy === "entryPeriod" || sortBy === "entry") {
      orderBy = [{ entryPeriod: sortOrder }, { nim: "asc" }];
    } else if (sortBy === "exitPeriod" || sortBy === "exit") {
      orderBy = [{ exitPeriod: sortOrder }, { nim: "asc" }];
    } else if (sortBy === "graduationYear" || sortBy === "year") {
      orderBy = [{ graduationYear: sortOrder }, { yudisiumDate: sortOrder }, { nim: "asc" }];
    } else if (sortBy === "batch" || sortBy === "pisnBatchNumber") {
      orderBy = [{ pisnBatchNumber: sortOrder }, { nim: "asc" }];
    } else if (sortBy === "pisn" || sortBy === "pisnNumber") {
      orderBy = [{ pisnNumber: sortOrder }, { nim: "asc" }];
    } else if (sortBy === "registrationType" || sortBy === "jalur") {
      orderBy = [{ registrationType: sortOrder }, { nim: "asc" }];
    }

    const items = await prisma.alumni.findMany({
      where,
      orderBy,
    });

    const isAll = scope === "all" || Object.keys(where).length === 0;

    let filterTag = "";
    if (!isAll) {
      if (hasThesis === "true") filterTag = "SUDAH ADA JUDUL";
      else if (hasThesis === "false") filterTag = "BELUM ADA JUDUL";
      else if (hasPisn === "false") filterTag = "BELUM PISN";
      else if (hasPisn === "true") filterTag = "SUDAH PISN";
      else if (fileStatusParam === "has_ijazah") filterTag = "SUDAH UPLOAD IJAZAH";
      else if (fileStatusParam === "no_ijazah" || fileStatusParam === "no_files") filterTag = "BELUM UPLOAD IJAZAH";
      else if (yudisiumDateParam) filterTag = `YUDISIUM ${yudisiumDateParam}`;
      else if (cohortParam) filterTag = `ANGKATAN ${cohortParam}`;
      else if (prodi === "61201") filterTag = "S1 MANAJEMEN";
      else if (prodi === "61101") filterTag = "S2 MANAJEMEN";
      else if (registrationType === "RPL_PEROLEHAN_SKS") filterTag = "RPL PEROLEHAN";
      else if (registrationType === "RPL_TRANSFER_SKS") filterTag = "RPL TRANSFER";
      else if (registrationType === "PESERTA_DIDIK_BARU") filterTag = "PESERTA BARU";
      else if (query) filterTag = `CARI ${query.slice(0, 15).replace(/[^\w\s-]/g, "")}`.trim();
      else filterTag = "TERFILTER";
    }

    if (tab === "skripsi") {
      // Sheet Judul Skripsi & Tesis
      const rows = items.map((a, idx) => ({
        "NO": idx + 1,
        "NIM": a.nim,
        "NAMA MAHASISWA": a.fullName,
        "PROGRAM STUDI": a.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen",
        "JENJANG": a.degree || "S1",
        "JUDUL SKRIPSI / KARYA ILMIAH": a.thesisTitle || "-",
        "STATUS JUDUL": a.thesisTitle && a.thesisTitle.trim() ? "Lengkap" : "Belum Ada",
        "IPK": a.gpa !== null && a.gpa !== undefined ? a.gpa : "-",
        "PERIODE MASUK": a.entryPeriod || "-",
        "PERIODE KELUAR": a.exitPeriod || "-",
        "TAHUN KELUAR": getTahunKeluar(a),
        "TANGGAL YUDISIUM": formatIndoDate(a.yudisiumDate),
        "NOMOR SK YUDISIUM": a.yudisiumDecreeNumber || "-",
        "NOMOR PISN": a.pisnNumber || "Belum Terbit",
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);

      ws["!cols"] = [
        { wch: 6 },  // NO
        { wch: 15 }, // NIM
        { wch: 32 }, // NAMA
        { wch: 16 }, // PRODI
        { wch: 10 }, // JENJANG
        { wch: 55 }, // JUDUL SKRIPSI
        { wch: 14 }, // STATUS JUDUL
        { wch: 8 },  // IPK
        { wch: 15 }, // MASUK
        { wch: 15 }, // KELUAR
        { wch: 14 }, // TAHUN KELUAR
        { wch: 20 }, // TANGGAL YUDISIUM
        { wch: 35 }, // NO SK
        { wch: 25 }, // NO PISN
      ];

      const filename = isAll
        ? `ARSIP JUDUL SKRIPSI LULUSAN STIMI - SEMUA (${items.length} ALUMNI).xlsx`
        : `ARSIP JUDUL SKRIPSI - ${filterTag} (${items.length} ALUMNI).xlsx`;
      const encodedFilename = encodeURIComponent(filename);

      XLSX.utils.book_append_sheet(wb, ws, "ARSIP SKRIPSI STIMI");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
        },
      });
    }

    if (tab === "berkas") {
      // Sheet Berkas Ijazah, Transkrip & SK
      const rows = items.map((a, idx) => ({
        "NO": idx + 1,
        "NIM": a.nim,
        "NAMA MAHASISWA": a.fullName,
        "PROGRAM STUDI": a.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen",
        "JENJANG": a.degree || "S1",
        "TANGGAL YUDISIUM": formatIndoDate(a.yudisiumDate),
        "NOMOR SK YUDISIUM": a.yudisiumDecreeNumber || "-",
        "NOMOR PISN": a.pisnNumber || "Belum Terbit",
        "STATUS SCAN IJAZAH": a.ijazahScan ? "Ada (PDF)" : "Belum Diunggah",
        "NAMA FILE IJAZAH": a.ijazahScan?.fileName || "-",
        "STATUS SCAN TRANSKRIP": a.transkripScan ? "Ada (PDF)" : "Belum Diunggah",
        "NAMA FILE TRANSKRIP": a.transkripScan?.fileName || "-",
        "TANGGAL UPLOAD BERKAS": a.ijazahScan?.uploadedAt ? formatIndoDate(a.ijazahScan.uploadedAt) : (a.transkripScan?.uploadedAt ? formatIndoDate(a.transkripScan.uploadedAt) : "-"),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);

      ws["!cols"] = [
        { wch: 6 },  // NO
        { wch: 15 }, // NIM
        { wch: 32 }, // NAMA
        { wch: 16 }, // PRODI
        { wch: 10 }, // JENJANG
        { wch: 20 }, // TANGGAL YUDISIUM
        { wch: 35 }, // NO SK
        { wch: 25 }, // NO PISN
        { wch: 22 }, // STATUS IJAZAH
        { wch: 30 }, // NAMA FILE IJAZAH
        { wch: 24 }, // STATUS TRANSKRIP
        { wch: 30 }, // NAMA FILE TRANSKRIP
        { wch: 24 }, // TANGGAL UPLOAD
      ];

      const filename = isAll
        ? `ARSIP BERKAS IJAZAH & SK LULUSAN STIMI - SEMUA (${items.length} ALUMNI).xlsx`
        : `ARSIP BERKAS IJAZAH - ${filterTag} (${items.length} ALUMNI).xlsx`;
      const encodedFilename = encodeURIComponent(filename);

      XLSX.utils.book_append_sheet(wb, ws, "ARSIP BERKAS IJAZAH");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
        },
      });
    }

    // Default: Sheet Repositori PISN & Arsip Ijazah
    const rows = items.map((a, idx) => ({
      "NO": idx + 1,
      "NIM": a.nim,
      "NAMA MAHASISWA": a.fullName,
      "PROGRAM STUDI": a.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen",
      "JENJANG": a.degree || "S1",
      "JALUR PENDAFTARAN":
        a.registrationType === "RPL_PEROLEHAN_SKS" || a.registrationType === "RPL_KONVERSI_SKS"
          ? "RPL Perolehan SKS"
          : a.registrationType === "RPL_TRANSFER_SKS"
          ? "RPL Transfer SKS"
          : a.registrationType === "KONVERSI_TRANSFER_NILAI"
          ? "Perolehan SKS (Transfer Nilai)"
          : "Peserta Didik Baru",
      "PERIODE MASUK": a.entryPeriod || "-",
      "PERIODE KELUAR": a.exitPeriod || "-",
      "TAHUN KELUAR": getTahunKeluar(a),
      "TANGGAL YUDISIUM": formatIndoDate(a.yudisiumDate),
      "NOMOR SK YUDISIUM": a.yudisiumDecreeNumber || "-",
      "NOMOR IJAZAH NASIONAL (PISN)": a.pisnNumber || "Belum Terbit",
      "KODE BATCH BELMAWA": a.pisnBatchNumber || "-",
      "IPK": a.gpa !== null && a.gpa !== undefined ? a.gpa : "-",
      "BERKAS IJAZAH SERVER": a.ijazahScan ? "Ada (PDF)" : "Belum Ada",
      "BERKAS TRANSKRIP SERVER": a.transkripScan ? "Ada (PDF)" : "Belum Ada",
      "JUDUL SKRIPSI": a.thesisTitle || "-",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    ws["!cols"] = [
      { wch: 6 },  // NO
      { wch: 15 }, // NIM
      { wch: 32 }, // NAMA
      { wch: 16 }, // PRODI
      { wch: 10 }, // JENJANG
      { wch: 28 }, // JALUR
      { wch: 15 }, // MASUK
      { wch: 15 }, // KELUAR
      { wch: 14 }, // TAHUN KELUAR
      { wch: 20 }, // TANGGAL YUDISIUM
      { wch: 35 }, // NO SK
      { wch: 25 }, // NO PISN
      { wch: 22 }, // BATCH
      { wch: 8 },  // IPK
      { wch: 22 }, // BERKAS IJAZAH
      { wch: 24 }, // BERKAS TRANSKRIP
      { wch: 45 }, // JUDUL SKRIPSI
    ];

    const filename = isAll
      ? `ARSIP IJAZAH LULUSAN STIMI - SEMUA (${items.length} ALUMNI).xlsx`
      : `ARSIP IJAZAH - ${filterTag} (${items.length} ALUMNI).xlsx`;
    const encodedFilename = encodeURIComponent(filename);

    XLSX.utils.book_append_sheet(wb, ws, "ARSIP IJAZAH LULUSAN STIMI");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (error) {
    console.error("Export alumni excel error:", error);
    return NextResponse.json(
      { error: "Gagal mengekspor data repositori ke Excel" },
      { status: 500 }
    );
  }
}
