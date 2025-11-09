import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🗑️  Clearing all data...');
  
  // Delete in correct order (respecting foreign keys)
  await prisma.studentModule.deleteMany();
  await prisma.moduleCategoryModule.deleteMany();
  await prisma.moduleSlide.deleteMany();
  await prisma.moduleObjective.deleteMany();
  await prisma.module.deleteMany();
  await prisma.moduleCategory.deleteMany();
  await prisma.quizAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestionOption.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.moduleFeedback.deleteMany();
  await prisma.quizQuestionReaction.deleteMany();
  await prisma.registrationRequest.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('✅ All data cleared');
  
  console.log('\n🔄 Resetting auto-increment counters...');
  
  // Reset auto-increment for MySQL
  await prisma.$executeRawUnsafe('ALTER TABLE User AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE Module AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE ModuleCategory AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE ModuleCategoryModule AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE StudentModule AUTO_INCREMENT = 1');
  
  console.log('✅ Auto-increment counters reset');
  console.log('\n✨ Database is clean! Run npm run fill to seed with fresh data.');
  
  await prisma.$disconnect();
}

resetDatabase().catch(console.error);
