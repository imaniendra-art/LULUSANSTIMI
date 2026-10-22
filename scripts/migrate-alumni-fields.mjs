import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting data migration for Alumni fields...");

  const allAlumni = await prisma.alumni.findMany();
  console.log(`Found ${allAlumni.length} alumni records to update.`);

  let updatedCount = 0;

  for (const a of allAlumni) {
    // Derive entry year from NIM (first 2 digits: 22 -> 2022)
    const nimPrefix = a.nim ? a.nim.substring(0, 2) : "22";
    const entryYear = parseInt(nimPrefix, 10) ? 2000 + parseInt(nimPrefix, 10) : 2022;
    const entryPeriod = `${entryYear}/${entryYear + 1} Ganjil`;

    // Exit Period from graduation year (2026 -> 2025/2026 Genap)
    const gradYear = a.graduationYear || 2026;
    const exitPeriod = `${gradYear - 1}/${gradYear} Genap`;

    // Decree number default
    const yudisiumDecreeNumber = a.yudisiumDecreeNumber || "042/SK-YUD/STIMI/IX/2026";

    await prisma.alumni.update({
      where: { id: a.id },
      data: {
        registrationType: "PESERTA_DIDIK_BARU",
        entryPeriod: a.entryPeriod || entryPeriod,
        exitPeriod: a.exitPeriod || exitPeriod,
        yudisiumDecreeNumber,
        prodiCode: "61201",
        prodiName: "S1 Manajemen",
        degree: "S1",
      },
    });

    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} alumni records with entry/exit period and registrationType.`);
}

main()
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
