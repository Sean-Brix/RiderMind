import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import colors from 'colors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

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

// Sample accounts (no student modules)
const accounts = [
  {
    email: 'admin@ridermind.com',
    password: '123456',
    role: 'ADMIN',
    first_name: 'Admin',
    last_name: 'User',
    middle_name: 'System',
    sex: 'Male',
    nationality: 'Filipino',
    civil_status: 'Single',
    birthdate: '1990-01-01',
    telephone_number: '123-4567',
    cellphone_number: '09171234567',
    email_address: 'admin@ridermind.com'
  },
  {
    email: 'user@ridermind.com',
    password: '123456',
    role: 'USER',
    first_name: 'Test',
    last_name: 'User',
    middle_name: 'Demo',
    sex: 'Male',
    nationality: 'Filipino',
    civil_status: 'Single',
    birthdate: '1995-05-15',
    cellphone_number: '09187654321',
    email_address: 'user@ridermind.com',
    student_type: 'B'
  }
];

// Module titles for variety
const moduleTopics = [
  'Traffic Signs and Signals',
  'Defensive Driving Techniques',
  'Vehicle Maintenance Basics',
  'Road Safety and Hazard Awareness',
  'Parking and Maneuvering Skills',
  'Night Driving Safety',
  'Weather Conditions and Driving',
  'Emergency Procedures',
  'Fuel Efficiency and Eco-Driving',
  'Advanced Driving Skills'
];

// Get random item from array
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Get random number between min and max
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function createAccounts() {
  console.log('\n👥 Creating Accounts...'.bold.cyan);
  
  let created = 0;
  for (const account of accounts) {
    const { email, password, birthdate, ...userData } = account;

    await animateProgress(`Creating: ${userData.first_name} ${userData.last_name}`, 400);
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        birthdate: birthdate ? new Date(birthdate) : null,
        ...userData,
      },
    });
    
    console.log(`   📧 ${email} / 🔑 ${password}`.dim);
    created++;
  }
  
  return created;
}

async function createCategories() {
  console.log('\n🏷️  Creating Categories...'.bold.cyan);
  
  const categories = [
    {
      name: 'Motorcycle Training',
      description: 'Complete motorcycle safety and operation course',
      vehicleType: 'MOTORCYCLE',
      isDefault: true,
      isActive: true
    },
    {
      name: 'Car Training',
      description: 'Comprehensive car driving training program',
      vehicleType: 'CAR',
      isDefault: false,
      isActive: true
    }
  ];

  const created = [];
  for (const cat of categories) {
    const existing = await prisma.moduleCategory.findFirst({
      where: { vehicleType: cat.vehicleType }
    });
    
    if (existing) {
      console.log(`⏭️  Skipped: ${cat.name}`.yellow);
      created.push(existing);
      continue;
    }

    await animateProgress(`Creating: ${cat.name}`, 400);
    const category = await prisma.moduleCategory.create({ data: cat });
    created.push(category);
  }

  return created;
}

async function createModulesWithSlidesAndQuizzes(categories) {
  console.log('\n📚 Creating 10 Modules per Category...'.bold.cyan);
  
  const videoFiles = ['1.mp4', '2.mp4', '3.mp4', '4.mp4', '5.mp4', '6.mp4', '7.mp4', '8.mp4', '9.mp4', '10.mp4', '11.mp4'];
  const imageFiles = ['1.jpg', '2.jpeg', '3.jpg', '4.jpeg', '5.jpeg', '6.jpeg', '7.jpeg', '8.jpeg', '9.jpg', '10.jpeg', '11.jpeg'];
  
  const allModules = [];
  
  for (const category of categories) {
    console.log(`\n  📖 ${category.name}`.bold);
    
    for (let moduleIdx = 0; moduleIdx < 10; moduleIdx++) {
      const moduleName = moduleTopics[moduleIdx];
      await animateProgress(`  Creating Module ${moduleIdx + 1}: ${moduleName}`, 300);
      
      // Create module
      const module = await prisma.module.create({
        data: {
          title: moduleName,
          description: `Learn about ${moduleName.toLowerCase()} for safe ${category.vehicleType.toLowerCase()} operation`,
          isActive: true
        }
      });

      // Create objectives
      await prisma.moduleObjective.createMany({
        data: [
          { moduleId: module.id, objective: `Understand key concepts of ${moduleName}`, position: 1 },
          { moduleId: module.id, objective: `Apply ${moduleName} in real scenarios`, position: 2 },
          { moduleId: module.id, objective: `Demonstrate mastery of ${moduleName}`, position: 3 }
        ]
      });

      // Create slides (7-15 slides, increasing with difficulty)
      const beginnerSlides = 7; // First 7 slides are beginner
      const intermediateSlides = getRandomInt(3, 4); // 3-4 intermediate
      const expertSlides = getRandomInt(2, 4); // 2-4 expert
      const totalSlides = beginnerSlides + intermediateSlides + expertSlides;

      for (let slideIdx = 0; slideIdx < totalSlides; slideIdx++) {
        let skillLevel = 'Beginner';
        if (slideIdx >= beginnerSlides && slideIdx < beginnerSlides + intermediateSlides) {
          skillLevel = 'Intermediate';
        } else if (slideIdx >= beginnerSlides + intermediateSlides) {
          skillLevel = 'Expert';
        }

        const slideType = getRandom(['video', 'image', 'text']);
        let slideData = {
          moduleId: module.id,
          type: slideType,
          title: `${moduleName} - Part ${slideIdx + 1}`,
          description: `Learn about ${moduleName} - ${skillLevel} level content`,
          position: slideIdx + 1,
          skillLevel: skillLevel
        };

        if (slideType === 'video') {
          const videoFile = getRandom(videoFiles);
          const videoPath = path.join(__dirname, 'Data', 'modules', 'videos', videoFile);
          slideData.videoPath = videoPath;
          slideData.content = `Video content for ${moduleName}`;
        } else if (slideType === 'image') {
          const imageFile = getRandom(imageFiles);
          const imagePath = path.join(__dirname, 'Data', 'modules', 'images', imageFile);
          const imageBuffer = fs.readFileSync(imagePath);
          slideData.imageData = imageBuffer; // Use imageData instead of content
          slideData.imageMime = imageFile.endsWith('.jpg') ? 'image/jpeg' : 'image/jpeg';
          slideData.content = `Image slide for ${moduleName}`; // Text description
        } else {
          slideData.content = `This is a text slide about ${moduleName}. ${skillLevel} level information about safe driving practices and important concepts you need to know.`;
        }

        await prisma.moduleSlide.create({ data: slideData });
      }

      console.log(`    ✓ Created ${totalSlides} slides (${beginnerSlides} Beginner, ${intermediateSlides} Intermediate, ${expertSlides} Expert)`.dim);

      // Create quiz with 10 questions
      const quiz = await prisma.quiz.create({
        data: {
          moduleId: module.id,
          title: `${moduleName} Quiz`,
          description: `Test your knowledge of ${moduleName}`,
          passingScore: 70,
          timeLimit: 600
        }
      });

      // Create 10 quiz questions
      const questionTypes = ['MULTIPLE_CHOICE', 'TRUE_FALSE'];
      for (let qIdx = 0; qIdx < 10; qIdx++) {
        const questionType = getRandom(questionTypes);
        
        let questionData = {
          quizId: quiz.id,
          question: `Question ${qIdx + 1}: What is important about ${moduleName}?`,
          type: questionType,
          points: 10,
          position: qIdx + 1
        };

        const question = await prisma.quizQuestion.create({ data: questionData });

        // Create options for the question
        if (questionType === 'MULTIPLE_CHOICE') {
          const options = [
            { text: 'Safety first', isCorrect: true },
            { text: 'Speed is important', isCorrect: false },
            { text: 'Ignore traffic signs', isCorrect: false },
            { text: 'Drive recklessly', isCorrect: false }
          ];
          
          for (let optIdx = 0; optIdx < options.length; optIdx++) {
            await prisma.quizQuestionOption.create({
              data: {
                questionId: question.id,
                optionText: options[optIdx].text,
                isCorrect: options[optIdx].isCorrect,
                position: optIdx + 1
              }
            });
          }
        } else { // TRUE_FALSE
          await prisma.quizQuestionOption.createMany({
            data: [
              {
                questionId: question.id,
                optionText: 'True',
                isCorrect: true,
                position: 1
              },
              {
                questionId: question.id,
                optionText: 'False',
                isCorrect: false,
                position: 2
              }
            ]
          });
        }
      }

      console.log(`    ✓ Created quiz with 10 questions`.dim);

      // Link module to category
      await prisma.moduleCategoryModule.create({
        data: {
          categoryId: category.id,
          moduleId: module.id,
          position: moduleIdx + 1
        }
      });

      allModules.push(module);
    }
  }

  return allModules;
}

async function cleanDatabase() {
  console.log('\n🧹 Cleaning Database...'.bold.red);
  
  try {
    // Delete in correct order (CASCADE will handle related records)
    await animateProgress('Deleting student modules', 300);
    await prisma.studentModule.deleteMany({});
    
    await animateProgress('Deleting quiz attempts', 300);
    await prisma.quizAttempt.deleteMany({});
    
    await animateProgress('Deleting quiz question options', 300);
    await prisma.quizQuestionOption.deleteMany({});
    
    await animateProgress('Deleting quiz questions', 300);
    await prisma.quizQuestion.deleteMany({});
    
    await animateProgress('Deleting quizzes', 300);
    await prisma.quiz.deleteMany({});
    
    await animateProgress('Deleting slides', 300);
    await prisma.slide.deleteMany({});
    
    await animateProgress('Deleting module-category links', 300);
    await prisma.moduleCategoryModule.deleteMany({});
  } catch (err) {
    console.log(`⚠️  Note: ${err.message}`.yellow);
  }
  
  try {
    await animateProgress('Deleting modules', 300);
    await prisma.module.deleteMany({});
    
    await animateProgress('Deleting categories', 300);
    await prisma.moduleCategory.deleteMany({});
  } catch (err) {
    console.log(`⚠️  Note: ${err.message}`.yellow);
  }
  
  try {
    await animateProgress('Deleting users', 300);
    await prisma.user.deleteMany({});
  } catch (err) {
    console.log(`⚠️  Note: ${err.message}`.yellow);
  }
  
  console.log('✓ Database cleaned!'.green);
}

async function main() {
  try {
    console.log('\n' + '='.repeat(70).rainbow);
    console.log('  🚀 BLANK SEED - Creating Fresh Database'.bold.magenta);
    console.log('='.repeat(70).rainbow);

    // Clean existing data first
    await cleanDatabase();

    // Create accounts
    const accountsCreated = await createAccounts();

    // Create categories
    const categories = await createCategories();

    // Create modules with slides and quizzes
    const modules = await createModulesWithSlidesAndQuizzes(categories);

    console.log('\n' + '─'.repeat(70).gray);
    console.log('📊 Summary:'.bold);
    console.log(`   ✓ Accounts: ${accountsCreated}`.green);
    console.log(`   ✓ Categories: ${categories.length}`.green);
    console.log(`   ✓ Modules: ${modules.length}`.green);
    console.log(`   ✓ Each module has 10-15 slides with randomized skill levels`.green);
    console.log(`   ✓ Each module has a quiz with 10 questions`.green);
    console.log('─'.repeat(70).gray);

    console.log('\n💡 Credentials:'.bold.yellow);
    console.log(`   Admin: admin@ridermind.com / 123456`.cyan);
    console.log(`   User:  user@ridermind.com / 123456`.cyan);
    
    console.log('\n✨ Note: Users have NO student modules yet!'.bold.yellow);
    console.log('   They will need to select a course first.\n'.dim);

  } catch (error) {
    console.error('\n❌ Error seeding database:'.red.bold, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('✅ Blank seed completed successfully!'.green.bold);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Blank seed failed:'.red.bold, error);
    process.exit(1);
  });
