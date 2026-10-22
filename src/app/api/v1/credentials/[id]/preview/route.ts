import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAbsoluteFilePath, fileExists } from "@/lib/storage";
import fs from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "ijazah"; // "ijazah" or "transkrip"

    // Check if id is a valid 24-character hexadecimal MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    // Search by MongoDB ObjectId or by NIM
    const alumni = await prisma.alumni.findFirst({
      where: isObjectId
        ? { OR: [{ id: id }, { nim: id }] }
        : { nim: id },
    });

    if (!alumni) {
      return NextResponse.json(
        { error: "Data alumni / lulusan tidak ditemukan" },
        { status: 404 }
      );
    }

    const fileMeta = type === "transkrip" ? alumni.transkripScan : alumni.ijazahScan;

    if (!fileMeta || !fileMeta.filePath) {
      return NextResponse.json(
        { error: `Berkas scan ${type} belum diunggah untuk lulusan ini` },
        { status: 404 }
      );
    }

    if (!fileExists(fileMeta.filePath)) {
      return NextResponse.json(
        { error: `File fisik tidak ditemukan pada server: ${fileMeta.filePath}` },
        { status: 404 }
      );
    }

    const fullPath = getAbsoluteFilePath(fileMeta.filePath);
    const fileBuffer = await fs.promises.readFile(fullPath);

    const filename = `${alumni.nim}_${type}.pdf`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": fileMeta.mimeType || "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Preview credential error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat membaca berkas" },
      { status: 500 }
    );
  }
}
