import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rawData = [
  { no: 1, nim: "2261201009", name: "Hikmah Novia Saafitri Talli", yudisiumDateStr: "31 Juli 2026", pisn: "", batch: "", gpa: 3.86 },
  { no: 2, nim: "2261201015", name: "A. Nurul Hardianti Tenriuke HD", yudisiumDateStr: "31 Juli 2026", pisn: "093046612012026100132", batch: "NI-09304661201269", gpa: 3.95 },
  { no: 3, nim: "2261201018", name: "Dina Angreini", yudisiumDateStr: "31 Juli 2026", pisn: "093046612012026100121", batch: "NI-09304661201268", gpa: 3.88 },
  { no: 4, nim: "2261201020", name: "Mardi", yudisiumDateStr: "31 Juli 2026", pisn: "", batch: "NI-09304661201268", gpa: 3.57 },
  { no: 5, nim: "2261201021", name: "Lisna Damayanti", yudisiumDateStr: "31 Juli 2026", pisn: "093046612012026100122", batch: "NI-09304661201268", gpa: 3.66 },
  { no: 6, nim: "2261201029", name: "Asrullah Saputra", yudisiumDateStr: "31 Juli 2026", pisn: "093046612012026100123", batch: "NI-09304661201268", gpa: 3.69 },
  { no: 7, nim: "2261201032", name: "Ayu Lestari", yudisiumDateStr: "31 Juli 2026", pisn: "093046612012026100124", batch: "NI-09304661201268", gpa: 3.89 },
  { no: 8, nim: "2261201034", name: "Samsul Bahri Samiun", yudisiumDateStr: "31 Juli 2026", pisn: "093046612012026100126", batch: "NI-09304661201268", gpa: 3.26 },
  { no: 9, nim: "2261201036", name: "Jatsiah Ali", yudisiumDateStr: "31 Juli 2026", pisn: "093046612012026100127", batch: "NI-09304661201268", gpa: 3.76 },
  { no: 10, nim: "2261201066", name: "Sulfidayanti", yudisiumDateStr: "31 Juli 2026", pisn: "093046612012026100128", batch: "NI-09304661201268", gpa: 3.93 },
  { no: 11, nim: "2261201068", name: "Usmal Rebsal", yudisiumDateStr: "31 Juli 2026", pisn: "093046612012026100129", batch: "NI-09304661201268", gpa: 3.78 },
  { no: 12, nim: "2261201083", name: "Syalwa Shabila", yudisiumDateStr: "31 Juli 2026", pisn: "", batch: "NI-09304661201268", gpa: 3.74 },
  { no: 13, nim: "2261201105", name: "Mohd Taofiq", yudisiumDateStr: "31 Juli 2026", pisn: "", batch: "NI-09304661201268", gpa: 3.7 },
  { no: 14, nim: "2261201108", name: "Nurmila Sari", yudisiumDateStr: "31 Juli 2026", pisn: "093046612012026100130", batch: "NI-09304661201268", gpa: 3.91 },
  { no: 15, nim: "2261201110", name: "Huznul Hotima R.", yudisiumDateStr: "31 Juli 2026", pisn: "093046612012026100131", batch: "NI-09304661201268", gpa: 3.89 },
  { no: 16, nim: "2261201007", name: "Dhika Damayanti Dahri", yudisiumDateStr: "31 Juli 2026", pisn: "", batch: "", gpa: 3.29 },
  { no: 17, nim: "2261201155", name: "Nurafikah Latang", yudisiumDateStr: "31 Juli 2026", pisn: "", batch: "", gpa: 3.77 },
  { no: 18, nim: "2261201011", name: "Aditya Pratama", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100099", batch: "NI-09304661201267", gpa: 3.57 },
  { no: 19, nim: "2261201014", name: "Fandi", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100100", batch: "NI-09304661201267", gpa: 3.57 },
  { no: 20, nim: "2261201022", name: "M. Fadli Irawan", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100101", batch: "NI-09304661201267", gpa: 3.58 },
  { no: 21, nim: "2261201025", name: "Mardani Putriani", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100102", batch: "NI-09304661201267", gpa: 3.82 },
  { no: 22, nim: "2261201026", name: "Angghi Nursyamsi", yudisiumDateStr: "8 Agustus 2026", pisn: "", batch: "", gpa: 3.88 },
  { no: 23, nim: "2261201028", name: "Riska Amalia", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100103", batch: "NI-09304661201267", gpa: 3.95 },
  { no: 24, nim: "2261201053", name: "St. Rohani", yudisiumDateStr: "8 Agustus 2026", pisn: "", batch: "", gpa: 3.93 },
  { no: 25, nim: "2261201059", name: "Nurfala", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100106", batch: "NI-09304661201267", gpa: 3.62 },
  { no: 26, nim: "2261201062", name: "Viona Aprilia Wiwin", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100107", batch: "NI-09304661201267", gpa: 3.92 },
  { no: 27, nim: "2261201065", name: "Gustri", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100108", batch: "NI-09304661201267", gpa: 3.8 },
  { no: 28, nim: "2261201072", name: "Muhammad Fadli", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100110", batch: "NI-09304661201267", gpa: 3.47 },
  { no: 29, nim: "2261201073", name: "Sarmilah", yudisiumDateStr: "8 Agustus 2026", pisn: "", batch: "", gpa: 3.86 },
  { no: 30, nim: "2261201076", name: "Maulinda", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100111", batch: "NI-09304661201267", gpa: 3.93 },
  { no: 31, nim: "2261201080", name: "Ikhwan Saldi", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100112", batch: "NI-09304661201267", gpa: 3.73 },
  { no: 32, nim: "2261201088", name: "Nurul Apriyanti", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100113", batch: "NI-09304661201267", gpa: 3.51 },
  { no: 33, nim: "2261201098", name: "Dendy Gunarsa Abadi Lau", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100114", batch: "NI-09304661201267", gpa: 3.58 },
  { no: 34, nim: "2261201112", name: "Muh Gilang Ramadhan", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100117", batch: "NI-09304661201267", gpa: 3.56 },
  { no: 35, nim: "2261201122", name: "Nurfahira", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100118", batch: "NI-09304661201267", gpa: 3.65 },
  { no: 36, nim: "2261201123", name: "Ayu", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100119", batch: "NI-09304661201267", gpa: 3.86 },
  { no: 37, nim: "2261201175", name: "Engellina", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100120", batch: "NI-09304661201267", gpa: 3.84 },
  { no: 38, nim: "2261201103", name: "Adelia Harahap", yudisiumDateStr: "8 Agustus 2026", pisn: "093046612012026100115", batch: "NI-09304661201266", gpa: 3.81 },
  { no: 39, nim: "2261201120", name: "Meilani Anggreani Eka Putri Herman", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100097", batch: "NI-09304661201266", gpa: 3.8 },
  { no: 40, nim: "2261201013", name: "Nensi", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100077", batch: "NI-09304661201266", gpa: 3.78 },
  { no: 41, nim: "2261201012", name: "Muh. Fahrul Harsam", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100076", batch: "NI-09304661201266", gpa: 3.53 },
  { no: 42, nim: "2261201115", name: "Nurul Hafifa Bahar", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100095", batch: "NI-09304661201266", gpa: 3.65 },
  { no: 43, nim: "2261201079", name: "Andi Riswan", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100090", batch: "NI-09304661201266", gpa: 3.8 },
  { no: 44, nim: "2261201069", name: "Firman Sahrun", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100087", batch: "NI-09304661201266", gpa: 3.5 },
  { no: 45, nim: "2261201063", name: "Tia Sartika", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100085", batch: "NI-09304661201266", gpa: 3.7 },
  { no: 46, nim: "2261201077", name: "Andi Indry Nurfadilah Idris", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100089", batch: "NI-09304661201266", gpa: 3.67 },
  { no: 47, nim: "2261201067", name: "Rama Bagus Waseso", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100086", batch: "NI-09304661201266", gpa: 3.66 },
  { no: 48, nim: "2261201085", name: "Tumba' Kata", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100091", batch: "NI-09304661201266", gpa: 3.53 },
  { no: 49, nim: "2261201001", name: "Zahra Azizah Ridwan", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100133", batch: "NI-09304661201230", gpa: 3.4 },
  { no: 50, nim: "2261201087", name: "Hana Seba", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100134", batch: "NI-09304661201230", gpa: 3.44 },
  { no: 51, nim: "2261201121", name: "Nur Ariska Febrianti", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100098", batch: "NI-09304661201266", gpa: 3.5 },
  { no: 52, nim: "2261201061", name: "Nur Fadilla", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100084", batch: "NI-09304661201266", gpa: 3.31 },
  { no: 53, nim: "2261201081", name: "Bintang Pramudia", yudisiumDateStr: "4 September 2026", pisn: "", batch: "", gpa: 3.55 },
  { no: 54, nim: "2261201071", name: "Nur Fitrah Indah Sari", yudisiumDateStr: "4 September 2026", pisn: "", batch: "", gpa: 3.83 },
  { no: 55, nim: "2261201037", name: "Eka Kurniawan M", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100079", batch: "NI-09304661201266", gpa: 3.35 },
  { no: 56, nim: "2261201113", name: "Bryan Anggara", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100094", batch: "NI-09304661201266", gpa: 3.52 },
  { no: 57, nim: "2261201118", name: "Cahyo Setiawan", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100096", batch: "NI-09304661201266", gpa: 3.69 },
  { no: 58, nim: "2261201040", name: "Rahayu", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100080", batch: "NI-09304661201266", gpa: 3.71 },
  { no: 59, nim: "2261201075", name: "Sinta Eka Putri", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100088", batch: "NI-09304661201266", gpa: 3.73 },
  { no: 60, nim: "2261201060", name: "Dipa Sudarta", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100083", batch: "NI-09304661201266", gpa: 3.58 },
  { no: 61, nim: "2261201016", name: "Thahira Arista", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100078", batch: "NI-09304661201266", gpa: 3.53 },
  { no: 62, nim: "2261201006", name: "Sarlan", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100075", batch: "NI-09304661201266", gpa: 3.54 },
  { no: 63, nim: "2261201106", name: "Irham", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100093", batch: "NI-09304661201266", gpa: 3.45 },
  { no: 64, nim: "2261201104", name: "Muh. Rezky Hidayat Muslimin", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100092", batch: "NI-09304661201266", gpa: 3.24 },
  { no: 65, nim: "2261201057", name: "Yusran Yusuf", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100082", batch: "NI-09304661201266", gpa: 3.46 },
  { no: 66, nim: "2261201055", name: "Sultan Iskandar", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100081", batch: "NI-09304661201266", gpa: 3.43 },
  { no: 67, nim: "2261201003", name: "RICKY G", yudisiumDateStr: "4 September 2026", pisn: "093046612012026100074", batch: "NI-09304661201266", gpa: 3.39 },
  { no: 68, nim: "2261201004", name: "FIRDA NUR DEWISARI", yudisiumDateStr: "31 Juli 2026", pisn: "", batch: "", gpa: 3.23 },
  { no: 69, nim: "2261201010", name: "TAUFIK HIDAYAT", yudisiumDateStr: "31 Juli 2026", pisn: "", batch: "", gpa: 3.23 },
  { no: 70, nim: "2261201017", name: "M AIDIL TASRI HANIFA", yudisiumDateStr: "31 Juli 2026", pisn: "", batch: "", gpa: 3.23 },
  { no: 71, nim: "2261201019", name: "MIFTHA QHULJANNAH", yudisiumDateStr: "31 Juli 2026", pisn: "", batch: "", gpa: 3.23 },
  { no: 72, nim: "2261201033", name: "MUH. SADDAM AFFANDI", yudisiumDateStr: "31 Juli 2026", pisn: "", batch: "", gpa: 3.25 },
  { no: 73, nim: "2261201035", name: "FARIN ISKA", yudisiumDateStr: "31 Juli 2026", pisn: "", batch: "", gpa: 3.24 },
  { no: 74, nim: "2261201038", name: "RAHMAWATI", yudisiumDateStr: "31 Juli 2026", pisn: "", batch: "", gpa: 3.28 },
  { no: 75, nim: "2261201039", name: "MUH ABDILLAH H", yudisiumDateStr: "31 Juli 2026", pisn: "", batch: "", gpa: 3.23 },
  { no: 76, nim: "2261201047", name: "KARDILA", yudisiumDateStr: "31 Juli 2026", pisn: "", batch: "", gpa: 3.23 },
  { no: 77, nim: "2261201049", name: "NUR ANNISA ASSAHRA", yudisiumDateStr: "8 Agustus 2026", pisn: "", batch: "", gpa: 3.23 },
  { no: 78, nim: "2261201050", name: "NURUL FATIMAH AZZAHRAH", yudisiumDateStr: "8 Agustus 2026", pisn: "", batch: "", gpa: 3.9 },
  { no: 79, nim: "2261201058", name: "LUSIANA RAHAYU", yudisiumDateStr: "8 Agustus 2026", pisn: "", batch: "", gpa: 3.57 },
  { no: 80, nim: "2261201064", name: "MUH. GALIB JUNAIF SYAM", yudisiumDateStr: "8 Agustus 2026", pisn: "", batch: "", gpa: 3.51 },
  { no: 81, nim: "2261201070", name: "AHMAD MUAMMAR", yudisiumDateStr: "8 Agustus 2026", pisn: "", batch: "", gpa: 3.31 },
  { no: 82, nim: "2261201078", name: "RAKHA APRILIANO PUTRA", yudisiumDateStr: "8 Agustus 2026", pisn: "", batch: "", gpa: 3.23 },
  { no: 83, nim: "2261201082", name: "ST. NURALISA", yudisiumDateStr: "8 Agustus 2026", pisn: "", batch: "", gpa: 3.23 },
  { no: 84, nim: "2261201109", name: "WARDANA", yudisiumDateStr: "8 Agustus 2026", pisn: "", batch: "", gpa: 3.41 },
  { no: 85, nim: "2261201114", name: "NUR ALIM AKBAR", yudisiumDateStr: "8 Agustus 2026", pisn: "", batch: "", gpa: 3.23 },
  { no: 86, nim: "2261201119", name: "ANDI IRSAN SAPUTRA", yudisiumDateStr: "8 Agustus 2026", pisn: "", batch: "", gpa: 3.57 },
  { no: 87, nim: "2261201177", name: "YUSUF WIBISONO BAHAR", yudisiumDateStr: "8 Agustus 2026", pisn: "", batch: "", gpa: 3.35 }
];

function parseIndoDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(" ");
  if (parts.length < 3) return null;
  const day = parseInt(parts[0], 10);
  const monthName = parts[1].toLowerCase();
  const year = parseInt(parts[2], 10);

  const months = {
    januari: 0,
    februari: 1,
    maret: 2,
    april: 3,
    mei: 4,
    juni: 5,
    juli: 6,
    agustus: 7,
    september: 8,
    oktober: 9,
    november: 10,
    desember: 11
  };

  const month = months[monthName];
  if (month === undefined) return null;

  // Use UTC midday to avoid timezone boundary shifts
  return new Date(Date.UTC(year, month, day, 0, 0, 0));
}

async function main() {
  console.log(`Starting synchronization of ${rawData.length} alumni yudisium dates...`);

  let updatedCount = 0;
  let notFound = [];

  for (const item of rawData) {
    const yudisiumDate = parseIndoDate(item.yudisiumDateStr);
    if (!yudisiumDate) {
      console.warn(`Could not parse date for NIM ${item.nim}: ${item.yudisiumDateStr}`);
      continue;
    }

    const existing = await prisma.alumni.findUnique({
      where: { nim: item.nim }
    });

    if (!existing) {
      notFound.push(item);
      continue;
    }

    const updatePayload = {
      yudisiumDate: yudisiumDate,
      gpa: item.gpa !== undefined && item.gpa !== null ? item.gpa : existing.gpa,
    };

    if (item.pisn && item.pisn.trim().length > 0) {
      updatePayload.pisnNumber = item.pisn.trim();
    }
    if (item.batch && item.batch.trim().length > 0) {
      updatePayload.pisnBatchNumber = item.batch.trim();
    }

    await prisma.alumni.update({
      where: { nim: item.nim },
      data: updatePayload
    });

    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} alumni with verified Yudisium dates & details.`);
  if (notFound.length > 0) {
    console.warn(`NIMs not found in database (${notFound.length}):`, notFound.map(x => `${x.nim} - ${x.name}`));
  }
}

main()
  .catch((err) => {
    console.error("Error executing sync:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
