import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Mengosongkan Angkatan & Jenis Pendaftaran Alumni ===");
  const total = await prisma.alumni.count();
  console.log(`Total alumni di database: ${total}`);

  const res = await prisma.alumni.updateMany({
    data: {
      cohortYear: null,
      entryPeriod: null,
      registrationType: null,
    },
  });

  console.log(`✔ Berhasil mengosongkan data pada ${res.count} alumni.`);
  console.log("- Angkatan: null (tampil '-')");
  console.log("- Periode Masuk: null (tampil '-')");
  console.log("- Jenis Pendaftaran: null (tampil '-')");
  console.log("\nData kini murni hanya berisi data hasil ekspor kelulusan Feeder.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
