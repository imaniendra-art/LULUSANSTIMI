import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

function getPredikatKelulusan(gpa: number | null | undefined): string {
  if (gpa === null || gpa === undefined || isNaN(gpa)) return "-";
  if (gpa >= 3.75) return "Dengan Pujian";
  if (gpa >= 3.50) return "Sangat Memuaskan";
  if (gpa >= 3.00) return "Memuaskan";
  return "Cukup";
}

function formatIndoDate(d?: Date | string | null): string {
  if (!d) return "-";
  try {
    const dateObj = typeof d === "string" ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return typeof d === "string" ? d : "-";
    return dateObj.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

interface StudentExportRow {
  nim: string;
  fullName: string;
  nik: string;
  prodiName: string;
  degree: string;
  birthDateStr?: string;
  gpa: number | null;
  predikat?: string;
}

function buildExcelResponse(
  students: StudentExportRow[],
  decreeNumber?: string,
  dateStr?: string,
  dateLabel?: string
) {
  // Susun baris sesuai permintaan user:
  // 1. NO, 2. NIM, 3. NAMA MAHASISWA, 4. NIK, 5. PRODI, 6. JENJANG, 7. TANGGAL LAHIR, 8. IPK, 9. PREDIKAT
  const rows = students.map((s, idx) => ({
    "NO": idx + 1,
    "NIM": s.nim,
    "NAMA MAHASISWA": s.fullName,
    "NIK": s.nik || "-",
    "PRODI": s.prodiName || "S1 Manajemen",
    "JENJANG": s.degree || "S1",
    "TANGGAL LAHIR": s.birthDateStr || "-",
    "IPK": s.gpa !== null && s.gpa !== undefined ? s.gpa : "-",
    "PREDIKAT": s.predikat || getPredikatKelulusan(s.gpa),
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // Lebar kolom rapi
  ws["!cols"] = [
    { wch: 6 },  // NO
    { wch: 16 }, // NIM
    { wch: 34 }, // NAMA MAHASISWA
    { wch: 20 }, // NIK
    { wch: 18 }, // PRODI
    { wch: 10 }, // JENJANG
    { wch: 20 }, // TANGGAL LAHIR
    { wch: 8 },  // IPK
    { wch: 20 }, // PREDIKAT
  ];

  const sheetName = "LAMPIRAN SK YUDISIUM";
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const safeDecree = decreeNumber ? decreeNumber.replace(/[/\\?%*:|"<>]/g, "_").trim() : "";
  const filename = safeDecree
    ? `LAMPIRAN SK - ${safeDecree} (${students.length} Mahasiswa).xlsx`
    : `LAMPIRAN SK - Yudisium ${dateStr || "Export"} (${students.length} Mahasiswa).xlsx`;

  const encodedFilename = encodeURIComponent(filename);
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
    },
  });
}

// 1. POST Endpoint: Digunakan saat modal mengirim data grup langsung
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { students, decreeNumber, dateStr, dateLabel } = body;

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "Daftar mahasiswa kosong" }, { status: 400 });
    }

    return buildExcelResponse(students, decreeNumber, dateStr, dateLabel);
  } catch (error) {
    console.error("Export SK error (POST):", error);
    return NextResponse.json({ error: "Gagal membuat file Lampiran SK" }, { status: 500 });
  }
}

// 2. GET Endpoint: Mengunduh langsung berdasarkan query param dateStr / decreeNumber
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const dateStr = searchParams.get("dateStr");
    const decreeNumber = searchParams.get("decreeNumber") || "";

    if (!dateStr) {
      return NextResponse.json({ error: "Parameter dateStr wajib diisi" }, { status: 400 });
    }

    const start = new Date(`${dateStr}T00:00:00.000Z`);
    const end = new Date(`${dateStr}T23:59:59.999Z`);

    const where: Record<string, unknown> = {
      yudisiumDate: { gte: start, lte: end },
    };

    if (decreeNumber) {
      where.yudisiumDecreeNumber = decreeNumber;
    }

    const alumni = await prisma.alumni.findMany({
      where,
      orderBy: { nim: "asc" },
      select: {
        nim: true,
        fullName: true,
        nik: true,
        prodiCode: true,
        prodiName: true,
        degree: true,
        birthDate: true,
        gpa: true,
        yudisiumDecreeNumber: true,
        yudisiumDate: true,
      },
    });

    if (alumni.length === 0) {
      return NextResponse.json(
        { error: `Tidak ditemukan mahasiswa untuk tanggal yudisium ${dateStr}` },
        { status: 404 }
      );
    }

    const students: StudentExportRow[] = alumni.map((a) => ({
      nim: a.nim,
      fullName: a.fullName,
      nik: a.nik || "-",
      prodiName: a.prodiName || (a.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen"),
      degree: a.degree || (a.prodiCode === "61101" ? "S2" : "S1"),
      birthDateStr: formatIndoDate(a.birthDate),
      gpa: a.gpa,
      predikat: getPredikatKelulusan(a.gpa),
    }));

    const dateLabel = formatIndoDate(alumni[0].yudisiumDate);
    const resolvedDecree = decreeNumber || alumni[0].yudisiumDecreeNumber || "";

    return buildExcelResponse(students, resolvedDecree, dateStr, dateLabel);
  } catch (error) {
    console.error("Export SK error (GET):", error);
    return NextResponse.json({ error: "Gagal membuat file Lampiran SK" }, { status: 500 });
  }
}
