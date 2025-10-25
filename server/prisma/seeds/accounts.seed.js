import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import colors from 'colors';

const prisma = new PrismaClient();

// Animation helpers
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinnerIndex = 0;

async function animateProgress(message, duration = 800) {
  const steps = Math.floor(duration / 100);
  for (let i = 0; i < steps; i++) {
    process.stdout.write(`\r${spinner[spinnerIndex]} ${message}`.cyan);
    spinnerIndex = (spinnerIndex + 1) % spinner.length;
    await sleep(100);
  }
  process.stdout.write(`\r✓ ${message}`.green + '\n');
}

const accountsData = [
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
    email_address: 'user@ridermind.com'
  },
  {
    email: 'john.doe@email.com',
    password: '123456',
    role: 'USER',
    first_name: 'John',
    last_name: 'Doe',
    middle_name: 'Smith',
    sex: 'Male',
    nationality: 'Filipino',
    civil_status: 'Married',
    birthdate: '1988-03-20',
    cellphone_number: '09191234567',
    email_address: 'john.doe@email.com',
    vehicle_categories: 'A,B1'
  },
  {
    email: 'jane.santos@email.com',
    password: '123456',
    role: 'USER',
    first_name: 'Jane',
    last_name: 'Santos',
    middle_name: 'Cruz',
    sex: 'Female',
    nationality: 'Filipino',
    civil_status: 'Single',
    birthdate: '1992-07-12',
    cellphone_number: '09209876543',
    email_address: 'jane.santos@email.com',
    vehicle_categories: 'A,B'
  }
];

export async function seedAccounts() {
  console.log('\n' + '='.repeat(60).rainbow);
  console.log('  👥 SEEDING USER ACCOUNTS'.bold.magenta);
  console.log('='.repeat(60).rainbow + '\n');

  let successCount = 0;
  let skipCount = 0;

  for (const account of accountsData) {
    const { email, password, birthdate, ...userData } = account;
    
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      
      if (existing) {
        console.log(`⏭️  Skipping: ${email}`.yellow);
        skipCount++;
        continue;
      }

      // Animate account creation
      const createMessage = `Creating: ${userData.first_name} ${userData.last_name} (${userData.role})`;
      await animateProgress(createMessage, 600);

      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          birthdate: birthdate ? new Date(birthdate) : null,
          ...userData,
        },
      });

      console.log(`   📧 Email: ${email}`.dim);
      console.log(`   🔑 Password: ${password}\n`.dim);
      successCount++;
      
    } catch (error) {
      console.log(`✗ Error creating ${email}: ${error.message}`.red);
    }
  }

  console.log('\n' + '─'.repeat(60).gray);
  console.log(`📊 Results:`.bold);
  console.log(`   ✓ Created: ${successCount} accounts`.green);
  console.log(`   ⏭️  Skipped: ${skipCount} accounts`.yellow);
  console.log('─'.repeat(60).gray);

  if (successCount > 0) {
    console.log('\n' + '💡 Developer Credentials:'.bold.yellow);
    console.log(`   Admin: email="admin@ridermind.com", password="123456"`.cyan);
    console.log(`   User:  email="user@ridermind.com", password="123456"`.cyan);
  }
  console.log('');

  return { success: successCount, skipped: skipCount };
}

export default seedAccounts;
