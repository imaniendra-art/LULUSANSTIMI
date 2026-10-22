import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rawData = [
  { no: 1, nim: "2461201248", nama: "A MUH NUR FAYIZ APRISAL", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 2, nim: "2461201228", nama: "ADRIANAH", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 3, nim: "2461201207", nama: "ANDI AWANG", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 4, nim: "2461201234", nama: "ANDI RUSLAN", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 5, nim: "2561201102", nama: "ANNISA YUSTISIA LUMENTUT", angkatan: "2025 GANJIL", nomorSk: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-18", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 6, nim: "2461201237", nama: "ARHAM", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 7, nim: "2461201241", nama: "ARIYANI ARIFIN", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 8, nim: "2461201205", nama: "BUDI HASTUTI", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 9, nim: "2561201105", nama: "DIMAS ADHY WIBOWO", angkatan: "2025 GANJIL", nomorSk: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-18", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 10, nim: "2461201231", nama: "ENDANG HERMAWAN", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 11, nim: "2461201239", nama: "HERINUS HAMATIA", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 12, nim: "2461201245", nama: "MOH SYAHDILLAH BAKRI", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 13, nim: "2561201103", nama: "MUH JALIL", angkatan: "2025 GANJIL", nomorSk: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-18", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 14, nim: "2461201221", nama: "MUHAMMAD RAFLI", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 15, nim: "2461201206", nama: "MUHAMMAD RAMADHAN TUKUBOYA", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 16, nim: "2461201214", nama: "MURSIDIN", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 17, nim: "2461201211", nama: "NUR CAHAYA HASMIL", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 18, nim: "2461201202", nama: "RAHMAT RIYADI", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 19, nim: "2461201233", nama: "RIANTI LAMASAY", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 20, nim: "2461201236", nama: "RYAN ANJAS WIJAYA", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 21, nim: "2461201247", nama: "SANDY JODIN ARONGGEAR", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 22, nim: "2461201223", nama: "SUHAEDAH NADJAMUDDIN", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 23, nim: "2561201101", nama: "WILLIAM WETAN AYORBABA", angkatan: "2025 GANJIL", nomorSk: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-18", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 24, nim: "2461201201", nama: "YUSNIA TRIE ANDINI", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 25, nim: "2461201227", nama: "YUSRA NGINANG", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 26, nim: "2461201235", nama: "ZURMIYATI KARUDJA", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 27, nim: "2461201226", nama: "AHMAD FAIZ FAUZAN", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 28, nim: "2461201210", nama: "MUAMAR", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 29, nim: "2461201219", nama: "MUHAMMAD YUSUF BAHTIAR", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 30, nim: "2461201208", nama: "NUR INTAN N", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 31, nim: "2461201209", nama: "SAIFUL", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 32, nim: "2461201216", nama: "SUGIARTI UTAMI WIBOWO", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 33, nim: "2461201229", nama: "WATI ANGGRAENI", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 34, nim: "2561201115", nama: "MUTHMAINNAH", angkatan: "2025 GANJIL", nomorSk: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-18", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 35, nim: "2561201116", nama: "ISMAIL", angkatan: "2025 GANJIL", nomorSk: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-18", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 36, nim: "2561201117", nama: "AHMAD FATHIR FACHRIANZAH", angkatan: "2025 GANJIL", nomorSk: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-18", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 37, nim: "2561201143", nama: "SUKMO", angkatan: "2025 GANJIL", nomorSk: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-18", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 38, nim: "2461201215", nama: "TENGKU ADI ABDUL RACHMAN", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 39, nim: "2461201219", nama: "MUHAMMAD YUSUF BAHTIAR", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 40, nim: "2461201220", nama: "ANDI NABILA RAMADHANI", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" },
  { no: 41, nim: "2461201230", nama: "KRISTIAN HOEGH PRIDE LAMBE", angkatan: "2024 GENAP", nomorSk: "000.2/511/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-17", periodeKeluar: "2026 GANJIL", jalur: "Perolehan SKS" }
];

function formatPeriod(str) {
  if (!str) return "";
  const match = str.trim().match(/^(\d{4})\s+(GANJIL|GENAP)/i);
  if (match) {
    const year = match[1];
    const sem = match[2].toUpperCase() === "GANJIL" ? "1" : "2";
    return `${year}-${sem}`;
  }
  return str;
}

async function main() {
  console.log(`Starting insertion of ${rawData.length} additional alumni records...`);

  // De-duplicate by NIM (e.g. row 29 and 39)
  const uniqueMap = new Map();
  for (const item of rawData) {
    if (!uniqueMap.has(item.nim)) {
      uniqueMap.set(item.nim, item);
    }
  }

  console.log(`Total unique records to process: ${uniqueMap.size}`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of uniqueMap.values()) {
    const entryPeriod = formatPeriod(item.angkatan);
    const exitPeriod = formatPeriod(item.periodeKeluar);
    const cohortYear = parseInt(item.nim.substring(0, 2), 10) ? 2000 + parseInt(item.nim.substring(0, 2), 10) : 2024;
    const yudisiumDate = new Date(`${item.tanggal}T00:00:00.000Z`);

    const payload = {
      nim: item.nim.trim(),
      fullName: item.nama.trim(),
      prodiCode: "61201",
      prodiName: "S1 Manajemen",
      degree: "S1",
      registrationType: "KONVERSI_TRANSFER_NILAI", // Perolehan SKS / Transfer
      entryPeriod: entryPeriod,
      exitPeriod: exitPeriod,
      cohortYear: cohortYear,
      graduationYear: 2026,
      yudisiumDate: yudisiumDate,
      yudisiumDecreeNumber: item.nomorSk.trim(),
      thesisTitle: "Telah memenuhi syarat kelulusan dan penomoran ijazah nasional (PISN/PIN)",
      graduationSource: "YUDISIUM_NON_WISUDA",
      isDirectoryPublic: true,
      isVerified: true
    };

    const existing = await prisma.alumni.findUnique({
      where: { nim: item.nim.trim() }
    });

    if (existing) {
      await prisma.alumni.update({
        where: { nim: item.nim.trim() },
        data: payload
      });
      updatedCount++;
    } else {
      await prisma.alumni.create({
        data: payload
      });
      insertedCount++;
    }
  }

  console.log(`Insertion completed!`);
  console.log(`- Inserted new: ${insertedCount}`);
  console.log(`- Updated: ${updatedCount}`);

  const total = await prisma.alumni.count();
  console.log(`Current total alumni in database: ${total}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
