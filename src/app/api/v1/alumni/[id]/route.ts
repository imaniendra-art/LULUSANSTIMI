import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/storage";

function buildAlumniLookup(id: string) {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
  return isObjectId ? { OR: [{ id }, { nim: id }] } : { nim: id };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alumni = await prisma.alumni.findFirst({
      where: buildAlumniLookup(id),
    });

    if (!alumni) {
      return NextResponse.json(
        { error: "Data lulusan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: alumni });
  } catch (error) {
    console.error("Get alumni detail error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail lulusan" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const existing = await prisma.alumni.findFirst({
      where: buildAlumniLookup(id),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Data lulusan tidak ditemukan" },
        { status: 404 }
      );
    }

    const fullName = formData.get("fullName") as string;
    const prodiCode = formData.get("prodiCode") as string;
    const prodiName =
      (formData.get("prodiName") as string) ||
      (prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen");
    const degree = prodiCode === "61101" ? "S2" : "S1";

    const registrationType = formData.get("registrationType") as
      | "PESERTA_DIDIK_BARU"
      | "RPL_PEROLEHAN_SKS"
      | "RPL_TRANSFER_SKS"
      | "RPL_KONVERSI_SKS"
      | "KONVERSI_TRANSFER_NILAI";
    const entryPeriod = formData.get("entryPeriod") as string;
    const exitPeriod = formData.get("exitPeriod") as string;

    const yudisiumDateStr = formData.get("yudisiumDate") as string;
    const yudisiumDecreeNumber = formData.get("yudisiumDecreeNumber") as string;
    const thesisTitle = formData.get("thesisTitle") as string;
    const pisnNumber = formData.get("pisnNumber") as string;
    const pisnBatchNumber = formData.get("pisnBatchNumber") as string;
    const certificateNumber = formData.get("certificateNumber") as string;
    const gpaStr = formData.get("gpa") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const personalEmail = formData.get("personalEmail") as string;

    const updateData: Record<string, unknown> = {};

    if (fullName) updateData.fullName = fullName.trim();
    if (prodiCode) {
      updateData.prodiCode = prodiCode;
      updateData.prodiName = prodiName;
      updateData.degree = degree;
    }
    if (registrationType) updateData.registrationType = registrationType;
    if (entryPeriod !== undefined) updateData.entryPeriod = entryPeriod;
    if (exitPeriod !== undefined) updateData.exitPeriod = exitPeriod;

    if (yudisiumDateStr) {
      const yDate = new Date(yudisiumDateStr);
      updateData.yudisiumDate = yDate;
      updateData.graduationYear = yDate.getFullYear();
    }
    if (yudisiumDecreeNumber !== undefined) updateData.yudisiumDecreeNumber = yudisiumDecreeNumber;
    if (thesisTitle) updateData.thesisTitle = thesisTitle;
    if (pisnNumber !== undefined) updateData.pisnNumber = pisnNumber ? pisnNumber.trim() : null;
    if (pisnBatchNumber !== undefined) updateData.pisnBatchNumber = pisnBatchNumber ? pisnBatchNumber.trim() : null;
    if (certificateNumber !== undefined) updateData.certificateNumber = certificateNumber ? certificateNumber.trim() : null;
    if (gpaStr !== undefined) updateData.gpa = gpaStr ? parseFloat(gpaStr) : null;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (personalEmail !== undefined) updateData.personalEmail = personalEmail;

    // Check if new ijazah file is uploaded
    const ijazahFile = formData.get("ijazahFile") as File | null;
    if (ijazahFile && ijazahFile.size > 0) {
      const buffer = Buffer.from(await ijazahFile.arrayBuffer());
      const saved = await saveUploadedFile({
        buffer,
        subfolder: "credentials/ijazah",
        originalName: ijazahFile.name,
        nim: existing.nim,
      });
      updateData.ijazahScan = {
        fileName: ijazahFile.name,
        filePath: saved.relativePath,
        fileSizeBytes: saved.size,
        mimeType: ijazahFile.type || "application/pdf",
        uploadedAt: new Date(),
      };
    }

    // Check if new transkrip file is uploaded
    const transkripFile = formData.get("transkripFile") as File | null;
    if (transkripFile && transkripFile.size > 0) {
      const buffer = Buffer.from(await transkripFile.arrayBuffer());
      const saved = await saveUploadedFile({
        buffer,
        subfolder: "credentials/transkrip",
        originalName: transkripFile.name,
        nim: existing.nim,
      });
      updateData.transkripScan = {
        fileName: transkripFile.name,
        filePath: saved.relativePath,
        fileSizeBytes: saved.size,
        mimeType: transkripFile.type || "application/pdf",
        uploadedAt: new Date(),
      };
    }

    const updated = await prisma.alumni.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Data lulusan berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("Update alumni error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data lulusan" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.alumni.findFirst({
      where: buildAlumniLookup(id),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Data lulusan tidak ditemukan" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.thesisTitle !== undefined) updateData.thesisTitle = String(body.thesisTitle).trim();
    if (body.yudisiumDecreeNumber !== undefined) updateData.yudisiumDecreeNumber = String(body.yudisiumDecreeNumber).trim();
    if (body.gpa !== undefined) updateData.gpa = typeof body.gpa === "number" ? body.gpa : parseFloat(body.gpa) || null;
    if (body.pisnNumber !== undefined) updateData.pisnNumber = body.pisnNumber ? String(body.pisnNumber).trim() : null;

    const updated = await prisma.alumni.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Data lulusan berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("Patch alumni error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data lulusan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.alumni.findFirst({
      where: buildAlumniLookup(id),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Data lulusan tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.alumni.delete({ where: { id: existing.id } });

    return NextResponse.json({
      success: true,
      message: `Data lulusan dengan NIM ${existing.nim} berhasil dihapus.`,
    });
  } catch (error) {
    console.error("Delete alumni error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data lulusan" },
      { status: 500 }
    );
  }
}
