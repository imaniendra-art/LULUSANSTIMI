import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

interface StudentReqItem {
  nim: string;
  fullName?: string;
}

function buildResponse(
  students: StudentReqItem[],
  decreeNumber?: string,
  dateStr?: string,
  fileFormat: "xlsx" | "csv" = "xlsx"
) {
  // Format template resmi permintaan PISN:
  // Kolom: No, NIM
  const rows = students.map((s, idx) => ({
    "No": idx + 1,
    "NIM": s.nim,
  }));

  const safeDecree = decreeNumber ? decreeNumber.replace(/[/\\?%*:|"<>]/g, "_").trim() : "";
  const baseFilename = safeDecree
    ? `DAFTAR_PISN_${safeDecree}_(${students.length}_Mahasiswa)`
    : `DAFTAR_PISN_Yudisium_${dateStr || "Export"}_(${students.length}_Mahasiswa)`;

  if (fileFormat === "csv") {
    // Bangun string CSV murni: No,NIM
    const csvContent = ["No,NIM", ...rows.map((r) => `${r["No"]},${r["NIM"]}`)].join("\r\n");
    const filename = `${baseFilename}.csv`;
    const encodedFilename = encodeURIComponent(filename);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  }

  // Format Excel (.xlsx)
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows, { header: ["No", "NIM"] });

  // Set lebar kolom yang rapi
  ws["!cols"] = [
    { wch: 8 },  // No
    { wch: 22 }, // NIM
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  const filename = `${baseFilename}.xlsx`;
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

// 1. POST Endpoint: Digunakan saat modal GeneratePisnModal mengirim list mahasiswa langsung
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { students, decreeNumber, dateStr, format = "xlsx" } = body;

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "Daftar mahasiswa kosong" }, { status: 400 });
    }

    const fileFormat = format === "csv" ? "csv" : "xlsx";
    return buildResponse(students, decreeNumber, dateStr, fileFormat);
  } catch (error) {
    console.error("Export Permintaan PISN error (POST):", error);
    return NextResponse.json({ error: "Gagal membuat file template permintaan PISN" }, { status: 500 });
  }
}

// 2. GET Endpoint: Mengunduh langsung berdasarkan query param
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const dateStr = searchParams.get("dateStr");
    const decreeNumber = searchParams.get("decreeNumber") || "";
    const format = searchParams.get("format") === "csv" ? "csv" : "xlsx";

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
      },
    });

    if (alumni.length === 0) {
      return NextResponse.json(
        { error: "Tidak ditemukan mahasiswa pada tanggal/SK yudisium tersebut" },
        { status: 404 }
      );
    }

    return buildResponse(alumni, decreeNumber, dateStr, format);
  } catch (error) {
    console.error("Export Permintaan PISN error (GET):", error);
    return NextResponse.json({ error: "Gagal membuat file permintaan PISN" }, { status: 500 });
  }
}
