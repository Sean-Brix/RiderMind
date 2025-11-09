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

async function animateProgress(message, duration = 400) {
  const steps = Math.floor(duration / 100);
  for (let i = 0; i < steps; i++) {
    process.stdout.write(`\r${spinner[spinnerIndex]} ${message}`.cyan);
    spinnerIndex = (spinnerIndex + 1) % spinner.length;
    await sleep(100);
  }
  process.stdout.write(`\r✓ ${message}`.green + '\n');
}

// Helper to get random element
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Available media files
const availableImages = ['1.jpg', '2.jpeg', '3.jpg', '4.jpeg', '5.jpeg', '6.jpeg', '7.jpeg', '8.jpeg', '9.jpg', '10.jpeg', '11.jpeg'];
const availableVideos = ['1.mp4', '2.mp4', '3.mp4', '4.mp4', '5.mp4', '6.mp4', '7.mp4', '8.mp4', '9.mp4', '10.mp4', '11.mp4'];

// Module titles and descriptions - MOTORCYCLE ONLY (15 modules)
const moduleTopics = [
  {
    title: 'Basic Traffic Rules and Regulations',
    description: 'Learn the fundamental traffic rules and regulations that every rider must know.',
    objectives: [
      'Understand basic traffic signs and their meanings',
      'Learn right-of-way rules at intersections',
      'Master lane discipline and proper road positioning',
      'Know speed limits and traffic light regulations'
    ]
  },
  {
    title: 'Road Signs and Markings',
    description: 'Comprehensive guide to understanding road signs, signals, and road markings.',
    objectives: [
      'Identify regulatory, warning, and guide signs',
      'Understand road markings and their purposes',
      'Learn traffic signal meanings and sequences',
      'Master pedestrian crossing regulations'
    ]
  },
  {
    title: 'Motorcycle Pre-Operation Inspection',
    description: 'Learn how to properly inspect your motorcycle before starting your journey.',
    objectives: [
      'Check tire pressure and condition',
      'Inspect lights, signals, and mirrors',
      'Verify fluid levels and brake functionality',
      'Ensure all safety equipment is present'
    ]
  },
  {
    title: 'Motorcycle Balance and Control',
    description: 'Learn the fundamentals of motorcycle balance, posture, and control.',
    objectives: [
      'Master proper riding posture and body position',
      'Understand weight distribution for balance',
      'Learn clutch and throttle control',
      'Practice smooth starts and stops'
    ]
  },
  {
    title: 'Turning and Cornering Techniques',
    description: 'Develop skills for safe and effective turning and cornering.',
    objectives: [
      'Learn proper body lean techniques',
      'Understand counter-steering principles',
      'Master slow-speed maneuvers',
      'Practice emergency swerving'
    ]
  },
  {
    title: 'Defensive Riding Techniques',
    description: 'Master defensive riding strategies to stay safe on the road.',
    objectives: [
      'Maintain safe following distance',
      'Anticipate potential hazards',
      'Practice proper scanning techniques',
      'Handle aggressive drivers safely'
    ]
  },
  {
    title: 'Weather Conditions and Hazards',
    description: 'Learn to ride safely in various weather conditions.',
    objectives: [
      'Handle rain and wet road conditions',
      'Navigate through fog safely',
      'Ride in strong winds',
      'Avoid hydroplaning and skidding'
    ]
  },
  {
    title: 'Emergency Braking Procedures',
    description: 'Master emergency braking techniques for critical situations.',
    objectives: [
      'Learn threshold braking technique',
      'Understand ABS operation on motorcycles',
      'Practice emergency stopping procedures',
      'Avoid common braking mistakes'
    ]
  },
  {
    title: 'Highway Riding and Merging',
    description: 'Learn safe practices for highway riding and merging.',
    objectives: [
      'Master highway entry and exit procedures',
      'Maintain proper highway speed and position',
      'Execute safe lane changes',
      'Handle highway traffic flow and wind buffeting'
    ]
  },
  {
    title: 'Intersections and Right-of-Way',
    description: 'Understand intersection navigation and right-of-way rules for motorcyclists.',
    objectives: [
      'Navigate controlled intersections',
      'Handle uncontrolled intersections',
      'Increase visibility at intersections',
      'Make safe left and right turns'
    ]
  },
  {
    title: 'Motorcycle Maintenance Basics',
    description: 'Learn essential motorcycle maintenance procedures.',
    objectives: [
      'Perform routine oil and fluid checks',
      'Inspect and maintain tire condition',
      'Check and adjust chain tension',
      'Understand basic engine maintenance'
    ]
  },
  {
    title: 'Passenger and Cargo Safety',
    description: 'Ensure the safety of passengers and proper cargo handling on motorcycles.',
    objectives: [
      'Prepare your motorcycle for a passenger',
      'Communicate with your passenger',
      'Load cargo safely on your motorcycle',
      'Adjust riding for additional weight'
    ]
  },
  {
    title: 'Urban Traffic Navigation',
    description: 'Master riding in busy urban environments.',
    objectives: [
      'Navigate congested traffic safely',
      'Handle pedestrians and cyclists',
      'Use proper lane positioning',
      'Manage stress in traffic'
    ]
  },
  {
    title: 'Motorcycle Group Riding',
    description: 'Learn safe practices for riding in groups.',
    objectives: [
      'Understand group riding formations',
      'Communicate effectively with hand signals',
      'Maintain proper spacing',
      'Handle group stops and starts'
    ]
  },
  {
    title: 'Protective Gear and Safety Equipment',
    description: 'Learn about essential motorcycle safety gear and equipment.',
    objectives: [
      'Choose proper helmet and protective clothing',
      'Understand gear ratings and certifications',
      'Maintain your safety equipment',
      'Dress appropriately for weather conditions'
    ]
  }
];

// Slide content templates - MOTORCYCLE FOCUSED
const slideContentTemplates = {
  beginner: [
    'This is an introduction to fundamental motorcycle riding concepts that every beginner should understand.',
    'Let\'s start with the basic principles that form the foundation of safe motorcycle riding.',
    'Understanding these core concepts is essential before moving to advanced riding topics.',
    'This lesson covers the essential information you need to know as you begin your riding journey.',
    'These are the fundamental riding skills that will serve as your foundation.',
    'Master these motorcycle basics before progressing to more complex techniques.',
    'This introductory content will help you build a strong foundation as a motorcyclist.',
    'Learn the essential principles that every motorcycle rider must understand.',
    'These basic concepts are crucial for your development as a safe rider.',
    'Start your riding journey with these fundamental lessons and principles.'
  ],
  intermediate: [
    'Now that you understand the basics, let\'s explore more advanced riding concepts.',
    'This intermediate lesson builds upon your foundational motorcycle knowledge.',
    'Apply your basic riding skills to more complex scenarios and situations.',
    'Develop your riding abilities further with these intermediate techniques.',
    'Enhance your motorcycle skills with these more sophisticated methods.',
    'Progress your understanding with these intermediate-level riding concepts.'
  ],
  expert: [
    'Master these advanced techniques to become an expert motorcycle rider.',
    'This expert-level content requires strong foundational riding knowledge.',
    'Apply advanced riding principles to handle the most challenging situations.',
    'Refine your mastery with these expert-level motorcycle techniques and strategies.'
  ]
};

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

function copyVideoToPublic(videoName) {
  try {
    const sourcePath = path.join(__dirname, '..', 'data', 'modules', 'videos', videoName);
    const destPath = path.join(__dirname, '..', '..', 'public', 'videos', videoName);
    
    // Only copy if source exists and dest doesn't exist
    if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`   📹 Copied video: ${videoName}`.dim);
    }
    
    return `/videos/${videoName}`;
  } catch (error) {
    console.log(`   ⚠️  Could not copy video ${videoName}: ${error.message}`.yellow);
    return null;
  }
}

async function createSlide(moduleId, position, skillLevel, type) {
  const levelTemplates = {
    'Beginner': slideContentTemplates.beginner,
    'Intermediate': slideContentTemplates.intermediate,
    'Expert': slideContentTemplates.expert
  };

  const content = randomElement(levelTemplates[skillLevel]);
  const title = `${skillLevel} Level - Slide ${position + 1}`;
  
  let imageData = null;
  let imageMime = null;
  let videoPath = null;

  if (type === 'image') {
    const imageBlob = await loadImageAsBlob(randomElement(availableImages));
    if (imageBlob) {
      imageData = imageBlob.data;
      imageMime = imageBlob.mime;
    }
  } else if (type === 'video') {
    const videoName = randomElement(availableVideos);
    videoPath = copyVideoToPublic(videoName);
  }

  return {
    type,
    title,
    content,
    description: `${skillLevel} level content for comprehensive understanding.`,
    position,
    skillLevel,
    imageData,
    imageMime,
    videoPath
  };
}

export async function seedModulesEnhanced() {
  console.log('\n' + '='.repeat(60).rainbow);
  console.log('  📚 SEEDING ENHANCED MODULES (20 Modules)'.bold.cyan);
  console.log('='.repeat(60).rainbow + '\n');

  // Ensure public/videos directory exists
  const publicVideosDir = path.join(__dirname, '..', '..', 'public', 'videos');
  if (!fs.existsSync(publicVideosDir)) {
    fs.mkdirSync(publicVideosDir, { recursive: true });
    console.log('📁 Created public/videos directory'.dim);
  }

  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < moduleTopics.length; i++) {
    const topic = moduleTopics[i];
    
    try {
      const existing = await prisma.module.findFirst({
        where: { title: topic.title }
      });

      if (existing) {
        console.log(`⏭️  Skipping: ${topic.title}`.yellow);
        skipCount++;
        continue;
      }

      const createMessage = `Creating Module ${i + 1}/${moduleTopics.length}: ${topic.title}`;
      await animateProgress(createMessage, 300);

      // Create slide distribution: 10 beginner, 2 intermediate, 3 expert
      const slides = [];
      let position = 0;

      // 10 Beginner slides
      for (let j = 0; j < 10; j++) {
        const type = j < 6 ? 'text' : (j < 8 ? 'image' : 'video');
        slides.push(await createSlide(null, position++, 'Beginner', type));
      }

      // 2 Intermediate slides
      for (let j = 0; j < 2; j++) {
        const type = j === 0 ? 'text' : 'image';
        slides.push(await createSlide(null, position++, 'Intermediate', type));
      }

      // 3 Expert slides
      for (let j = 0; j < 3; j++) {
        const type = j < 2 ? 'text' : 'video';
        slides.push(await createSlide(null, position++, 'Expert', type));
      }

      // Create module with objectives and slides
      await prisma.module.create({
        data: {
          title: topic.title,
          description: topic.description,
          isActive: true,
          position: i,
          objectives: {
            create: topic.objectives.map((obj, idx) => ({
              objective: obj,
              position: idx
            }))
          },
          slides: {
            create: slides
          }
        }
      });

      console.log(`   ✓ Created 15 slides (10 Beginner, 2 Intermediate, 3 Expert)`.dim);
      console.log(`   ✓ Created ${topic.objectives.length} objectives\n`.dim);
      successCount++;

    } catch (error) {
      console.log(`✗ Error creating ${topic.title}: ${error.message}`.red);
    }
  }

  console.log('\n' + '─'.repeat(60).gray);
  console.log(`📊 Results:`.bold);
  console.log(`   ✓ Created: ${successCount} modules`.green);
  console.log(`   ⏭️  Skipped: ${skipCount} modules`.yellow);
  console.log(`   📄 Total Slides: ${successCount * 15}`.cyan);
  console.log('─'.repeat(60).gray + '\n');

  return { success: successCount, skipped: skipCount };
}

export default seedModulesEnhanced;
