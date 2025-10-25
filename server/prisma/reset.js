import { PrismaClient } from '@prisma/client';
import colors from 'colors';
import { readdirSync, unlinkSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const prisma = new PrismaClient();

// Get the directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_VIDEOS_DIR = join(__dirname, '..', 'public', 'videos');

// Animation helpers
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function showWarning() {
  const warning = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     ⚠️  DATABASE RESET WARNING ⚠️                          ║
║                                                            ║
║     This will DELETE ALL DATA:                            ║
║     • All user accounts                                   ║
║     • All learning modules                                ║
║     • All module objectives                               ║
║     • All module slides                                   ║
║     • All uploaded videos                                 ║
║                                                            ║
║     THIS ACTION CANNOT BE UNDONE!                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `.red.bold;
  
  console.log(warning);
}

async function askConfirmation() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('\nType "DELETE EVERYTHING" to confirm: '.yellow.bold, (answer) => {
      rl.close();
      resolve(answer === 'DELETE EVERYTHING');
    });
  });
}

async function deleteUploadedVideos() {
  console.log('\n🗑️  Deleting uploaded videos...'.cyan);
  
  if (!existsSync(PUBLIC_VIDEOS_DIR)) {
    console.log('   ℹ️  Videos directory does not exist'.dim);
    return 0;
  }

  const files = readdirSync(PUBLIC_VIDEOS_DIR);
  let deletedCount = 0;

  for (const file of files) {
    if (file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.ogg')) {
      const filePath = join(PUBLIC_VIDEOS_DIR, file);
      try {
        unlinkSync(filePath);
        console.log(`   ✓ Deleted: ${file}`.dim);
        deletedCount++;
        await sleep(50);
      } catch (error) {
        console.log(`   ✗ Failed to delete: ${file}`.red);
      }
    }
  }

  console.log(`\n   🗑️  Total videos deleted: ${deletedCount}`.green);
  return deletedCount;
}

async function deleteAllData() {
  console.log('\n🗑️  Deleting all database records...'.cyan);
  
  const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let spinnerIndex = 0;

  // Delete in correct order (respecting foreign keys)
  const steps = [
    { name: 'Module Slides', fn: () => prisma.moduleSlide.deleteMany() },
    { name: 'Module Objectives', fn: () => prisma.moduleObjective.deleteMany() },
    { name: 'Modules', fn: () => prisma.module.deleteMany() },
    { name: 'Users', fn: () => prisma.user.deleteMany() },
  ];

  const deletedCounts = {};

  for (const step of steps) {
    process.stdout.write(`   ${spinner[spinnerIndex]} Deleting ${step.name}...`.cyan);
    
    const interval = setInterval(() => {
      spinnerIndex = (spinnerIndex + 1) % spinner.length;
      process.stdout.write(`\r   ${spinner[spinnerIndex]} Deleting ${step.name}...`.cyan);
    }, 100);

    try {
      const result = await step.fn();
      clearInterval(interval);
      deletedCounts[step.name] = result.count;
      process.stdout.write(`\r   ✓ Deleted ${step.name}: ${result.count} records\n`.green);
      await sleep(100);
    } catch (error) {
      clearInterval(interval);
      process.stdout.write(`\r   ✗ Error deleting ${step.name}: ${error.message}\n`.red);
    }
  }

  return deletedCounts;
}

async function resetDatabase() {
  try {
    await showWarning();
    
    const confirmed = await askConfirmation();
    
    if (!confirmed) {
      console.log('\n❌ Reset cancelled. No changes were made.\n'.yellow);
      return;
    }

    console.log('\n🚀 Starting database reset...\n'.bold.green);

    // Delete uploaded videos
    const videosDeleted = await deleteUploadedVideos();

    // Delete all database records
    const deletedCounts = await deleteAllData();

    // Success summary
    console.log('\n' + '═'.repeat(60).rainbow);
    console.log('  ✨ DATABASE RESET COMPLETED ✨'.bold.green);
    console.log('═'.repeat(60).rainbow);
    
    console.log('\n📊 Summary:'.bold);
    console.log(`   🗑️  Videos deleted: ${videosDeleted}`.cyan);
    
    Object.entries(deletedCounts).forEach(([name, count]) => {
      console.log(`   🗑️  ${name}: ${count}`.cyan);
    });

    const totalRecords = Object.values(deletedCounts).reduce((a, b) => a + b, 0);
    console.log(`\n   📦 Total records deleted: ${totalRecords}`.green.bold);
    console.log(`   🎥 Total videos deleted: ${videosDeleted}`.magenta.bold);

    console.log('\n✅ Database is now empty and ready for fresh seeding!'.bold.green);
    console.log('   Run "npm run fill" to seed the database.\n'.dim);

  } catch (error) {
    console.error('\n❌ Error during reset:'.red.bold);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed.'.dim);
  }
}

// ASCII art on exit
process.on('exit', () => {
  console.log('\n' + '─'.repeat(60).gray);
  console.log('  Database Reset Complete 🧹'.cyan);
  console.log('─'.repeat(60).gray + '\n');
});

resetDatabase();
