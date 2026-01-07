/**
 * COMPREHENSIVE SEED SYSTEM FOR RIDERMIND
 * 
 * This script will:
 * 1. Clear all existing data
 * 2. Seed accounts (20+)
 * 3. Seed modules (8 modules with animations from Firebase)
 * 4. Seed categories (2 default)
 * 5. Seed quizzes (10 questions per module)
 * 6. Seed FAQs (4+ per category)
 * 7. Seed student modules (5 enrollments)
 * 8. Seed feedback (2-3 per module)
 * 
 * Prerequisites:
 * - Firebase animations uploaded to "animation-seed/module/" and "animation-seed/quiz/"
 * - Module videos: "Module 1.mp4", "Module 2.mp4", ... "Module 8.mp4"
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import colors from 'colors';

const prisma = new PrismaClient();

// ==================== UTILITY FUNCTIONS ====================

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

// ==================== STEP 1: CLEAR DATABASE ====================

async function clearDatabase() {
  console.log('\n' + '='.repeat(80).red);
  console.log('  🗑️  CLEARING DATABASE'.bold.red);
  console.log('='.repeat(80).red + '\n');

  const tables = [
    'QuizAnswer',
    'QuizAttempt',
    'QuizQuestionOption',
    'QuizQuestion',
    'Quiz',
    'ModuleFeedback',
    'QuizQuestionReaction',
    'StudentModule',
    'ModuleCategoryModule',
    'ModuleSlide',
    'ModuleObjective',
    'Module',
    'ModuleCategory',
    'FAQ',
    'RegistrationRequest',
    'User'
  ];

  for (const table of tables) {
    await animateProgress(`Clearing ${table}`, 200);
    await prisma[table.charAt(0).toLowerCase() + table.slice(1)].deleteMany({});
  }

  console.log('\n✅ Database cleared successfully!\n'.green);
}

// ==================== STEP 2: SEED ACCOUNTS ====================

async function seedAccounts() {
  console.log('\n' + '='.repeat(80).rainbow);
  console.log('  👥 SEEDING ACCOUNTS (20+ Users)'.bold.magenta);
  console.log('='.repeat(80).rainbow + '\n');

  const firstNames = ['Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Rosa', 'Carlos', 'Isabel', 'Miguel', 'Elena', 'Luis', 'Carmen', 'Ramon', 'Teresa', 'Francisco', 'Luz', 'Antonio', 'Josefa', 'Manuel', 'Sofia', 'Ricardo', 'Angelica', 'Roberto', 'Cristina'];
  const lastNames = ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Lopez', 'Gonzales', 'Ramos', 'Rivera', 'Flores', 'Torres', 'Dela Cruz', 'Villanueva', 'Castillo', 'Aquino', 'Soriano', 'Diaz', 'Fernandez', 'Martinez'];
  const nationalities = ['Filipino', 'Filipino', 'Filipino', 'Filipino', 'American', 'Chinese', 'Japanese'];
  const studentTypes = ['A', 'A1', 'B', 'B1', 'B2'];

  const accounts = [
    {
      email: 'admin@ridermind.com',
      password: '123456',
      role: 'ADMIN',
      first_name: 'Admin',
      last_name: 'RiderMind',
      middle_name: 'System',
      sex: 'Male',
      nationality: 'Filipino',
      civil_status: 'Single',
      birthdate: new Date('1985-01-15'),
      cellphone_number: '09171234567',
      student_type: null,
      weight: 70.5,
      height: 175.0,
      blood_type: 'O+',
      eye_color: 'Brown'
    }
  ];

  // Generate 23 more users (total 24 including admin)
  for (let i = 0; i < 23; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const sex = i % 2 === 0 ? 'Male' : 'Female';
    const year = randomInt(1990, 2002);
    const month = randomInt(1, 12);
    const day = randomInt(1, 28);
    
    accounts.push({
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@email.com`,
      password: '123456',
      role: 'USER',
      first_name: firstName,
      last_name: lastName,
      middle_name: randomElement(['Dela', 'San', 'Tan', 'Lee', 'Cruz']),
      sex: sex,
      nationality: randomElement(nationalities),
      civil_status: randomElement(['Single', 'Single', 'Married']),
      birthdate: new Date(year, month - 1, day),
      cellphone_number: `09${randomInt(10, 99)}${randomInt(1000000, 9999999)}`,
      student_type: randomElement(studentTypes),
      weight: randomInt(50, 95) + Math.random(),
      height: randomInt(150, 185) + Math.random(),
      blood_type: randomElement(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
      eye_color: randomElement(['Brown', 'Black', 'Hazel'])
    });
  }

  for (const account of accounts) {
    const { email, password, birthdate, weight, height, student_type, ...userData} = account;
    await animateProgress(`Creating: ${userData.first_name} ${userData.last_name} (${userData.role})`, 300);
    
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        birthdate,
        weight,
        height,
        student_type,
        email_address: email,
        ...userData
      }
    });
  }

  console.log(`\n✅ Created ${accounts.length} accounts!\n`.green);
  return accounts.length;
}

// ==================== STEP 3: SEED MODULES ====================

async function seedModules() {
  console.log('\n' + '='.repeat(80).rainbow);
  console.log('  📚 SEEDING MODULES (8 Modules with Animations)'.bold.cyan);
  console.log('='.repeat(80).rainbow + '\n');

  const modules = [
    {
      title: 'Introduction to Driving and Traffic Rules',
      description: 'Understanding traffic rules, road markings, and basic driving laws',
      objectives: [
        'Understanding the purpose of the TDC',
        'The role of drivers in road safety',
        'Traffic signs, road markings, and basic driving laws',
        'The importance of following LTO regulations'
      ],
      slides: [
        {
          type: 'text',
          title: 'Welcome to Module 1',
          content: 'Introduction to Driving and Traffic Rules',
          description: 'In this module, you will learn about road markings, traffic lights, and the fundamental rules of the road.',
        },
        {
          type: 'video',
          title: 'Road Safety Animation',
          content: 'Watch this animation to understand road safety basics',
          videoUrl: 'https://firebasestorage.googleapis.com/v0/b/ridermind/o/animation-seed%2Fmodule%2FModule%201.mp4?alt=media',
          videoPath: 'animation-seed/module/Module 1.mp4'
        },
        {
          type: 'text',
          title: 'Broken White Lines',
          content: '1. Broken White Lines\n\nIto ay naghihiwalay ng lanes na parehong direksyon ang takbo.\n\n👉 Pwede kang mag-overtake o magpalit ng lane, basta ligtas.',
          description: 'Understanding broken white lines on the road'
        },
        {
          type: 'text',
          title: 'Solid White Line',
          content: '2. Solid White Line\n\nKaraniwang makikita sa gilid ng kalsada o bago mag-intersection.\n\n👉 Hindi ina-encourage ang paglipat ng lane sa area na ito.',
          description: 'Understanding solid white lines'
        },
        {
          type: 'text',
          title: 'Yellow Lines',
          content: '3. Solid Yellow Line\n\nMadalas nasa kaliwang bahagi ng kalsada o island side.\n\n👉 Ibig sabihin no swerving o exclusive lane, tulad ng EDSA Busway.\n\n4. Double Solid Yellow Lines\n\nDalawang solid yellow lines sa gitna ng kalsada.\n\n👉 Bawal na bawal mag-overtake o tumawid sa linya mula sa kahit anong side.',
          description: 'Understanding yellow line markings'
        },
        {
          type: 'text',
          title: 'Broken Yellow Line',
          content: '5. Broken Yellow Line\n\nPwede itong tawirin para mag-overtake,\n\n👉 pero dapat sobrang ingat at siguraduhing clear ang kasalubong.',
          description: 'When overtaking is allowed'
        },
        {
          type: 'text',
          title: 'Stop Line and Crossings',
          content: '6. Solid White Horizontal Line (Stop Line)\n\nMakikita sa intersection bago ang traffic light o stop sign.\n\n👉 Dito ka dapat huminto, hindi lalampas sa linya.\n\n7. Zebra Crossing\n\nPuting makakapal na guhit sa kalsada.\n\n👉 Pedestrian lane ito, kaya bigyan ng daan ang tumatawid.',
          description: 'Stop lines and pedestrian crossings'
        },
        {
          type: 'text',
          title: 'Yellow Box and Arrows',
          content: '8. Yellow Box\n\nDilaw na kahon sa intersection.\n\n👉 Huwag pumasok kung hindi pa clear ang exit, para hindi mag-cause ng traffic.\n\n9. Directional Arrows\n\nPuting arrows sa lane (straight, left, right).\n\n👉 Sundin ang direksyon, bawal lumihis.',
          description: 'Yellow boxes and directional arrows'
        },
        {
          type: 'text',
          title: 'Rumble Strips',
          content: '10. Rumble Strips\n\nMga naka-angat o uka sa kalsada.\n\n👉 Nagbibigay ng vibration at tunog para magising ang driver at mag-warning sa hazard o slowdown area.',
          description: 'Understanding rumble strips'
        },
        {
          type: 'text',
          title: 'Traffic Lights',
          content: '🔴 RED LIGHT (Pula) - STOP\n\n👉 Kailangang huminto ang sasakyan bago ang stop line.\n\n🟡 YELLOW LIGHT (Dilaw) - MAGHANDA NA HUMINTO\n\n👉 Babala ito na malapit nang mag-red light.\n\n🟢 GREEN LIGHT (Berde) - GO\n\n👉 Pwede ka nang umandar, pero siguraduhing clear ang intersection.',
          description: 'Understanding traffic light signals'
        }
      ]
    },
    {
      title: 'Basic Road Courtesy and Discipline',
      description: 'Proper driver attitude, behavior, and road sharing',
      objectives: [
        'Proper driver attitude and behavior',
        'Road sharing with pedestrians, cyclists, and PUVs',
        'Avoiding road rage and promoting respect',
        'Common road courtesy rules and real-life applications'
      ],
      videoNum: 2
    },
    {
      title: 'Traffic Rules, Road Signs, and Pavement Markings',
      description: 'Understanding colors, shapes, and types of traffic signs',
      objectives: [
        'Meaning of colors, shapes, and types of traffic signs',
        'Road markings and their importance',
        'Traffic lights and intersection rules',
        'Understanding "right of way"'
      ],
      videoNum: 3
    },
    {
      title: 'Rights, Duties, and Responsibilities of a Driver',
      description: 'Legal and moral responsibilities of drivers',
      objectives: [
        'The moral, legal, and social responsibilities of drivers',
        'LTO regulations and penalties',
        'Responsibilities during an accident or traffic stop',
        'Defensive vs. reckless driving'
      ],
      videoNum: 4
    },
    {
      title: 'Road and Vehicle Familiarization',
      description: 'Vehicle parts, functions, and basic maintenance',
      objectives: [
        'Parts and functions of a vehicle',
        'Basic car maintenance (oil, brakes, tires, etc.)',
        'Pre-driving inspection checklist',
        'Safe start-up and parking practices'
      ],
      videoNum: 5
    },
    {
      title: 'Driving Fundamentals and Techniques',
      description: 'Proper seating, steering, and driving techniques',
      objectives: [
        'Proper seating, steering, and mirror adjustment',
        'Smooth acceleration, braking, and turning',
        'Uphill and downhill driving',
        'Basic reversing and parking techniques'
      ],
      videoNum: 6
    },
    {
      title: 'Defensive Driving and Risk Awareness',
      description: 'Anticipating hazards and avoiding collisions',
      objectives: [
        'Anticipating hazards and avoiding collisions',
        'Safe following distance and speed control',
        'Handling distractions and fatigue',
        'Driving under different weather and road conditions'
      ],
      videoNum: 7
    },
    {
      title: 'Handling Emergencies and Accidents',
      description: 'What to do in case of breakdown or accidents',
      objectives: [
        'What to do in case of a breakdown',
        'Basic first aid awareness',
        'Proper reporting and documentation after an accident',
        'How to use hazard lights and emergency tools'
      ],
      videoNum: 8
    }
  ];

  const additionalSlideContent = [
    { title: 'Understanding the Basics', content: 'Learn the fundamental concepts that will help you become a safe and responsible driver.' },
    { title: 'Key Points to Remember', content: 'Always prioritize safety and follow traffic regulations to protect yourself and others on the road.' },
    { title: 'Practical Applications', content: 'Apply what you learn in real-world scenarios to build confidence and competence.' },
    { title: 'Common Mistakes to Avoid', content: 'Being aware of common errors can help you prevent accidents and violations.' },
    { title: 'Best Practices', content: 'Follow these recommended practices to enhance your driving skills and road awareness.' },
    { title: 'Safety First', content: 'Your safety and the safety of others should always be your top priority when driving.' },
    { title: 'Tips for Success', content: 'These helpful tips will guide you toward becoming an excellent and responsible driver.' },
    { title: 'Review and Practice', content: 'Regular review and practice are essential for mastering driving skills and knowledge.' }
  ];

  for (let i = 0; i < modules.length; i++) {
    const moduleData = modules[i];
    await animateProgress(`Creating Module ${i + 1}: ${moduleData.title}`, 400);

    let slides = moduleData.slides;
    
    // Generate slides for modules 2-8
    if (!slides && moduleData.videoNum) {
      slides = [
        {
          type: 'text',
          title: `Welcome to Module ${moduleData.videoNum}`,
          content: moduleData.title,
          description: moduleData.description
        },
        {
          type: 'video',
          title: 'Learning Animation',
          content: 'Watch this animation carefully',
          videoUrl: `https://firebasestorage.googleapis.com/v0/b/ridermind/o/animation-seed%2Fmodule%2FModule%20${moduleData.videoNum}.mp4?alt=media`,
          videoPath: `animation-seed/module/Module ${moduleData.videoNum}.mp4`
        }
      ];

      // Add 8 random content slides
      for (let j = 0; j < 8; j++) {
        const slideContent = randomElement(additionalSlideContent);
        slides.push({
          type: 'text',
          title: slideContent.title,
          content: `${slideContent.content}\n\n${moduleData.description}`,
          description: `Topic ${j + 1} for ${moduleData.title}`
        });
      }
    }

    const module = await prisma.module.create({
      data: {
        title: moduleData.title,
        description: moduleData.description,
        isActive: true,
        position: i,
        objectives: {
          create: moduleData.objectives.map((obj, idx) => ({
            objective: obj,
            position: idx
          }))
        },
        slides: {
          create: slides.map((slide, idx) => ({
            type: slide.type,
            title: slide.title,
            content: slide.content,
            description: slide.description || '',
            position: idx,
            skillLevel: 'Beginner',
            videoUrl: slide.videoUrl || null,
            videoPath: slide.videoPath || null,
            imageUrl: slide.imageUrl || null,
            imagePath: slide.imagePath || null
          }))
        }
      }
    });

    console.log(`   📄 ${slides.length} slides created`.dim);
  }

  console.log(`\n✅ Created ${modules.length} modules!\n`.green);
  return modules.length;
}

// ==================== EXPORTS ====================

export { clearDatabase, seedAccounts, seedModules };
