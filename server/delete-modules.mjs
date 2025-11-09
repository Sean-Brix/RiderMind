import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteModules() {
  console.log('Deleting all modules...');
  
  await prisma.moduleSlide.deleteMany();
  console.log('✓ Deleted slides');
  
  await prisma.moduleObjective.deleteMany();
  console.log('✓ Deleted objectives');
  
  await prisma.moduleCategoryModule.deleteMany();
  console.log('✓ Deleted category assignments');
  
  await prisma.module.deleteMany();
  console.log('✓ Deleted modules');
  
  await prisma.$disconnect();
  console.log('\n✅ All modules deleted. Run npm run fill to reseed.');
}

deleteModules();
