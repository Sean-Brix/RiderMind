/**
 * Quiz Seeds
 * Generates quizzes for all modules with random questions using sample media
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Question templates with variety
const questionTemplates = [
  {
    type: 'MULTIPLE_CHOICE',
    templates: [
      "What is the most important safety equipment for motorcycle riding?",
      "Which technique is essential for maintaining control during cornering?",
      "What should you check before every ride?",
      "How do you properly adjust your mirrors?",
      "What is the correct body position for high-speed riding?",
      "When should you replace your motorcycle tires?",
      "What is the purpose of counter-steering?",
      "How often should you check your chain tension?",
      "What is the recommended following distance on a highway?",
      "Which braking technique is most effective in emergency situations?"
    ],
    options: [
      ["Full-face helmet", "Half helmet", "No helmet needed", "Baseball cap"],
      ["Proper throttle control", "Ignoring speed limits", "One-handed riding", "Standing on pegs"],
      ["Tire pressure and tread", "Radio station", "Phone battery", "Favorite playlist"],
      ["By guessing", "While riding at speed", "While stationary", "Never adjust them"],
      ["Leaning forward", "Sitting upright", "Standing up", "Lying on tank"],
      ["Every 10 years", "When completely bald", "At tread wear indicators", "Never"],
      ["To confuse other riders", "To steer at low speeds", "To initiate turns at speed", "To stop quickly"],
      ["Every 10,000 miles", "Every 500-1000 miles", "Once a year", "Never"],
      ["1 car length", "2-3 seconds", "10 feet", "As close as possible"],
      ["Both brakes together", "Only rear brake", "Only front brake", "No brakes, downshift"]
    ],
    correctIndex: 0
  },
  {
    type: 'TRUE_FALSE',
    templates: [
      "You should always ride with your headlight on during the day for visibility.",
      "It's safer to ride in the center of your lane at all times.",
      "You should avoid braking while cornering if possible.",
      "Loud pipes save lives is scientifically proven.",
      "You should check your blind spots before changing lanes.",
      "Riding in the rain requires the same technique as dry conditions.",
      "A full-face helmet provides the best protection.",
      "You can text at red lights if you're careful.",
      "Practicing emergency braking is an important safety skill.",
      "You should grip the handlebars tightly at all times."
    ],
    correctAnswer: [true, false, true, false, true, false, true, false, true, false]
  },
  {
    type: 'IDENTIFICATION',
    templates: [
      "What is the name of the safety technique where you press the handlebars in the direction opposite to where you want to turn?",
      "What do the letters ATGATT stand for in motorcycle safety?",
      "What is the name of the optimal path through a corner?",
      "What is the safety check you perform before each ride called?",
      "What is the hand signal for slowing down or stopping?",
      "What gear should you be in when stopped at a light?",
      "What is the blind spot behind a vehicle called?",
      "What is the recommended tire pressure unit?",
      "What does MSF stand for in motorcycle training?",
      "What is the protective layer between the rider and road called?"
    ],
    correctAnswers: [
      "Counter-steering",
      "All The Gear All The Time",
      "Racing line",
      "Pre-ride inspection",
      "Left arm down",
      "First gear",
      "No zone",
      "PSI",
      "Motorcycle Safety Foundation",
      "Safety gear"
    ]
  }
];

// Additional question content for variety
const descriptionTemplates = [
  "This is an essential safety concept every rider should know.",
  "Understanding this can help prevent accidents.",
  "This knowledge is crucial for safe motorcycle operation.",
  "Mastering this skill improves your riding confidence.",
  "This is a fundamental principle of motorcycle safety.",
  "Knowing this can save your life on the road.",
  "This technique is used by professional riders.",
  "Understanding this helps you make better riding decisions.",
  "This is important for maintaining your motorcycle.",
  "This knowledge is essential for passing your riding test."
];

/**
 * Get random element from array
 */
function getRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get random media reference
 */
function getRandomMedia(imageCount, videoCount) {
  const hasMedia = Math.random() > 0.3; // 70% chance of having media
  
  if (!hasMedia) return null;
  
  const useImage = Math.random() > 0.5; // 50/50 chance between image and video
  
  if (useImage) {
    const imageNum = Math.floor(Math.random() * imageCount) + 1;
    const imageName = `${imageNum}.${imageNum === 1 || imageNum === 3 || imageNum === 9 ? 'jpg' : 'jpeg'}`;
    return {
      type: 'image',
      url: `https://firebasestorage.googleapis.com/sample-media/images/${imageName}`,
      path: `sample-media/images/${imageName}`,
      mime: 'image/jpeg'
    };
  } else {
    const videoNum = Math.floor(Math.random() * videoCount) + 1;
    return {
      type: 'video',
      url: `https://firebasestorage.googleapis.com/sample-media/videos/${videoNum}.mp4`,
      path: `sample-media/videos/${videoNum}.mp4`
    };
  }
}

/**
 * Generate a random question
 */
function generateQuestion(index, imageCount, videoCount) {
  // Randomly select question type
  const typeIndex = Math.floor(Math.random() * questionTemplates.length);
  const template = questionTemplates[typeIndex];
  
  const questionIndex = Math.floor(Math.random() * template.templates.length);
  const media = getRandomMedia(imageCount, videoCount);
  
  const baseQuestion = {
    type: template.type,
    question: template.templates[questionIndex],
    description: getRandom(descriptionTemplates),
    points: Math.random() > 0.7 ? 2 : 1, // 30% chance of 2 points
    position: index + 1,
    shuffleOptions: Math.random() > 0.5
  };

  // Add media if generated
  if (media) {
    if (media.type === 'image') {
      baseQuestion.imageUrl = media.url;
      baseQuestion.imagePath = media.path;
      baseQuestion.imageMime = media.mime;
    } else {
      baseQuestion.videoUrl = media.url;
      baseQuestion.videoPath = media.path;
    }
  }

  // Generate options based on type
  if (template.type === 'MULTIPLE_CHOICE') {
    const optionSet = template.options[questionIndex];
    baseQuestion.options = {
      create: optionSet.map((text, idx) => ({
        optionText: text,
        isCorrect: idx === template.correctIndex,
        position: idx + 1
      }))
    };
  } else if (template.type === 'TRUE_FALSE') {
    const isTrue = template.correctAnswer[questionIndex];
    baseQuestion.options = {
      create: [
        { optionText: 'True', isCorrect: isTrue, position: 1 },
        { optionText: 'False', isCorrect: !isTrue, position: 2 }
      ]
    };
  } else if (template.type === 'IDENTIFICATION') {
    baseQuestion.caseSensitive = false;
    baseQuestion.options = {
      create: [
        {
          optionText: template.correctAnswers[questionIndex],
          isCorrect: true,
          position: 1
        }
      ]
    };
  }

  return baseQuestion;
}

/**
 * Seed quizzes for all modules
 */
export async function seedQuizzes(prisma) {
  console.log('📝 Starting quiz seeding...');

  try {
    // Get all modules
    const modules = await prisma.module.findMany({
      select: { id: true, title: true }
    });

    if (modules.length === 0) {
      console.log('⚠️  No modules found. Please seed modules first.');
      return { success: false, message: 'No modules found' };
    }

    console.log(`📚 Found ${modules.length} modules`);

    const imageCount = 11; // Number of sample images
    const videoCount = 11; // Number of sample videos
    const minQuestionsPerQuiz = 10;

    let createdCount = 0;

    for (const module of modules) {
      console.log(`\n📝 Creating quiz for: ${module.title}`);

      // Generate 10-15 questions per quiz for variety
      const questionCount = minQuestionsPerQuiz + Math.floor(Math.random() * 6);
      const questions = [];

      for (let i = 0; i < questionCount; i++) {
        questions.push(generateQuestion(i, imageCount, videoCount));
      }

      // Create quiz with questions
      const quiz = await prisma.quiz.create({
        data: {
          moduleId: module.id,
          title: `${module.title} Assessment`,
          description: `Test your knowledge of ${module.title.toLowerCase()}. This quiz covers key concepts and safety practices.`,
          instructions: "Read each question carefully. Some questions may include images or videos to help illustrate the concept. Choose the best answer for each question.",
          passingScore: 70,
          timeLimit: questionCount * 60, // 60 seconds per question
          shuffleQuestions: true,
          showResults: true,
          questions: {
            create: questions
          }
        },
        include: {
          questions: {
            include: {
              options: true
            }
          }
        }
      });

      console.log(`  ✓ Created quiz with ${quiz.questions.length} questions`);
      console.log(`  ✓ Questions with media: ${quiz.questions.filter(q => q.imageUrl || q.videoUrl).length}`);
      createdCount++;
    }

    console.log(`\n✅ Quiz seeding completed! Created ${createdCount} quizzes`);
    return { success: true, count: createdCount };
  } catch (error) {
    console.error('❌ Error seeding quizzes:', error);
    throw error;
  }
}

/**
 * Clear all quizzes
 */
export async function clearQuizzes(prisma) {
  console.log('🗑️  Clearing all quizzes...');

  try {
    // Delete in correct order due to foreign key constraints
    await prisma.quizOption.deleteMany({});
    await prisma.quizQuestion.deleteMany({});
    await prisma.quizAttempt.deleteMany({});
    await prisma.quiz.deleteMany({});

    console.log('✅ All quizzes cleared successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing quizzes:', error);
    throw error;
  }
}
