import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { getInstitutionSettings } from "@/lib/institution";
import { generateLampiranSkPdf } from "@/lib/generate-lampiran-pdf";

function getPredikatKelulusan(gpa: number | null | undefined): string {
  if (gpa === null || gpa === undefined || isNaN(gpa)) return "Memuaskan";
  if (gpa >= 3.75) return "Dengan Pujian";
  if (gpa >= 3.5) return "Sangat Memuaskan";
  if (gpa >= 3.0) return "Memuaskan";
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

interface StudentItem {
  nim: string;
  fullName: string;
  nik?: string | null;
  prodiName?: string | null;
  degree?: string | null;
  birthDate?: Date | string | null;
  gpa?: number | null;
  predikat?: string;
  sks?: number | string | null;
}

// Data sampel untuk keperluan uji coba (test) jika database belum terisi untuk SK tertentu
const sampleStudents: StudentItem[] = [
  { nim: "221612010003", fullName: "ACHMAD WARDANI JAFAR", nik: "7371120102020002", prodiName: "S1 Manajemen", degree: "S1", gpa: 2.94, sks: 151 },
  { nim: "221612010005", fullName: "ADHE NABHIYA PUTRI SYAHRANI", nik: "7371075712030007", prodiName: "S1 Manajemen", degree: "S1", gpa: 2.72, sks: 151 },
  { nim: "221612010006", fullName: "ADINDA SALSABILA PUTRI", nik: "7371102060300008", prodiName: "S1 Manajemen", degree: "S1", gpa: 3.04, sks: 151 },
  { nim: "221612010011", fullName: "AHMAD ABDILLAH", nik: "7371142107020006", prodiName: "S1 Manajemen", degree: "S1", gpa: 3.00, sks: 151 },
  { nim: "221612010012", fullName: "AFIFAH NURUL INSIYAH", nik: "7371114503020004", prodiName: "S1 Manajemen", degree: "S1", gpa: 3.65, sks: 151 },
  { nim: "221612010018", fullName: "ANDI MUHAMMAD FAIZAL", nik: "7371091508010003", prodiName: "S1 Manajemen", degree: "S1", gpa: 3.42, sks: 151 },
  { nim: "221612010022", fullName: "CITRA LESTARI DEWI", nik: "7371136405020001", prodiName: "S1 Manajemen", degree: "S1", gpa: 3.82, sks: 151 },
  { nim: "221612010025", fullName: "DIAN AYU PUSPITA", nik: "7371085209010005", prodiName: "S1 Manajemen", degree: "S1", gpa: 3.55, sks: 151 },
];

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const dateStr = searchParams.get("dateStr") || "";
  const decreeNumber = searchParams.get("decreeNumber") || "000.2/342/STIMI-YAPMI/MKS/VII/2026";
  const customTentang = searchParams.get("tentang");
  const isAutoPrint = searchParams.get("autoPrint") === "true" || searchParams.get("autoPrint") === "1";
  const format = searchParams.get("format");

  // Baca konfigurasi identitas penandatangan & institusi dari pengaturan sistem
  const inst = getInstitutionSettings();

  const leaderName = searchParams.get("leaderName") || inst.leaderName;
  const leaderNidn = searchParams.get("leaderNidn") || inst.leaderNidn;
  const leaderTitle = searchParams.get("leaderTitle") || inst.leaderTitle;
  const institutionCity = inst.city || "Makassar";

  let resolvedDateLabel = dateStr ? formatIndoDate(dateStr) : "31 Juli 2026";
  const decreeDisplay = decreeNumber || "000.2/342/STIMI-YAPMI/MKS/VII/2026";

  // Penentuan teks "Tentang" default sesuai SK yudisium
  const tentangDisplay =
    customTentang ||
    (dateStr && (dateStr.includes("-07-") || dateStr.includes("-08-"))
      ? "Penetapan Yudisium Mahasiswa Semester Genap T.A. 2025/2026"
      : "Penetapan Yudisium Mahasiswa Semester Genap T.A. 2025/2026");

  // Query data mahasiswa dari database
  let students: StudentItem[] = [];

  try {
    const where: Record<string, unknown> = {};

    if (dateStr) {
      const start = new Date(`${dateStr}T00:00:00.000Z`);
      const end = new Date(`${dateStr}T23:59:59.999Z`);
      where.yudisiumDate = { gte: start, lte: end };
    }

    if (decreeNumber) {
      where.yudisiumDecreeNumber = decreeNumber;
    }

    const alumniFromDb = await prisma.alumni.findMany({
      where,
      orderBy: { nim: "asc" },
      select: {
        nim: true,
        fullName: true,
        nik: true,
        prodiName: true,
        degree: true,
        birthDate: true,
        gpa: true,
        yudisiumDate: true,
        yudisiumDecreeNumber: true,
      },
    });

    if (alumniFromDb.length > 0) {
      students = alumniFromDb.map((a) => ({
        nim: a.nim,
        fullName: a.fullName,
        nik: a.nik || "-",
        prodiName: a.prodiName || "S1 Manajemen",
        degree: a.degree || "S1",
        birthDate: a.birthDate,
        gpa: a.gpa,
        predikat: getPredikatKelulusan(a.gpa),
        sks: 151,
      }));

      if (alumniFromDb[0].yudisiumDate && !dateStr) {
        resolvedDateLabel = formatIndoDate(alumniFromDb[0].yudisiumDate);
      }
    }
  } catch (e) {
    console.error("Gagal mengambil alumni dari database:", e);
  }

  // Jika data di database kosong (misal saat mode test atau nomor SK belum disinkronkan),
  // gunakan data uji coba agar admin langsung bisa melihat dan mencetak dokumen
  if (students.length === 0) {
    students = sampleStudents.map((s) => ({
      ...s,
      predikat: getPredikatKelulusan(s.gpa),
    }));
  }

  // Jika parameter format=pdf diminta, buat berkas binary PDF langsung menggunakan pdf-lib
  if (format === "pdf") {
    try {
      const pdfBytes = await generateLampiranSkPdf({
        decreeNumber: decreeDisplay,
        tentang: tentangDisplay,
        dateLabel: resolvedDateLabel,
        city: institutionCity,
        leaderTitle,
        leaderName,
        leaderNidn,
        students,
      });

      const safeDecree = decreeDisplay.replace(/[/\\?%*:|"<>]/g, "_").trim();
      const filename = `LAMPIRAN_SK_${safeDecree}.pdf`;
      const encodedFilename = encodeURIComponent(filename);

      return new NextResponse(Buffer.from(pdfBytes), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
        },
      });
    } catch (err) {
      console.error("Gagal generate PDF:", err);
    }
  }

  // Muat gambar KOP STIMI dari folder public dan encode ke Base64 Data URI untuk print reliability
  let kopBase64 = "";
  try {
    const kopPath = path.join(process.cwd(), "public", "kop-stimi.jpg");
    if (fs.existsSync(kopPath)) {
      const imgBuffer = fs.readFileSync(kopPath);
      kopBase64 = `data:image/jpeg;base64,${imgBuffer.toString("base64")}`;
    }
  } catch (e) {
    console.error("Gagal membaca berkas kop-stimi.jpg:", e);
  }

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lampiran SK Yudisium - ${decreeDisplay}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      color: #111;
      background-color: #f1f5f9;
      line-height: 1.5;
    }
    .toolbar {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #fff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 100;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .toolbar-title {
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn {
      padding: 7px 14px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: #059669;
      color: #fff;
    }
    .btn-primary:hover {
      background: #10b981;
    }
    .btn-secondary {
      background: #334155;
      color: #f8fafc;
    }
    .btn-secondary:hover {
      background: #475569;
    }

    .page-container {
      max-width: 820px;
      margin: 24px auto;
      background: #fff;
      padding: 20mm 20mm 20mm 20mm;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border-radius: 4px;
      min-height: 1050px;
    }

    .kop-container {
      text-align: center;
      margin-bottom: 12px;
    }
    .kop-image {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    .kop-fallback {
      border-bottom: 3px double #111;
      padding-bottom: 10px;
      margin-bottom: 16px;
      text-align: center;
    }
    .kop-yayasan {
      font-size: 11pt;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .kop-pt {
      font-size: 13pt;
      font-weight: bold;
      margin: 2px 0;
    }
    .kop-sk {
      font-size: 9.5pt;
      font-style: italic;
    }
    .kop-alamat {
      font-size: 8.5pt;
      margin-top: 2px;
    }

    /* Keterangan Lampiran Header (Matching User Screenshot 1) */
    .lampiran-header {
      margin: 14px 0 16px 0;
      font-size: 11pt;
      line-height: 1.55;
    }
    .lampiran-table {
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 11pt;
    }
    .lampiran-table td {
      padding: 1.5px 0;
      vertical-align: top;
    }
    .lampiran-table td.col-label {
      width: 78px;
      font-weight: normal;
    }
    .lampiran-table td.col-sep {
      width: 16px;
      text-align: center;
    }
    .lampiran-table td.col-val {
      font-weight: normal;
    }

    /* Tabel Daftar Mahasiswa */
    .students-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 10pt;
    }
    .students-table thead {
      display: table-header-group;
    }
    .students-table tr {
      page-break-inside: avoid;
    }
    .students-table th {
      border: 1px solid #222;
      padding: 6px 4px;
      background-color: #f8fafc;
      font-weight: bold;
      text-align: center;
      font-size: 9.5pt;
      vertical-align: middle;
    }
    .students-table td {
      border: 1px solid #222;
      padding: 5px 6px;
      vertical-align: middle;
      font-size: 9.5pt;
    }
    .td-center {
      text-align: center;
    }
    .td-left {
      text-align: left;
    }
    .td-right {
      text-align: right;
    }

    /* Blok Tanda Tangan Halaman Terakhir (Matching User Screenshot 2) */
    .footer-ttd-container {
      margin-top: 36px;
      display: flex;
      justify-content: flex-end;
      page-break-inside: avoid;
    }
    .ttd-box {
      width: 280px;
      font-size: 11pt;
      line-height: 1.45;
    }
    .ttd-meta-table {
      border-collapse: collapse;
      margin-bottom: 2px;
      width: 100%;
    }
    .ttd-meta-table td {
      padding: 1px 0;
      font-size: 11pt;
      vertical-align: top;
    }
    .ttd-meta-table td.lbl {
      width: 110px;
    }
    .ttd-meta-table td.sep {
      width: 14px;
      text-align: center;
    }
    .ttd-jabatan {
      font-weight: bold;
      margin: 3px 0 0 0;
    }
    .ttd-space {
      height: 72px;
    }
    .ttd-name {
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 2px;
    }
    .ttd-nidn {
      font-size: 10.5pt;
    }

    @media print {
      body {
        background: transparent !important;
      }
      .toolbar {
        display: none !important;
      }
      .page-container {
        margin: 0 !important;
        padding: 10mm 15mm 15mm 15mm !important;
        box-shadow: none !important;
        max-width: 100% !important;
        min-height: auto !important;
        border-radius: 0 !important;
      }
      .kop-image {
        max-width: 100% !important;
      }
      .students-table th {
        background-color: #f1f5f9 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-title">
      <span>📄</span>
      <span>Lampiran SK Yudisium STIMI YAPMI</span>
      <span style="font-size: 11px; opacity: 0.8; font-weight: normal; margin-left: 8px;">
        (SK: ${decreeDisplay} · ${students.length} Mahasiswa)
      </span>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-primary" onclick="window.print()">
        <span>🖨️</span>
        <span>Cetak / Simpan PDF</span>
      </button>
      <a href="/api/v1/pisn/lampiran-sk?dateStr=${dateStr}&decreeNumber=${encodeURIComponent(decreeNumber)}&format=pdf" target="_blank" class="btn btn-secondary" title="Unduh berkas PDF langsung">
        <span>⬇️</span>
        <span>Unduh PDF</span>
      </a>
      <a href="/api/v1/pisn/export-sk?dateStr=${dateStr}&decreeNumber=${encodeURIComponent(decreeNumber)}" class="btn btn-secondary">
        <span>📥</span>
        <span>Excel (.xlsx)</span>
      </a>
      <a href="/api/v1/pisn/sptjm?dateStr=${dateStr}&decreeNumber=${encodeURIComponent(decreeNumber)}&count=${students.length}" target="_blank" class="btn btn-secondary">
        <span>📄</span>
        <span>Lihat SPTJM</span>
      </a>
      <button class="btn btn-secondary" onclick="window.close()">
        <span>Tutup</span>
      </button>
    </div>
  </div>

  <div class="page-container">
    <div class="kop-container">
      ${
        kopBase64
          ? `<img src="${kopBase64}" alt="Kop Surat STIMI YAPMI Makassar" class="kop-image" />`
          : `<div class="kop-fallback">
              <div class="kop-yayasan">YAYASAN PENDIDIKAN MANAJEMEN INDONESIA (YAPMI)</div>
              <div class="kop-pt">SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA (STIMI) YAPMI MAKASSAR</div>
              <div class="kop-sk">Status Terakreditasi BAN-PT · Kode PT: ${inst.institutionCode}</div>
              <div class="kop-alamat">${inst.address} · Website: ${inst.website}</div>
            </div>`
      }
    </div>

    <div class="lampiran-header">
      <table class="lampiran-table">
        <tr>
          <td class="col-label">Lampiran</td>
          <td class="col-sep">:</td>
          <td class="col-val">Surat Keputusan Ketua STIMI YAPMI Makassar</td>
        </tr>
        <tr>
          <td class="col-label">Nomor</td>
          <td class="col-sep">:</td>
          <td class="col-val"><strong>${decreeDisplay}</strong></td>
        </tr>
        <tr>
          <td class="col-label">Tentang</td>
          <td class="col-sep">:</td>
          <td class="col-val">${tentangDisplay}</td>
        </tr>
        <tr>
          <td class="col-label">Tanggal</td>
          <td class="col-sep">:</td>
          <td class="col-val">${resolvedDateLabel}</td>
        </tr>
      </table>
    </div>

    <table class="students-table">
      <thead>
        <tr>
          <th style="width: 32px;">No</th>
          <th style="width: 105px;">NIM</th>
          <th>Nama Mahasiswa</th>
          <th style="width: 110px;">NIK</th>
          <th style="width: 115px;">Program Studi</th>
          <th style="width: 45px;">Jenj.</th>
          <th style="width: 45px;">IPK</th>
          <th style="width: 110px;">Predikat</th>
        </tr>
      </thead>
      <tbody>
        ${students
          .map(
            (s, idx) => `
        <tr>
          <td class="td-center">${idx + 1}</td>
          <td class="td-center" style="font-family: monospace; font-size: 10pt; font-weight: bold;">${s.nim}</td>
          <td class="td-left" style="font-weight: 600;">${s.fullName}</td>
          <td class="td-center" style="font-family: monospace; font-size: 9pt;">${s.nik || "-"}</td>
          <td class="td-left">${s.prodiName || "S1 Manajemen"}</td>
          <td class="td-center">${s.degree || "S1"}</td>
          <td class="td-center" style="font-weight: bold;">${s.gpa !== null && s.gpa !== undefined ? Number(s.gpa).toFixed(2) : "-"}</td>
          <td class="td-center">${s.predikat || getPredikatKelulusan(s.gpa)}</td>
        </tr>`
          )
          .join("")}
      </tbody>
    </table>

    <div class="footer-ttd-container">
      <div class="ttd-box">
        <table class="ttd-meta-table">
          <tr>
            <td class="lbl">Ditetapkan di</td>
            <td class="sep">:</td>
            <td>${institutionCity}</td>
          </tr>
          <tr>
            <td class="lbl">Pada Tanggal</td>
            <td class="sep">:</td>
            <td>${resolvedDateLabel}</td>
          </tr>
        </table>
        
        <p class="ttd-jabatan">${leaderTitle}</p>

        <div class="ttd-space"></div>

        <p class="ttd-name">${leaderName}</p>
        <p class="ttd-nidn">NIDN. ${leaderNidn}</p>
      </div>
    </div>
  </div>

  ${
    isAutoPrint
      ? `<script>
          window.addEventListener('load', function() {
            setTimeout(function() { window.print(); }, 400);
          });
        </script>`
      : ""
  }
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
