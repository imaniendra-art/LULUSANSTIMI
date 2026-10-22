import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const nims = [
  "2461201248", "2461201228", "2461201207", "2461201234", "2561201102",
  "2461201237", "2461201241", "2461201205", "2561201105", "2461201231",
  "2461201239", "2461201245", "2561201103", "2461201221", "2461201206",
  "2461201214", "2461201211", "2461201202", "2461201233", "2461201236",
  "2461201247", "2461201223", "2561201101", "2461201201", "2461201227",
  "2461201235", "2461201226", "2461201210", "2461201219", "2461201208",
  "2461201209", "2461201216", "2461201229", "2561201115", "2561201116",
  "2561201117", "2561201143", "2461201215", "2461201220", "2461201230"
];

async function main() {
  const existing = await prisma.alumni.findMany({
    where: { nim: { in: nims } },
    select: { nim: true, fullName: true }
  });
  console.log(`Found ${existing.length} existing out of ${nims.length} unique NIMs.`);
  if (existing.length > 0) {
    console.log("Existing records:", existing);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
