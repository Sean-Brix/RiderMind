/**
 * COMPREHENSIVE SEED SYSTEM - PART 2
 * Contains: Categories, Quizzes, FAQs, Student Modules, Feedback
 */

import { PrismaClient } from '@prisma/client';
import colors from 'colors';
import { uploadFile, listFiles } from '../utils/firebase.js';
import { storage } from '../firebase.config.js';
import { ref, getBytes } from 'firebase/storage';

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

/**
 * Download video from animation-seed and re-upload to proper quiz location
 * This mimics the manual upload process
 */
async function downloadAndUploadQuizVideo(sourcePath, quizId, questionId) {
  try {
    console.log(`  ⬇️  Downloading: ${sourcePath}`.dim);
    
    // Download the video from animation-seed
    const sourceRef = ref(storage, sourcePath);
    const videoBuffer = await getBytes(sourceRef);
    
    console.log(`  📦 Downloaded ${(videoBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`.dim);
    
    // Generate proper storage path (same as manual upload)
    const timestamp = Date.now();
    const filename = sourcePath.split('/').pop(); // Get filename from path
    const destinationPath = `quizzes/${quizId}/questions/${questionId}/${timestamp}-${filename}`;
    
    console.log(`  ⬆️  Uploading to: ${destinationPath}`.dim);
    
    // Upload to proper location using Firebase utils
    const result = await uploadFile(Buffer.from(videoBuffer), destinationPath, 'video/mp4');
    
    console.log(`  ✅ Uploaded successfully`.green);
    
    return {
      videoUrl: result.url,
      videoPath: destinationPath
    };
  } catch (error) {
    console.error(`  ❌ Failed to process video: ${sourcePath}`.red, error.message);
    return {
      videoUrl: null,
      videoPath: null
    };
  }
}


// ==================== STEP 4: SEED CATEGORIES ====================

export async function seedCategories() {
  console.log('\n' + '='.repeat(80).rainbow);
  console.log('  🏷️  SEEDING CATEGORIES'.bold.yellow);
  console.log('='.repeat(80).rainbow + '\n');

  const modules = await prisma.module.findMany({ orderBy: { position: 'asc' } });

  const categories = [
    {
      name: 'Motorcycle Training',
      description: 'Complete training modules for motorcycle riders',
      vehicleType: 'MOTORCYCLE',
      isDefault: true,
      isActive: true
    },
    {
      name: 'Car Training',
      description: 'Complete training modules for car drivers',
      vehicleType: 'CAR',
      isDefault: false,
      isActive: true
    }
  ];

  for (const categoryData of categories) {
    await animateProgress(`Creating: ${categoryData.name}`, 300);

    if (categoryData.vehicleType === 'MOTORCYCLE') {
      await prisma.moduleCategory.create({
        data: {
          ...categoryData,
          modules: {
            create: modules.map((module, index) => ({
              moduleId: module.id,
              position: index
            }))
          }
        }
      });
      console.log(`   📚 ${modules.length} modules assigned`.dim);
    } else {
      await prisma.moduleCategory.create({ data: categoryData });
      console.log(`   📦 Empty category`.dim);
    }
  }

  console.log(`\n✅ Created ${categories.length} categories!\n`.green);
}

// ==================== STEP 5: SEED QUIZZES ====================

export async function seedQuizzes() {
  console.log('\n' + '='.repeat(80).rainbow);
  console.log('  📝 SEEDING QUIZZES (10 Questions per Module)'.bold.blue);
  console.log('='.repeat(80).rainbow + '\n');

  const modules = await prisma.module.findMany({ orderBy: { position: 'asc' } });

  // Fetch actual quiz videos from Firebase Storage
  console.log('  📂 Fetching available quiz videos from Firebase...'.cyan);
  let quizAnimations = [];
  
  try {
    const files = await listFiles('animation-seed/quiz/');
    quizAnimations = files
      .filter(file => file.name.endsWith('.mp4'))
      .map(file => ({
        name: file.name,
        path: file.fullPath
      }));
    
    console.log(`  ✅ Found ${quizAnimations.length} quiz videos in Firebase Storage`.green);
    
    if (quizAnimations.length === 0) {
      console.log('  ⚠️  No quiz videos found - questions will be created without videos'.yellow);
    }
  } catch (error) {
    console.log('  ⚠️  Could not fetch quiz videos from Firebase - questions will be created without videos'.yellow);
    console.log(`  Error: ${error.message}`.dim);
  }

  const allQuizQuestions = [
    // Module 1 Questions
    [
      { type: 'MULTIPLE_CHOICE', question: 'What is the main purpose of the Theoretical Driving Course (TDC)?', options: ['To increase car sales', 'To teach driving techniques only', 'To educate drivers about road safety and traffic laws', 'To issue licenses directly'], correctIndex: 2 },
      { type: 'TRUE_FALSE', question: 'Following LTO regulations is optional as long as you drive safely.', isTrue: false },
      { type: 'IDENTIFICATION', question: 'What government agency is responsible for issuing driver\'s licenses in the Philippines?', answer: 'Land Transportation Office (LTO)' },
      { type: 'MULTIPLE_CHOICE', question: 'A red circular traffic sign usually means:', options: ['Warning', 'Mandatory', 'Prohibition or restriction', 'Information'], correctIndex: 2 },
      { type: 'IDENTIFICATION', question: 'Why is it important for drivers to understand traffic signs and road markings?', answer: 'To ensure safety, maintain traffic order, and prevent accidents' },
      { type: 'TRUE_FALSE', question: 'A responsible driver always checks the vehicle\'s condition before traveling.', isTrue: true },
      { type: 'MULTIPLE_CHOICE', question: 'Which of the following is a driver\'s role in road safety?', options: ['Speed to reach the destination faster', 'Ignore pedestrians', 'Follow traffic rules and show courtesy', 'Focus only on own vehicle'], correctIndex: 2 },
      { type: 'IDENTIFICATION', question: 'What do you call the set of laws that guide the use of public roads by vehicles and pedestrians?', answer: 'Traffic rules and regulations' },
      { type: 'TRUE_FALSE', question: 'Understanding road signs is only necessary for professional drivers.', isTrue: false },
      { type: 'IDENTIFICATION', question: 'Why is the TDC required before applying for a student permit?', answer: 'To ensure new drivers are knowledgeable about traffic rules and road safety before driving' }
    ],
    // Module 2 Questions
    [
      { type: 'MULTIPLE_CHOICE', question: 'If another driver cuts in front of you suddenly, what is the best reaction?', options: ['Honk aggressively', 'Speed up and overtake', 'Stay calm and maintain distance', 'Yell at the driver'], correctIndex: 2 },
      { type: 'TRUE_FALSE', question: 'Road rage can lead to accidents and legal trouble.', isTrue: true },
      { type: 'IDENTIFICATION', question: 'What is the practice of sharing the road responsibly with pedestrians, cyclists, and other drivers called?', answer: 'Road courtesy or road sharing' },
      { type: 'MULTIPLE_CHOICE', question: 'A courteous driver should:', options: ['Use headlights to intimidate others', 'Yield to pedestrians at crosswalks', 'Block intersections to save time', 'Argue with traffic enforcers'], correctIndex: 1 },
      { type: 'IDENTIFICATION', question: 'Why is maintaining emotional control important while driving?', answer: 'Because anger or stress can lead to poor decisions and unsafe driving' },
      { type: 'TRUE_FALSE', question: 'Using turn signals before changing lanes is an example of road courtesy.', isTrue: true },
      { type: 'MULTIPLE_CHOICE', question: 'What should you do when a pedestrian is crossing at a marked crosswalk?', options: ['Speed up', 'Stop and give way', 'Blow the horn', 'Ignore them'], correctIndex: 1 },
      { type: 'IDENTIFICATION', question: 'What behavior refers to losing one\'s temper or driving aggressively due to anger?', answer: 'Road rage' },
      { type: 'TRUE_FALSE', question: 'Drivers should always give way to emergency vehicles using sirens or flashing lights.', isTrue: true },
      { type: 'IDENTIFICATION', question: 'Give one example of showing courtesy while driving.', answer: 'Letting others merge, not honking unnecessarily, giving pedestrians priority' }
    ],
    // Module 3 Questions
    [
      { type: 'MULTIPLE_CHOICE', question: 'A triangle-shaped traffic sign with a red border means:', options: ['Stop', 'Warning', 'Information', 'Parking area'], correctIndex: 1 },
      { type: 'TRUE_FALSE', question: 'Broken white lines on the road mean overtaking is allowed when safe.', isTrue: true },
      { type: 'IDENTIFICATION', question: 'What is the rule that determines who goes first at intersections?', answer: 'Right of way' },
      { type: 'MULTIPLE_CHOICE', question: 'When the traffic light turns yellow, you should:', options: ['Speed up', 'Stop if safe to do so', 'Ignore and continue', 'Blow the horn'], correctIndex: 1 },
      { type: 'IDENTIFICATION', question: 'Why are pavement markings important?', answer: 'They guide drivers and help maintain order on the road' },
      { type: 'TRUE_FALSE', question: 'A blue rectangular sign usually gives road information or directions.', isTrue: true },
      { type: 'MULTIPLE_CHOICE', question: 'Which sign shape indicates a regulation or law you must follow?', options: ['Circular', 'Triangle', 'Octagon', 'Rectangle'], correctIndex: 0 },
      { type: 'IDENTIFICATION', question: 'What marking separates traffic moving in opposite directions?', answer: 'Yellow line' },
      { type: 'TRUE_FALSE', question: 'A flashing red light means you should proceed with caution without stopping.', isTrue: false },
      { type: 'IDENTIFICATION', question: 'What should you do when approaching an intersection with no traffic lights?', answer: 'Slow down, check all directions, and yield to vehicles on the right' }
    ],
    // Module 4-8 Questions (abbreviated - following same pattern)
    [
      { type: 'MULTIPLE_CHOICE', question: 'If you are stopped by a traffic enforcer, what should you do?', options: ['Argue immediately', 'Drive away quickly', 'Stay calm and cooperate respectfully', 'Record the incident without permission'], correctIndex: 2 },
      { type: 'TRUE_FALSE', question: 'Drivers have both legal and moral responsibilities while on the road.', isTrue: true },
      { type: 'IDENTIFICATION', question: 'What do you call the practice of driving carefully to avoid accidents despite others\' mistakes?', answer: 'Defensive driving' },
      { type: 'MULTIPLE_CHOICE', question: 'When involved in an accident, the driver must:', options: ['Leave immediately', 'Help and report to authorities', 'Hide the vehicle', 'Argue with witnesses'], correctIndex: 1 },
      { type: 'IDENTIFICATION', question: 'What is the difference between defensive and reckless driving?', answer: 'Defensive driving is cautious and safe; reckless driving is careless and dangerous' },
      { type: 'TRUE_FALSE', question: 'You can ignore minor accidents if no one is injured.', isTrue: false },
      { type: 'MULTIPLE_CHOICE', question: 'Which of the following is a driver\'s duty?', options: ['Follow road rules and respect others', 'Ignore pedestrians', 'Prioritize personal convenience', 'Park anywhere'], correctIndex: 0 },
      { type: 'IDENTIFICATION', question: 'What penalty is imposed for driving without a valid license?', answer: 'Fine or suspension' },
      { type: 'TRUE_FALSE', question: 'A responsible driver always carries important documents like a license and registration.', isTrue: true },
      { type: 'IDENTIFICATION', question: 'Why must a driver know basic LTO laws and penalties?', answer: 'To avoid violations and understand the consequences of unsafe driving' }
    ],
    [
      { type: 'MULTIPLE_CHOICE', question: 'Before starting a trip, what should you inspect first?', options: ['Air freshener', 'Oil, brakes, lights, tires', 'Radio', 'Dashboard stickers'], correctIndex: 1 },
      { type: 'TRUE_FALSE', question: 'The engine oil helps reduce friction and cool the engine.', isTrue: true },
      { type: 'IDENTIFICATION', question: 'What part of the vehicle is used to control direction?', answer: 'Steering wheel' },
      { type: 'MULTIPLE_CHOICE', question: 'What should you do if a dashboard warning light turns on while driving?', options: ['Ignore it', 'Continue and check later', 'Stop safely and inspect', 'Panic immediately'], correctIndex: 2 },
      { type: 'IDENTIFICATION', question: 'Why is tire pressure important for safe driving?', answer: 'It affects handling, braking, and fuel efficiency' },
      { type: 'TRUE_FALSE', question: 'The battery powers the car\'s electrical systems and helps start the engine.', isTrue: true },
      { type: 'MULTIPLE_CHOICE', question: 'Which part allows the driver to change gears?', options: ['Handbrake', 'Gear shift', 'Accelerator', 'Clutch'], correctIndex: 1 },
      { type: 'IDENTIFICATION', question: 'What checklist should you perform before driving to ensure safety?', answer: 'Pre-driving inspection checklist' },
      { type: 'TRUE_FALSE', question: 'Parking on uneven ground is acceptable without engaging the handbrake.', isTrue: false },
      { type: 'IDENTIFICATION', question: 'Why is it important to familiarize yourself with vehicle controls before driving?', answer: 'To ensure proper operation and prevent accidents' }
    ],
    [
      { type: 'MULTIPLE_CHOICE', question: 'What is the first thing you should adjust before moving the car?', options: ['Gear stick', 'Mirrors', 'Seat position', 'Steering wheel'], correctIndex: 2 },
      { type: 'TRUE_FALSE', question: 'Smooth acceleration helps in maintaining control and saving fuel.', isTrue: true },
      { type: 'IDENTIFICATION', question: 'What is the technique used to control the steering wheel properly during a turn?', answer: 'Hand-over-hand steering' },
      { type: 'MULTIPLE_CHOICE', question: 'When driving uphill, what should you do to prevent rolling backward?', options: ['Step on the clutch fully', 'Use the handbrake while releasing the clutch slowly', 'Shift to neutral', 'Accelerate quickly'], correctIndex: 1 },
      { type: 'IDENTIFICATION', question: 'Why is proper mirror adjustment important before driving?', answer: 'To minimize blind spots and ensure maximum visibility of surrounding vehicles' },
      { type: 'MULTIPLE_CHOICE', question: 'Which pedal should be used for smooth braking?', options: ['Accelerator', 'Brake pedal with gradual pressure', 'Brake pedal with sudden pressure', 'Clutch pedal'], correctIndex: 1 },
      { type: 'TRUE_FALSE', question: 'You can rest your foot on the clutch while driving to prepare for sudden stops.', isTrue: false },
      { type: 'IDENTIFICATION', question: 'What driving maneuver involves moving the car backward into a parking space?', answer: 'Reverse parking' },
      { type: 'MULTIPLE_CHOICE', question: 'When driving downhill, which gear should you use to maintain better control?', options: ['High gear', 'Neutral', 'Low gear', 'Reverse'], correctIndex: 2 },
      { type: 'IDENTIFICATION', question: 'What should you do if you hear unusual noises while accelerating or braking?', answer: 'Stop the car safely and check for mechanical problems before continuing' }
    ],
    [
      { type: 'MULTIPLE_CHOICE', question: 'Defensive driving mainly focuses on:', options: ['Getting to the destination quickly', 'Avoiding collisions and anticipating hazards', 'Ignoring slow drivers', 'Driving aggressively'], correctIndex: 1 },
      { type: 'TRUE_FALSE', question: 'A safe following distance gives you enough time to react to sudden stops.', isTrue: true },
      { type: 'IDENTIFICATION', question: 'What do we call the practice of scanning the road ahead, sides, and mirrors regularly?', answer: 'Visual scanning or situational awareness' },
      { type: 'MULTIPLE_CHOICE', question: 'If you feel sleepy while driving, the best action is to:', options: ['Drink coffee and continue driving', 'Open the window', 'Pull over to a safe area and rest', 'Increase the volume of music'], correctIndex: 2 },
      { type: 'TRUE_FALSE', question: 'It is safe to use a cellphone as long as it\'s on speaker mode.', isTrue: false },
      { type: 'IDENTIFICATION', question: 'What is the "three-second rule"?', answer: 'A guideline to maintain at least a three-second gap between your vehicle and the one in front' },
      { type: 'MULTIPLE_CHOICE', question: 'Which condition requires slower speeds and longer braking distances?', options: ['Dry pavement', 'Wet or slippery roads', 'Highways', 'Well-lit streets'], correctIndex: 1 },
      { type: 'IDENTIFICATION', question: 'What do you call the act of recognizing potential dangers early and preparing to react safely?', answer: 'Risk awareness' },
      { type: 'TRUE_FALSE', question: 'Defensive drivers assume other drivers will always follow the rules.', isTrue: false },
      { type: 'IDENTIFICATION', question: 'List one factor that increases driving risk.', answer: 'Fatigue, speeding, distractions, or alcohol use' }
    ],
    [
      { type: 'MULTIPLE_CHOICE', question: 'If your car breaks down on the road, what should you do first?', options: ['Leave the car immediately', 'Turn on hazard lights and pull over safely', 'Continue driving slowly', 'Stop in the middle of the lane'], correctIndex: 1 },
      { type: 'TRUE_FALSE', question: 'You should stand behind your vehicle to direct traffic after a breakdown.', isTrue: false },
      { type: 'IDENTIFICATION', question: 'What is the blinking red triangle device used during vehicle breakdowns?', answer: 'Early warning device (EWD)' },
      { type: 'MULTIPLE_CHOICE', question: 'If you witness an accident, what is the most responsible thing to do?', options: ['Drive away', 'Take photos for social media', 'Report to authorities and assist safely', 'Approach the crash recklessly'], correctIndex: 2 },
      { type: 'TRUE_FALSE', question: 'You should move an injured person immediately even without proper training.', isTrue: false },
      { type: 'IDENTIFICATION', question: 'What should you check before using a fire extinguisher on a vehicle fire?', answer: 'Check if the fire is small and can be controlled safely without endangering yourself' },
      { type: 'MULTIPLE_CHOICE', question: 'After an accident, you must:', options: ['Leave the scene to avoid blame', 'Report the incident to police or LTO', 'Argue with the other driver', 'Ignore minor damage'], correctIndex: 1 },
      { type: 'IDENTIFICATION', question: 'What safety measure warns approaching drivers of a stalled vehicle?', answer: 'Hazard lights' },
      { type: 'TRUE_FALSE', question: 'Carrying a first aid kit and tools is part of emergency preparedness.', isTrue: true },
      { type: 'IDENTIFICATION', question: 'Why is documentation after an accident important?', answer: 'It serves as legal proof for insurance and investigation purposes' }
    ]
  ];

  for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
    const module = modules[moduleIndex];
    const questions = allQuizQuestions[moduleIndex];

    await animateProgress(`Creating Quiz for Module ${moduleIndex + 1}`, 400);

    const quiz = await prisma.quiz.create({
      data: {
        moduleId: module.id,
        title: `${module.title} - Assessment`,
        description: `Test your knowledge on ${module.title}`,
        passingScore: 75,
        timeLimit: 30,
        shuffleQuestions: true,
        showResults: true,
        isActive: true,
        position: moduleIndex
      }
    });

    for (let qIndex = 0; qIndex < questions.length; qIndex++) {
      const q = questions[qIndex];
      const sourceAnimation = quizAnimations.length > 0 ? randomElement(quizAnimations) : null;

      console.log(`\n  📝 Question ${qIndex + 1}: ${q.type}`.yellow);

      if (q.type === 'MULTIPLE_CHOICE') {
        // Create question first to get its ID
        const createdQuestion = await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            type: q.type,
            question: q.question,
            points: 1,
            position: qIndex,
            shuffleOptions: true,
            options: {
              create: q.options.map((opt, optIndex) => ({
                optionText: opt,
                isCorrect: optIndex === q.correctIndex,
                position: optIndex
              }))
            }
          }
        });

        // Download and re-upload the video if available
        if (sourceAnimation) {
          const videoData = await downloadAndUploadQuizVideo(
            sourceAnimation.path,
            quiz.id,
            createdQuestion.id
          );

          // Update question with video URLs
          await prisma.quizQuestion.update({
            where: { id: createdQuestion.id },
            data: {
              videoUrl: videoData.videoUrl,
              videoPath: videoData.videoPath
            }
          });
        } else {
          console.log(`  ⚠️  No video available - question created without video`.dim);
        }

      } else if (q.type === 'TRUE_FALSE') {
        // Create question first to get its ID
        const createdQuestion = await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            type: q.type,
            question: q.question,
            points: 1,
            position: qIndex,
            options: {
              create: [
                { optionText: 'True', isCorrect: q.isTrue, position: 0 },
                { optionText: 'False', isCorrect: !q.isTrue, position: 1 }
              ]
            }
          }
        });

        // Download and re-upload the video if available
        if (sourceAnimation) {
          const videoData = await downloadAndUploadQuizVideo(
            sourceAnimation.path,
            quiz.id,
            createdQuestion.id
          );

          // Update question with video URLs
          await prisma.quizQuestion.update({
            where: { id: createdQuestion.id },
            data: {
              videoUrl: videoData.videoUrl,
              videoPath: videoData.videoPath
            }
          });
        } else {
          console.log(`  ⚠️  No video available - question created without video`.dim);
        }

      } else if (q.type === 'IDENTIFICATION') {
        // Create question first to get its ID
        const createdQuestion = await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            type: q.type,
            question: q.question,
            points: 1,
            position: qIndex,
            caseSensitive: false,
            options: {
              create: [{ optionText: q.answer, isCorrect: true, position: 0 }]
            }
          }
        });

        // Download and re-upload the video if available
        if (sourceAnimation) {
          const videoData = await downloadAndUploadQuizVideo(
            sourceAnimation.path,
            quiz.id,
            createdQuestion.id
          );

          // Update question with video URLs
          await prisma.quizQuestion.update({
            where: { id: createdQuestion.id },
            data: {
              videoUrl: videoData.videoUrl,
              videoPath: videoData.videoPath
            }
          });
        } else {
          console.log(`  ⚠️  No video available - question created without video`.dim);
        }
      }
    }

    console.log(`   ✓ Created ${questions.length} questions with videos uploaded`.dim);
  }

  console.log(`\n✅ Created ${modules.length} quizzes with 10 questions each!\n`.green);
}
