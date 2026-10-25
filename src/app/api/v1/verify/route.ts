import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = (searchParams.get("q") || "").trim();

    if (!query) {
      return NextResponse.json(
        { error: "Masukkan NIM atau Nomor Ijazah / PISN yang ingin diverifikasi." },
        { status: 400 }
      );
    }

    const alumni = await prisma.alumni.findFirst({
      where: {
        OR: [
          { nim: query },
          { pisnNumber: query },
          { certificateNumber: query },
        ],
      },
      select: {
        id: true,
        nim: true,
        fullName: true,
        prodiCode: true,
        prodiName: true,
        degree: true,
        registrationType: true,
        entryPeriod: true,
        exitPeriod: true,
        graduationYear: true,
        yudisiumDate: true,
        yudisiumDecreeNumber: true,
        thesisTitle: true,
        pisnNumber: true,
        pisnBatchNumber: true,
        certificateNumber: true,
        isVerified: true,
        ijazahScan: { select: { fileName: true } },
        transkripScan: { select: { fileName: true } },
      },
    });

    if (!alumni) {
      return NextResponse.json({
        found: false,
        message: "Data kelulusan tidak ditemukan dalam basis data resmi STIMI YAPMI Makassar.",
      });
    }

    return NextResponse.json({
      found: true,
      data: {
        ...alumni,
        hasIjazahArchive: !!alumni.ijazahScan,
        hasTranskripArchive: !!alumni.transkripScan,
        institution: "Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar",
        institutionCode: "093046",
        statusLegalitas: alumni.pisnNumber
          ? "TERDAFTAR & TERVERIFIKASI PISN KEMENDIKBUDRISTEK"
          : "TERDAFTAR AKADEMIK STIMI YAPMI MAKASSAR",
      },
    });
  } catch (error) {
    console.error("Public verify error:", error);
    return NextResponse.json(
      { error: "Terjadi gangguan saat memverifikasi data" },
      { status: 500 }
    );
  }
}
