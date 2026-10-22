import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

function parseDateIndo(str?: string) {
  if (!str) return new Date();
  // Check direct valid date first (e.g. ISO YYYY-MM-DD)
  const direct = new Date(str);
  if (!isNaN(direct.getTime()) && !/^[0-9]{1,2}\s+[a-zA-Z]+/i.test(str.trim())) {
    return direct;
  }
  const months: Record<string, number> = {
    januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
    juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
  };
  const parts = str.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const month = months[parts[1].toLowerCase()] ?? 8;
    const year = parseInt(parts[2], 10) || 2026;
    return new Date(Date.UTC(year, month, day, 0, 0, 0));
  }
  return new Date();
}

function getOfficialSkNumber(date: Date): string {
  try {
    const dateStr = date.toISOString().split("T")[0];
    if (dateStr === "2026-07-31") return "000.2/342/STIMI-YAPMI/MKS/VII/2026";
    if (dateStr === "2026-08-08") return "000.2/443/STIMI-YAPMI/MKS/VIII/2026";
    if (dateStr === "2026-09-04") return "000.2/493/STIMI-YAPMI/MKS/IX/2026";
    if (dateStr === "2026-09-17") return "000.2/511/STIMI-YAPMI/MKS/IX/2026";
    if (dateStr === "2026-09-18") return "000.2/512/STIMI-YAPMI/MKS/IX/2026";
  } catch {
    // fallback
  }
  return "000.2/512/STIMI-YAPMI/MKS/IX/2026";
}

function parsePisnBelmawaRawText(text: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let currentBatch = "";
  let currentGenerateDate = new Date();
  const students: Array<{
    nim: string;
    fullName: string;
    pisnNumber: string;
    pisnBatchNumber: string;
    yudisiumDate: Date;
    graduationYear: number;
    prodiCode: string;
    prodiName: string;
    degree: string;
    entryPeriod: string;
    exitPeriod: string;
  }> = [];

  for (const line of lines) {
    if (line.startsWith("Nomor Batch:")) {
      const parts = line.split(",").map((p) => p.trim());
      currentBatch = parts[1] || "";
      continue;
    }

    if (line.startsWith("Tanggal Generate Nomor:")) {
      const parts = line.split(",").map((p) => p.trim());
      currentGenerateDate = parseDateIndo(parts[1]);
      continue;
    }

    if (
      line.startsWith("NIM,") ||
      line.startsWith("Perguruan Tinggi:") ||
      line.startsWith("Program Studi:") ||
      line.startsWith("Operator PT:") ||
      line.startsWith("Tanggal Export Data:") ||
      line.startsWith(",,,")
    ) {
      continue;
    }

    // Tabular row: NIM,Nama Mahasiswa,Nomor Ijazah,Keterangan
    const cols = line.split(",").map((c) => c.trim());
    if (cols.length >= 3 && /^\d+$/.test(cols[0])) {
      const nim = cols[0];
      const nimPrefix = nim.substring(0, 2);
      const entryYear = parseInt(nimPrefix, 10) ? 2000 + parseInt(nimPrefix, 10) : 2022;
      const gradYear = currentGenerateDate.getFullYear() || 2026;

      students.push({
        nim,
        fullName: cols[1],
        pisnNumber: cols[2],
        pisnBatchNumber: currentBatch,
        yudisiumDate: currentGenerateDate,
        graduationYear: gradYear,
        prodiCode: "61201",
        prodiName: "S1 Manajemen",
        degree: "S1",
        entryPeriod: `${entryYear}-1`,
        exitPeriod: `${gradYear - 1}-2`,
      });
    }
  }

  return students;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const rawText = formData.get("rawText") as string | null;
    const file = formData.get("file") as File | null;

    let recordsInserted = 0;
    let recordsUpdated = 0;
    let recordsFailed = 0;
    const errors: Array<{ row: number; nim?: string; error: string }> = [];

    // Case A: Raw text paste from Belmawa
    if (rawText && rawText.trim().length > 0) {
      const parsedStudents = parsePisnBelmawaRawText(rawText);

      if (parsedStudents.length === 0) {
        return NextResponse.json(
          { error: "Format teks PISN tidak terbaca atau tidak ada baris data mahasiswa valid." },
          { status: 400 }
        );
      }

      for (let i = 0; i < parsedStudents.length; i++) {
        const s = parsedStudents[i];
        try {
          const existing = await prisma.alumni.findUnique({ where: { nim: s.nim } });
          if (existing) {
            await prisma.alumni.update({
              where: { nim: s.nim },
              data: {
                fullName: s.fullName,
                pisnNumber: s.pisnNumber,
                certificateNumber: s.pisnNumber,
                pisnBatchNumber: s.pisnBatchNumber || existing.pisnBatchNumber,
                yudisiumDate: s.yudisiumDate,
                graduationYear: s.graduationYear,
                prodiCode: s.prodiCode,
                prodiName: s.prodiName,
                entryPeriod: existing.entryPeriod || s.entryPeriod,
                exitPeriod: existing.exitPeriod || s.exitPeriod,
              },
            });
            recordsUpdated++;
          } else {
            await prisma.alumni.create({
              data: {
                nim: s.nim,
                fullName: s.fullName,
                pisnNumber: s.pisnNumber,
                certificateNumber: s.pisnNumber,
                pisnBatchNumber: s.pisnBatchNumber,
                prodiCode: s.prodiCode,
                prodiName: s.prodiName,
                degree: s.degree,
                registrationType: "PESERTA_DIDIK_BARU",
                entryPeriod: s.entryPeriod,
                exitPeriod: s.exitPeriod,
                cohortYear: parseInt(s.nim.substring(0, 4), 10) || 2022,
                graduationYear: s.graduationYear,
                yudisiumDate: s.yudisiumDate,
                yudisiumDecreeNumber: getOfficialSkNumber(s.yudisiumDate),
                thesisTitle: "Telah memenuhi syarat kelulusan dan penomoran ijazah nasional (PISN/PIN)",
                graduationSource: "YUDISIUM_NON_WISUDA",
              },
            });
            recordsInserted++;
          }
        } catch (err: unknown) {
          recordsFailed++;
          errors.push({
            row: i + 1,
            nim: s.nim,
            error: (err as Error)?.message || "Gagal menyimpan baris data",
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Impor teks Belmawa berhasil. ${recordsInserted} data baru, ${recordsUpdated} diperbarui, ${recordsFailed} gagal.`,
        summary: {
          totalRows: parsedStudents.length,
          recordsInserted,
          recordsUpdated,
          recordsFailed,
          errors,
        },
      });
    }

    // Case B: Excel Spreadsheet Upload
    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "Silakan unggah file spreadsheet (.xlsx) atau tempel teks data PISN." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      const getVal = (keys: string[]): string => {
        for (const k of Object.keys(row)) {
          const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
          for (const target of keys) {
            if (cleanK === target.toLowerCase().replace(/[^a-z0-9]/g, "")) {
              const val = row[k];
              if (val instanceof Date) return val.toISOString().split("T")[0];
              return val ? String(val).trim() : "";
            }
          }
        }
        return "";
      };

      const nim = getVal(["NIM", "Nomor Induk Mahasiswa"]);
      const fullName = getVal(["Nama Lengkap", "Nama", "Nama Mahasiswa"]);
      const prodiCodeInput = getVal(["Kode Prodi", "Prodi", "Program Studi"]);
      const registrationTypeInput = getVal(["Jenis Pendaftar", "Jalur Masuk", "Status Pendaftar"]);
      const entryPeriodInput = getVal(["Periode Masuk", "Semester Masuk", "Tahun Masuk"]);
      const exitPeriodInput = getVal(["Periode Keluar", "Semester Keluar", "Tahun Lulus"]);
      const yudisiumDateStr = getVal(["Tanggal Yudisium", "Tgl Yudisium", "Yudisium"]);
      const thesisTitle = getVal(["Judul Skripsi", "Skripsi", "Tugas Akhir", "Judul Tesis"]);
      const pisnNumber = getVal(["Nomor PISN", "PISN", "No PISN", "PIN", "Nomor PIN", "Nomor Ijazah"]);
      const pisnBatchNumber = getVal(["Nomor Batch", "No Batch", "Batch"]);
      const yudisiumDecreeNumber = getVal(["No SK Yudisium", "SK Yudisium", "Nomor SK"]);
      const certificateNumber = getVal(["No Ijazah", "Nomor Ijazah", "No Seri Ijazah"]);
      const gpaStr = getVal(["IPK", "Indeks Prestasi Kumulatif"]);

      if (!nim || !fullName) {
        recordsFailed++;
        errors.push({ row: rowNum, nim, error: "NIM dan Nama Lengkap wajib diisi" });
        continue;
      }

      // Prodi S1 Manajemen vs S2 Manajemen
      let prodiCode = "61201";
      let prodiName = "S1 Manajemen";
      let degree = "S1";

      if (prodiCodeInput.includes("61101") || prodiCodeInput.toLowerCase().includes("s2") || prodiCodeInput.toLowerCase().includes("magister")) {
        prodiCode = "61101";
        prodiName = "S2 Manajemen";
        degree = "S2";
      }

      // Registration Type
      let registrationType:
        | "PESERTA_DIDIK_BARU"
        | "RPL_PEROLEHAN_SKS"
        | "RPL_TRANSFER_SKS"
        | "RPL_KONVERSI_SKS"
        | "KONVERSI_TRANSFER_NILAI" = "PESERTA_DIDIK_BARU";
      const regLower = registrationTypeInput.toLowerCase();
      if (regLower.includes("perolehan") || regLower.includes("konversi")) {
        registrationType = "RPL_PEROLEHAN_SKS";
      } else if (regLower.includes("transfer")) {
        registrationType = "RPL_TRANSFER_SKS";
      }

      let yudisiumDate = new Date();
      if (yudisiumDateStr) {
        const parsed = parseDateIndo(yudisiumDateStr);
        if (!isNaN(parsed.getTime())) yudisiumDate = parsed;
      }

      const graduationYear = yudisiumDate.getFullYear();
      const gpa = gpaStr ? parseFloat(gpaStr.replace(",", ".")) : null;

      // Auto generate Entry & Exit Period format Opsi A if missing
      const nimPrefix = nim.substring(0, 2);
      const entryYear = parseInt(nimPrefix, 10) ? 2000 + parseInt(nimPrefix, 10) : graduationYear - 4;
      const entryPeriod = entryPeriodInput || `${entryYear}-1`;
      const exitPeriod = exitPeriodInput || `${graduationYear - 1}-2`;

      try {
        const existing = await prisma.alumni.findUnique({ where: { nim } });

        if (existing) {
          await prisma.alumni.update({
            where: { nim },
            data: {
              fullName,
              prodiCode,
              prodiName,
              degree,
              registrationType,
              entryPeriod: existing.entryPeriod || entryPeriod,
              exitPeriod: existing.exitPeriod || exitPeriod,
              yudisiumDate,
              graduationYear,
              thesisTitle: thesisTitle || existing.thesisTitle,
              pisnNumber: pisnNumber || existing.pisnNumber,
              pisnBatchNumber: pisnBatchNumber || existing.pisnBatchNumber,
              yudisiumDecreeNumber: yudisiumDecreeNumber || existing.yudisiumDecreeNumber,
              certificateNumber: certificateNumber || existing.certificateNumber,
              gpa: gpa || existing.gpa,
            },
          });
          recordsUpdated++;
        } else {
          await prisma.alumni.create({
            data: {
              nim,
              fullName,
              prodiCode,
              prodiName,
              degree,
              registrationType,
              entryPeriod,
              exitPeriod,
              cohortYear: entryYear,
              graduationYear,
              yudisiumDate,
              yudisiumDecreeNumber: yudisiumDecreeNumber || getOfficialSkNumber(yudisiumDate),
              thesisTitle: thesisTitle || "Telah memenuhi syarat kelulusan",
              pisnNumber: pisnNumber || null,
              pisnBatchNumber: pisnBatchNumber || null,
              certificateNumber: certificateNumber || null,
              gpa,
              graduationSource: "YUDISIUM_NON_WISUDA",
            },
          });
          recordsInserted++;
        }
      } catch (err: unknown) {
        recordsFailed++;
        errors.push({
          row: rowNum,
          nim,
          error: (err as Error)?.message || "Gagal menyimpan baris data",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Impor berhasil diproses. ${recordsInserted} data baru, ${recordsUpdated} diperbarui, ${recordsFailed} gagal.`,
      summary: {
        totalRows: rows.length,
        recordsInserted,
        recordsUpdated,
        recordsFailed,
        errors,
      },
    });
  } catch (error) {
    console.error("Batch import PISN error:", error);
    return NextResponse.json({ error: "Gagal memproses file spreadsheet" }, { status: 500 });
  }
}
