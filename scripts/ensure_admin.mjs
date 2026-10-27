import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "baak@stimi-yapmi.ac.id" },
    update: {},
    create: {
      email: "baak@stimi-yapmi.ac.id",
      nim: "ADMIN001",
      role: "ADMIN_BAAK",
      status: "ACTIVE",
    },
  });
  console.log("Admin BAAK ready:", admin.email, admin.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
