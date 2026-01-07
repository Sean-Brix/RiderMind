import { PrismaClient } from '@prisma/client';
import colors from 'colors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import seedAccounts from './seeds/accounts.seed.js';
import seedCategories from './seeds/categories.seed.js';
import { seedFAQs } from './seeds/faqs.seed.js';
import seedFeedback from './seeds/feedback.seed.js';
import { seedModules } from './seeds/modules.seed.js';
import { seedQuizzes } from './seeds/quizzes.seed.js';
import seedStudentModules from './seeds/student-modules.seed.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// Animation helpers
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function showBanner() {
  const banner = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🏍️  RIDERMIND DATABASE SEEDING SYSTEM 🏍️              ║
║                                                            ║
║     Initializing MOTORCYCLE TRAINING database...          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `.cyan.bold;
  
  console.log(banner);
  await sleep(500);
}

async function showProgress(current, total, label) {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * 30);
  const empty = 30 - filled;
  
  const bar = '█'.repeat(filled).green + '░'.repeat(empty).gray;
  process.stdout.write(`\r[$bar] ${percentage}% - ${label}`.cyan);
  
  if (current === total) {
    console.log('');
  }
}

async function main() {
  try {
    await showBanner();

    // Clear database before seeding
    console.log('🗑️  Clearing database...\n'.yellow.bold);
    
    try {
      console.log('   Deleting quiz question reactions...'.gray);
      await prisma.quizQuestionReaction.deleteMany({});
      
      console.log('   Deleting module feedback...'.gray);
      await prisma.moduleFeedback.deleteMany({});
      
      console.log('   Deleting quiz answers...'.gray);
      await prisma.quizAnswer.deleteMany({});
      
      console.log('   Deleting quiz attempts...'.gray);
      await prisma.quizAttempt.deleteMany({});
      
      console.log('   Deleting student modules...'.gray);
      await prisma.studentModule.deleteMany({});
      
      console.log('   Deleting quiz options...'.gray);
      await prisma.quizQuestionOption.deleteMany({});
      
      console.log('   Deleting quiz questions...'.gray);
      await prisma.quizQuestion.deleteMany({});
      
      console.log('   Deleting quizzes...'.gray);
      await prisma.quiz.deleteMany({});
      
      console.log('   Deleting module slides...'.gray);
      await prisma.moduleSlide.deleteMany({});
      
      console.log('   Deleting module objectives...'.gray);
      await prisma.moduleObjective.deleteMany({});
      
      console.log('   Deleting module category modules...'.gray);
      await prisma.moduleCategoryModule.deleteMany({});
      
      console.log('   Deleting modules...'.gray);
      await prisma.module.deleteMany({});
      
      console.log('   Deleting categories...'.gray);
      await prisma.moduleCategory.deleteMany({});
      
      console.log('   Deleting FAQs...'.gray);
      await prisma.fAQ.deleteMany({});
      
      console.log('   Deleting registration requests...'.gray);
      await prisma.registrationRequest.deleteMany({});
      
      console.log('   Deleting accounts...'.gray);
      await prisma.user.deleteMany({});
      
      console.log('\n   ✅ Database cleared successfully!\n'.green.bold);
    } catch (deleteError) {
      console.error('\n   ⚠️  Error during deletion (continuing anyway):'.yellow, deleteError.message);
    }
    
    await sleep(500);

    const seedFunctions = [
      { name: 'User Accounts (20 Accounts)', fn: seedAccounts, emoji: '👥', models: ['User'] },
      { name: 'Categories (Motorcycle & Car)', fn: seedCategories, emoji: '🏷️', models: ['ModuleCategory', 'ModuleCategoryModule'] },
      { name: 'Modules (10 Training Modules)', fn: () => seedModules(prisma), emoji: '🏍️', models: ['Module', 'ModuleObjective', 'ModuleSlide'] },
      { name: 'Quizzes (10+ Questions per Module)', fn: () => seedQuizzes(prisma), emoji: '📝', models: ['Quiz', 'QuizQuestion', 'QuizQuestionOption'] },
      { name: 'Student Enrollments (Realistic Progress)', fn: seedStudentModules, emoji: '📚', models: ['StudentModule', 'QuizAttempt', 'QuizAnswer'] },
      { name: 'FAQs (3-6 per Category)', fn: seedFAQs, emoji: '❓', models: ['FAQ'] },
      { name: 'Feedback System (Comments & Reactions)', fn: seedFeedback, emoji: '💬', models: ['ModuleFeedback', 'QuizQuestionReaction'] }
    ];

    let totalSuccess = 0;
    let totalSkipped = 0;

    console.log('🚀 Starting seed process...\n'.bold.green);

    for (let i = 0; i < seedFunctions.length; i++) {
      const { name, fn, emoji } = seedFunctions[i];
      
      console.log(`\n${emoji} ${`[${i + 1}/${seedFunctions.length}]`.gray} Processing: ${name}`.bold);
      console.log('─'.repeat(60).gray);
      
      const result = await fn();
      
      totalSuccess += result.success;
      totalSkipped += result.skipped;
      
      await showProgress(i + 1, seedFunctions.length, name);
      await sleep(300);
    }

    // Final summary
    console.log('\n\n' + '═'.repeat(60).rainbow);
    console.log('  ✨ SEEDING COMPLETED SUCCESSFULLY! ✨'.bold.green);
    console.log('═'.repeat(60).rainbow);
    
    console.log('\n📊 Overall Statistics:'.bold);
    console.log(`   ✓ Total Created: ${totalSuccess} records`.green);
    console.log(`   ⏭️  Total Skipped: ${totalSkipped} records`.yellow);
    console.log(`   📦 Total Seeds Run: ${seedFunctions.length}`.cyan);
    
    // List all seeded models
    const allModels = [...new Set(seedFunctions.flatMap(s => s.models))];
    console.log('\n📋 Prisma Models Seeded (' + allModels.length + '/15 total):'.bold);
    allModels.forEach(model => {
      console.log(`   ✓ ${model}`.green);
    });
    
    console.log('\n📝 Models Not Seeded (created during runtime):'.bold);
    console.log('   • RegistrationRequest (pending user registrations)'.dim);
    
    console.log('\n🎉 Database is ready for use!\n'.bold.magenta);

  } catch (error) {
    console.error('\n❌ Error during seeding:'.red.bold);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed.'.dim);
  }
}

// ASCII art on exit
process.on('exit', () => {
  console.log('\n' + '─'.repeat(60).gray);
  console.log('  Thanks for using RiderMind Seed System! 🏍️💨'.cyan);
  console.log('─'.repeat(60).gray + '\n');
});

main();
