import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

export interface LampiranStudentPdfItem {
  nim: string;
  fullName: string;
  nik?: string | null;
  prodiName?: string | null;
  degree?: string | null;
  gpa?: number | null;
  predikat?: string;
}

export interface LampiranPdfOptions {
  decreeNumber: string;
  tentang: string;
  dateLabel: string;
  city: string;
  leaderTitle: string;
  leaderName: string;
  leaderNidn: string;
  students: LampiranStudentPdfItem[];
}

export async function generateLampiranSkPdf(options: LampiranPdfOptions): Promise<Uint8Array> {
  const {
    decreeNumber,
    tentang,
    dateLabel,
    city,
    leaderTitle,
    leaderName,
    leaderNidn,
    students,
  } = options;

  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const pageWidth = 595.28; // A4 portrait
  const pageHeight = 841.89;
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2; // ~515 pt

  // Ukuran kolom tabel
  const colWidths = {
    no: 25,
    nim: 75,
    nama: 155,
    nik: 85,
    prodi: 65,
    jenjang: 30,
    ipk: 32,
    predikat: 48,
  };

  const colX = {
    no: marginX,
    nim: marginX + colWidths.no,
    nama: marginX + colWidths.no + colWidths.nim,
    nik: marginX + colWidths.no + colWidths.nim + colWidths.nama,
    prodi: marginX + colWidths.no + colWidths.nim + colWidths.nama + colWidths.nik,
    jenjang: marginX + colWidths.no + colWidths.nim + colWidths.nama + colWidths.nik + colWidths.prodi,
    ipk: marginX + colWidths.no + colWidths.nim + colWidths.nama + colWidths.nik + colWidths.prodi + colWidths.jenjang,
    predikat: marginX + colWidths.no + colWidths.nim + colWidths.nama + colWidths.nik + colWidths.prodi + colWidths.jenjang + colWidths.ipk,
  };

  // Muat KOP STIMI
  let kopImage: any = null;
  let kopDims = { width: 0, height: 0 };
  const kopPath = path.join(process.cwd(), "public", "kop-stimi.jpg");
  if (fs.existsSync(kopPath)) {
    try {
      const kopBytes = fs.readFileSync(kopPath);
      kopImage = await pdfDoc.embedJpg(kopBytes);
      kopDims = kopImage.scale(0.88); // Scale to fit nicely ~503px
    } catch (e) {
      console.error("Gagal embed KOP JPG:", e);
    }
  }

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - 35;

  // 1. Gambar KOP
  if (kopImage) {
    currentPage.drawImage(kopImage, {
      x: (pageWidth - kopDims.width) / 2,
      y: currentY - kopDims.height,
      width: kopDims.width,
      height: kopDims.height,
    });
    currentY -= kopDims.height + 14;
  } else {
    currentPage.drawText("SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA (STIMI) YAPMI MAKASSAR", {
      x: marginX,
      y: currentY - 14,
      size: 11,
      font: timesBold,
    });
    currentY -= 28;
  }

  // 2. Keterangan Lampiran (Sesuai Gambar 1)
  const drawLampiranHeader = (page: typeof currentPage, y: number) => {
    const startX = marginX;
    const colonX = startX + 68;
    const valueX = colonX + 10;
    const fontSize = 10;
    const lineHeight = 14;

    const rows = [
      ["Lampiran", "Surat Keputusan Ketua STIMI YAPMI Makassar"],
      ["Nomor", decreeNumber],
      ["Tentang", tentang],
      ["Tanggal", dateLabel],
    ];

    let rowY = y;
    for (const [lbl, val] of rows) {
      page.drawText(lbl, { x: startX, y: rowY, size: fontSize, font: timesRoman });
      page.drawText(":", { x: colonX, y: rowY, size: fontSize, font: timesRoman });
      page.drawText(val, {
        x: valueX,
        y: rowY,
        size: fontSize,
        font: lbl === "Nomor" ? timesBold : timesRoman,
      });
      rowY -= lineHeight;
    }

    return rowY - 6;
  };

  currentY = drawLampiranHeader(currentPage, currentY);

  // 3. Header Tabel
  const drawTableHeader = (page: typeof currentPage, y: number) => {
    const rowH = 20;
    // Background bar
    page.drawRectangle({
      x: marginX,
      y: y - rowH,
      width: contentWidth,
      height: rowH,
      color: rgb(0.95, 0.96, 0.98),
      borderColor: rgb(0.2, 0.2, 0.2),
      borderWidth: 0.8,
    });

    const headerFontSize = 8.5;
    const textY = y - 14;

    page.drawText("No", { x: colX.no + 6, y: textY, size: headerFontSize, font: timesBold });
    page.drawText("NIM", { x: colX.nim + 16, y: textY, size: headerFontSize, font: timesBold });
    page.drawText("Nama Mahasiswa", { x: colX.nama + 18, y: textY, size: headerFontSize, font: timesBold });
    page.drawText("NIK", { x: colX.nik + 24, y: textY, size: headerFontSize, font: timesBold });
    page.drawText("Program Studi", { x: colX.prodi + 6, y: textY, size: headerFontSize, font: timesBold });
    page.drawText("Jenj.", { x: colX.jenjang + 5, y: textY, size: headerFontSize, font: timesBold });
    page.drawText("IPK", { x: colX.ipk + 7, y: textY, size: headerFontSize, font: timesBold });
    page.drawText("Predikat", { x: colX.predikat + 8, y: textY, size: headerFontSize, font: timesBold });

    // Garis vertikal header
    for (const key of Object.keys(colX) as (keyof typeof colX)[]) {
      if (key !== "no") {
        page.drawLine({
          start: { x: colX[key], y },
          end: { x: colX[key], y: y - rowH },
          thickness: 0.8,
          color: rgb(0.2, 0.2, 0.2),
        });
      }
    }

    return y - rowH;
  };

  currentY = drawTableHeader(currentPage, currentY);

  // 4. Baris-Baris Mahasiswa
  const rowHeight = 18;
  const rowFontSize = 8.5;

  for (let i = 0; i < students.length; i++) {
    const s = students[i];

    // Cek apakah halaman berikutnya dibutuhkan (sisakan ~130pt untuk tanda tangan jika di baris terakhir)
    const neededSpace = i === students.length - 1 ? rowHeight + 140 : rowHeight + 40;

    if (currentY - neededSpace < 40) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - 40;
      currentY = drawTableHeader(currentPage, currentY);
    }

    const y = currentY;
    const textY = y - 12;

    // Kotak baris
    currentPage.drawRectangle({
      x: marginX,
      y: y - rowHeight,
      width: contentWidth,
      height: rowHeight,
      borderColor: rgb(0.3, 0.3, 0.3),
      borderWidth: 0.6,
    });

    // Garis vertikal pemisah kolom
    for (const key of Object.keys(colX) as (keyof typeof colX)[]) {
      if (key !== "no") {
        currentPage.drawLine({
          start: { x: colX[key], y },
          end: { x: colX[key], y: y - rowHeight },
          thickness: 0.6,
          color: rgb(0.3, 0.3, 0.3),
        });
      }
    }

    // Teks kolom
    currentPage.drawText(String(i + 1), { x: colX.no + 7, y: textY, size: rowFontSize, font: timesRoman });
    currentPage.drawText(s.nim || "-", { x: colX.nim + 6, y: textY, size: rowFontSize, font: timesRoman });

    // Truncate nama jika terlalu panjang
    let namaStr = s.fullName || "-";
    if (namaStr.length > 25) {
      namaStr = namaStr.substring(0, 23) + "..";
    }
    currentPage.drawText(namaStr, { x: colX.nama + 6, y: textY, size: rowFontSize, font: timesBold });

    currentPage.drawText(s.nik || "-", { x: colX.nik + 6, y: textY, size: 7.5, font: timesRoman });
    currentPage.drawText(s.prodiName || "S1 Manajemen", { x: colX.prodi + 5, y: textY, size: 8, font: timesRoman });
    currentPage.drawText(s.degree || "S1", { x: colX.jenjang + 8, y: textY, size: rowFontSize, font: timesRoman });

    const gpaStr = s.gpa !== null && s.gpa !== undefined ? Number(s.gpa).toFixed(2) : "-";
    currentPage.drawText(gpaStr, { x: colX.ipk + 6, y: textY, size: rowFontSize, font: timesBold });

    currentPage.drawText(s.predikat || "-", { x: colX.predikat + 4, y: textY, size: 7.5, font: timesRoman });

    currentY -= rowHeight;
  }

  // 5. Blok Tanda Tangan Halaman Terakhir (Sesuai Gambar 2)
  currentY -= 20;

  const ttdBoxWidth = 220;
  const ttdX = pageWidth - marginX - ttdBoxWidth;
  const ttdFontSize = 10;
  const ttdLineH = 14;

  currentPage.drawText("Ditetapkan di", { x: ttdX, y: currentY, size: ttdFontSize, font: timesRoman });
  currentPage.drawText(":", { x: ttdX + 70, y: currentY, size: ttdFontSize, font: timesRoman });
  currentPage.drawText(city, { x: ttdX + 80, y: currentY, size: ttdFontSize, font: timesRoman });
  currentY -= ttdLineH;

  currentPage.drawText("Pada Tanggal", { x: ttdX, y: currentY, size: ttdFontSize, font: timesRoman });
  currentPage.drawText(":", { x: ttdX + 70, y: currentY, size: ttdFontSize, font: timesRoman });
  currentPage.drawText(dateLabel, { x: ttdX + 80, y: currentY, size: ttdFontSize, font: timesRoman });
  currentY -= ttdLineH + 2;

  currentPage.drawText(leaderTitle, { x: ttdX, y: currentY, size: ttdFontSize, font: timesBold });
  currentY -= 54; // Ruang tanda tangan & cap basah

  currentPage.drawText(leaderName, { x: ttdX, y: currentY, size: ttdFontSize, font: timesBold });

  // Garis bawah nama penandatangan
  const nameWidth = timesBold.widthOfTextAtSize(leaderName, ttdFontSize);
  currentPage.drawLine({
    start: { x: ttdX, y: currentY - 2 },
    end: { x: ttdX + nameWidth, y: currentY - 2 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  currentY -= ttdLineH;
  currentPage.drawText(`NIDN. ${leaderNidn}`, { x: ttdX, y: currentY, size: ttdFontSize, font: timesRoman });

  return await pdfDoc.save();
}
