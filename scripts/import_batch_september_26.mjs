import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rawData = [
  { no: 1, nim: "221612010239", nama: "ARIALDY KAMAL", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 2, nim: "221612010238", nama: "MUH AL FAJRI SULTAN", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 3, nim: "221612010226", nama: "SERLIN PAKIDING", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 4, nim: "221612010211", nama: "YESLINI EONIKE DJIWA", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 5, nim: "221612010206", nama: "UMMU MAYSARAH", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 6, nim: "221612010204", nama: "THORIQUL AMIN", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 7, nim: "221612010200", nama: "NORMAN NURDIN", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 8, nim: "221612010196", nama: "SRI MAHARYANTI", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 9, nim: "221612010191", nama: "SARHANDI", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 10, nim: "221612010184", nama: "ROMI SETIAWAN", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 11, nim: "221612010179", nama: "RISKA JABAL NUR", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 12, nim: "221612010173", nama: "RESKI ANITA", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 13, nim: "221612010172", nama: "RENI", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 14, nim: "221612010168", nama: "RANI MARYAM JAMILAH IDRIS", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 15, nim: "221612010167", nama: "RAHMAN", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 16, nim: "221612010157", nama: "NURUL FADILLAH", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 17, nim: "221612010154", nama: "NURUL AEINULYA", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 18, nim: "221612010151", nama: "NURLIA", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 19, nim: "221612010147", nama: "NURFIANA", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 20, nim: "221612010145", nama: "HASRIYANTI", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 21, nim: "221612010137", nama: "NUR OKTAVIA SARI", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 22, nim: "221612010122", nama: "MUHAMMAD NURHAFID. R", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 23, nim: "221612010120", nama: "MUHAMMAD NABIL", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 24, nim: "221612010116", nama: "MUHAMMAD IHSAN", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 25, nim: "221612010111", nama: "MUH. WAHYU FAJAR SHIDDIQ", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 26, nim: "221612010110", nama: "MUH. ASWAD ARDYANSYAH", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 27, nim: "221612010109", nama: "MUH. ALIF", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 28, nim: "221612010108", nama: "MUH. ALDI M", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 29, nim: "221612010101", nama: "MAHARANI", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 30, nim: "221612010088", nama: "ISADATUL MULIANA", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 31, nim: "221612010072", nama: "FITRIANTI MEGA RANTE ALLO", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 32, nim: "221612010067", nama: "FAUZIYAH MURTI AZZAHRAH RUKMAN", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 33, nim: "221612010050", nama: "CANDRA WARDANA", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 34, nim: "221612010037", nama: "ARIF FAUZI", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 35, nim: "221612010033", nama: "ANNISA SYAHBIRA FAISYAL", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 36, nim: "221612010031", nama: "ANNISA RAMADHANI", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 37, nim: "221612010030", nama: "ANISA PURNAMA SARI", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 38, nim: "221612010025", nama: "MUHAMMAD NUR FITRAH", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 39, nim: "221612010021", nama: "AMALIYA FITRIANI", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 40, nim: "221612010015", nama: "AKBAR K", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 41, nim: "221612010011", nama: "AHMAD ABDILLAH", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 42, nim: "221612010006", nama: "ADINDA SALSABILA PUTRI", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 43, nim: "221612010005", nama: "ADHE NABHIYA PUTRI SYAHRANI", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 44, nim: "221612010003", nama: "ACHMAD WARDANI JAFAR", angkatan: "2021 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 45, nim: "2261201166", nama: "REZKY MARIO TAUFIK", angkatan: "2022 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 46, nim: "2261201159", nama: "SITI NURHALIZA AZZARA PUTRI", angkatan: "2022 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 47, nim: "2261201157", nama: "MUH FURQAN ARSY", angkatan: "2022 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 48, nim: "2261201143", nama: "NURHALISAH", angkatan: "2022 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 49, nim: "2261201124", nama: "MUHAMMAD FALID FADIL ALIF", angkatan: "2022 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 50, nim: "2261201100", nama: "WILNA", angkatan: "2022 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 51, nim: "2261201093", nama: "MUH. FAKHRUDDIN NURSYAM", angkatan: "2022 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 52, nim: "2261201092", nama: "MUHAMMAD RAIHAN", angkatan: "2022 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 53, nim: "2261201091", nama: "FADYA AZIZAH WULANDARI", angkatan: "2022 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 54, nim: "2261201086", nama: "RESKI SIMON SENDANA", angkatan: "2022 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 55, nim: "2261201084", nama: "NUR ANNISA HERAWATY", angkatan: "2022 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 56, nim: "2261201051", nama: "NOVA", angkatan: "2022 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 57, nim: "2261201027", nama: "NURFADILLAH", angkatan: "2022 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 58, nim: "2261201008", nama: "HASMA", angkatan: "2022 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 59, nim: "2261201005", nama: "RETNIATI", angkatan: "2022 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" },
  { no: 60, nim: "2261201002", nama: "MUH ARIF BUDIMAN", angkatan: "2022 GANJIL", nomor: "000.2/512/STIMI-YAPMI/MKS/IX/2026", tanggal: "2026-09-26", periodeKeluar: "2025 GENAP", jalur: "Peserta Baru" }
];

function formatPeriod(str) {
  if (!str) return "";
  const upper = str.toUpperCase().trim();
  const yearMatch = upper.match(/(\d{4})/);
  const year = yearMatch ? yearMatch[1] : "";
  if (upper.includes("GANJIL") || upper.includes("-1") || upper.includes("1")) {
    return `${year}-1`;
  }
  if (upper.includes("GENAP") || upper.includes("-2") || upper.includes("2")) {
    return `${year}-2`;
  }
  return year || str;
}

async function main() {
  console.log("Analyzing 60 additional alumni to input...");

  const allNims = rawData.map(d => d.nim.trim());
  const existingRecords = await prisma.alumni.findMany({
    where: { nim: { in: allNims } },
    select: { nim: true, fullName: true, id: true }
  });

  const existingMap = new Map(existingRecords.map(r => [r.nim, r]));
  console.log(`Found ${existingRecords.length} already existing in DB out of ${allNims.length}.`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of rawData) {
    const nim = item.nim.trim();
    const fullName = item.nama.trim().toUpperCase();
    const entryPeriod = formatPeriod(item.angkatan);
    const exitPeriod = formatPeriod(item.periodeKeluar);
    const yudisiumDate = new Date(`${item.tanggal}T00:00:00.000Z`);
    const yudisiumDecreeNumber = item.nomor.trim();
    const cohortYear = parseInt(item.angkatan.match(/(\d{4})/)?.[1] || "2021", 10);
    const graduationYear = 2026;
    const registrationType = "PESERTA_DIDIK_BARU";
    const prodiCode = "61201";
    const prodiName = "S1 Manajemen";
    const degree = "S1";

    const existing = existingMap.get(nim);
    if (existing) {
      await prisma.alumni.update({
        where: { id: existing.id },
        data: {
          fullName,
          entryPeriod,
          exitPeriod,
          yudisiumDate,
          yudisiumDecreeNumber,
          cohortYear,
          graduationYear,
          registrationType,
          prodiCode,
          prodiName,
          degree
        }
      });
      updatedCount++;
    } else {
      await prisma.alumni.create({
        data: {
          nim,
          fullName,
          entryPeriod,
          exitPeriod,
          yudisiumDate,
          yudisiumDecreeNumber,
          cohortYear,
          graduationYear,
          registrationType,
          prodiCode,
          prodiName,
          degree,
          thesisTitle: "Telah memenuhi syarat kelulusan dan penomoran ijazah nasional (PISN/PIN)"
        }
      });
      insertedCount++;
    }
  }

  console.log(`\nImport complete!`);
  console.log(`- Inserted new: ${insertedCount}`);
  console.log(`- Updated existing: ${updatedCount}`);

  const total = await prisma.alumni.count();
  console.log(`- Total alumni now in MongoDB Atlas: ${total}`);

  const byYudisium = await prisma.alumni.groupBy({
    by: ['yudisiumDate', 'yudisiumDecreeNumber'],
    _count: { nim: true },
    orderBy: { yudisiumDate: 'desc' }
  });
  console.log("\nDistribution by Yudisium Date & SK:");
  console.table(byYudisium.map(y => ({
    tanggal: y.yudisiumDate ? y.yudisiumDate.toISOString().split("T")[0] : null,
    sk: y.yudisiumDecreeNumber,
    jumlah: y._count.nim
  })));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
