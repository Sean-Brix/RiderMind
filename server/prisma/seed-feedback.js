import { PrismaClient } from '@prisma/client';
import seedFeedback from './seeds/feedback.seed.js';

const prisma = new PrismaClient();

async function main() {
  console.log('💬 Seeding Feedback...\n');
  const result = await seedFeedback();
  console.log(`\n✅ Feedback seeded: ${result.success} created, ${result.skipped} skipped\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
