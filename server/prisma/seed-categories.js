import { PrismaClient } from '@prisma/client';
import seedCategories from './seeds/categories.seed.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🏷️ Seeding Categories...\n');
  const result = await seedCategories();
  console.log(`\n✅ Categories seeded: ${result.success} created, ${result.skipped} skipped\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
