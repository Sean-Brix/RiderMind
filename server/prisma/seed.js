import { PrismaClient } from '@prisma/client';
import colors from 'colors';
import seedAccounts from './seeds/accounts.seed.js';
import seedModules from './seeds/modules.seed.js';

const prisma = new PrismaClient();

// Animation helpers
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function showBanner() {
  const banner = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🏍️  RIDERMIND DATABASE SEEDING SYSTEM 🏍️              ║
║                                                            ║
║     Initializing database with sample data...             ║
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
      { name: 'User Accounts', fn: seedAccounts, emoji: '👥' },
      { name: 'Learning Modules', fn: seedModules, emoji: '📚' }
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
