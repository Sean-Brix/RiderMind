import { PrismaClient } from '@prisma/client';
import colors from 'colors';

// Animation helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Seed student module enrollments with realistic progress and scores
 * Creates varied completion states for different users to populate leaderboard
 */
export async function seedStudentModules() {
  console.log('   📚 Seeding student module enrollments...'.cyan);

  let created = 0;
  let skipped = 0;
  let prisma;

  try {
    prisma = new PrismaClient();
    
    // Get all users (excluding admins for realistic data)
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true, email: true, first_name: true, last_name: true }
    });

    if (users.length === 0) {
      console.log('   ⚠️  No users found. Run accounts seed first.'.yellow);
      return { success: 0, skipped: 0 };
    }

    // Get all categories
    const categories = await prisma.moduleCategory.findMany({
      select: { id: true }
    });

    if (categories.length === 0) {
      console.log('   ⚠️  No categories found. Run categories seed first.'.yellow);
      return { success: 0, skipped: 0 };
    }

    // Get all modules
    const modules = await prisma.module.findMany({
      orderBy: { position: 'asc' },
      select: { id: true, position: true }
    });

    if (modules.length === 0) {
      console.log('   ⚠️  No modules found. Run modules seed first.'.yellow);
      return { success: 0, skipped: 0 };
    }

    console.log(`   Found ${users.length} users, ${categories.length} categories, ${modules.length} modules`.gray);

    // Define different user types with varied completion patterns
    const userPatterns = [
      { name: 'Top Performer', modules: 5, minScore: 90, maxScore: 100, attempts: [1, 2] },
      { name: 'High Achiever', modules: 4, minScore: 85, maxScore: 95, attempts: [1, 2] },
      { name: 'Steady Learner', modules: 3, minScore: 75, maxScore: 88, attempts: [2, 3] },
      { name: 'New Learner', modules: 2, minScore: 70, maxScore: 80, attempts: [2, 3] },
      { name: 'Beginner', modules: 1, minScore: 65, maxScore: 75, attempts: [3, 4] },
    ];

    // Assign patterns to users (some users may not have any enrollments for realism)
    for (let i = 0; i < Math.min(users.length, 8); i++) {
      const user = users[i];
      const pattern = userPatterns[i % userPatterns.length];
      const category = categories[0]; // Use first category for consistency

      console.log(`   👤 Enrolling ${user.first_name || 'User'} ${user.last_name || ''}...`.gray);

      // Determine how many modules this user completes
      const modulesToComplete = Math.min(pattern.modules, modules.length);
      const skillLevel = i < 3 ? 'Expert' : i < 6 ? 'Intermediate' : 'Beginner';

      for (let j = 0; j < modulesToComplete; j++) {
        const module = modules[j];
        
        // Check if enrollment already exists
        const existing = await prisma.studentModule.findFirst({
          where: {
            userId: user.id,
            categoryId: category.id,
            moduleId: module.id
          }
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Generate realistic scores and attempts
        const quizScore = Math.floor(Math.random() * (pattern.maxScore - pattern.minScore + 1)) + pattern.minScore;
        const quizAttempts = pattern.attempts[Math.floor(Math.random() * pattern.attempts.length)];
        const isCompleted = true;
        const quizPassed = quizScore >= 75; // Assuming 75% is passing

        // Get the quiz for this module
        const quiz = await prisma.quiz.findFirst({
          where: { moduleId: module.id },
          include: {
            questions: {
              include: {
                options: true
              }
            }
          }
        });

        // Create student module enrollment
        const studentModule = await prisma.studentModule.create({
          data: {
            userId: user.id,
            categoryId: category.id,
            moduleId: module.id,
            position: module.position,
            skillLevel: skillLevel,
            progress: 100,
            status: 'COMPLETED',
            isCompleted: isCompleted,
            startedAt: new Date(Date.now() - Math.random() * 35 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
            quizScore: quizScore,
            quizAttempts: quizAttempts,
            quizPassed: quizPassed,
            currentSlideId: null
          }
        });

        // Create quiz attempts and answers for realism
        if (quiz && quiz.questions.length > 0) {
          for (let attempt = 1; attempt <= quizAttempts; attempt++) {
            const isLastAttempt = attempt === quizAttempts;
            const attemptScore = isLastAttempt 
              ? quizScore 
              : Math.floor(Math.random() * (quizScore - 10)) + 50; // Earlier attempts have lower scores
            
            const attemptDate = new Date(Date.now() - Math.random() * (40 - attempt * 5) * 24 * 60 * 60 * 1000);
            const quizAttempt = await prisma.quizAttempt.create({
              data: {
                userId: user.id,
                quizId: quiz.id,
                score: attemptScore,
                passed: attemptScore >= 75,
                startedAt: new Date(attemptDate.getTime() - 10 * 60 * 1000), // Started 10 mins before
                submittedAt: attemptDate,
                timeSpent: Math.floor(Math.random() * 600) + 300 // 5-15 minutes in seconds
              }
            });

            // Create answers for each question
            for (const question of quiz.questions) {
              const correctOption = question.options.find(opt => opt.isCorrect);
              const incorrectOptions = question.options.filter(opt => !opt.isCorrect);
              
              // Determine if this answer should be correct based on attempt score
              const shouldBeCorrect = Math.random() * 100 < attemptScore;
              const selectedOption = shouldBeCorrect && correctOption 
                ? correctOption 
                : incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)] || correctOption;

              await prisma.quizAnswer.create({
                data: {
                  attemptId: quizAttempt.id,
                  questionId: question.id,
                  selectedOptionId: selectedOption?.id || question.options[0].id,
                  isCorrect: selectedOption?.isCorrect || false
                }
              });
            }
          }
        }

        created++;
        await sleep(10); // Small delay to show progress
      }

      console.log(`   ✓ ${user.first_name || 'User'} enrolled in ${modulesToComplete} modules (${pattern.name})`.green);
    }

    console.log(`   ✅ Created ${created} student module enrollments`.green.bold);
    
    return { success: created, skipped };

  } catch (error) {
    console.error('   ❌ Error seeding student modules:'.red, error.message);
    throw error;
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

export default seedStudentModules;
