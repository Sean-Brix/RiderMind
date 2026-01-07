import { PrismaClient } from '@prisma/client';
import seedAccounts from './seeds/accounts.seed.js';

const prisma = new PrismaClient();

async function main() {
  console.log('👥 Seeding Accounts...\n');
  const result = await seedAccounts();
  console.log(`\n✅ Accounts seeded: ${result.success} created, ${result.skipped} skipped\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
