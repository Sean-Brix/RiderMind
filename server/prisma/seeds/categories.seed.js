import { PrismaClient } from '@prisma/client';
import colors from 'colors';

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

const categoriesData = [
  {
    name: 'Motorcycle (Basic)',
    description: 'Basic training modules for motorcycle riders',
    studentType: 'A',
    isDefault: true,
    isActive: true
  },
  {
    name: 'Motorcycle (Advanced)',
    description: 'Advanced training modules for experienced motorcycle riders',
    studentType: 'A1',
    isDefault: false,
    isActive: true
  },
  {
    name: 'Car & SUV',
    description: 'Standard training modules for car and SUV drivers',
    studentType: 'B',
    isDefault: false,
    isActive: true
  },
  {
    name: 'Light Trucks',
    description: 'Training modules for light truck drivers',
    studentType: 'B1',
    isDefault: false,
    isActive: true
  },
  {
    name: 'Heavy Trucks',
    description: 'Training modules for heavy truck operators',
    studentType: 'B2',
    isDefault: false,
    isActive: true
  },
  {
    name: 'Professional Driver',
    description: 'Comprehensive modules for professional drivers',
    studentType: 'C',
    isDefault: false,
    isActive: true
  }
];

export async function seedCategories() {
  console.log('\n' + '='.repeat(60).rainbow);
  console.log('  🏷️  SEEDING MODULE CATEGORIES'.bold.yellow);
  console.log('='.repeat(60).rainbow + '\n');

  let successCount = 0;
  let skipCount = 0;

  // Get all modules for assignment
  const modules = await prisma.module.findMany({
    orderBy: { position: 'asc' }
  });

  if (modules.length === 0) {
    console.log('⚠️  No modules found. Please seed modules first.'.yellow);
    return { success: 0, skipped: 0 };
  }

  for (const categoryData of categoriesData) {
    try {
      const existing = await prisma.moduleCategory.findFirst({
        where: { name: categoryData.name }
      });

      if (existing) {
        console.log(`⏭️  Skipping: ${categoryData.name}`.yellow);
        skipCount++;
        continue;
      }

      // Animate category creation
      const createMessage = `Creating: ${categoryData.name} (${categoryData.studentType})`;
      await animateProgress(createMessage, 500);

      // Assign different modules based on student type
      let modulesToAssign = [];
      
      switch (categoryData.studentType) {
        case 'A':
        case 'A1':
          // Motorcycles get modules 1-8
          modulesToAssign = modules.slice(0, 8);
          break;
        case 'B':
        case 'B1':
          // Cars and light trucks get modules 1-11 (all)
          modulesToAssign = modules;
          break;
        case 'B2':
        case 'C':
          // Heavy trucks and professional get all modules
          modulesToAssign = modules;
          break;
        default:
          // Default: assign all modules
          modulesToAssign = modules;
      }

      // Create category with module assignments
      await prisma.moduleCategory.create({
        data: {
          ...categoryData,
          modules: {
            create: modulesToAssign.map((module, index) => ({
              moduleId: module.id,
              position: index
            }))
          }
        }
      });

      console.log(`   📚 ${modulesToAssign.length} modules assigned`.dim);
      console.log(`   ${categoryData.isDefault ? '⭐ Default category' : '  '}\n`.dim);
      successCount++;

    } catch (error) {
      console.log(`✗ Error creating ${categoryData.name}: ${error.message}`.red);
    }
  }

  console.log('\n' + '─'.repeat(60).gray);
  console.log(`📊 Results:`.bold);
  console.log(`   ✓ Created: ${successCount} categories`.green);
  console.log(`   ⏭️  Skipped: ${skipCount} categories`.yellow);
  console.log('─'.repeat(60).gray + '\n');

  return { success: successCount, skipped: skipCount };
}

export default seedCategories;
