import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { getInstitutionSettings } from "@/lib/institution";

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

// Menghitung default Semester & Tahun Akademik berdasarkan tanggal yudisium
function inferDefaultAcademicYear(dateStr?: string | null): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  const year = isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
  const month = isNaN(d.getMonth()) ? new Date().getMonth() + 1 : d.getMonth() + 1; // 1-12

  // Bulan 3-8 = Genap (Tahun lalu/Tahun ini)
  // Bulan 9-2 = Ganjil (Tahun ini/Tahun depan)
  if (month >= 3 && month <= 8) {
    return `SEMESTER GENAP TA ${year - 1}/${year}`;
  } else if (month >= 9) {
    return `SEMESTER GANJIL TA ${year}/${year + 1}`;
  } else {
    return `SEMESTER GANJIL TA ${year - 1}/${year}`;
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const dateStr = searchParams.get("dateStr") || "";
  const decreeNumber = searchParams.get("decreeNumber") || "000.2/848/STIMI-YAPMI/MKS/VII/2025";
  const customAcademicYear = searchParams.get("academicYear");
  const customMeetingDate = searchParams.get("meetingDate");
  const customProdi = searchParams.get("prodiName") || "PROGRAM STUDI MANAJEMEN";
  const customDegree = searchParams.get("degree") || "STRATA (S.1)";
  const isAutoPrint = searchParams.get("autoPrint") === "true" || searchParams.get("autoPrint") === "1";

  // Ambil data penandatangan resmi institusi
  const inst = getInstitutionSettings();
  const leaderName = searchParams.get("leaderName") || inst.leaderName;
  const leaderNidn = searchParams.get("leaderNidn") || inst.leaderNidn;
  const leaderTitle = searchParams.get("leaderTitle") || inst.leaderTitle || "Ketua STIMI YAPMI Makassar";
  const institutionCity = inst.city || "Makassar";

  const resolvedDateLabel = dateStr ? formatIndoDate(dateStr) : formatIndoDate(new Date());
  const resolvedMeetingDate = customMeetingDate ? formatIndoDate(customMeetingDate) : resolvedDateLabel;
  const resolvedAcademicYear = (customAcademicYear || inferDefaultAcademicYear(dateStr)).trim().toUpperCase();

  // Muat gambar KOP STIMI YAPMI dari folder public dan konversi ke Base64 Data URI
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

  // Teks jenjang dalam huruf kecil untuk bagian isi putusan
  const degreeLower = customDegree.toLowerCase().includes("s.2") || customDegree.toLowerCase().includes("s2")
    ? "strata dua (S.2)"
    : "strata satu (S.1)";

  const prodiClean = customProdi.replace(/^(PROGRAM\s*STUDI\s*)/i, "").trim();

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SK Yudisium - ${decreeNumber}</title>
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
      line-height: 1.45;
    }
    .toolbar {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #fff;
      padding: 10px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 100;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .toolbar-title {
      font-weight: 700;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .toolbar-actions {
      display: flex;
      gap: 10px;
    }
    .btn {
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #0d9488;
      color: white;
    }
    .btn-primary:hover {
      background: #0f766e;
    }
    .btn-secondary {
      background: #334155;
      color: #e2e8f0;
    }
    .btn-secondary:hover {
      background: #475569;
    }
    .page-container {
      max-width: 215mm;
      min-height: 330mm; /* Standar kertas F4 / Folio atau A4 */
      margin: 20px auto;
      background: #fff;
      padding: 15mm 22mm 20mm 22mm;
      box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    }
    .kop-container {
      margin-bottom: 12px;
      text-align: center;
    }
    .kop-image {
      width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
      object-fit: contain;
    }
    .kop-fallback {
      border-bottom: 3px double #000;
      padding-bottom: 10px;
      text-align: center;
    }
    .kop-yayasan {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .kop-pt {
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .kop-sk {
      font-size: 9pt;
    }
    .kop-alamat {
      font-size: 8.5pt;
    }
    
    /* Header SK */
    .sk-header {
      text-align: center;
      margin-top: 10px;
      margin-bottom: 12px;
    }
    .sk-title {
      font-size: 11.5pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.25;
    }
    .sk-number {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 4px;
      margin-bottom: 6px;
    }
    .sk-tentang-label {
      font-size: 10.5pt;
      font-weight: bold;
      letter-spacing: 3px;
      margin: 4px 0;
    }
    .sk-subject {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      line-height: 1.25;
      margin-bottom: 8px;
    }

    /* Preamble */
    .sk-preamble {
      font-size: 10.5pt;
      margin-bottom: 8px;
      text-align: justify;
    }

    /* Konsideran Table */
    .sk-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      margin-bottom: 10px;
    }
    .sk-table td {
      vertical-align: top;
      padding: 3px 0;
    }
    .col-label {
      width: 110px;
      font-weight: bold;
    }
    .col-colon {
      width: 15px;
      text-align: center;
      font-weight: bold;
    }
    .col-content {
      text-align: justify;
      line-height: 1.35;
    }
    .col-content ol {
      margin-left: 18px;
      padding-left: 0;
    }
    .col-content ol li {
      margin-bottom: 3px;
      padding-left: 4px;
    }
    .col-content p {
      margin-bottom: 4px;
    }

    .memutuskan-divider {
      text-align: center;
      font-weight: bold;
      font-size: 10.5pt;
      letter-spacing: 3px;
      margin: 8px 0 6px;
    }

    /* TTD Block */
    .ttd-wrapper {
      margin-top: 14px;
      display: flex;
      justify-content: flex-end;
      page-break-inside: avoid;
    }
    .ttd-box {
      width: 280px;
      font-size: 10.5pt;
      text-align: left;
    }
    .ttd-space {
      height: 60px;
    }
    .ttd-name {
      font-weight: bold;
      text-decoration: underline;
    }

    /* Tembusan Block */
    .tembusan-box {
      margin-top: 15px;
      font-size: 9pt;
      line-height: 1.35;
      page-break-inside: avoid;
    }
    .tembusan-box ol {
      margin-left: 18px;
      padding-left: 0;
    }
    .tembusan-box ol li {
      margin-bottom: 1px;
    }

    @media print {
      @page {
        size: legal portrait; /* atau A4 / F4 */
        margin: 12mm 15mm 15mm 15mm;
      }
      body {
        background: #fff;
      }
      .toolbar {
        display: none !important;
      }
      .page-container {
        margin: 0;
        padding: 0;
        box-shadow: none;
        max-width: 100%;
        min-height: auto;
      }
    }
  </style>
</head>
<body>

  <!-- Floating Toolbar -->
  <div class="toolbar">
    <div class="toolbar-title">
      <span>📜 Pratinjau Surat Keputusan (SK) Yudisium Resmi</span>
      <span style="font-size: 11px; background: rgba(255,255,255,0.2); padding: 2px 8px; rounded: 4px;">${decreeNumber}</span>
    </div>
    <div class="toolbar-actions">
      <button type="button" class="btn btn-primary" onclick="window.print()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        <span>Cetak / Simpan PDF</span>
      </button>
      <button type="button" class="btn btn-secondary" onclick="window.close()">
        <span>Tutup</span>
      </button>
    </div>
  </div>

  <div class="page-container">
    <!-- KOP RESMI -->
    <div class="kop-container">
      ${
        kopBase64
          ? `<img src="${kopBase64}" alt="KOP STIMI YAPMI Makassar" class="kop-image" />`
          : `<div class="kop-fallback">
              <div class="kop-yayasan">YAYASAN PEMBANGUNAN MANAJEMEN INDONESIA (YAPMI)</div>
              <div class="kop-pt">SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA (STIMI) YAPMI MAKASSAR</div>
              <div class="kop-sk">Status Terakreditasi BAN-PT · Program Studi Sarjana (S1) Manajemen & Magister (S2) Manajemen</div>
              <div class="kop-alamat">Kampus: Jl. Danau Tanjung Bunga No. 1, Kota Makassar · Website: stimiyapmim.ac.id</div>
            </div>`
      }
    </div>

    <!-- JUDUL DOKUMEN SK -->
    <div class="sk-header">
      <div class="sk-title">
        SURAT KEPUTUSAN<br>
        SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA<br>
        (STIMI) YAPMI MAKASSAR
      </div>
      <div class="sk-number">
        Nomor : ${decreeNumber}
      </div>
      <div class="sk-tentang-label">T E N T A N G</div>
      <div class="sk-subject">
        PENETAPAN YUDISIUM MAHASISWA JENJANG ${customDegree.toUpperCase()}<br>
        ${customProdi.toUpperCase()}<br>
        SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA<br>
        YAYASAN PEMBANGUNAN MANAJEMEN INDONESIA<br>
        (STIMI-YAPMI) MAKASSAR<br>
        ${resolvedAcademicYear}
      </div>
    </div>

    <!-- PREAMBLE -->
    <div class="sk-preamble">
      Ketua Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar, setelah :
    </div>

    <!-- KONSIDERAN -->
    <table class="sk-table">
      <tr>
        <td class="col-label">Menimbang</td>
        <td class="col-colon">:</td>
        <td class="col-content">
          <ol type="a">
            <li>Bahwa Mahasiswa Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar yang telah menyelesaikan studi dan memenuhi persyaratan kelulusan perlu di yudisium.</li>
            <li>Bahwa dengan pertimbangan sebagaimana poin 1 di atas di pandang perlu menerbitkan Surat Keputusan Ketua Sekolah Tinggi Ilmu Manamajemen Indonesia (STIMI) YAPMI.</li>
          </ol>
        </td>
      </tr>
      <tr>
        <td class="col-label">Mengingat</td>
        <td class="col-colon">:</td>
        <td class="col-content">
          <ol type="1">
            <li>Undang-Undang Republik Indonesia No. 20 Tahun 2003, Tentang Sistem Pendidikan Nasional.</li>
            <li>Undang-Undang Republik Indonesia No. 14 Tahun 2005 tentang Guru dan Dosen.</li>
            <li>Undang-Undang Republik Indonesia No. 12 Tahun 2012 tentang Pendidikan Tinggi.</li>
            <li>Undang-Undang Republik Indonesia No. 37 Tahun 2009 tentang Dosen.</li>
            <li>Peraturan Menteri Pendidikan Nasional dan Kebudayaan RI Nomor 92 Tahun 2014 tentang Petunjuk Teknis Pelaksanaan Penilaian Angka Kredit Jabatan Fungsional Dosen dan Angka Kreditnya.</li>
            <li>Peraturan Menteri Riset, Teknologi dan Pendidikan Tinggi Nomor 44 Tahun 2015 Tentang Standar Nasional Pendidikan Tinggi.</li>
          </ol>
        </td>
      </tr>
      <tr>
        <td class="col-label">Memperhatikan</td>
        <td class="col-colon">:</td>
        <td class="col-content">
          <ol type="1">
            <li>Statuta STIMI YAPMI Makassar.</li>
            <li>Pedoman akademik STIMI YAPMI Makassar.</li>
            <li>Kalender Akademik STIMI YAPMI Makassar.</li>
            <li>Hasil keputusan rapat pimpinan STIMI-YAPMI Makassar tanggal ${resolvedMeetingDate}.</li>
          </ol>
        </td>
      </tr>
    </table>

    <!-- MEMUTUSKAN -->
    <div class="memutuskan-divider">M E M U T U S K A N :</div>

    <table class="sk-table">
      <tr>
        <td class="col-label">Menetapkan</td>
        <td class="col-colon">:</td>
        <td class="col-content">
          Keputusan Ketua Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar tentang Yudisium mahasiswa jenjang ${degreeLower} ${customProdi} STIMI YAPMI Makassar ${resolvedAcademicYear}.
        </td>
      </tr>
      <tr>
        <td class="col-label">Pertama</td>
        <td class="col-colon">:</td>
        <td class="col-content">
          Bahwa nama-nama mahasiswa ${customProdi} jenjang ${customDegree} yang di yudisium terlampir.
        </td>
      </tr>
      <tr>
        <td class="col-label">Kedua</td>
        <td class="col-colon">:</td>
        <td class="col-content">
          Surat Keputusan ini mulai berlaku sejak tanggal ditetapkan dan apabila dikemudian hari terdapat kekeliruan, maka akan dilakukan perbaikan sebagaimana mestinya.
        </td>
      </tr>
    </table>

    <!-- TANDA TANGAN KETUA -->
    <div class="ttd-wrapper">
      <div class="ttd-box">
        <div>Ditetapkan di : ${institutionCity}</div>
        <div>Pada Tanggal : ${resolvedDateLabel}</div>
        <div style="margin-top: 4px; font-weight: bold;">${leaderTitle},</div>
        <div class="ttd-space"></div>
        <div class="ttd-name">${leaderName}</div>
        <div>NIDN. ${leaderNidn}</div>
      </div>
    </div>

    <!-- TEMBUSAN -->
    <div class="tembusan-box">
      <strong>Tembusan Kepada Yth. :</strong>
      <ol type="1">
        <li>Kepala Layanan Pendidikan Tinggi Wil. IX Sultanbatara di Makassar.</li>
        <li>Ketua Yayasan Pembangunan Manajemen Indonesia Makassar di Makassar.</li>
        <li>Kepala Administrasi Keuangan STIMI YAPMI Makassar.</li>
        <li>Arsip.</li>
      </ol>
    </div>
  </div>

  ${isAutoPrint ? `<script>window.addEventListener('load', () => window.print());</script>` : ""}
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, must-revalidate",
    },
  });
}
