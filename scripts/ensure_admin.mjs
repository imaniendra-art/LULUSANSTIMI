import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = crypto.createHash("sha256").update("makassar123").digest("hex");

  const admin = await prisma.user.upsert({
    where: { email: "imaniendra@gmail.com" },
    update: {
      nim: "iman",
      role: "SUPERADMIN",
      status: "ACTIVE",
      passwordHash,
    },
    create: {
      email: "imaniendra@gmail.com",
      nim: "iman",
      role: "SUPERADMIN",
      status: "ACTIVE",
      passwordHash,
    },
  });
  console.log("Superadmin Iman ready:", admin.email, admin.nim, admin.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
