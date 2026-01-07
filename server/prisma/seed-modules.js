import { PrismaClient } from '@prisma/client';
import { seedModules } from './seeds/modules.seed.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🏍️ Seeding Modules...\n');
  const result = await seedModules(prisma);
  console.log(`\n✅ Modules seeded: ${result.success} created, ${result.skipped} skipped\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
