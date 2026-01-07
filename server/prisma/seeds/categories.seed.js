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
      const createMessage = `Creating: ${categoryData.name} (${categoryData.vehicleType})`;
      await animateProgress(createMessage, 500);

      // Only assign modules to Motorcycle Training category
      if (categoryData.vehicleType === 'MOTORCYCLE') {
        // Motorcycle category gets all modules with sequential positions
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
        console.log(`   ${categoryData.isDefault ? '⭐ Default category' : '  '}\n`.dim);
      } else {
        // Car category created without modules
        await prisma.moduleCategory.create({
          data: categoryData
        });

        console.log(`   📦 Empty category (no modules assigned)`.dim);
        console.log(`   ${categoryData.isDefault ? '⭐ Default category' : '  '}\n`.dim);
      }

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
