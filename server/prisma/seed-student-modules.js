import { PrismaClient } from '@prisma/client';
import seedStudentModules from './seeds/student-modules.seed.js';

const prisma = new PrismaClient();

async function main() {
  console.log('📚 Seeding Student Modules...\n');
  const result = await seedStudentModules();
  console.log(`\n✅ Student modules seeded: ${result.success} created, ${result.skipped} skipped\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
