import { PrismaClient } from "@prisma/client";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function createSamplePdf(outputPath, title, nim, name) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Decorative border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: 555.28,
    height: 801.89,
    borderColor: rgb(0.06, 0.16, 0.26),
    borderWidth: 2,
  });

  page.drawText("SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA (STIMI) YAPMI", {
    x: 40,
    y: 780,
    size: 14,
    font: fontBold,
    color: rgb(0.06, 0.16, 0.26),
  });

  page.drawText("MAKASSAR - SULAWESI SELATAN", {
    x: 40,
    y: 760,
    size: 10,
    font: fontReg,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawLine({
    start: { x: 40, y: 745 },
    end: { x: 555, y: 745 },
    thickness: 1.5,
    color: rgb(0.83, 0.69, 0.22), // Gold
  });

  page.drawText(title.toUpperCase(), {
    x: 40,
    y: 700,
    size: 18,
    font: fontBold,
    color: rgb(0.06, 0.16, 0.26),
  });

  page.drawText(`NIM           : ${nim}`, {
    x: 40,
    y: 650,
    size: 12,
    font: fontBold,
  });

  page.drawText(`Nama Lengkap  : ${name}`, {
    x: 40,
    y: 625,
    size: 12,
    font: fontReg,
  });

  page.drawText(`Dokumen ini adalah arsip digital resmi STIMI Yapmi Makassar.`, {
    x: 40,
    y: 580,
    size: 10,
    font: fontReg,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(`Terverifikasi oleh BAAK STIMI Yapmi`, {
    x: 40,
    y: 50,
    size: 9,
    font: fontReg,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  return pdfBytes.length;
}

async function main() {
  console.log("Seeding database STIMI Yapmi...");

  // 1. Seed Admin BAAK User
  const adminUser = await prisma.user.upsert({
    where: { email: "baak@stimi-yapmi.ac.id" },
    update: {},
    create: {
      email: "baak@stimi-yapmi.ac.id",
      nim: "ADMIN001",
      role: "ADMIN_BAAK",
      status: "ACTIVE",
    },
  });
  console.log("Admin BAAK created:", adminUser.email);

  // 2. Generate sample PDF files
  const sample1Ijazah = path.join(process.cwd(), "storage/uploads/credentials/ijazah/202061201001_ijazah.pdf");
  const sample1Transkrip = path.join(process.cwd(), "storage/uploads/credentials/transkrip/202061201001_transkrip.pdf");
  const size1I = await createSamplePdf(sample1Ijazah, "Salinan Ijazah Sarjana", "202061201001", "Muhammad Rezky Pratama");
  const size1T = await createSamplePdf(sample1Transkrip, "Transkrip Nilai Akademik", "202061201001", "Muhammad Rezky Pratama");

  const sample2Ijazah = path.join(process.cwd(), "storage/uploads/credentials/ijazah/202061201002_ijazah.pdf");
  const sample2Transkrip = path.join(process.cwd(), "storage/uploads/credentials/transkrip/202061201002_transkrip.pdf");
  const size2I = await createSamplePdf(sample2Ijazah, "Salinan Ijazah Sarjana", "202061201002", "Siti Nurhaliza");
  const size2T = await createSamplePdf(sample2Transkrip, "Transkrip Nilai Akademik", "202061201002", "Siti Nurhaliza");

  // 3. Seed Alumni with PISN
  const graduates = [
    {
      nim: "202061201001",
      nik: "7371101405010001",
      fullName: "Muhammad Rezky Pratama",
      birthPlace: "Makassar",
      birthDate: new Date("2001-05-14"),
      gender: "MALE",
      phoneNumber: "081234567890",
      personalEmail: "rezky.pratama@gmail.com",
      prodiCode: "61201",
      prodiName: "S1 Manajemen",
      degree: "S1",
      cohortYear: 2020,
      graduationYear: 2024,
      yudisiumDate: new Date("2024-08-15"),
      yudisiumDecreeNumber: "SK/STIMI/2024/089",
      thesisTitle: "Pengaruh Disiplin Kerja dan Motivasi Terhadap Kinerja Karyawan PT Semen Tonasa",
      pisnNumber: "612012024000101",
      certificateNumber: "STIMI/S1-MNJ/2024/0101",
      gpa: 3.78,
      graduationSource: "WISUDA_PANDAWA",
      currentJobStatus: "EMPLOYED_FULL_TIME",
      currentCompany: "Bank Sulselbar",
      currentPosition: "Account Officer",
      industrySector: "Perbankan & Keuangan",
      city: "Makassar",
      province: "Sulawesi Selatan",
      ijazahScan: {
        fileName: "202061201001_ijazah.pdf",
        filePath: "storage/uploads/credentials/ijazah/202061201001_ijazah.pdf",
        fileSizeBytes: size1I,
        mimeType: "application/pdf",
        uploadedAt: new Date(),
      },
      transkripScan: {
        fileName: "202061201001_transkrip.pdf",
        filePath: "storage/uploads/credentials/transkrip/202061201001_transkrip.pdf",
        fileSizeBytes: size1T,
        mimeType: "application/pdf",
        uploadedAt: new Date(),
      },
    },
    {
      nim: "202061201002",
      nik: "7371105203020002",
      fullName: "Siti Nurhaliza",
      birthPlace: "Gowa",
      birthDate: new Date("2002-03-21"),
      gender: "FEMALE",
      phoneNumber: "085299887766",
      personalEmail: "siti.nurhaliza@gmail.com",
      prodiCode: "61201",
      prodiName: "S1 Manajemen",
      degree: "S1",
      cohortYear: 2020,
      graduationYear: 2024,
      yudisiumDate: new Date("2024-08-15"),
      yudisiumDecreeNumber: "SK/STIMI/2024/089",
      thesisTitle: "Analisis Strategi Pemasaran Digital Dalam Meningkatkan Volume Penjualan Produk UMKM Kuliner di Kota Makassar",
      pisnNumber: "612012024000102",
      certificateNumber: "STIMI/S1-MNJ/2024/0102",
      gpa: 3.84,
      graduationSource: "WISUDA_PANDAWA",
      currentJobStatus: "ENTREPRENEUR",
      currentCompany: "Kopi Kenangan Senja",
      currentPosition: "Owner / Founder",
      industrySector: "Kuliner & F&B",
      city: "Gowa",
      province: "Sulawesi Selatan",
      ijazahScan: {
        fileName: "202061201002_ijazah.pdf",
        filePath: "storage/uploads/credentials/ijazah/202061201002_ijazah.pdf",
        fileSizeBytes: size2I,
        mimeType: "application/pdf",
        uploadedAt: new Date(),
      },
      transkripScan: {
        fileName: "202061201002_transkrip.pdf",
        filePath: "storage/uploads/credentials/transkrip/202061201002_transkrip.pdf",
        fileSizeBytes: size2T,
        mimeType: "application/pdf",
        uploadedAt: new Date(),
      },
    },
    {
      nim: "202062201001",
      nik: "7371081110000003",
      fullName: "Ahmad Fauzan Syarif",
      birthPlace: "Maros",
      birthDate: new Date("2000-11-10"),
      gender: "MALE",
      phoneNumber: "082155443322",
      personalEmail: "ahmad.fauzan@gmail.com",
      prodiCode: "62201",
      prodiName: "S1 Akuntansi",
      degree: "S1",
      cohortYear: 2020,
      graduationYear: 2024,
      yudisiumDate: new Date("2024-09-02"),
      yudisiumDecreeNumber: "SK/STIMI/2024/095",
      thesisTitle: "Analisis Efektivitas Pengendalian Internal Atas Sistem Informasi Akuntansi Penggajian Pada Perumda Air Minum Kota Makassar",
      pisnNumber: "622012024000103",
      certificateNumber: "STIMI/S1-AKT/2024/0045",
      gpa: 3.65,
      graduationSource: "YUDISIUM_NON_WISUDA",
      currentJobStatus: "EMPLOYED_FULL_TIME",
      currentCompany: "Kantor Akuntan Publik (KAP) Amir Abadi Jusuf",
      currentPosition: "Junior Auditor",
      industrySector: "Akuntansi & Audit",
      city: "Makassar",
      province: "Sulawesi Selatan",
    },
    {
      nim: "202062201002",
      nik: "7371096507010004",
      fullName: "Dewi Lestari",
      birthPlace: "Takalar",
      birthDate: new Date("2001-07-25"),
      gender: "FEMALE",
      phoneNumber: "081344556677",
      personalEmail: "dewi.lestari@gmail.com",
      prodiCode: "62201",
      prodiName: "S1 Akuntansi",
      degree: "S1",
      cohortYear: 2020,
      graduationYear: 2024,
      yudisiumDate: new Date("2024-09-02"),
      yudisiumDecreeNumber: "SK/STIMI/2024/095",
      thesisTitle: "Pengaruh Transparansi dan Akuntabilitas Pengelolaan Alokasi Dana Desa Terhadap Pemberdayaan Masyarakat di Kabupaten Takalar",
      pisnNumber: "622012024000104",
      certificateNumber: "STIMI/S1-AKT/2024/0046",
      gpa: 3.91,
      graduationSource: "YUDISIUM_NON_WISUDA",
      currentJobStatus: "CONTINUING_STUDY",
      currentCompany: "Universitas Hasanuddin",
      currentPosition: "Mahasiswa Magister Akuntansi (S2)",
      industrySector: "Pendidikan",
      city: "Takalar",
      province: "Sulawesi Selatan",
    },
  ];

  for (const g of graduates) {
    await prisma.alumni.upsert({
      where: { nim: g.nim },
      update: g,
      create: g,
    });
    console.log(`Graduate seeded: ${g.nim} - ${g.fullName} (${g.prodiName}) - PISN: ${g.pisnNumber}`);
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
