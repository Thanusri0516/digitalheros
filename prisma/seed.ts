import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const currentCount = await prisma.charity.count();
  if (!currentCount) {
    await prisma.charity.createMany({
      data: [
        {
          name: "Hope Caddies Foundation",
          description: "Scholarships and youth coaching support via golf fundraising.",
          featured: true,
        },
        {
          name: "Green Earth Trust",
          description: "Climate and reforestation initiatives powered by sport communities.",
        },
        {
          name: "Fairway Health Aid",
          description: "Emergency healthcare grants for under-served families.",
        },
      ],
    });
  }

  const adminEmail = "admin@digitalheroes.local";
  const exists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!exists) {
    await prisma.user.create({
      data: {
        name: "Platform Admin",
        email: adminEmail,
        passwordHash: await bcrypt.hash("Admin@123", 10),
        role: Role.ADMIN,
      },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
