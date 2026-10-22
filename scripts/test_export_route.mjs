import * as XLSX from "xlsx";
import prisma from "../src/lib/prisma.ts";

async function main() {
  console.log("Testing export data extraction and Excel generation...");

  const items = await prisma.alumni.findMany({
    orderBy: [{ graduationYear: "desc" }, { yudisiumDate: "desc" }, { nim: "asc" }]
  });

  console.log(`Found ${items.length} alumni for export.`);

  const rows = items.map((a, idx) => ({
    "NO": idx + 1,
    "NIM": a.nim,
    "NAMA MAHASISWA": a.fullName,
    "PROGRAM STUDI": a.prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen",
    "JENJANG": a.degree || "S1",
    "JALUR PENDAFTARAN":
      a.registrationType === "RPL_PEROLEHAN_SKS" || a.registrationType === "RPL_KONVERSI_SKS"
        ? "RPL Perolehan SKS"
        : a.registrationType === "RPL_TRANSFER_SKS"
        ? "RPL Transfer SKS"
        : a.registrationType === "KONVERSI_TRANSFER_NILAI"
        ? "Perolehan SKS (Transfer Nilai)"
        : "Peserta Didik Baru",
    "PERIODE MASUK": a.entryPeriod || "-",
    "PERIODE KELUAR": a.exitPeriod || "-",
    "TANGGAL YUDISIUM": a.yudisiumDate ? a.yudisiumDate.toISOString().split("T")[0] : "-",
    "NOMOR SK YUDISIUM": a.yudisiumDecreeNumber || "-",
    "NOMOR IJAZAH NASIONAL (PISN)": a.pisnNumber || "Belum Terbit",
    "KODE BATCH BELMAWA": a.pisnBatchNumber || "-",
    "IPK": a.gpa !== null && a.gpa !== undefined ? a.gpa : "-",
    "BERKAS IJAZAH SERVER": a.ijazahScan ? "Ada (PDF)" : "Belum Ada",
    "BERKAS TRANSKRIP SERVER": a.transkripScan ? "Ada (PDF)" : "Belum Ada",
    "JUDUL SKRIPSI": a.thesisTitle || "-",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Repositori PISN & Ijazah");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  console.log(`Generated Excel buffer size: ${buffer.length} bytes.`);
  console.log("Export test SUCCESS!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
