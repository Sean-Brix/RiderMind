import { PrismaClient } from '@prisma/client';
import colors from 'colors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const prisma = new PrismaClient();

// Animation helpers
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerIndex = 0;

async function animateProgress(message, duration = 300) {
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

// Available media files
const availableImages = ['1.jpg', '2.jpeg', '3.jpg', '4.jpeg', '5.jpeg', '6.jpeg', '7.jpeg', '8.jpeg', '9.jpg', '10.jpeg', '11.jpeg'];
const availableVideos = ['1.mp4', '2.mp4', '3.mp4', '4.mp4', '5.mp4', '6.mp4', '7.mp4', '8.mp4', '9.mp4', '10.mp4', '11.mp4'];

async function loadImageAsBlob(imageName) {
  try {
    const imagePath = path.join(__dirname, '..', 'data', 'modules', 'images', imageName);
    if (fs.existsSync(imagePath)) {
      const buffer = fs.readFileSync(imagePath);
      const ext = path.extname(imageName).toLowerCase();
      const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
      return { data: buffer, mime: mimeType };
    }
  } catch (error) {
    console.log(`Warning: Could not load image ${imageName}`.yellow);
  }
  return null;
}

function getVideoPath(videoName) {
  return `videos/${videoName}`;
}

// Question templates by type
const questionTemplates = {
  traffic: [
    'What is the speed limit in residential areas?',
    'When should you use your turn signal?',
    'What does a red traffic light mean?',
    'When must you yield to pedestrians?',
    'What is the safe following distance?',
    'When is it legal to use a cell phone while driving?',
    'What should you do at a stop sign?',
    'Who has the right of way at an intersection?',
    'What does a yellow traffic light indicate?',
    'When should you use your headlights?'
  ],
  safety: [
    'What is the first thing to check before starting your vehicle?',
    'How should you adjust your mirrors?',
    'What safety equipment is required by law?',
    'When should you wear a seatbelt?',
    'How do you properly wear a motorcycle helmet?',
    'What is the purpose of anti-lock brakes?',
    'How can you prevent hydroplaning?',
    'What should you do if your brakes fail?',
    'How should you handle a tire blowout?',
    'What is defensive driving?'
  ],
  road_signs: [
    'What does this road sign indicate?',
    'What action should you take when you see this sign?',
    'What is the meaning of this road marking?',
    'What does a triangular sign represent?',
    'What color are regulatory signs?',
    'What does a circular sign with a red border mean?',
    'What is indicated by a broken white line?',
    'What does a diamond-shaped sign indicate?',
    'What is the purpose of guide signs?',
    'What does a pentagon-shaped sign represent?'
  ],
  mechanics: [
    'How often should you check your tire pressure?',
    'What does the oil pressure warning light indicate?',
    'When should you replace your brake pads?',
    'How do you check your engine oil level?',
    'What causes engine overheating?',
    'When should you replace your wiper blades?',
    'What is the purpose of the cooling system?',
    'How often should you rotate your tires?',
    'What does the battery warning light mean?',
    'When should you check your brake fluid?'
  ],
  weather: [
    'How should you drive in heavy rain?',
    'What is the safest speed in foggy conditions?',
    'How can you prevent skidding on ice?',
    'What should you do if caught in a flood?',
    'How does wind affect motorcycle riding?',
    'What precautions should you take in hot weather?',
    'How do you handle driving in snow?',
    'What is aquaplaning?',
    'How should you adjust following distance in rain?',
    'When should you use fog lights?'
  ]
};

const multipleChoiceOptions = {
  speeds: ['20 km/h', '30 km/h', '40 km/h', '50 km/h', '60 km/h'],
  distances: ['1 meter', '2 meters', '3 meters', '5 meters', '10 meters'],
  times: ['Immediately', 'After 1 second', 'After 2 seconds', 'After 3 seconds', 'Never'],
  general: ['Always', 'Never', 'Only at night', 'Only in emergencies', 'When safe to do so'],
  yesNo: ['Yes, always', 'No, never', 'Only sometimes', 'Depends on situation']
};

function createMultipleChoiceQuestion(question, hasMedia = false) {
  const optionSet = randomElement(Object.values(multipleChoiceOptions));
  const correctIndex = randomInt(0, hasMedia ? 1 : 3); // Only 2 options if media
  const numOptions = hasMedia ? 2 : 4;
  
  const selectedOptions = [];
  for (let i = 0; i < numOptions; i++) {
    selectedOptions.push({
      optionText: optionSet[i % optionSet.length] || `Option ${i + 1}`,
      isCorrect: i === correctIndex,
      position: i
    });
  }
  
  return selectedOptions;
}

function createTrueFalseQuestion() {
  const correctAnswer = Math.random() > 0.5;
  return [
    { optionText: 'True', isCorrect: correctAnswer, position: 0 },
    { optionText: 'False', isCorrect: !correctAnswer, position: 1 }
  ];
}

async function createQuizForModule(module, position) {
  const numQuestions = randomInt(20, 25);
  const hasMedia = Math.random() > 0.7; // 30% chance to have media questions
  
  // Determine time limit (120 seconds to unlimited)
  const timeLimitOptions = [null, 120, 180, 240, 300, null, null]; // More nulls = more unlimited
  const timeLimit = randomElement(timeLimitOptions);
  
  const questions = [];
  
  for (let i = 0; i < numQuestions; i++) {
    const category = randomElement(Object.keys(questionTemplates));
    const questionText = randomElement(questionTemplates[category]);
    
    // Determine question type
    let questionType;
    let options;
    let imageData = null;
    let imageMime = null;
    let videoPath = null;
    let hasQuestionMedia = false;
    
    // Decide if this question has media (only some questions)
    if (hasMedia && i < 5 && Math.random() > 0.5) {
      hasQuestionMedia = true;
      questionType = 'TRUE_FALSE'; // Media questions are true/false only
      options = createTrueFalseQuestion();
      
      // 50/50 chance of image or video
      if (Math.random() > 0.5) {
        const imageBlob = await loadImageAsBlob(randomElement(availableImages));
        if (imageBlob) {
          imageData = imageBlob.data;
          imageMime = imageBlob.mime;
        }
      } else {
        videoPath = getVideoPath(randomElement(availableVideos));
      }
    } else {
      // Text-only questions can be multiple choice or true/false
      questionType = Math.random() > 0.3 ? 'MULTIPLE_CHOICE' : 'TRUE_FALSE';
      options = questionType === 'TRUE_FALSE' 
        ? createTrueFalseQuestion() 
        : createMultipleChoiceQuestion(questionText, false);
    }
    
    questions.push({
      type: questionType,
      question: questionText,
      description: 'Choose the correct answer based on your knowledge.',
      points: 1,
      position: i,
      isRequired: true,
      imageData,
      imageMime,
      videoPath,
      shuffleOptions: Math.random() > 0.5,
      options: {
        create: options
      }
    });
  }
  
  return {
    moduleId: module.id,
    title: `${module.title} - Assessment Quiz`,
    description: `Test your knowledge of ${module.title.toLowerCase()}. This quiz covers all key concepts from the module.`,
    instructions: 'Read each question carefully and select the best answer. You must score at least 70% to pass.',
    passingScore: 70,
    timeLimit,
    shuffleQuestions: Math.random() > 0.5,
    showResults: true,
    isActive: true,
    position,
    questions: {
      create: questions
    }
  };
}

async function createQuizAttempts(quizId, userIds) {
  const numAttempts = randomInt(10, 15);
  const attempts = [];
  
  for (let i = 0; i < numAttempts; i++) {
    const userId = randomElement(userIds);
    const score = randomInt(50, 100);
    const passed = score >= 70;
    const timeSpent = randomInt(300, 1800); // 5-30 minutes in seconds
    
    const now = new Date();
    const startTime = new Date(now.getTime() - timeSpent * 1000 - randomInt(0, 7 * 24 * 60 * 60 * 1000)); // Within last week
    const submitTime = new Date(startTime.getTime() + timeSpent * 1000);
    
    attempts.push({
      quizId,
      userId,
      startedAt: startTime,
      submittedAt: submitTime,
      score,
      passed,
      timeSpent
    });
  }
  
  return attempts;
}

export async function seedQuizzesEnhanced() {
  console.log('\n' + '='.repeat(60).rainbow);
  console.log('  📝 SEEDING ENHANCED QUIZZES WITH ATTEMPTS'.bold.magenta);
  console.log('='.repeat(60).rainbow + '\n');

  let successCount = 0;
  let skipCount = 0;
  let totalQuestions = 0;
  let totalAttempts = 0;

  // Get all modules
  const modules = await prisma.module.findMany({
    orderBy: { position: 'asc' }
  });

  if (modules.length === 0) {
    console.log('⚠️  No modules found. Please seed modules first.'.yellow);
    return { success: 0, skipped: 0 };
  }

  // Get all users for attempts
  const users = await prisma.user.findMany({
    where: { role: 'USER' }
  });

  if (users.length === 0) {
    console.log('⚠️  No users found. Please seed users first.'.yellow);
    return { success: 0, skipped: 0 };
  }

  const userIds = users.map(u => u.id);

  console.log(`Found ${modules.length} modules and ${users.length} users\n`.cyan);

  for (let i = 0; i < modules.length; i++) {
    const module = modules[i];
    
    try {
      const existing = await prisma.quiz.findFirst({
        where: { moduleId: module.id }
      });

      if (existing) {
        console.log(`⏭️  Skipping quiz for: ${module.title}`.yellow);
        skipCount++;
        continue;
      }

      const createMessage = `Creating Quiz ${i + 1}/${modules.length}: ${module.title}`;
      await animateProgress(createMessage, 200);

      // Create quiz with questions
      const quizData = await createQuizForModule(module, i);
      const quiz = await prisma.quiz.create({
        data: quizData
      });

      const questionsCount = quizData.questions.create.length;
      totalQuestions += questionsCount;

      console.log(`   ✓ Created ${questionsCount} questions`.dim);

      // Create quiz attempts
      const attempts = await createQuizAttempts(quiz.id, userIds);
      
      for (const attemptData of attempts) {
        await prisma.quizAttempt.create({
          data: attemptData
        });
      }

      totalAttempts += attempts.length;
      console.log(`   ✓ Created ${attempts.length} quiz attempts\n`.dim);

      successCount++;

    } catch (error) {
      console.log(`✗ Error creating quiz for ${module.title}: ${error.message}`.red);
      console.log(error.stack);
    }
  }

  console.log('\n' + '─'.repeat(60).gray);
  console.log(`📊 Results:`.bold);
  console.log(`   ✓ Created: ${successCount} quizzes`.green);
  console.log(`   ⏭️  Skipped: ${skipCount} quizzes`.yellow);
  console.log(`   ❓ Total Questions: ${totalQuestions}`.cyan);
  console.log(`   📊 Total Attempts: ${totalAttempts}`.cyan);
  console.log('─'.repeat(60).gray + '\n');

  return { success: successCount, skipped: skipCount };
}

export default seedQuizzesEnhanced;
