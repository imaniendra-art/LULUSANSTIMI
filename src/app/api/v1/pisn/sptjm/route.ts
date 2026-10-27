import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const dateStr = searchParams.get("dateStr") || "";
  const decreeNumber = searchParams.get("decreeNumber") || "";
  const countParam = searchParams.get("count");
  const leaderName = searchParams.get("leaderName") || "Dr. H. Ibrahim, S.E., M.Si.";
  const leaderTitle = searchParams.get("leaderTitle") || "Ketua STIMI YAPMI Makassar";
  const sptjmNumber = searchParams.get("sptjmNumber") || (decreeNumber ? `SPTJM/${decreeNumber}` : "……/SPTJM/STIMI-YAPMI/……/2026");

  let totalStudents = countParam ? parseInt(countParam, 10) : 0;
  let resolvedDateLabel = dateStr ? formatIndoDate(dateStr) : formatIndoDate(new Date());

  if (!totalStudents && dateStr) {
    const start = new Date(`${dateStr}T00:00:00.000Z`);
    const end = new Date(`${dateStr}T23:59:59.999Z`);
    const count = await prisma.alumni.count({
      where: {
        yudisiumDate: { gte: start, lte: end },
        ...(decreeNumber ? { yudisiumDecreeNumber: decreeNumber } : {}),
      },
    });
    totalStudents = count;
  }

  const todayStr = formatIndoDate(new Date());

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SPTJM PIN - ${decreeNumber || dateStr || "STIMI YAPMI"}</title>
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
      line-height: 1.6;
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
      font-family: system-ui, -apple-system, sans-serif;
    }
    .toolbar-title {
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .toolbar-actions {
      display: flex;
      gap: 10px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
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
      max-width: 210mm;
      min-height: 297mm;
      margin: 24px auto;
      background: #fff;
      padding: 25mm 25mm 25mm 30mm;
      box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    }
    .kop-surat {
      border-bottom: 3px double #000;
      padding-bottom: 12px;
      margin-bottom: 24px;
      text-align: center;
    }
    .kop-yayasan {
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .kop-pt {
      font-size: 15pt;
      font-weight: bold;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin: 2px 0;
    }
    .kop-sk {
      font-size: 9.5pt;
      color: #222;
      margin-bottom: 3px;
    }
    .kop-alamat {
      font-size: 8.5pt;
      color: #333;
    }
    .title-doc {
      text-align: center;
      margin: 20px 0 16px;
    }
    .title-doc h2 {
      font-size: 12pt;
      font-weight: bold;
      text-decoration: underline;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .title-doc p {
      font-size: 11pt;
      margin-top: 3px;
    }
    .content-body {
      font-size: 11pt;
      text-align: justify;
    }
    .content-body p {
      margin-bottom: 10px;
    }
    .identitas-table {
      margin: 12px 0 16px 20px;
      font-size: 11pt;
      border-collapse: collapse;
    }
    .identitas-table td {
      padding: 3px 6px;
      vertical-align: top;
    }
    .identitas-table td:first-child {
      width: 170px;
    }
    .identitas-table td:nth-child(2) {
      width: 15px;
      text-align: center;
    }
    ol.pernyataan-list {
      margin: 10px 0 16px 36px;
      padding-left: 0;
    }
    ol.pernyataan-list li {
      margin-bottom: 8px;
      padding-left: 6px;
    }
    .footer-ttd {
      margin-top: 40px;
      display: flex;
      justify-content: flex-end;
    }
    .ttd-box {
      width: 250px;
      text-align: center;
      font-size: 11pt;
    }
    .materai-box {
      width: 110px;
      height: 70px;
      border: 1px dashed #666;
      margin: 18px auto 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8.5pt;
      color: #555;
      font-family: sans-serif;
      background: #fafafa;
    }
    .ttd-name {
      font-weight: bold;
      text-decoration: underline;
    }
    .notes-box {
      margin-top: 50px;
      padding-top: 10px;
      border-top: 1px dashed #bbb;
      font-size: 8pt;
      color: #666;
      font-family: sans-serif;
    }

    @media print {
      body {
        background: transparent;
      }
      .toolbar {
        display: none !important;
      }
      .page-container {
        margin: 0;
        padding: 15mm 20mm;
        box-shadow: none;
        max-width: 100%;
        min-height: auto;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-title">
      <span>📄</span>
      <span>Dokumen Resmi SPTJM PIN Kemdiktisaintek</span>
      <span style="font-size: 11px; opacity: 0.7; font-weight: normal; margin-left: 8px;">
        (${totalStudents} Mahasiswa · SK: ${decreeNumber || "-"})
      </span>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-primary" onclick="window.print()">
        <span>🖨️</span>
        <span>Cetak / Simpan PDF</span>
      </button>
      <button class="btn btn-secondary" onclick="window.close()">
        <span>Tutup</span>
      </button>
    </div>
  </div>

  <div class="page-container">
    <div class="kop-surat">
      <div class="kop-yayasan">YAYASAN PENDIDIKAN MANAJEMEN INDONESIA (YAPMI)</div>
      <div class="kop-pt">SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA (STIMI) YAPMI MAKASSAR</div>
      <div class="kop-sk">Status Terakreditasi BAN-PT · Kode PT: 093046</div>
      <div class="kop-alamat">Jl. Danau Tanjung Bunga No. 1, Kota Makassar, Sulawesi Selatan · Website: stimiyapmim.ac.id</div>
    </div>

    <div class="title-doc">
      <h2>SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK</h2>
      <p>Nomor: ${sptjmNumber}</p>
    </div>

    <div class="content-body">
      <p>Yang bertanda tangan di bawah ini:</p>

      <table class="identitas-table">
        <tr>
          <td>Nama</td>
          <td>:</td>
          <td><strong>${leaderName}</strong></td>
        </tr>
        <tr>
          <td>Jabatan</td>
          <td>:</td>
          <td>${leaderTitle}</td>
        </tr>
        <tr>
          <td>Perguruan Tinggi</td>
          <td>:</td>
          <td>Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar</td>
        </tr>
        <tr>
          <td>Kode Perguruan Tinggi</td>
          <td>:</td>
          <td>093046</td>
        </tr>
      </table>

      <p>Menyatakan dengan sesungguhnya bahwa:</p>

      <ol class="pernyataan-list">
        <li>
          Mahasiswa yang diusulkan penerbitan Nomor Ijazah Nasional (PISN/PIN) sejumlah <strong>${totalStudents} (${totalStudents > 0 ? totalStudents : "……"}) orang mahasiswa</strong>${decreeNumber ? ` berdasarkan Keputusan Yudisium Tanggal ${resolvedDateLabel} Nomor: <strong>${decreeNumber}</strong>` : ""} merupakan benar mahasiswa Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar;
        </li>
        <li>
          Mahasiswa tersebut telah menyelesaikan proses pembelajaran sesuai dengan Standar Nasional Pendidikan Tinggi (SN-Dikti) dan/atau ketentuan yang ditetapkan oleh Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar; dan
        </li>
        <li>
          Bertanggung jawab penuh terhadap kebenaran data yang diusulkan dalam proses penerbitan Nomor Ijazah Nasional (PISN/PIN) pada Kementerian Pendidikan Tinggi, Sains, dan Teknologi.
        </li>
      </ol>

      <p>Demikian surat pernyataan ini dibuat dengan sebenar-benarnya dan digunakan sebagaimana mestinya.</p>

      <div class="footer-ttd">
        <div class="ttd-box">
          <p>Makassar, ${todayStr}</p>
          <p style="margin-top: 4px;">${leaderTitle},</p>
          
          <div class="materai-box">
            Materai<br>Rp. 10.000
          </div>

          <p class="ttd-name">${leaderName}</p>
        </div>
      </div>

      <div class="notes-box">
        Catatan: Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) ini ditandatangani oleh Pemimpin PT (Ketua STIMI YAPMI Makassar) di atas meterai Rp 10.000 sebagai lampiran wajib usulan penerbitan Nomor Ijazah Nasional (PIN) pada portal Ditjen Diktiristek/Kemdiktisaintek.
      </div>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
