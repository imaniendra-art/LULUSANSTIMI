import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function toCompactPeriod(periodStr, defaultVal) {
  if (!periodStr) return defaultVal;
  // Match "2022/2023 Ganjil" -> "2022-1"
  // Match "2025/2026 Genap" -> "2025-2"
  const match = periodStr.match(/^(\d{4})[^\s]*\s+(Ganjil|Genap)/i);
  if (match) {
    const year = match[1];
    const sem = match[2].toLowerCase() === "ganjil" ? "1" : "2";
    return `${year}-${sem}`;
  }
  // If already formatted like 2022-1 or 20221
  if (/^\d{4}-\d$/.test(periodStr)) {
    return periodStr;
  }
  if (/^\d{5}$/.test(periodStr)) {
    return `${periodStr.substring(0, 4)}-${periodStr.charAt(4)}`;
  }
  return defaultVal;
}

async function main() {
  console.log("Updating alumni entry/exit periods to compact format (e.g. 2022-1, 2025-2)...");

  const alumni = await prisma.alumni.findMany();
  console.log(`Found ${alumni.length} records.`);

  let updated = 0;
  for (const a of alumni) {
    const nimPrefix = a.nim ? a.nim.substring(0, 2) : "22";
    const entryYear = parseInt(nimPrefix, 10) ? 2000 + parseInt(nimPrefix, 10) : 2022;
    const defaultEntry = `${entryYear}-1`;

    const gradYear = a.graduationYear || 2026;
    const defaultExit = `${gradYear - 1}-2`;

    const newEntry = toCompactPeriod(a.entryPeriod, defaultEntry);
    const newExit = toCompactPeriod(a.exitPeriod, defaultExit);

    await prisma.alumni.update({
      where: { id: a.id },
      data: {
        entryPeriod: newEntry,
        exitPeriod: newExit,
      },
    });
    updated++;
  }

  console.log(`Updated ${updated} alumni records successfully.`);
}

main()
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
