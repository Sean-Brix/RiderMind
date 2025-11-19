import { PrismaClient } from '@prisma/client';
import colors from 'colors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import seedAccounts from './seeds/accounts.seed.js';
import seedCategories from './seeds/categories.seed.js';
import { seedFAQs } from './seeds/faqs.seed.js';
import seedFeedback from './seeds/feedback.seed.js';
import { seedModules } from './seeds/modules.seed.js';
import { seedQuizzes } from './seeds/quizzes.seed.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// Animation helpers
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function showBanner() {
  const banner = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🏍️  RIDERMIND DATABASE SEEDING SYSTEM 🏍️              ║
║                                                            ║
║     Initializing MOTORCYCLE TRAINING database...          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `.cyan.bold;
  
  console.log(banner);
  await sleep(500);
}

async function showProgress(current, total, label) {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * 30);
  const empty = 30 - filled;
  
  const bar = '█'.repeat(filled).green + '░'.repeat(empty).gray;
  process.stdout.write(`\r[$bar] ${percentage}% - ${label}`.cyan);
  
  if (current === total) {
    console.log('');
  }
}

async function main() {
  try {
    await showBanner();

    const seedFunctions = [
      { name: 'User Accounts (20 Accounts)', fn: seedAccounts, emoji: '👥' },
      { name: 'FAQs (3-6 per Category)', fn: seedFAQs, emoji: '❓' },
      { name: 'Feedback System (Comments & Reactions)', fn: seedFeedback, emoji: '💬' },
      { name: 'Modules (10 Training Modules)', fn: () => seedModules(prisma), emoji: '🏍️' },
      { name: 'Categories (Motorcycle & Car)', fn: seedCategories, emoji: '🏷️' },
      { name: 'Quizzes (10+ Questions per Module)', fn: () => seedQuizzes(prisma), emoji: '📝' }
    ];

    let totalSuccess = 0;
    let totalSkipped = 0;

    console.log('🚀 Starting seed process...\n'.bold.green);

    for (let i = 0; i < seedFunctions.length; i++) {
      const { name, fn, emoji } = seedFunctions[i];
      
      console.log(`\n${emoji} ${`[${i + 1}/${seedFunctions.length}]`.gray} Processing: ${name}`.bold);
      console.log('─'.repeat(60).gray);
      
      const result = await fn();
      
      totalSuccess += result.success;
      totalSkipped += result.skipped;
      
      await showProgress(i + 1, seedFunctions.length, name);
      await sleep(300);
    }

    // Final summary
    console.log('\n\n' + '═'.repeat(60).rainbow);
    console.log('  ✨ SEEDING COMPLETED SUCCESSFULLY! ✨'.bold.green);
    console.log('═'.repeat(60).rainbow);
    
    console.log('\n📊 Overall Statistics:'.bold);
    console.log(`   ✓ Total Created: ${totalSuccess} records`.green);
    console.log(`   ⏭️  Total Skipped: ${totalSkipped} records`.yellow);
    console.log(`   📦 Total Seeds Run: ${seedFunctions.length}`.cyan);
    
    console.log('\n🎉 Database is ready for use!\n'.bold.magenta);

  } catch (error) {
    console.error('\n❌ Error during seeding:'.red.bold);
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
  console.log('  Thanks for using RiderMind Seed System! 🏍️💨'.cyan);
  console.log('─'.repeat(60).gray + '\n');
});

main();
