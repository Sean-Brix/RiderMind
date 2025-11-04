import { PrismaClient } from '@prisma/client';
import colors from 'colors';

const prisma = new PrismaClient();

async function clearStudentModules() {
  try {
    console.log('\n🧹 Clearing Student Modules...'.bold.yellow);
    
    const result = await prisma.studentModule.deleteMany({});
    
    console.log(`✓ Deleted ${result.count} student module records`.green);
    console.log('\n✨ All users can now start fresh with course selection!\n'.cyan);
    
  } catch (error) {
    console.error('❌ Error clearing student modules:'.red, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearStudentModules()
  .then(() => {
    console.log('✅ Done!'.green.bold);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:'.red.bold, error);
    process.exit(1);
  });
