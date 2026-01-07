import { PrismaClient } from '@prisma/client';
import { seedQuizzes } from './seeds/quizzes.seed.js';

const prisma = new PrismaClient();

async function main() {
  console.log('📝 Seeding Quizzes...\n');
  const result = await seedQuizzes(prisma);
  console.log(`\n✅ Quizzes seeded: ${result.success} created, ${result.skipped} skipped\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
