import { PrismaClient } from '@prisma/client';
import colors from 'colors';

const prisma = new PrismaClient();

// Animation helpers
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerIndex = 0;

async function animateProgress(message, duration = 200) {
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

// Comment templates for module feedback
const positiveComments = [
  'This module was very helpful and informative!',
  'Great content, easy to understand.',
  'I learned a lot from this module.',
  'Excellent explanations and examples.',
  'Very well structured and organized.',
  'The visuals really helped me understand the concepts.',
  'Perfect pace, not too fast or slow.',
  'This is exactly what I needed to learn.',
  'Clear and concise information.',
  'Really enjoyed this module!',
  'The instructor did a great job explaining everything.',
  'Best module I\'ve taken so far.',
  'Very practical and useful information.',
  'I feel much more confident now.',
  'The examples were really helpful.',
  'Great use of multimedia content.',
  'This module exceeded my expectations.',
  'Very engaging and interactive.',
  'I appreciate the detailed explanations.',
  'This will definitely help me pass my exam.'
];

const constructiveComments = [
  'Good module, but could use more examples.',
  'Helpful content, some parts were confusing.',
  'Decent module, would like more practice questions.',
  'Interesting topic, but needs better organization.',
  'Good information, but the pace was a bit fast.',
  'Useful content, could be more concise.',
  'Nice module, but some sections were repetitive.',
  'Helpful overall, needs more visual aids.',
  'Good material, but would benefit from updates.',
  'Informative, but could be more interactive.'
];

const excellentComments = [
  'Outstanding module! Could not ask for better content.',
  'This is the best learning material I\'ve ever used.',
  'Absolutely perfect! Five stars all the way!',
  'Incredible detail and clarity in every lesson.',
  'This module has transformed my understanding completely.',
  'Masterfully crafted content. Highly recommended!',
  'I wish all modules were this well designed.',
  'Perfect balance of theory and practice.',
  'This module is a game changer!',
  'Exceptional quality throughout the entire module.'
];

export async function seedFeedback() {
  console.log('\n' + '='.repeat(60).rainbow);
  console.log('  💬 SEEDING FEEDBACK SYSTEM'.bold.green);
  console.log('='.repeat(60).rainbow + '\n');

  let moduleFeedbackCount = 0;
  let questionReactionCount = 0;
  let localPrisma;

  try {
    localPrisma = new PrismaClient();
    
    // Get all modules
    const modules = await localPrisma.module.findMany();
    if (modules.length === 0) {
      console.log('⚠️  No modules found. Please seed modules first.'.yellow);
      return { success: 0, skipped: 0 };
    }

    // Get all users (excluding admin)
    const users = await localPrisma.user.findMany({
      where: { role: 'USER' }
    });
    if (users.length === 0) {
      console.log('⚠️  No users found. Please seed users first.'.yellow);
      return { success: 0, skipped: 0 };
    }

    // Get all quiz questions
    const questions = await localPrisma.quizQuestion.findMany();
    if (questions.length === 0) {
      console.log('⚠️  No quiz questions found. Please seed quizzes first.'.yellow);
    }

    console.log(`Found ${modules.length} modules, ${users.length} users, ${questions.length} questions\n`.cyan);

    // Create Module Feedback (comments) - OPTIMIZED FOR FREE TIER
    console.log('Creating module feedback comments...'.cyan);
    
    const feedbackData = [];
    for (const module of modules) {
      const numFeedbacks = 10; // Exactly 10 feedbacks per module
      
      // Select random users without duplicates for this module
      const selectedUsers = [...users].sort(() => Math.random() - 0.5).slice(0, numFeedbacks);

      for (const user of selectedUsers) {
        // Weighted random: 70% positive (4-5 stars), 20% good (3 stars), 10% constructive (1-2 stars)
        const rand = Math.random();
        let rating, comment, isLike;
        
        if (rand < 0.7) {
          // Positive feedback
          rating = randomInt(4, 5);
          comment = rating === 5 ? randomElement(excellentComments) : randomElement(positiveComments);
          isLike = true;
        } else if (rand < 0.9) {
          // Neutral feedback
          rating = 3;
          comment = randomElement(positiveComments);
          isLike = true;
        } else {
          // Constructive feedback
          rating = randomInt(2, 3);
          comment = randomElement(constructiveComments);
          isLike = Math.random() > 0.5;
        }

        feedbackData.push({
          moduleId: module.id,
          userId: user.id,
          rating,
          comment,
          isLike,
          isActive: true
        });
      }
      
      process.stdout.write(`\r   Created feedback for ${modules.indexOf(module) + 1}/${modules.length} modules`.cyan);
    }

    // Batch create all feedback at once
    console.log('\n   Saving to database...'.cyan);
    try {
      await localPrisma.moduleFeedback.createMany({
        data: feedbackData,
        skipDuplicates: true
      });
      moduleFeedbackCount = feedbackData.length;
      console.log(`   ✓ Created ${moduleFeedbackCount} module feedback comments`.green);
    } catch (error) {
      console.log(`   ⚠️  Some feedback may have been skipped due to duplicates`.yellow);
      moduleFeedbackCount = feedbackData.length;
    }

    // Create Quiz Question Reactions (likes/dislikes) - OPTIMIZED FOR FREE TIER
    if (questions.length > 0) {
      console.log('\nCreating quiz question reactions...'.cyan);
      
      const reactionData = [];
      for (const question of questions) {
        const numReactions = 10; // Exactly 10 reactions per question
        
        // Select random users without duplicates for this question
        const selectedUsers = [...users].sort(() => Math.random() - 0.5).slice(0, numReactions);

        for (const user of selectedUsers) {
          // 80% likes, 20% dislikes
          const isLike = Math.random() < 0.8;

          reactionData.push({
            questionId: question.id,
            userId: user.id,
            isLike
          });
        }
        
        if (questions.indexOf(question) % 10 === 0) {
          const progress = Math.round((questions.indexOf(question) / questions.length) * 100);
          process.stdout.write(`\r   Generated reactions for ${progress}% of questions`.cyan);
        }
      }

      // Batch create all reactions at once
      console.log('\n   Saving to database...'.cyan);
      try {
        await localPrisma.quizQuestionReaction.createMany({
          data: reactionData,
          skipDuplicates: true
        });
        questionReactionCount = reactionData.length;
        console.log(`   ✓ Created ${questionReactionCount} question reactions`.green);
      } catch (error) {
        console.log(`   ⚠️  Some reactions may have been skipped due to duplicates`.yellow);
        questionReactionCount = reactionData.length;
      }
    }

    console.log('\n' + '─'.repeat(60).gray);
    console.log(`📊 Results:`.bold);
    console.log(`   💬 Module Feedback: ${moduleFeedbackCount}`.green);
    console.log(`   👍 Question Reactions: ${questionReactionCount}`.green);
    console.log(`   📊 Total Feedback Items: ${moduleFeedbackCount + questionReactionCount}`.cyan);
    console.log('─'.repeat(60).gray + '\n');

    return { success: moduleFeedbackCount + questionReactionCount, skipped: 0 };

  } catch (error) {
    console.error('\n✗ Error seeding feedback:'.red, error);
    throw error;
  } finally {
    if (localPrisma) {
      await localPrisma.$disconnect();
    }
  }
}

export default seedFeedback;
