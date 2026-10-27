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
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

interface ParsedEligibleRow {
  nim: string;
  fullName: string;
  nik: string;
  gpaFromFile?: number;
  sksFromFile?: string;
  status: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawText = (formData.get("rawText") as string)?.trim();

    let workbook: XLSX.WorkBook;

    if (file && typeof file === "object" && "arrayBuffer" in file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      workbook = XLSX.read(buffer, { type: "buffer" });
    } else if (rawText) {
      workbook = XLSX.read(rawText, { type: "string" });
    } else {
      return NextResponse.json(
        { error: "Silakan unggah file Excel/CSV atau tempel data hasil cek PISN." },
        { status: 400 }
      );
    }

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return NextResponse.json({ error: "File spreadsheet kosong." }, { status: 400 });
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<(string | number | undefined)[]>(sheet, {
      header: 1,
      blankrows: false,
    });

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Tidak ada baris data yang ditemukan." }, { status: 400 });
    }

    // 1. Cari baris header yang memuat "NIM"
    let headerRowIdx = -1;
    let nimCol = -1;
    let nameCol = -1;
    let nikCol = -1;
    let statusCol = -1;
    let ipkCol = -1;
    let sksCol = -1;

    for (let r = 0; r < Math.min(rows.length, 15); r++) {
      const row = rows[r];
      if (!Array.isArray(row)) continue;

      for (let c = 0; c < row.length; c++) {
        const val = String(row[c] || "").trim().toLowerCase();
        if (val === "nim" || val === "nomor induk mahasiswa") {
          headerRowIdx = r;
          nimCol = c;
          break;
        }
      }

      if (headerRowIdx !== -1) {
        // Deteksi kolom lainnya di baris header ini
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c] || "").trim().toLowerCase();
          if (c === nimCol) continue;
          if (val.includes("nama") && nameCol === -1) nameCol = c;
          else if ((val.includes("nik") || val.includes("passport") || val.includes("paspor")) && nikCol === -1) nikCol = c;
          else if (val === "status" || val.includes("status kelayakan") || val.includes("keterangan")) statusCol = c;
          else if (val.includes("ipk") || val.includes("indeks prestasi") && ipkCol === -1) ipkCol = c;
          else if (val.includes("jumlah sks") && !val.includes("status") && sksCol === -1) sksCol = c;
        }
        break;
      }
    }

    if (headerRowIdx === -1 || nimCol === -1) {
      return NextResponse.json(
        { error: "Format file tidak dikenali. Kolom 'NIM' tidak ditemukan pada tabel." },
        { status: 400 }
      );
    }

    // 2. Ambil seluruh mahasiswa yang statusnya Eligible
    const eligibleRecords: ParsedEligibleRow[] = [];
    const notEligibleRecords: Array<{ nim: string; fullName: string; reason: string }> = [];

    for (let r = headerRowIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!Array.isArray(row) || row.length === 0) continue;

      const rawNim = String(row[nimCol] || "").trim().replace(/[^\w]/g, "");
      if (!rawNim || rawNim.length < 5) continue; // Skip jika bukan NIM

      const fullName = nameCol !== -1 ? String(row[nameCol] || "").trim() : "";
      const nik = nikCol !== -1 ? String(row[nikCol] || "").trim() : "";
      
      // Deteksi status
      let statusStr = "Eligible";
      if (statusCol !== -1 && row[statusCol] !== undefined) {
        statusStr = String(row[statusCol] || "").trim();
      } else {
        // Cek apakah ada kata "tidak eligible" atau "not eligible" di sepanjang baris
        const rowStr = row.map((x) => String(x || "")).join(" ").toLowerCase();
        if (rowStr.includes("tidak eligible") || rowStr.includes("not eligible")) {
          statusStr = "Tidak Eligible";
        }
      }

      const isEligible =
        statusStr.toLowerCase().includes("eligible") &&
        !statusStr.toLowerCase().includes("tidak eligible") &&
        !statusStr.toLowerCase().includes("not eligible");

      let gpaVal: number | undefined;
      if (ipkCol !== -1 && row[ipkCol] !== undefined) {
        const parsedGpa = parseFloat(String(row[ipkCol]).replace(",", "."));
        if (!isNaN(parsedGpa)) gpaVal = parsedGpa;
      }

      const sksVal = sksCol !== -1 ? String(row[sksCol] || "").trim() : undefined;

      if (isEligible) {
        eligibleRecords.push({
          nim: rawNim,
          fullName,
          nik,
          gpaFromFile: gpaVal,
          sksFromFile: sksVal,
          status: statusStr,
        });
      } else {
        notEligibleRecords.push({
          nim: rawNim,
          fullName,
          reason: statusStr || "Tidak memenuhi syarat kelayakan PISN",
        });
      }
    }

    if (eligibleRecords.length === 0) {
      return NextResponse.json(
        {
          error: "Tidak ada mahasiswa dengan status 'Eligible' yang ditemukan pada file.",
          notEligibleCount: notEligibleRecords.length,
          notEligibleRecords: notEligibleRecords.slice(0, 10),
        },
        { status: 400 }
      );
    }

    // 3. Cocokkan NIM dengan master database Alumni
    const eligibleNims = eligibleRecords.map((x) => x.nim);
    const alumniList = await prisma.alumni.findMany({
      where: {
        nim: { in: eligibleNims },
      },
      select: {
        id: true,
        nim: true,
        fullName: true,
        nik: true,
        prodiCode: true,
        prodiName: true,
        degree: true,
        birthDate: true,
        birthPlace: true,
        gpa: true,
        yudisiumDate: true,
        yudisiumDecreeNumber: true,
        pisnNumber: true,
        pisnBatchNumber: true,
        thesisTitle: true,
      },
    });

    const alumniByNim = new Map(alumniList.map((a) => [a.nim, a]));

    // 4. Pengelompokan (Group By) berdasarkan Tanggal Yudisium & Nomor SK
    interface StudentSKItem {
      nim: string;
      fullName: string;
      nik: string;
      prodiName: string;
      degree: string;
      birthDateStr: string;
      birthPlace: string;
      gpa: number | null;
      predikat: string;
      yudisiumDateStr: string;
      yudisiumDecreeNumber: string;
      pisnNumber: string | null;
      thesisTitle: string;
      foundInDb: boolean;
    }

    interface SKGroup {
      groupKey: string;
      dateStr: string;
      dateLabel: string;
      decreeNumber: string;
      hasDecreeNumber: boolean;
      totalStudents: number;
      students: StudentSKItem[];
    }

    const groupsMap = new Map<string, SKGroup>();
    const notFoundInDb: ParsedEligibleRow[] = [];
    const missingYudisiumDate: StudentSKItem[] = [];

    for (const record of eligibleRecords) {
      const dbAlumni = alumniByNim.get(record.nim);

      if (!dbAlumni) {
        notFoundInDb.push(record);
        continue;
      }

      const gpa = dbAlumni.gpa ?? record.gpaFromFile ?? null;
      const predikat = getPredikatKelulusan(gpa);
      const nik = dbAlumni.nik || record.nik || "-";
      const fullName = dbAlumni.fullName || record.fullName || "-";
      const prodiName = dbAlumni.prodiName || (dbAlumni.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen");
      const degree = dbAlumni.degree || (dbAlumni.prodiCode === "61101" ? "S2" : "S1");
      const birthDateStr = formatIndoDate(dbAlumni.birthDate);
      const birthPlace = dbAlumni.birthPlace || "-";
      const thesisTitle = dbAlumni.thesisTitle || "-";
      const pisnNumber = dbAlumni.pisnNumber || null;

      const yudisiumDateStr = dbAlumni.yudisiumDate
        ? dbAlumni.yudisiumDate.toISOString().split("T")[0]
        : "";
      const decreeNumber = (dbAlumni.yudisiumDecreeNumber || "").trim();

      const studentItem: StudentSKItem = {
        nim: dbAlumni.nim,
        fullName,
        nik,
        prodiName,
        degree,
        birthDateStr,
        birthPlace,
        gpa,
        predikat,
        yudisiumDateStr,
        yudisiumDecreeNumber: decreeNumber,
        pisnNumber,
        thesisTitle,
        foundInDb: true,
      };

      if (!yudisiumDateStr) {
        missingYudisiumDate.push(studentItem);
        continue;
      }

      // Kunci pengelompokan: gabungan dateStr dan decreeNumber jika ada
      const groupKey = decreeNumber ? `${yudisiumDateStr}__${decreeNumber}` : yudisiumDateStr;

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          groupKey,
          dateStr: yudisiumDateStr,
          dateLabel: formatIndoDate(dbAlumni.yudisiumDate),
          decreeNumber: decreeNumber || "",
          hasDecreeNumber: Boolean(decreeNumber),
          totalStudents: 0,
          students: [],
        });
      }

      const grp = groupsMap.get(groupKey)!;
      grp.totalStudents++;
      grp.students.push(studentItem);
    }

    // Urutkan grup dari tanggal yudisium terbaru
    const groups = Array.from(groupsMap.values()).sort((a, b) =>
      b.dateStr.localeCompare(a.dateStr)
    );

    // Urutkan mahasiswa di dalam setiap grup berdasarkan NIM
    for (const g of groups) {
      g.students.sort((a, b) => a.nim.localeCompare(b.nim));
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalEligibleInFile: eligibleRecords.length,
        totalFoundInDb: alumniList.length,
        totalGroups: groups.length,
        notFoundInDbCount: notFoundInDb.length,
        missingYudisiumDateCount: missingYudisiumDate.length,
        notEligibleInFileCount: notEligibleRecords.length,
      },
      groups,
      notFoundInDb: notFoundInDb.slice(0, 50),
      missingYudisiumDate: missingYudisiumDate.slice(0, 50),
      notEligibleRecords: notEligibleRecords.slice(0, 50),
    });
  } catch (error) {
    console.error("Generate PISN error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Gagal memproses data pengajuan PISN" },
      { status: 500 }
    );
  }
}
