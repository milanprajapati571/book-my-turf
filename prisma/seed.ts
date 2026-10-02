import "dotenv/config";
import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create an Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@bookmyturf.com" },
    update: {},
    create: {
      email: "admin@bookmyturf.com",
      passwordHash: hashedPassword,
      name: "Super Admin",
      role: "ADMIN",
    },
  });

  // 2. Create an Owner
  const owner = await prisma.user.upsert({
    where: { email: "owner@turfmaster.com" },
    update: {},
    create: {
      email: "owner@turfmaster.com",
      passwordHash: hashedPassword,
      name: "John TurfOwner",
      role: "OWNER",
    },
  });

  // Removed turf seeding based on user request - only user-registered turfs will appear.

  console.log("Database seeded successfully!");
  console.log(`Test Owner: ${owner.email} / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
