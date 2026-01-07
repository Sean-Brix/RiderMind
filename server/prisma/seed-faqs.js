import { PrismaClient } from '@prisma/client';
import { seedFAQs } from './seeds/faqs.seed.js';

const prisma = new PrismaClient();

async function main() {
  console.log('❓ Seeding FAQs...\n');
  const result = await seedFAQs();
  console.log(`\n✅ FAQs seeded: ${result.success} created, ${result.skipped} skipped\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
