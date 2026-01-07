import { exec } from 'child_process';
import { promisify } from 'util';
import colors from 'colors';

const execAsync = promisify(exec);

const scripts = [
  { name: 'Accounts', script: 'node prisma/seed-accounts.js' },
  { name: 'Modules', script: 'node prisma/seed-modules.js' },
  { name: 'Categories', script: 'node prisma/seed-categories.js' },
  { name: 'Quizzes', script: 'node prisma/seed-quizzes.js' },
  { name: 'Student Modules', script: 'node prisma/seed-student-modules.js' },
  { name: 'FAQs', script: 'node prisma/seed-faqs.js' },
  { name: 'Feedback', script: 'node prisma/seed-feedback.js' }
];

async function runSeeds() {
  console.log('\n╔════════════════════════════════════════════════════════════╗'.cyan.bold);
  console.log('║                                                            ║'.cyan.bold);
  console.log('║     🏍️  RIDERMIND DATABASE SEEDING SYSTEM 🏍️              ║'.cyan.bold);
  console.log('║                                                            ║'.cyan.bold);
  console.log('╚════════════════════════════════════════════════════════════╝'.cyan.bold);
  console.log('\n🚀 Starting sequential seed process...\n'.bold.green);

  for (let i = 0; i < scripts.length; i++) {
    const { name, script } = scripts[i];
    
    console.log(`\n[${'█'.repeat(i + 1)}${'░'.repeat(scripts.length - i - 1)}] ${i + 1}/${scripts.length} - ${name}`.cyan);
    console.log('─'.repeat(60).gray);
    
    try {
      const { stdout, stderr } = await execAsync(script);
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr.yellow);
    } catch (error) {
      console.error(`❌ Error seeding ${name}:`.red.bold, error.message);
      process.exit(1);
    }
  }

  console.log('\n\n' + '═'.repeat(60).rainbow);
  console.log('  ✨ ALL SEEDS COMPLETED SUCCESSFULLY! ✨'.bold.green);
  console.log('═'.repeat(60).rainbow);
  console.log('\n🎉 Database is ready for use!\n'.bold.magenta);
}

runSeeds().catch((error) => {
  console.error('❌ Fatal error:'.red.bold, error);
  process.exit(1);
});
