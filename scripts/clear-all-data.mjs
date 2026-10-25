import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Mengosongkan Seluruh Data Alumni STIMI YAPMI ===");

  // 1. Hitung sebelum dihapus
  const countLegalization = await prisma.legalizationRequest.count();
  const countTracer = await prisma.tracerResponse.count();
  const countLogs = await prisma.integrationLog.count();
  const countAlumni = await prisma.alumni.count();
  const countAlumniUsers = await prisma.user.count({ where: { role: "ALUMNI" } });

  console.log(`Ditemukan:`);
  console.log(`- ${countAlumni} data Alumni`);
  console.log(`- ${countLegalization} Permohonan Legalisir`);
  console.log(`- ${countTracer} Respon Tracer Study`);
  console.log(`- ${countLogs} Log Integrasi`);
  console.log(`- ${countAlumniUsers} Akun User Alumni`);

  // 2. Hapus data berelasi
  console.log("\nMenghapus data...");
  const delLegal = await prisma.legalizationRequest.deleteMany({});
  console.log(`✔ Terhapus ${delLegal.count} permohonan legalisir`);

  const delTracer = await prisma.tracerResponse.deleteMany({});
  console.log(`✔ Terhapus ${delTracer.count} respon tracer`);

  const delLogs = await prisma.integrationLog.deleteMany({});
  console.log(`✔ Terhapus ${delLogs.count} log integrasi`);

  const delAlumni = await prisma.alumni.deleteMany({});
  console.log(`✔ Terhapus ${delAlumni.count} data alumni`);

  const delUsers = await prisma.user.deleteMany({ where: { role: "ALUMNI" } });
  console.log(`✔ Terhapus ${delUsers.count} akun pengguna alumni`);

  // 3. Pastikan Admin BAAK tetap ada
  const adminBaak = await prisma.user.upsert({
    where: { email: "baak@stimi-yapmi.ac.id" },
    update: {},
    create: {
      email: "baak@stimi-yapmi.ac.id",
      nim: "ADMIN001",
      role: "ADMIN_BAAK",
      status: "ACTIVE",
    },
  });
  console.log(`✔ Akun Admin BAAK tetap aman: ${adminBaak.email} (${adminBaak.role})`);

  // 4. Verifikasi sisa data
  const finalAlumniCount = await prisma.alumni.count();
  console.log(`\nStatus Akhir: ${finalAlumniCount} data Alumni di database (BERSIH 100%).`);
}

main()
  .catch((err) => {
    console.error("Gagal mengosongkan database:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
