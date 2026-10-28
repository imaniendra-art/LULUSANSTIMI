import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rawData = `
Nomor Batch: ,NI-09304661201266,,
Perguruan Tinggi: ,093046 - Sekolah Tinggi Ilmu Manajemen Indonesia YAPMI,,
Program Studi: ,61201 - Sarjana - Manajemen,,
Tanggal Generate Nomor: ,23 September 2026,,
Operator PT: ,Iman Prasetyo,,
Tanggal Export Data: ,22 Oktober 2026,,
,,,
NIM,Nama Mahasiswa,Nomor Ijazah,Keterangan
2261201003,RICKY G,093046612012026100074,-
2261201006,SARLAN,093046612012026100075,-
2261201012,MUH FAHRUL HARSAM,093046612012026100076,-
2261201013,NENSI,093046612012026100077,-
2261201016,THAHIRA ARISTA,093046612012026100078,-
2261201037,EKA KURNIAWAN M,093046612012026100079,-
2261201040,RAHAYU,093046612012026100080,-
2261201055,SULTAN ISKANDAR,093046612012026100081,-
2261201057,YUSRAN YUSUF,093046612012026100082,-
2261201060,DIPA SUDARTA,093046612012026100083,-
2261201061,NUR FADILLA,093046612012026100084,-
2261201063,TIA SARTIKA,093046612012026100085,-
2261201067,RAMA BAGUS WASESO,093046612012026100086,-
2261201069,FIRMAN SAHRUN,093046612012026100087,-
2261201075,SINTA EKA PUTRI,093046612012026100088,-
2261201077,ANDI INDRY NURFADILAH IDRIS,093046612012026100089,-
2261201079,ANDI RISWAN,093046612012026100090,-
2261201085,TUMBA KATA,093046612012026100091,-
2261201104,MUH. REZKY HIDAYAT MUSLIMIN,093046612012026100092,-
2261201106,IRHAM,093046612012026100093,-
2261201113,BRYAN ANGGARA,093046612012026100094,-
2261201115,NURUL HAFIFA BAHAR,093046612012026100095,-
2261201118,CAHYO SETIAWAN,093046612012026100096,-
2261201120,MEILANI ANGGREANI EKA PUTRI HERMAN,093046612012026100097,-
2261201121,NUR ARISKA FEBRIANTI,093046612012026100098,-
Nomor Batch: ,NI-09304661201267,,
Perguruan Tinggi: ,093046 - Sekolah Tinggi Ilmu Manajemen Indonesia YAPMI,,
Program Studi: ,61201 - Sarjana - Manajemen,,
Tanggal Generate Nomor: ,23 September 2026,,
Operator PT: ,Iman Prasetyo,,
Tanggal Export Data: ,22 Oktober 2026,,
,,,
NIM,Nama Mahasiswa,Nomor Ijazah,Keterangan
2261201011,ADITYA PRATAMA,093046612012026100099,-
2261201014,FANDI,093046612012026100100,-
2261201022,M FADLI IRAWAN,093046612012026100101,-
2261201025,MARDANI PUTRIANI,093046612012026100102,-
2261201028,RISKA AMALIA,093046612012026100103,-
2261201050,NURUL FATIMAH AZZAHRAH,093046612012026100104,-
2261201058,LUSIANI RAHAYU,093046612012026100105,-
2261201059,NURFALA,093046612012026100106,-
2261201062,VIONA APRILIA WIWIN,093046612012026100107,-
2261201065,GUSTRI,093046612012026100108,-
2261201070,AHMAD MUAMMAR,093046612012026100109,-
2261201072,MUHAMMAD FADLI,093046612012026100110,-
2261201076,MAULINDA,093046612012026100111,-
2261201080,IKHWAN SALDI,093046612012026100112,-
2261201088,NURUL APRIYANTI,093046612012026100113,-
2261201098,DENDY GUNARSA ABADI LAU,093046612012026100114,-
2261201103,ADELIA HARAHAP,093046612012026100115,-
2261201109,WARDANA,093046612012026100116,-
2261201112,MUH GILANG RAMADHAN,093046612012026100117,-
2261201122,NURFAHIRA,093046612012026100118,-
2261201123,AYU,093046612012026100119,-
2261201175,ENGELLINA,093046612012026100120,-
Nomor Batch: ,NI-09304661201268,,
Perguruan Tinggi: ,093046 - Sekolah Tinggi Ilmu Manajemen Indonesia YAPMI,,
Program Studi: ,61201 - Sarjana - Manajemen,,
Tanggal Generate Nomor: ,23 September 2026,,
Operator PT: ,Iman Prasetyo,,
Tanggal Export Data: ,22 Oktober 2026,,
,,,
NIM,Nama Mahasiswa,Nomor Ijazah,Keterangan
2261201018,DINA ANGREINI,093046612012026100121,-
2261201021,LISNA DAMAYANTI,093046612012026100122,-
2261201029,ASRULLAH SAPUTRA,093046612012026100123,-
2261201032,AYU LESTARI,093046612012026100124,-
2261201033,MUH. SADDAM AFFANDI,093046612012026100125,-
2261201034,SAMSUL BAHRI SAMIUN,093046612012026100126,-
2261201036,JATSIAH ALI,093046612012026100127,-
2261201066,SULFIDAYANTY,093046612012026100128,-
2261201068,USMAL REBSAL,093046612012026100129,-
2261201108,NURMILA SARI,093046612012026100130,-
2261201110,HUZNUL HOTIMAH RUDI,093046612012026100131,-
Nomor Batch: ,NI-09304661201269,,
Perguruan Tinggi: ,093046 - Sekolah Tinggi Ilmu Manajemen Indonesia YAPMI,,
Program Studi: ,61201 - Sarjana - Manajemen,,
Tanggal Generate Nomor: ,24 September 2026,,
Operator PT: ,Iman Prasetyo,,
Tanggal Export Data: ,22 Oktober 2026,,
,,,
NIM,Nama Mahasiswa,Nomor Ijazah,Keterangan
2261201015,A. NURUL HARDIANTI TENRI UKE HD,093046612012026100132,-
Nomor Batch: ,NI-093046612012610,,
Perguruan Tinggi: ,093046 - Sekolah Tinggi Ilmu Manajemen Indonesia YAPMI,,
Program Studi: ,61201 - Sarjana - Manajemen,,
Tanggal Generate Nomor: ,24 September 2026,,
Operator PT: ,Iman Prasetyo,,
Tanggal Export Data: ,22 Oktober 2026,,
,,,
NIM,Nama Mahasiswa,Nomor Ijazah,Keterangan
2261201001,ZAHRA AZIZAH RIDWAN,093046612012026100133,-
2261201087,HANA SEBA,093046612012026100134,-
Nomor Batch: ,NI-093046612012611,,
Perguruan Tinggi: ,093046 - Sekolah Tinggi Ilmu Manajemen Indonesia YAPMI,,
Program Studi: ,61201 - Sarjana - Manajemen,,
Tanggal Generate Nomor: ,26 September 2026,,
Operator PT: ,Iman Prasetyo,,
Tanggal Export Data: ,22 Oktober 2026,,
,,,
NIM,Nama Mahasiswa,Nomor Ijazah,Keterangan
2261201026,ANGGHI NURSYAMSI,093046612012026100135,-
2261201049,NUR ANNISA ASSAHRA,093046612012026100136,-
2261201053,ST. ROHANI,093046612012026100137,-
2261201064,MUH. GALIB JUNAIF SYAM,093046612012026100138,-
2261201073,SARMILAH,093046612012026100139,-
2261201082,ST. NURALISA,093046612012026100140,-
2261201114,NUR ALIM AKBAR,093046612012026100141,-
2261201119,ANDI IRSAN SAPUTRA,093046612012026100142,-
Nomor Batch: ,NI-093046612012612,,
Perguruan Tinggi: ,093046 - Sekolah Tinggi Ilmu Manajemen Indonesia YAPMI,,
Program Studi: ,61201 - Sarjana - Manajemen,,
Tanggal Generate Nomor: ,26 September 2026,,
Operator PT: ,Iman Prasetyo,,
Tanggal Export Data: ,22 Oktober 2026,,
,,,
NIM,Nama Mahasiswa,Nomor Ijazah,Keterangan
2261201004,FIRDA NUR DEWISARI,093046612012026100143,-
2261201009,HIKMAH NOVIA SAFITRI TALLI,093046612012026100144,-
2261201019,MIFTHA QHULJANNAH,093046612012026100145,-
2261201020,MARDI,093046612012026100146,-
2261201083,SYALWA SHABILA,093046612012026100147,-
Nomor Batch: ,NI-093046612012613,,
Perguruan Tinggi: ,093046 - Sekolah Tinggi Ilmu Manajemen Indonesia YAPMI,,
Program Studi: ,61201 - Sarjana - Manajemen,,
Tanggal Generate Nomor: ,26 September 2026,,
Operator PT: ,Iman Prasetyo,,
Tanggal Export Data: ,22 Oktober 2026,,
,,,
NIM,Nama Mahasiswa,Nomor Ijazah,Keterangan
2261201071,NUR FITRAH INDAH SARI,093046612012026100148,-
2261201081,BINTANG PRAMUDIA,093046612012026100149,-
Nomor Batch: ,NI-093046612012614,,
Perguruan Tinggi: ,093046 - Sekolah Tinggi Ilmu Manajemen Indonesia YAPMI,,
Program Studi: ,61201 - Sarjana - Manajemen,,
Tanggal Generate Nomor: ,27 September 2026,,
Operator PT: ,Iman Prasetyo,,
Tanggal Export Data: ,22 Oktober 2026,,
,,,
NIM,Nama Mahasiswa,Nomor Ijazah,Keterangan
2261201078,RAKHA APRILIANO PUTRA,093046612012026100150,-
2261201177,YUSUF WIBISONO BAHAR,093046612012026100151,-
Nomor Batch: ,NI-093046612012615,,
Perguruan Tinggi: ,093046 - Sekolah Tinggi Ilmu Manajemen Indonesia YAPMI,,
Program Studi: ,61201 - Sarjana - Manajemen,,
Tanggal Generate Nomor: ,27 September 2026,,
Operator PT: ,Iman Prasetyo,,
Tanggal Export Data: ,22 Oktober 2026,,
,,,
NIM,Nama Mahasiswa,Nomor Ijazah,Keterangan
2261201007,DHIKA DAMAYANTI DAHRI,093046612012026100152,-
2261201010,TAUFIK HIDAYAT,093046612012026100153,-
2261201017,M AIDIL TASRI HANIFA,093046612012026100154,-
2261201035,FARIN ISKA,093046612012026100155,-
2261201038,RAHMAWATI,093046612012026100156,-
2261201039,MUH ABDILLAH H,093046612012026100157,-
2261201047,KARDILA,093046612012026100158,-
2261201105,MOHD. TAOFIK,093046612012026100159,-
2261201155,NURAFIKAH LATANG,093046612012026100160,-
`;

function parseDateIndo(str) {
  if (!str) return new Date("2026-09-23");
  const months = {
    januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
    juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11
  };
  const parts = str.trim().split(" ");
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const month = months[parts[1].toLowerCase()] ?? 8;
    const year = parseInt(parts[2], 10) || 2026;
    return new Date(year, month, day);
  }
  return new Date();
}

async function run() {
  console.log("Parsing PISN official batch data...");

  const lines = rawData.split("\n").map(l => l.trim()).filter(Boolean);

  let currentBatch = "";
  let currentGenerateDate = new Date("2026-09-23");
  let students = [];

  for (const line of lines) {
    if (line.startsWith("Nomor Batch:")) {
      const parts = line.split(",").map(p => p.trim());
      currentBatch = parts[1] || "";
      continue;
    }

    if (line.startsWith("Tanggal Generate Nomor:")) {
      const parts = line.split(",").map(p => p.trim());
      currentGenerateDate = parseDateIndo(parts[1]);
      continue;
    }

    if (line.startsWith("NIM,") || line.startsWith("Perguruan Tinggi:") || line.startsWith("Program Studi:") || line.startsWith("Operator PT:") || line.startsWith("Tanggal Export Data:") || line.startsWith(",,,")) {
      continue;
    }

    // Tabular record: NIM,Nama Mahasiswa,Nomor Ijazah,Keterangan
    const cols = line.split(",").map(c => c.trim());
    if (cols.length >= 3 && /^\d+$/.test(cols[0])) {
      students.push({
        nim: cols[0],
        fullName: cols[1],
        pisnNumber: cols[2],
        certificateNumber: cols[2],
        pisnBatchNumber: currentBatch,
        yudisiumDate: currentGenerateDate,
        graduationYear: 2026,
        prodiCode: "61201",
        prodiName: "S1 Manajemen",
        degree: "S1",
        cohortYear: parseInt(cols[0].substring(0, 4), 10) || 2022,
        thesisTitle: "Telah memenuhi syarat kelulusan dan penomoran ijazah nasional (PISN/PIN)",
        graduationSource: "YUDISIUM_NON_WISUDA",
      });
    }
  }

  console.log(`Extracted ${students.length} students across PISN batches.`);

  let inserted = 0;
  let updated = 0;

  for (const s of students) {
    const existing = await prisma.alumni.findUnique({ where: { nim: s.nim } });
    if (existing) {
      await prisma.alumni.update({
        where: { nim: s.nim },
        data: {
          fullName: s.fullName,
          pisnNumber: s.pisnNumber,
          certificateNumber: s.certificateNumber,
          pisnBatchNumber: s.pisnBatchNumber,
          // JANGAN menimpa yudisiumDate dengan Tanggal Generate Belmawa
          graduationYear: s.graduationYear,
        },
      });
      updated++;
    } else {
      await prisma.alumni.create({ data: s });
      inserted++;
    }
    console.log(`[${s.pisnBatchNumber}] ${s.nim} - ${s.fullName} - PISN: ${s.pisnNumber}`);
  }

  console.log(`\nImport complete! Inserted: ${inserted}, Updated: ${updated}, Total: ${students.length}`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
