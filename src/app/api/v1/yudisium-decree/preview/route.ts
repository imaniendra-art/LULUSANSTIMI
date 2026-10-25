import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getDecreePdfPath } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sk = searchParams.get("sk");

    if (!sk) {
      return NextResponse.json({ error: "Nomor SK tidak ditentukan" }, { status: 400 });
    }

    const { exists, absolutePath, relativePath } = getDecreePdfPath(sk);

    if (!exists) {
      return NextResponse.json(
        { error: "File PDF SK Yudisium belum diunggah untuk nomor SK ini", sk },
        { status: 404 }
      );
    }

    const fileBuffer = await fs.promises.readFile(absolutePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="SK_${sk.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Preview decree error:", error);
    return NextResponse.json({ error: "Gagal membuka file SK" }, { status: 500 });
  }
}
