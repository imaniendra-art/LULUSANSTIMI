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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tab = searchParams.get("tab") || "pisn";
    const query = searchParams.get("q") || "";
    const prodi = searchParams.get("prodi") || "";
    const year = searchParams.get("year");
    const batch = searchParams.get("batch") || "";
    const registrationType = searchParams.get("registrationType") || "";
    const hasPisn = searchParams.get("hasPisn");
    const yudisiumDateParam = searchParams.get("yudisiumDate") || "";
    const entryPeriodParam = searchParams.get("entryPeriod") || "";
    const fileStatusParam = searchParams.get("fileStatus") || "";
    const gpaRangeParam = searchParams.get("gpaRange") || "";
    const sortBy = searchParams.get("sortBy") || "nim";
    const sortOrder = (searchParams.get("sortOrder") || "asc").toLowerCase() === "desc" ? "desc" : "asc";

    const where: Record<string, unknown> = {};

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
    if (year) where.graduationYear = parseInt(year, 10);
    if (entryPeriodParam) where.entryPeriod = entryPeriodParam;

    if (yudisiumDateParam) {
      const start = new Date(`${yudisiumDateParam}T00:00:00.000Z`);
      const end = new Date(`${yudisiumDateParam}T23:59:59.999Z`);
      where.yudisiumDate = { gte: start, lte: end };
    }

    if (fileStatusParam === "has_both") {
      where.AND = [
        { ijazahScan: { isNot: null } },
        { transkripScan: { isNot: null } },
      ];
    } else if (fileStatusParam === "has_ijazah") {
      where.ijazahScan = { isNot: null };
    } else if (fileStatusParam === "has_transkrip") {
      where.transkripScan = { isNot: null };
    } else if (fileStatusParam === "no_files") {
      where.AND = [
        { ijazahScan: { is: null } },
        { transkripScan: { is: null } },
      ];
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

    const now = new Date();
    const dateStamp = now.toISOString().split("T")[0].replace(/-/g, "");

    if (tab === "skripsi") {
      // Sheet Judul Skripsi & Tesis
      const rows = items.map((a, idx) => ({
        "NO": idx + 1,
        "NIM": a.nim,
        "NAMA MAHASISWA": a.fullName,
        "PROGRAM STUDI": a.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen",
        "JENJANG": a.degree || "S1",
        "JUDUL SKRIPSI / KARYA ILMIAH": a.thesisTitle || "-",
        "IPK": a.gpa !== null && a.gpa !== undefined ? a.gpa : "-",
        "PERIODE MASUK": a.entryPeriod || "-",
        "PERIODE KELUAR": a.exitPeriod || "-",
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
        { wch: 8 },  // IPK
        { wch: 15 }, // MASUK
        { wch: 15 }, // KELUAR
        { wch: 20 }, // TANGGAL YUDISIUM
        { wch: 35 }, // NO SK
        { wch: 25 }, // NO PISN
      ];

      const filename = "ARSIP JUDUL SKRIPSI LULUSAN STIMI.xlsx";
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
      { wch: 20 }, // TANGGAL YUDISIUM
      { wch: 35 }, // NO SK
      { wch: 25 }, // NO PISN
      { wch: 22 }, // BATCH
      { wch: 8 },  // IPK
      { wch: 22 }, // BERKAS IJAZAH
      { wch: 24 }, // BERKAS TRANSKRIP
      { wch: 45 }, // JUDUL SKRIPSI
    ];

    const filename = "ARSIP IJAZA LULUSAN STIMI.xlsx";
    const encodedFilename = encodeURIComponent(filename);

    XLSX.utils.book_append_sheet(wb, ws, "ARSIP IJAZA LULUSAN STIMI");
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
