import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  console.log('\n=== Checking User 1 ===');
  const user = await prisma.user.findUnique({
    where: { id: 1 },
    select: { id: true, email: true, role: true }
  });
  
  if (user) {
    console.log('✓ User 1 EXISTS:', user);
  } else {
    console.log('✗ User 1 DOES NOT EXIST');
  }
  
  console.log('\n=== Checking Category 1 ===');
  const category = await prisma.moduleCategory.findUnique({
    where: { id: 1 },
    select: { id: true, name: true, vehicleType: true }
  });
  
  if (category) {
    console.log('✓ Category 1 EXISTS:', category);
  } else {
    console.log('✗ Category 1 DOES NOT EXIST');
  }
  
  console.log('\n=== Testing Insert ===');
  try {
    const test = await prisma.studentModule.create({
      data: {
        userId: 1,
        categoryId: 1,
        moduleId: 30,
        position: 0,
        skillLevel: 'Beginner',
        isCompleted: false
      }
    });
    console.log('✓ INSERT SUCCESSFUL:', test);
    
    // Clean up
    await prisma.studentModule.delete({ where: { id: test.id } });
    console.log('✓ Cleaned up test record');
  } catch (error) {
    console.log('✗ INSERT FAILED:', error.message);
    console.log('Meta:', error.meta);
  }
  
  await prisma.$disconnect();
}

checkUser().catch(console.error);
