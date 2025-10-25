import { PrismaClient } from '@prisma/client';
import colors from 'colors';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const prisma = new PrismaClient();

// Get the directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const QUIZ_IMAGES_DIR = join(__dirname, '..', 'data', 'quizzes', 'images');

// Animation helpers
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerIndex = 0;

async function animateProgress(message, duration = 600) {
  const steps = Math.floor(duration / 100);
  for (let i = 0; i < steps; i++) {
    process.stdout.write(`\r${spinner[spinnerIndex]} ${message}`.cyan);
    spinnerIndex = (spinnerIndex + 1) % spinner.length;
    await sleep(100);
  }
  process.stdout.write(`\r✓ ${message}`.green + '\n');
}

/**
 * Process quiz image file if exists
 * @param {string} imageName - Image filename
 * @returns {Object|null} - { data: Buffer, mime: string } or null
 */
function processQuizImage(imageName) {
  if (!imageName) return null;

  const imagePath = join(QUIZ_IMAGES_DIR, imageName);
  
  if (!existsSync(imagePath)) {
    return null;
  }

  const imageBuffer = readFileSync(imagePath);
  const ext = imageName.split('.').pop().toLowerCase();
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

  return {
    data: imageBuffer,
    mime: mimeType
  };
}

// Sample quiz data for each module
const quizzesData = [
  {
    title: 'Road Safety Fundamentals Quiz',
    moduleIndex: 1,
    description: 'Test your knowledge on basic road safety principles',
    instructions: 'Answer all questions to the best of your ability. You need 70% to pass.',
    passingScore: 70,
    timeLimit: 15,
    shuffleQuestions: true,
    questions: [
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What does a red traffic light mean?',
        points: 2,
        position: 1,
        shuffleOptions: true,
        options: [
          { text: 'Stop completely', isCorrect: true, position: 1 },
          { text: 'Slow down', isCorrect: false, position: 2 },
          { text: 'Proceed with caution', isCorrect: false, position: 3 },
          { text: 'Speed up', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'TRUE_FALSE',
        question: 'You should always wear a helmet when riding a motorcycle.',
        points: 1,
        position: 2,
        options: [
          { text: 'True', isCorrect: true, position: 1 },
          { text: 'False', isCorrect: false, position: 2 }
        ]
      },
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What is the minimum safe following distance in good weather?',
        description: 'Consider the two-second rule.',
        points: 2,
        position: 3,
        shuffleOptions: true,
        options: [
          { text: 'One car length', isCorrect: false, position: 1 },
          { text: 'Two seconds', isCorrect: true, position: 2 },
          { text: 'Five seconds', isCorrect: false, position: 3 },
          { text: 'Ten meters', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'IDENTIFICATION',
        question: 'What shape is a STOP sign?',
        points: 2,
        position: 4,
        caseSensitive: false,
        options: [
          { text: 'octagon', isCorrect: true, position: 1 },
          { text: 'Octagon', isCorrect: true, position: 2 },
          { text: 'OCTAGON', isCorrect: true, position: 3 }
        ]
      },
      {
        type: 'MULTIPLE_ANSWER',
        question: 'Which of the following are required safety equipment for motorcycles? (Select all that apply)',
        points: 3,
        position: 5,
        shuffleOptions: false,
        options: [
          { text: 'Helmet', isCorrect: true, position: 1 },
          { text: 'Working headlight', isCorrect: true, position: 2 },
          { text: 'Horn', isCorrect: true, position: 3 },
          { text: 'Air conditioning', isCorrect: false, position: 4 },
          { text: 'Rearview mirror', isCorrect: true, position: 5 }
        ]
      }
    ]
  },
  {
    title: 'Traffic Signs and Signals Quiz',
    moduleIndex: 2,
    description: 'Identify and understand common traffic signs and signals',
    instructions: 'Match each sign with its correct meaning. Passing score: 70%',
    passingScore: 70,
    timeLimit: 20,
    shuffleQuestions: true,
    questions: [
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What does a yellow traffic light mean?',
        points: 2,
        position: 1,
        options: [
          { text: 'Go faster to beat the red light', isCorrect: false, position: 1 },
          { text: 'Prepare to stop', isCorrect: true, position: 2 },
          { text: 'Stop immediately', isCorrect: false, position: 3 },
          { text: 'Proceed normally', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'TRUE_FALSE',
        question: 'A triangular sign usually indicates a warning.',
        points: 1,
        position: 2,
        options: [
          { text: 'True', isCorrect: true, position: 1 },
          { text: 'False', isCorrect: false, position: 2 }
        ]
      },
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What does a circular sign with a red border typically indicate?',
        points: 2,
        position: 3,
        options: [
          { text: 'Information', isCorrect: false, position: 1 },
          { text: 'Warning', isCorrect: false, position: 2 },
          { text: 'Prohibition or restriction', isCorrect: true, position: 3 },
          { text: 'Direction', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'IDENTIFICATION',
        question: 'What color are most regulatory signs?',
        points: 2,
        position: 4,
        caseSensitive: false,
        options: [
          { text: 'red', isCorrect: true, position: 1 },
          { text: 'Red', isCorrect: true, position: 2 },
          { text: 'RED', isCorrect: true, position: 3 },
          { text: 'red and white', isCorrect: true, position: 4 }
        ]
      },
      {
        type: 'TRUE_FALSE',
        question: 'You can turn right on a red light after coming to a complete stop, unless otherwise posted.',
        points: 2,
        position: 5,
        options: [
          { text: 'True', isCorrect: false, position: 1 },
          { text: 'False', isCorrect: true, position: 2 }
        ]
      }
    ]
  },
  {
    title: 'Defensive Driving Techniques Quiz',
    moduleIndex: 3,
    description: 'Master defensive driving strategies',
    instructions: 'Complete all questions. You need 70% to pass.',
    passingScore: 70,
    timeLimit: 15,
    shuffleQuestions: true,
    questions: [
      {
        type: 'MULTIPLE_CHOICE',
        question: 'What is the most important aspect of defensive driving?',
        points: 2,
        position: 1,
        options: [
          { text: 'Driving fast to avoid hazards', isCorrect: false, position: 1 },
          { text: 'Anticipating potential dangers', isCorrect: true, position: 2 },
          { text: 'Following closely to save fuel', isCorrect: false, position: 3 },
          { text: 'Using your horn frequently', isCorrect: false, position: 4 }
        ]
      },
      {
        type: 'TRUE_FALSE',
        question: 'Scanning 12-15 seconds ahead helps you identify potential hazards early.',
        points: 1,
        position: 2,
        options: [
          { text: 'True', isCorrect: true, position: 1 },
          { text: 'False', isCorrect: false, position: 2 }
        ]
      },
      {
        type: 'MULTIPLE_ANSWER',
        question: 'Which techniques are part of defensive driving? (Select all that apply)',
        points: 3,
        position: 3,
        options: [
          { text: 'Maintaining safe following distance', isCorrect: true, position: 1 },
          { text: 'Checking blind spots', isCorrect: true, position: 2 },
          { text: 'Aggressive lane changing', isCorrect: false, position: 3 },
          { text: 'Staying alert and focused', isCorrect: true, position: 4 },
          { text: 'Using turn signals', isCorrect: true, position: 5 }
        ]
      },
      {
        type: 'IDENTIFICATION',
        question: 'What is the recommended following distance in seconds during rain?',
        points: 2,
        position: 4,
        caseSensitive: false,
        options: [
          { text: '4', isCorrect: true, position: 1 },
          { text: 'four', isCorrect: true, position: 2 },
          { text: '4 seconds', isCorrect: true, position: 3 }
        ]
      }
    ]
  }
];

export async function seedQuizzes() {
  console.log('\n' + '='.repeat(60).rainbow);
  console.log('  📝 SEEDING QUIZZES'.bold.green);
  console.log('='.repeat(60).rainbow + '\n');

  let successCount = 0;
  let skipCount = 0;
  let questionCount = 0;
  let optionCount = 0;

  // Get all modules
  const modules = await prisma.module.findMany({
    orderBy: { position: 'asc' }
  });

  if (modules.length === 0) {
    console.log('⚠️  No modules found. Please seed modules first.'.yellow);
    return { success: 0, skipped: 0 };
  }

  for (const quizData of quizzesData) {
    const { questions, moduleIndex, ...quizInfo } = quizData;

    try {
      // Find the module by position (moduleIndex)
      const module = modules[moduleIndex - 1];
      
      if (!module) {
        console.log(`⚠️  Module ${moduleIndex} not found. Skipping quiz.`.yellow);
        skipCount++;
        continue;
      }

      // Check if quiz already exists for this module
      const existing = await prisma.quiz.findFirst({
        where: { 
          moduleId: module.id,
          title: quizInfo.title
        }
      });

      if (existing) {
        console.log(`⏭️  Skipping: ${quizInfo.title}`.yellow);
        skipCount++;
        continue;
      }

      // Animate quiz creation
      const createMessage = `Creating: ${quizInfo.title} (Module ${moduleIndex})`;
      await animateProgress(createMessage, 700);

      // Create quiz with questions and options
      await prisma.quiz.create({
        data: {
          ...quizInfo,
          moduleId: module.id,
          questions: {
            create: questions.map((q) => {
              const { options, ...questionData } = q;
              
              return {
                ...questionData,
                options: {
                  create: options.map((opt) => ({
                    optionText: opt.text,
                    isCorrect: opt.isCorrect,
                    position: opt.position
                  }))
                }
              };
            })
          }
        }
      });

      const totalQuestions = questions.length;
      const totalOptions = questions.reduce((sum, q) => sum + q.options.length, 0);
      
      console.log(`   ❓ ${totalQuestions} questions`.dim);
      console.log(`   ✓ ${totalOptions} options`.dim);
      console.log(`   ⏱️  Time limit: ${quizInfo.timeLimit} minutes`.dim);
      console.log(`   🎯 Passing score: ${quizInfo.passingScore}%\n`.dim);
      
      questionCount += totalQuestions;
      optionCount += totalOptions;
      successCount++;

    } catch (error) {
      console.log(`✗ Error creating ${quizInfo.title}: ${error.message}`.red);
      console.log(`   ${error.stack}`.dim);
    }
  }

  console.log('\n' + '─'.repeat(60).gray);
  console.log(`📊 Results:`.bold);
  console.log(`   ✓ Created: ${successCount} quizzes`.green);
  console.log(`   ❓ Total questions: ${questionCount}`.cyan);
  console.log(`   ✓ Total options: ${optionCount}`.magenta);
  console.log(`   ⏭️  Skipped: ${skipCount} quizzes`.yellow);
  console.log('─'.repeat(60).gray + '\n');

  return { success: successCount, skipped: skipCount };
}

export default seedQuizzes;
