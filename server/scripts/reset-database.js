import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🔄 Starting database reset...\n');

  try {
    // Step 1: Delete all data in correct order (respect foreign keys)
    console.log('🗑️  Deleting all data...');
    
    await prisma.quizAnswer.deleteMany({});
    console.log('  ✅ Quiz answers deleted');
    
    await prisma.quizAttempt.deleteMany({});
    console.log('  ✅ Quiz attempts deleted');
    
    await prisma.quizQuestionOption.deleteMany({});
    console.log('  ✅ Quiz question options deleted');
    
    await prisma.quizQuestionReaction.deleteMany({});
    console.log('  ✅ Quiz question reactions deleted');
    
    await prisma.quizQuestion.deleteMany({});
    console.log('  ✅ Quiz questions deleted');
    
    await prisma.quiz.deleteMany({});
    console.log('  ✅ Quizzes deleted');
    
    await prisma.moduleFeedback.deleteMany({});
    console.log('  ✅ Module feedbacks deleted');
    
    await prisma.studentModule.deleteMany({});
    console.log('  ✅ Student modules deleted');
    
    await prisma.moduleSlide.deleteMany({});
    console.log('  ✅ Module slides deleted');
    
    await prisma.moduleObjective.deleteMany({});
    console.log('  ✅ Module objectives deleted');
    
    await prisma.moduleCategoryModule.deleteMany({});
    console.log('  ✅ Module category modules deleted');
    
    await prisma.module.deleteMany({});
    console.log('  ✅ Modules deleted');
    
    await prisma.moduleCategory.deleteMany({});
    console.log('  ✅ Module categories deleted');
    
    // Skip FAQ deletion or use raw SQL if needed
    try {
      await prisma.$executeRawUnsafe('DELETE FROM `FAQ`;');
      console.log('  ✅ FAQs deleted');
    } catch (e) {
      console.log('  ⚠️  FAQs table might be empty or not exist');
    }
    
    await prisma.registrationRequest.deleteMany({});
    console.log('  ✅ Registration requests deleted');
    
    await prisma.user.deleteMany({});
    console.log('  ✅ All users deleted');

    console.log('\n✨ All data deleted successfully!\n');

    // Step 2: Reset AUTO_INCREMENT for all tables
    console.log('🔢 Resetting AUTO_INCREMENT values...');
    
    const tables = [
      'User',
      'registration_requests',
      'modules',
      'module_categories',
      'module_category_modules',
      'student_modules',
      'module_objectives',
      'module_slides',
      'quizzes',
      'quiz_questions',
      'quiz_question_options',
      'quiz_attempts',
      'quiz_answers',
      'FAQ',
      'module_feedbacks',
      'quiz_question_reactions'
    ];

    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1;`);
        console.log(`  ✅ ${table} AUTO_INCREMENT reset to 1`);
      } catch (e) {
        console.log(`  ⚠️  ${table} table doesn't exist, skipping...`);
      }
    }

    console.log('\n✨ All AUTO_INCREMENT values reset!\n');

    // Step 3: Create admin user
    console.log('👤 Creating admin user...');
    
    const adminPassword = 'admin123'; // Default password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@ridermind.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        first_name: 'System',
        last_name: 'Administrator',
        email_address: 'admin@ridermind.com'
      }
    });

    console.log(`  ✅ Admin user created with ID: ${admin.id}`);
    console.log(`  📧 Email: ${admin.email}`);
    console.log(`  🔑 Password: ${adminPassword}`);
    console.log(`  ⚠️  Please change the password after first login!\n`);

    console.log('🎉 Database reset complete!');
    console.log('📊 Current state:');
    console.log(`  - Users: 1 (admin)`);
    console.log(`  - All other tables: 0 records`);
    console.log(`  - All IDs start from 1\n`);

  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
resetDatabase()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
