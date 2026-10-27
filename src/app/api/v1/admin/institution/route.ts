import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  getInstitutionSettings,
  institutionConfigFilePath,
} from "@/lib/institution";

export async function GET() {
  const settings = getInstitutionSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = getInstitutionSettings();

    const updated = {
      ...current,
      leaderName: (body.leaderName || current.leaderName).trim(),
      leaderNidn: (body.leaderNidn || current.leaderNidn).trim(),
      leaderPangkat: (body.leaderPangkat || current.leaderPangkat).trim(),
      leaderTitle: (body.leaderTitle || current.leaderTitle).trim(),
      institutionName: (body.institutionName || current.institutionName).trim(),
      institutionCode: (body.institutionCode || current.institutionCode).trim(),
      accreditation: (body.accreditation || current.accreditation).trim(),
      city: (body.city || current.city).trim(),
      address: (body.address || current.address).trim(),
      website: (body.website || current.website).trim(),
    };

    const dir = path.dirname(institutionConfigFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(institutionConfigFilePath, JSON.stringify(updated, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      message: "Data identitas penandatangan & lembaga berhasil disimpan.",
      settings: updated,
    });
  } catch (error) {
    console.error("Gagal menyimpan konfigurasi institusi:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data konfigurasi institusi." },
      { status: 500 }
    );
  }
}
