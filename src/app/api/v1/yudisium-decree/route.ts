import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { saveDecreePdf, listAllUploadedDecrees, sanitizeSkNumber } from "@/lib/storage";
import { invalidateStatsCache } from "@/lib/statsCache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const decrees = listAllUploadedDecrees();

    // Query distinct yudisium dates and decree numbers from Alumni
    const alumniList = await prisma.alumni.findMany({
      select: {
        yudisiumDate: true,
        yudisiumDecreeNumber: true,
      },
    });

    const dateMap: Record<
      string,
      {
        dateStr: string;
        skNumber: string;
        count: number;
        hasPdf: boolean;
      }
    > = {};

    for (const a of alumniList) {
      if (!a.yudisiumDate) continue;
      const dStr = a.yudisiumDate.toISOString().split("T")[0];
      if (!dateMap[dStr]) {
        dateMap[dStr] = {
          dateStr: dStr,
          skNumber: a.yudisiumDecreeNumber || "",
          count: 0,
          hasPdf: false,
        };
      }
      dateMap[dStr].count++;
      if (a.yudisiumDecreeNumber && !dateMap[dStr].skNumber) {
        dateMap[dStr].skNumber = a.yudisiumDecreeNumber;
      }
    }

    const knownDecrees = Object.values(dateMap)
      .sort((a, b) => b.dateStr.localeCompare(a.dateStr))
      .map((item) => {
        const safeKey = item.skNumber ? sanitizeSkNumber(item.skNumber) : "";
        const hasPdf = safeKey ? Boolean(decrees[safeKey]) : false;
        return {
          ...item,
          hasPdf,
        };
      });

    return NextResponse.json({
      success: true,
      decrees,
      knownDecrees,
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("List decrees error:", error);
    return NextResponse.json({ error: "Gagal memuat daftar SK Yudisium" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const decreeNumber = (formData.get("decreeNumber") as string)?.trim();
    const yudisiumDateStr = (formData.get("yudisiumDate") as string)?.trim();
    const file = formData.get("file") as File | null;

    if (!decreeNumber) {
      return NextResponse.json({ error: "Nomor SK Yudisium wajib diisi" }, { status: 400 });
    }

    let savedFile = null;
    if (file && typeof file === "object" && "size" in file && file.size > 0) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        return NextResponse.json({ error: "Hanya file berekstensi .pdf yang diperbolehkan" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      savedFile = await saveDecreePdf(decreeNumber, buffer, file.name);
    }

    let updatedStudentsCount = 0;
    // Jika yudisiumDate disediakan, seragamkan nomor SK ke seluruh mahasiswa pada tanggal tersebut
    if (yudisiumDateStr) {
      const yDate = new Date(yudisiumDateStr);
      if (!isNaN(yDate.getTime())) {
        const startOfDay = new Date(yDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(yDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const updateResult = await prisma.alumni.updateMany({
          where: {
            yudisiumDate: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          data: {
            yudisiumDecreeNumber: decreeNumber,
          },
        });
        updatedStudentsCount = updateResult.count;
      }
    }

    invalidateStatsCache();

    return NextResponse.json({
      success: true,
      message: savedFile
        ? `Dokumen PDF SK Yudisium (${decreeNumber}) berhasil disimpan${
            updatedStudentsCount > 0 ? ` dan disematkan ke ${updatedStudentsCount} mahasiswa` : ""
          }`
        : `Nomor SK Yudisium (${decreeNumber}) berhasil disimpan${
            updatedStudentsCount > 0 ? ` untuk ${updatedStudentsCount} mahasiswa` : ""
          }. File PDF dapat diunggah menyusul.`,
      data: {
        decreeNumber,
        safeKey: sanitizeSkNumber(decreeNumber),
        hasPdf: Boolean(savedFile),
        fileName: savedFile ? savedFile.fileName : null,
        size: savedFile ? savedFile.size : null,
        updatedStudentsCount,
      },
    });
  } catch (error) {
    console.error("Upload decree error:", error);
    return NextResponse.json({ error: "Gagal memproses SK Yudisium" }, { status: 500 });
  }
}
