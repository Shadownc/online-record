import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (username && password && password !== "change-me-before-deploy") {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.adminUser.upsert({
      where: { username },
      create: { username, passwordHash },
      update: { passwordHash },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
