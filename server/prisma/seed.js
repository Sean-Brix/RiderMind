import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'ridermind@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || '123456';
  const name = process.env.ADMIN_NAME || 'Administrator';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: { email: adminEmail, passwordHash, name, role: 'ADMIN' },
    });
    console.log('Seeded admin:', adminEmail);
  } else {
    console.log('Admin already exists:', adminEmail);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
