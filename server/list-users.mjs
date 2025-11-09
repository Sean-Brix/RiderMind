import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  select: { id: true, email: true, role: true },
  orderBy: { id: 'asc' },
  take: 10
});

console.log('First 10 users:');
users.forEach(u => console.log(`  ID ${u.id}: ${u.email} (${u.role})`));

await prisma.$disconnect();
