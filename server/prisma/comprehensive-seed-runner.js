/**
 * COMPREHENSIVE SEED SYSTEM - PART 3
 * Contains: FAQs, Student Modules, Feedback, and Main Runner
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import colors from 'colors';
import { seedCategories, seedQuizzes } from './comprehensive-seed-part2.js';

const prisma = new PrismaClient();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerIndex = 0;

async function animateProgress(message, duration = 400) {
  const steps = Math.floor(duration / 100);
  for (let i = 0; i < steps; i++) {
    process.stdout.write(`\r${spinner[spinnerIndex]} ${message}`.cyan);
    spinnerIndex = (spinnerIndex + 1) % spinner.length;
    await sleep(100);
  }
  process.stdout.write(`\r✓ ${message}`.green + '\n');
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ==================== STEP 6: SEED FAQs ====================

async function seedFAQs() {
  console.log('\n' + '='.repeat(80).rainbow);
  console.log('  ❓ SEEDING FAQs (4+ per Category)'.bold.magenta);
  console.log('='.repeat(80).rainbow + '\n');

  const faqs = [
    // General Category (5 FAQs)
    { question: 'What is RiderMind?', answer: 'RiderMind is a comprehensive driver education platform designed to help students prepare for their license exams through interactive modules, quizzes, and learning materials.', category: 'General' },
    { question: 'How do I get started?', answer: 'Register for an account, select your student type, and start browsing available modules. Track your progress through the dashboard.', category: 'General' },
    { question: 'What are the different student types?', answer: 'Student types correspond to license categories: A (standard motorcycle), A1 (motorcycle with sidecar), B (basic motorcycle up to 400cc), B1, B2, etc.', category: 'General' },
    { question: 'Is RiderMind available on mobile?', answer: 'Yes! RiderMind is fully responsive and works on desktops, tablets, and mobile devices.', category: 'General' },
    { question: 'How long does it take to complete all modules?', answer: 'It depends on your pace, but most students complete all modules within 2-4 weeks of regular study.', category: 'General' },
    
    // System Category (5 FAQs)
    { question: 'How do I reset my password?', answer: 'Click "Forgot Password" on the login page and follow the email instructions.', category: 'System' },
    { question: 'Can I change my student type after registration?', answer: 'Yes, you can update your student type from your profile settings.', category: 'System' },
    { question: 'Is my personal information secure?', answer: 'Yes, all personal information is encrypted and stored securely. We never share your data without consent.', category: 'System' },
    { question: 'How do I update my profile?', answer: 'Click your profile icon in the navigation bar and select "Profile Settings".', category: 'System' },
    { question: 'Why can\'t I access certain modules?', answer: 'Module access depends on your student type and skill level. Some modules require completion of prerequisites.', category: 'System' },
    
    // Module Category (6 FAQs)
    { question: 'What are learning modules?', answer: 'Learning modules are structured educational content covering vehicle operation, traffic rules, road safety, and maintenance.', category: 'Module' },
    { question: 'Do I need to complete modules in order?', answer: 'Modules are organized in a recommended sequence, but you can access them based on your skill level.', category: 'Module' },
    { question: 'How do I track my progress?', answer: 'Your progress is automatically tracked and displayed in your dashboard with completion percentages.', category: 'Module' },
    { question: 'What are skill levels?', answer: 'Modules are divided into Beginner, Intermediate, and Expert levels. Your skill level determines which content is shown.', category: 'Module' },
    { question: 'Can I provide feedback on modules?', answer: 'Yes! You can rate modules, leave comments, and indicate whether content was helpful.', category: 'Module' },
    { question: 'How long does each module take?', answer: 'Most modules take 15-30 minutes to complete. You can pause and resume anytime.', category: 'Module' },
    
    // Quiz Category (6 FAQs)
    { question: 'How do quizzes work?', answer: 'Quizzes test your knowledge with various question types. You need to achieve the passing score to complete a quiz.', category: 'Quiz' },
    { question: 'What is the passing score?', answer: 'The default passing score is 75%, though this may vary per quiz.', category: 'Quiz' },
    { question: 'Can I retake a quiz if I fail?', answer: 'Yes, you can retake quizzes multiple times to improve your score.', category: 'Quiz' },
    { question: 'Are quizzes timed?', answer: 'Some quizzes have time limits, while others allow you to take as long as needed. The time limit is shown before starting.', category: 'Quiz' },
    { question: 'How are quiz scores calculated?', answer: 'Scores are calculated as a percentage based on correct answers. Each question may have different point values.', category: 'Quiz' },
    { question: 'Can I see which questions I got wrong?', answer: 'Yes, after completing a quiz, you can review your answers and see detailed explanations.', category: 'Quiz' }
  ];

  for (const faq of faqs) {
    await animateProgress(`Creating FAQ: ${faq.question.substring(0, 40)}...`, 200);
    await prisma.fAQ.create({ data: faq });
  }

  console.log(`\n✅ Created ${faqs.length} FAQs!\n`.green);
}

// ==================== STEP 7: SEED STUDENT MODULES ====================

async function seedStudentModules() {
  console.log('\n' + '='.repeat(80).rainbow);
  console.log('  📊 SEEDING STUDENT MODULE ENROLLMENTS'.bold.green);
  console.log('='.repeat(80).rainbow + '\n');

  const users = await prisma.user.findMany({ where: { role: 'USER' }, take: 5 });
  const category = await prisma.moduleCategory.findFirst({ where: { isDefault: true } });
  const modules = await prisma.module.findMany({ orderBy: { position: 'asc' }, take: 5 });
  const quizzes = await prisma.quiz.findMany({ orderBy: { position: 'asc' } });

  if (users.length < 5) {
    console.log('⚠️  Not enough users for student modules'.yellow);
    return;
  }

  for (let userIndex = 0; userIndex < users.length; userIndex++) {
    const user = users[userIndex];
    await animateProgress(`Enrolling ${user.first_name || 'User'} ${user.last_name || ''}`, 300);

    const modulesToEnroll = randomInt(3, 5); // Each user enrolls in 3-5 modules

    for (let modIndex = 0; modIndex < modulesToEnroll && modIndex < modules.length; modIndex++) {
      const module = modules[modIndex];
      const quiz = quizzes.find(q => q.moduleId === module.id);

      if (!quiz) continue;

      // Generate realistic scores - varied for analytics
      const attempts = randomInt(1, 3);
      const finalScore = randomInt(65, 98);
      const quizPassed = finalScore >= 75;

      const studentModule = await prisma.studentModule.create({
        data: {
          userId: user.id,
          categoryId: category.id,
          moduleId: module.id,
          position: module.position,
          skillLevel: ['Beginner', 'Intermediate', 'Expert'][userIndex % 3],
          progress: 100,
          status: 'COMPLETED',
          isCompleted: true,
          quizScore: finalScore,
          quizAttempts: attempts,
          quizPassed,
          startedAt: new Date(Date.now() - randomInt(15, 45) * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - randomInt(1, 14) * 24 * 60 * 60 * 1000)
        }
      });

      // Create quiz attempts
      const questions = await prisma.quizQuestion.findMany({ where: { quizId: quiz.id } });
      
      for (let attemptNum = 1; attemptNum <= attempts; attemptNum++) {
        const attemptScore = attemptNum === attempts ? finalScore : randomInt(55, 70);
        const correctCount = Math.floor((attemptScore / 100) * questions.length);
        
        const attempt = await prisma.quizAttempt.create({
          data: {
            userId: user.id,
            quizId: quiz.id,
            score: attemptScore,
            passed: attemptScore >= 75,
            startedAt: new Date(Date.now() - randomInt(1, 20) * 24 * 60 * 60 * 1000 - 600000),
            submittedAt: new Date(Date.now() - randomInt(1, 20) * 24 * 60 * 60 * 1000),
            timeSpent: randomInt(300, 900)
          }
        });

        // Create answers
        for (let qIndex = 0; qIndex < questions.length; qIndex++) {
          const question = questions[qIndex];
          const isCorrect = qIndex < correctCount;
          
          const options = await prisma.quizQuestionOption.findMany({ 
            where: { questionId: question.id } 
          });
          
          const correctOption = options.find(o => o.isCorrect);
          const selectedOption = isCorrect 
            ? correctOption 
            : randomElement(options.filter(o => !o.isCorrect)) || options[0];

          await prisma.quizAnswer.create({
            data: {
              attemptId: attempt.id,
              questionId: question.id,
              selectedOptionId: selectedOption?.id || null,
              answerText: question.type === 'IDENTIFICATION' ? (isCorrect ? correctOption?.optionText : 'Wrong answer') : null,
              isCorrect,
              pointsEarned: isCorrect ? question.points : 0
            }
          });
        }
      }

      console.log(`   ✓ Enrolled in ${module.title.substring(0, 30)}... (${attempts} attempts, ${finalScore}%)`.dim);
    }
  }

  console.log(`\n✅ Created student module enrollments!\n`.green);
}

// ==================== STEP 8: SEED FEEDBACK ====================

async function seedFeedback() {
  console.log('\n' + '='.repeat(80).rainbow);
  console.log('  💬 SEEDING FEEDBACK (2-3 per Module)'.bold.yellow);
  console.log('='.repeat(80).rainbow + '\n');

  const users = await prisma.user.findMany({ where: { role: 'USER' } });
  const modules = await prisma.module.findMany();

  const positiveComments = [
    'Very helpful and informative module!',
    'Great content, easy to understand.',
    'I learned a lot from this.',
    'Excellent explanations!',
    'Well structured and organized.',
    'The animations really helped!',
    'Perfect pace and clarity.',
    'This is exactly what I needed.',
    'Clear and concise information.',
    'Really enjoyed this module!'
  ];

  const constructiveComments = [
    'Good module, could use more examples.',
    'Helpful content overall.',
    'Decent module, useful information.',
    'Interesting topic.'
  ];

  for (const module of modules) {
    const feedbackCount = randomInt(2, 3);
    await animateProgress(`Adding feedback for ${module.title.substring(0, 40)}...`, 200);

    const selectedUsers = users.sort(() => Math.random() - 0.5).slice(0, feedbackCount);

    for (const user of selectedUsers) {
      const isPositive = Math.random() > 0.2; // 80% positive
      const rating = isPositive ? randomInt(4, 5) : randomInt(2, 3);
      const comment = isPositive ? randomElement(positiveComments) : randomElement(constructiveComments);

      await prisma.moduleFeedback.create({
        data: {
          moduleId: module.id,
          userId: user.id,
          rating,
          comment,
          isLike: rating >= 4,
          isActive: true
        }
      });
    }
  }

  console.log(`\n✅ Created feedback for all modules!\n`.green);
}

// ==================== MAIN RUNNER ====================

async function runComprehensiveSeed() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════╗'.cyan.bold);
  console.log('║                                                                        ║'.cyan.bold);
  console.log('║          🏍️  RIDERMIND COMPREHENSIVE SEED SYSTEM 🏍️                   ║'.cyan.bold);
  console.log('║                                                                        ║'.cyan.bold);
  console.log('╚════════════════════════════════════════════════════════════════════════╝'.cyan.bold);
  console.log('\n🚀 Starting comprehensive database seeding...\n'.bold.green);

  try {
    // Import functions from comprehensive-seed.js
    const { clearDatabase, seedAccounts, seedModules } = await import('./comprehensive-seed.js');

    // Step 1: Clear Database
    await clearDatabase();

    // Step 2: Seed Accounts
    await seedAccounts();

    // Step 3: Seed Modules
    await seedModules();

    // Step 4: Seed Categories
    await seedCategories();

    // Step 5: Seed Quizzes
    await seedQuizzes();

    // Step 6: Seed FAQs
    await seedFAQs();

    // Step 7: Seed Student Modules
    await seedStudentModules();

    // Step 8: Seed Feedback
    await seedFeedback();

    console.log('\n\n' + '═'.repeat(80).rainbow);
    console.log('  ✨ COMPREHENSIVE SEEDING COMPLETED SUCCESSFULLY! ✨'.bold.green);
    console.log('═'.repeat(80).rainbow);
    console.log('\n📊 Database Summary:'.bold.cyan);
    console.log('   • 24 User Accounts (1 Admin + 23 Users)'.green);
    console.log('   • 8 Learning Modules with 10 slides each'.green);
    console.log('   • 2 Categories (Motorcycle & Car)'.green);
    console.log('   • 8 Quizzes with 10 questions each'.green);
    console.log('   • 22 FAQs across 4 categories'.green);
    console.log('   • Student enrollments with quiz attempts'.green);
    console.log('   • Module feedback from users'.green);
    console.log('\n🎉 Database is fully populated and ready for use!\n'.bold.magenta);

  } catch (error) {
    console.error('\n❌ Error during seeding:'.red.bold, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
runComprehensiveSeed().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
