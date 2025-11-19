import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkModules() {
  console.log('\n=== Checking Modules ===');
  const modules = await prisma.module.findMany({
    select: { id: true, title: true },
    orderBy: { id: 'asc' }
  });
  console.log('Total modules:', modules.length);
  console.log('Module IDs:', modules.map(m => m.id));
  
  console.log('\n=== Checking Module Category Modules ===');
  const categoryModules = await prisma.moduleCategoryModule.findMany({
    where: { categoryId: 1 },
    select: { moduleId: true, position: true },
    orderBy: { position: 'asc' }
  });
  console.log('Category 1 has', categoryModules.length, 'modules assigned');
  console.log('Module IDs in category:', categoryModules.map(cm => cm.moduleId));
  
  console.log('\n=== Checking if Module IDs exist ===');
  for (const cm of categoryModules) {
    const exists = modules.find(m => m.id === cm.moduleId);
    console.log(`Module ${cm.moduleId}:`, exists ? '✓ EXISTS' : '✗ MISSING');
  }
  
  await prisma.$disconnect();
}

checkModules().catch(console.error);
